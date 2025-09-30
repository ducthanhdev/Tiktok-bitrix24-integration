import { Module } from '@nestjs/common';
import { BullModule } from '@nestjs/bullmq';
import { B24SyncProcessor } from './workers/b24-sync.processor';
import { NotifyProcessor } from './workers/notify.processor';
import { TiktokSyncProcessor } from './workers/tiktok-sync.processor';
import { QUEUE_B24_SYNC, QUEUE_NOTIFY, QUEUE_TIKTOK_SYNC } from './queue.constants';
import { Bitrix24Module } from '../bitrix24/bitrix24.module';
import { NotificationsModule } from '../notifications/notifications.module';

// queue names centralized in queue.constants

@Module({
  imports: [
    BullModule.registerQueue({ name: QUEUE_B24_SYNC }),
    BullModule.registerQueue({ name: QUEUE_NOTIFY }),
    BullModule.registerQueue({ name: QUEUE_TIKTOK_SYNC }),
    Bitrix24Module,
    NotificationsModule,
  ],
  providers: [B24SyncProcessor, NotifyProcessor, TiktokSyncProcessor],
  exports: [BullModule],
})
export class QueuesModule {}


