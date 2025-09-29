import { Module } from '@nestjs/common';
import { HttpModule } from './http.module.js';
import { Bitrix24Service } from './bitrix24.service';
import { ConfigModule } from '../config/config.module';

@Module({
  imports: [HttpModule, ConfigModule],
  providers: [Bitrix24Service],
  exports: [Bitrix24Service],
})
export class Bitrix24Module {}
