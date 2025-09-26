import { Injectable, UnauthorizedException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Lead } from '../leads/lead.entity';
import { Deal } from '../deals/deal.entity';
import { ConfigService } from '@nestjs/config';
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
    const name = (payload.lead_data?.full_name as string | undefined) ?? 'Unknown';
    const email = this.normalizeEmail(payload.lead_data?.email as string | undefined);
    const phone = this.normalizePhone(payload.lead_data?.phone as string | undefined);
    const campaignId = payload.campaign?.campaign_id ?? null;
    const adId = payload.campaign?.ad_id ?? null;
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
      existing.raw_data = (raw as Record<string, unknown>) ?? existing.raw_data;
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
      raw_data: (raw as Record<string, unknown>) ?? null,
      status: 'new',
    });
    const saved = await this.leadRepo.save(newLead);
    return { leadId: saved.id };
  }
}


