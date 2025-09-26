import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AnalyticsService } from './analytics.service.js';
import { AnalyticsController } from './analytics.controller.js';
import { Lead } from '../leads/lead.entity';
import { Deal } from '../deals/deal.entity';

@Module({
  imports: [TypeOrmModule.forFeature([Lead, Deal])],
  controllers: [AnalyticsController],
  providers: [AnalyticsService],
})
export class AnalyticsModule {}
