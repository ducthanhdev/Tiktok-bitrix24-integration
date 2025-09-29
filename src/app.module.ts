import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ConfigService } from '@nestjs/config';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { LeadsModule } from './leads/leads.module';
import { DealsModule } from './deals/deals.module';
import { ConfigModule } from './config/config.module';
import { AnalyticsModule } from './analytics/analytics.module';
import { Lead } from './leads/lead.entity';
import { Deal } from './deals/deal.entity';
import { ConfigurationEntity } from './config/configuration.entity';
import { WebhooksModule } from './webhooks/webhooks.module';
import { Bitrix24Module } from './bitrix24/bitrix24.module';

@Module({
  imports: [
    LeadsModule,
    DealsModule,
    ConfigModule,
    AnalyticsModule,
    WebhooksModule,
    Bitrix24Module,
    TypeOrmModule.forRootAsync({
      inject: [ConfigService],
      useFactory: (config: ConfigService) => ({
        type: 'postgres',
        host: config.getOrThrow<string>('DB_HOST'),
        port: config.get<number>('DB_PORT', 5432),
        username: config.getOrThrow<string>('DB_USERNAME'),
        password: config.getOrThrow<string>('DB_PASSWORD'),
        database: config.getOrThrow<string>('DB_NAME'),
        entities: [Lead, Deal, ConfigurationEntity],
        synchronize: true,
        // For production use migrations instead of synchronize
        logging: ['error', 'warn'],
      }),
    }),
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
