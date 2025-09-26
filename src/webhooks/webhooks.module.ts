import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { WebhooksService } from './webhooks.service';
import { TiktokWebhooksController } from './webhooks.tiktok.controller';
import { BitrixWebhooksController } from './webhooks.bitrix.controller';
import { Lead } from '../leads/lead.entity';
import { Deal } from '../deals/deal.entity';
import { ConfigModule } from '../config/config.module';

@Module({
  imports: [TypeOrmModule.forFeature([Lead, Deal]), ConfigModule],
  controllers: [TiktokWebhooksController, BitrixWebhooksController],
  providers: [WebhooksService],
})
export class WebhooksModule {}


