import { Controller, Get, Param, ParseUUIDPipe, Post, Query } from '@nestjs/common';
import { ApiOperation, ApiQuery, ApiTags } from '@nestjs/swagger';
import { LeadsService } from './leads.service';

@ApiTags('Leads')
@Controller('leads')
export class LeadsController {
  constructor(private readonly leadsService: LeadsService) {}

  @Get()
  @ApiOperation({ summary: 'List leads' })
  @ApiQuery({ name: 'page', required: false, example: 1 })
  @ApiQuery({ name: 'limit', required: false, example: 10 })
  @ApiQuery({ name: 'source', required: false, example: 'tiktok' })
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
  @ApiOperation({ summary: 'Get lead by id' })
  async get(@Param('id', new ParseUUIDPipe()) id: string) {
    return this.leadsService.getById(id);
  }

  @Post(':id/convert-to-deal')
  @ApiOperation({ summary: 'Convert lead to deal (rule-based)' })
  async convert(@Param('id', new ParseUUIDPipe()) id: string) {
    return this.leadsService.convertToDeal(id);
  }
}
