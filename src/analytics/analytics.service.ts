import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Lead } from '../leads/lead.entity';
import { Deal } from '../deals/deal.entity';

@Injectable()
export class AnalyticsService {
  constructor(
    @InjectRepository(Lead) private readonly leadRepo: Repository<Lead>,
    @InjectRepository(Deal) private readonly dealRepo: Repository<Deal>,
  ) {}

  async getConversionRates() {
    const totalLeads = await this.leadRepo.count();
    const totalDeals = await this.dealRepo.count();
    const rate = totalLeads > 0 ? (totalDeals / totalLeads) * 100 : 0;
    return { totalLeads, totalDeals, conversionRate: Math.round(rate * 100) / 100 };
  }

  async getCampaignPerformance() {
    const qb = this.leadRepo.createQueryBuilder('l')
      .select('l.campaign_id', 'campaign_id')
      .addSelect('COUNT(*)', 'leads')
      .groupBy('l.campaign_id')
      .orderBy('leads', 'DESC');
    const rows = await qb.getRawMany();
    return rows;
  }
}


