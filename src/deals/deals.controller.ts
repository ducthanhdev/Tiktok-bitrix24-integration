import { Controller, Get, Query } from '@nestjs/common';
import { ApiOperation, ApiQuery, ApiTags } from '@nestjs/swagger';
import { DealsService } from './deals.service';

@ApiTags('Deals')
@Controller('deals')
export class DealsController {
  constructor(private readonly dealsService: DealsService) {}

  @Get()
  @ApiOperation({ summary: 'List deals with optional filters' })
  @ApiQuery({ name: 'status', required: false, description: 'Stage/status code (e.g., NEW)' })
  @ApiQuery({ name: 'assigned_to', required: false, description: 'Assignee identifier' })
  @ApiQuery({ name: 'pipeline_id', required: false, description: 'Pipeline identifier' })
  async list(
    @Query('status') status?: string,
    @Query('assigned_to') assigned_to?: string,
    @Query('pipeline_id') pipeline_id?: string,
  ) {
    return this.dealsService.list({ status, assigned_to, pipeline_id });
  }
}


