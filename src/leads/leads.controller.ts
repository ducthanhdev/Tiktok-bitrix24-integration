import { Controller, Get, Param, ParseUUIDPipe, Post, Query } from '@nestjs/common';
import { LeadsService } from './leads.service';

@Controller('leads')
export class LeadsController {
  constructor(private readonly leadsService: LeadsService) {}

  @Get()
  async list(
    @Query('page') page = '1',
    @Query('limit') limit = '10',
    @Query('source') source?: string,
  ) {
    const p = Math.max(parseInt(page, 10) || 1, 1);
    const l = Math.min(Math.max(parseInt(limit, 10) || 10, 1), 100);
    return this.leadsService.list({ page: p, limit: l, source });
  }

  @Get(':id')
  async get(@Param('id', new ParseUUIDPipe()) id: string) {
    return this.leadsService.getById(id);
  }

  @Post(':id/convert-to-deal')
  async convert(@Param('id', new ParseUUIDPipe()) id: string) {
    return this.leadsService.convertToDeal(id);
  }
}
