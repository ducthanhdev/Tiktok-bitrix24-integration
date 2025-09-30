import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ConfigService } from '@nestjs/config';
import { APP_GUARD } from '@nestjs/core';
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
import { NotificationsModule } from './notifications/notifications.module';
import { BullModule } from '@nestjs/bullmq';
import { ThrottlerModule } from '@nestjs/throttler';
import { ThrottlerGuard } from '@nestjs/throttler';
import { TerminusModule } from '@nestjs/terminus';
import { QueuesModule } from './queues/queues.module';

@Module({
  imports: [
    LeadsModule,
    DealsModule,
    ConfigModule,
    AnalyticsModule,
    WebhooksModule,
    Bitrix24Module,
    NotificationsModule,
    TerminusModule,
    QueuesModule,
    BullModule.forRoot({
      connection: {
        host: process.env.REDIS_HOST || 'localhost',
        port: Number(process.env.REDIS_PORT || 6379),
      },
    }),
    ThrottlerModule.forRoot([{ ttl: 60_000, limit: 120 }]),
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
        logging: ['error', 'warn'],
      }),
    }),
  ],
  controllers: [AppController],
  providers: [
    AppService,
    { provide: APP_GUARD, useClass: ThrottlerGuard },
  ],
})
export class AppModule {}
