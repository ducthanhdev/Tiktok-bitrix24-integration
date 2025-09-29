import { Controller, Get, Query, Res } from '@nestjs/common';
import { ApiOperation, ApiQuery, ApiTags } from '@nestjs/swagger';
import { AnalyticsService } from './analytics.service';
import type { Response } from 'express';

@ApiTags('Analytics')
@Controller('analytics')
export class AnalyticsController {
  constructor(private readonly analyticsService: AnalyticsService) {}

  @Get('conversion-rates')
  @ApiOperation({ summary: 'Get conversion rates' })
  async conversion() {
    return this.analyticsService.getConversionRates();
  }

  @Get('campaign-performance')
  @ApiOperation({ summary: 'Get campaign performance' })
  @ApiQuery({ name: 'date_range', required: false, description: 'e.g., 30d' })
  async campaignPerformance(@Query('date_range') dateRange?: string) {
    const days = parseDateRangeDays(dateRange);
    return this.analyticsService.getCampaignPerformance(days ? { dateRangeDays: days } : undefined);
  }

  @Get('/reports/export')
  @ApiOperation({ summary: 'Export report' })
  @ApiQuery({ name: 'format', required: false, example: 'csv' })
  @ApiQuery({ name: 'date_range', required: false, example: '30d' })
  async export(@Query('format') format = 'csv', @Query('date_range') dateRange: string | undefined, @Res() res: Response) {
    const days = parseDateRangeDays(dateRange);
    const data = await this.analyticsService.getCampaignPerformance(days ? { dateRangeDays: days } : undefined);
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

  @Get('/reports/export.xlsx')
  @ApiOperation({ summary: 'Export report Excel' })
  @ApiQuery({ name: 'date_range', required: false, example: '30d' })
  async exportExcel(@Query('date_range') dateRange: string | undefined, @Res() res: Response) {
    const days = parseDateRangeDays(dateRange);
    const data = await this.analyticsService.getCampaignPerformance(days ? { dateRangeDays: days } : undefined);
    const { Workbook } = await import('exceljs');
    const wb = new Workbook();
    const ws = wb.addWorksheet('Campaign Performance');
    ws.columns = [
      { header: 'campaign_id', key: 'campaign_id', width: 30 },
      { header: 'leads', key: 'leads', width: 10 },
    ];
    ws.addRows(data);
    res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
    res.setHeader('Content-Disposition', 'attachment; filename="report.xlsx"');
    await wb.xlsx.write(res);
    res.end();
  }
}

function parseDateRangeDays(input?: string): number | null {
  if (!input) return null;
  const m = input.match(/^(\d+)d$/i);
  if (!m) return null;
  return Number(m[1]);
}

