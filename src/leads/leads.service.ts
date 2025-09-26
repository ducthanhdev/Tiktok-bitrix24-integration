import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Lead } from './lead.entity';
import { Deal } from '../deals/deal.entity';
import { ConfigurationService } from '../config/configuration.service';

@Injectable()
export class LeadsService {
  constructor(
    @InjectRepository(Lead) private readonly leadRepo: Repository<Lead>,
    @InjectRepository(Deal) private readonly dealRepo?: Repository<Deal>,
    private readonly configurationService?: ConfigurationService,
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
    try {
      const rules = (await this.configurationService?.get('deal_rules')) as any[] | undefined;
      if (Array.isArray(rules)) {
        const campaignName = (lead.raw_data as any)?.campaign?.campaign_name || '';
        for (const rule of rules) {
          const cond = String(rule.condition || '');
          if (cond.includes('campaign.campaign_name') && cond.toLowerCase().includes('contains')) {
            const token = cond.split('CONTAINS')[1]?.trim()?.replace(/^'|"|\s+|'+|"+$/g, '') || '';
            if (campaignName.toLowerCase().includes(token.toLowerCase())) {
              stage = rule.stage_id || stage;
              probability = typeof rule.probability === 'number' ? rule.probability : probability;
              break;
            }
          }
        }
      }
    } catch {}

    const deal = this.dealRepo.create({
      lead,
      title: `Deal for ${lead.name}`,
      stage,
      probability,
    });
    const saved = await this.dealRepo.save(deal);
    return saved;
  }
}
