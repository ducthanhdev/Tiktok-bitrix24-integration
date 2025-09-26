import { Controller, Get, Query } from '@nestjs/common';
import { DealsService } from './deals.service';

@Controller('deals')
export class DealsController {
  constructor(private readonly dealsService: DealsService) {}

  @Get()
  async list(@Query('status') status?: string) {
    return this.dealsService.list({ status });
  }
}


