import { Injectable, UnauthorizedException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Lead } from '../leads/lead.entity';
import { Deal } from '../deals/deal.entity';
import { ConfigService } from '@nestjs/config';
import { ConfigurationService } from '../config/configuration.service';
import { Bitrix24Service } from '../bitrix24/bitrix24.service';
import { InjectQueue } from '@nestjs/bullmq';
import { Queue } from 'bullmq';
import { QUEUE_B24_SYNC, QUEUE_TIKTOK_SYNC } from '../queues/queues.module';
import * as crypto from 'node:crypto';

interface TiktokWebhookPayload {
  event: string;
  event_id: string;
  timestamp: number;
  advertiser_id: string;
  campaign?: { campaign_id?: string; campaign_name?: string; ad_id?: string; ad_name?: string };
  form?: { form_id?: string; form_name?: string };
  lead_data?: { full_name?: string; email?: string; phone?: string; city?: string; ttclid?: string } & Record<string, unknown>;
  custom_questions?: Array<{ question: string; answer: string }>;
  [key: string]: unknown;
}

@Injectable()
export class WebhooksService {
  constructor(
    @InjectRepository(Lead) private readonly leadRepo: Repository<Lead>,
    @InjectRepository(Deal) private readonly dealRepo: Repository<Deal>,
    private readonly config: ConfigService,
    private readonly configurationService: ConfigurationService,
    private readonly bitrix24: Bitrix24Service,
    @InjectQueue(QUEUE_B24_SYNC) private readonly b24Queue: Queue,
    @InjectQueue(QUEUE_TIKTOK_SYNC) private readonly tiktokQueue: Queue,
  ) {}

  verifyTiktokSignature(rawBody: string, signature?: string): void {
    const secret = this.config.get<string>('TIKTOK_WEBHOOK_SECRET');
    if (!secret) return; // allow when not set (dev)
    if (!signature) throw new UnauthorizedException('Missing TikTok-Signature');
    const computed = crypto.createHmac('sha256', secret).update(rawBody).digest('base64');
    if (computed !== signature) throw new UnauthorizedException('Invalid TikTok-Signature');
  }

  normalizePhone(phone?: string | null): string | null {
    if (!phone) return null;
    let p = phone.replace(/[^+\d]/g, '');
    if (p.startsWith('00')) p = '+' + p.slice(2);
    if (!p.startsWith('+') && p.startsWith('0')) p = '+84' + p.slice(1); // default VN if not provided
    return p;
  }

  normalizeEmail(email?: string | null): string | null {
    if (!email) return null;
    return email.trim().toLowerCase();
  }

  async handleTiktokLead(payload: TiktokWebhookPayload, raw: unknown): Promise<{ leadId: string }> {
    const event = payload.event;
    const name = (payload.lead_data?.full_name as string | undefined) ?? 'Unknown';
    const email = this.normalizeEmail(payload.lead_data?.email as string | undefined);
    const phone = this.normalizePhone(payload.lead_data?.phone as string | undefined);
    const campaignId = payload.campaign?.campaign_id ?? null;
    const adId = payload.campaign?.ad_id ?? null;
    const formId = payload.form?.form_id ?? null;
    const externalId = payload.event_id;

    // deduplicate by email/phone
    let existing: Lead | null = null;
    if (email) existing = await this.leadRepo.findOne({ where: { email } });
    if (!existing && phone) existing = await this.leadRepo.findOne({ where: { phone } });
    if (!existing) existing = await this.leadRepo.findOne({ where: { external_id: externalId } });

    if (existing) {
      existing.name = existing.name || name;
      existing.campaign_id = campaignId ?? existing.campaign_id;
      existing.ad_id = adId ?? existing.ad_id;
      existing.form_id = formId ?? existing.form_id;
      existing.raw_data = (raw as Record<string, unknown>) ?? existing.raw_data;
      if (event === 'form.completed') {
        existing.status = 'completed';
        existing.score = Math.max(existing.score ?? 0, 50);
      }
      if (event === 'user.interaction') {
        existing.score = (existing.score ?? 0) + 10;
      }
      await this.leadRepo.save(existing);
      return { leadId: existing.id };
    }

    const newLead = this.leadRepo.create({
      external_id: externalId,
      source: 'tiktok',
      name,
      email: email ?? null,
      phone: phone ?? null,
      campaign_id: campaignId,
      ad_id: adId,
      form_id: formId,
      raw_data: (raw as Record<string, unknown>) ?? null,
      status: event === 'form.completed' ? 'completed' : 'new',
      score: event === 'user.interaction' ? 10 : 0,
    });
    const saved = await this.leadRepo.save(newLead);

    // enqueue Bitrix24 upsert (retry via queue)
    try {
      await this.b24Queue.add('upsertLead', {
        external_id: externalId,
        name,
        email,
        phone,
        campaign_name: payload.campaign?.campaign_name ?? null,
        ad_name: payload.campaign?.ad_name ?? null,
        ttclid: (payload.lead_data?.ttclid as string | undefined) ?? null,
        raw: raw as Record<string, unknown>,
      }, { attempts: 5, backoff: { type: 'exponential', delay: 2000 } });
    } catch {}
    // Event-specific hooks
    if (event === 'form.completed') {
      // placeholder: can update status or log
    } else if (event === 'user.interaction') {
      // placeholder: can bump score or log
    }
    return { leadId: saved.id };
  }
}


