import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Lead } from '../leads/lead.entity';
import { Deal } from '../deals/deal.entity';
import { ConfigurationService } from '../config/configuration.service';

@Injectable()
export class AnalyticsService {
  constructor(
    @InjectRepository(Lead) private readonly leadRepo: Repository<Lead>,
    @InjectRepository(Deal) private readonly dealRepo: Repository<Deal>,
    private readonly configService: ConfigurationService,
  ) {}

  async getConversionRates() {
    const totalLeads = await this.leadRepo.count();
    const totalDeals = await this.dealRepo.count();
    const rate = totalLeads > 0 ? (totalDeals / totalLeads) * 100 : 0;
    return { totalLeads, totalDeals, conversionRate: Math.round(rate * 100) / 100 };
  }

  async getCampaignPerformance(opts?: { dateRangeDays?: number }) {
    const qb = this.leadRepo.createQueryBuilder('l')
      .select('l.campaign_id', 'campaign_id')
      .addSelect('COUNT(*)', 'leads')
      .groupBy('l.campaign_id')
      .orderBy('leads', 'DESC');
    if (opts?.dateRangeDays && opts.dateRangeDays > 0) {
      const from = new Date(Date.now() - opts.dateRangeDays * 24 * 60 * 60 * 1000);
      qb.where('l.created_at >= :from', { from });
    }
    const rows = await qb.getRawMany();
    return rows;
  }

  async getCplRoi(opts?: { dateRangeDays?: number }) {
    const costConfig = await this.configService.get<Record<string, number>>('campaign_costs').catch(() => ({} as Record<string, number>));
    const perf = await this.getCampaignPerformance(opts);
    const deals = await this.dealRepo.createQueryBuilder('d')
      .select('d.stage', 'stage')
      .addSelect('COUNT(*)', 'count')
      .groupBy('d.stage')
      .getRawMany();
    const wonCount = Number((deals.find((r: any) => r.stage === 'WON')?.count ?? 0));
    const result = perf.map((row: any) => {
      const leads = Number(row.leads);
      const cost = Number(costConfig[row.campaign_id] ?? 0);
      const cpl = leads > 0 ? cost / leads : 0;
      // naive ROI: assume revenue per won deal = config.revenue_per_deal
      return { campaign_id: row.campaign_id, leads, cost, cpl, won: wonCount, roi: wonCount * (costConfig['revenue_per_deal'] ?? 0) - cost };
    });
    return result;
  }
}


