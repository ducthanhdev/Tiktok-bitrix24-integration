import { Module } from '@nestjs/common';
import { LeadsController } from './leads.controller';
import { LeadsService } from './leads.service';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Lead } from './lead.entity';
import { Deal } from '../deals/deal.entity';
import { ConfigModule } from '../config/config.module';

@Module({
  imports: [TypeOrmModule.forFeature([Lead, Deal]), ConfigModule],
  controllers: [LeadsController],
  providers: [LeadsService]
})
export class LeadsModule {}
