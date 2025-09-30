import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Lead } from './lead.entity';
import { Deal } from '../deals/deal.entity';
import { ConfigurationService } from '../config/configuration.service';
import { Bitrix24Service } from '../bitrix24/bitrix24.service';
import { NotificationsService } from '../notifications/notifications.service';
import { InjectQueue } from '@nestjs/bullmq';
import { Queue } from 'bullmq';
import { QUEUE_NOTIFY, QUEUE_TIKTOK_SYNC } from '../queues/queue.constants';

@Injectable()
export class LeadsService {
  constructor(
    @InjectRepository(Lead) private readonly leadRepo: Repository<Lead>,
    @InjectRepository(Deal) private readonly dealRepo: Repository<Deal>,
    private readonly configurationService: ConfigurationService,
    private readonly bitrix24Service: Bitrix24Service,
    private readonly notifications: NotificationsService,
    @InjectQueue(QUEUE_NOTIFY) private readonly notifyQueue: Queue,
    @InjectQueue(QUEUE_TIKTOK_SYNC) private readonly tiktokQueue: Queue,
  ) {}

  async list(params: { page: number; limit: number; source?: string }) {
    const { page, limit, source } = params;
    const [items, total] = await this.leadRepo.findAndCount({
      where: source ? { source } : {},
      order: { created_at: 'DESC' },
      skip: (page - 1) * limit,
      take: limit,
    });
    return { items, total, page, limit };
  }

  async getById(id: string) {
    const lead = await this.leadRepo.findOne({ where: { id } });
    if (!lead) throw new NotFoundException('Lead not found');
    return lead;
  }

  async convertToDeal(id: string) {
    const lead = await this.getById(id);
    if (!this.dealRepo) throw new Error('Deal repository not available');
    let stage = 'NEW';
    let probability = 30;
    let assignedTo: string | null = null;
    let pipelineId: string | null = null;
    try {
      const rules = (await this.configurationService?.get('deal_rules')) as any[] | undefined;
      if (Array.isArray(rules)) {
        const campaignName = (lead.raw_data as any)?.campaign?.campaign_name || '';
        const adName = (lead.raw_data as any)?.campaign?.ad_name || '';
        const formId = (lead.raw_data as any)?.form?.form_id || '';
        for (const rule of rules) {
          const cond = String(rule.condition || '');
          const checkContains = (expr: string, value: string) => {
            if (!expr.toLowerCase().includes('contains')) return false;
            const token = expr.split('CONTAINS')[1]?.trim()?.replace(/^'|"|\s+|'+|"+$/g, '') || '';
            return value.toLowerCase().includes(token.toLowerCase());
          };
          if (cond.includes('campaign.campaign_name') && checkContains(cond, campaignName)) {
            stage = rule.stage_id || stage;
            probability = typeof rule.probability === 'number' ? rule.probability : probability;
            pipelineId = rule.pipeline_id || pipelineId;
            if (rule.assigned_to) assignedTo = String(rule.assigned_to);
            break;
          }
          if (cond.includes('campaign.ad_name') && checkContains(cond, adName)) {
            stage = rule.stage_id || stage;
            probability = typeof rule.probability === 'number' ? rule.probability : probability;
            pipelineId = rule.pipeline_id || pipelineId;
            if (rule.assigned_to) assignedTo = String(rule.assigned_to);
            break;
          }
          if (cond.includes('form.form_id') && checkContains(cond, formId)) {
            stage = rule.stage_id || stage;
            probability = typeof rule.probability === 'number' ? rule.probability : probability;
            pipelineId = rule.pipeline_id || pipelineId;
            if (rule.assigned_to) assignedTo = String(rule.assigned_to);
            break;
          }
        }
      }
    } catch {}

    const deal = this.dealRepo.create({
      lead,
      title: `Deal for ${lead.name}`,
      stage,
      probability,
      assigned_to: assignedTo,
      pipeline_id: pipelineId,
    });
    const saved = await this.dealRepo.save(deal);

    // best-effort sync to Bitrix24
    if (lead.bitrix24_id && this.bitrix24Service) {
      await this.bitrix24Service.createDealForLead({
        leadBitrixId: lead.bitrix24_id,
        title: saved.title,
        stageId: saved.stage ?? 'NEW',
        probability: saved.probability,
      });
    }

    // enqueue notifications and tiktok conversion
    if (this.notifyQueue) {
      await this.notifyQueue.add('dealCreated', {
        title: saved.title,
        assigned_to: saved.assigned_to,
        probability: saved.probability,
        pipeline_id: saved.pipeline_id ?? null,
      }, { attempts: 3 });
    }
    if (this.tiktokQueue) {
      await this.tiktokQueue.add('conversion', {
        type: 'lead_converted',
        leadId: lead.id,
        dealId: saved.id,
        timestamp: Date.now(),
      }, { attempts: 5, backoff: { type: 'fixed', delay: 3000 } });
    }
    return saved;
  }
}
