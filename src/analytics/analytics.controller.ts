import { Controller, Get, Query, Res } from '@nestjs/common';
import { AnalyticsService } from './analytics.service';
import type { Response } from 'express';

@Controller('analytics')
export class AnalyticsController {
  constructor(private readonly analyticsService: AnalyticsService) {}

  @Get('conversion-rates')
  async conversion() {
    return this.analyticsService.getConversionRates();
  }

  @Get('campaign-performance')
  async campaignPerformance() {
    return this.analyticsService.getCampaignPerformance();
  }

  @Get('/reports/export')
  async export(@Query('format') format = 'csv', @Res() res: Response) {
    const data = await this.analyticsService.getCampaignPerformance();
    if (format === 'json') {
      return res.json(data);
    }
    const header = 'campaign_id,leads\n';
    const rows = data.map((r: any) => `${r.campaign_id ?? ''},${r.leads}`).join('\n');
    const csv = header + rows + '\n';
    res.setHeader('Content-Type', 'text/csv');
    res.setHeader('Content-Disposition', 'attachment; filename="report.csv"');
    return res.send(csv);
  }
}


