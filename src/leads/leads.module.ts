import { Module } from '@nestjs/common';
import { LeadsController } from './leads.controller';
import { LeadsService } from './leads.service';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Lead } from './lead.entity';
import { Deal } from '../deals/deal.entity';
import { ConfigModule } from '../config/config.module';
import { Bitrix24Module } from '../bitrix24/bitrix24.module';
import { NotificationsModule } from '../notifications/notifications.module';

@Module({
  imports: [TypeOrmModule.forFeature([Lead, Deal]), ConfigModule, Bitrix24Module, NotificationsModule],
  controllers: [LeadsController],
  providers: [LeadsService]
})
export class LeadsModule {}
