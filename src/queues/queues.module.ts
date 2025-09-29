import { Module } from '@nestjs/common';
import { BullModule } from '@nestjs/bullmq';
import { B24SyncProcessor } from './workers/b24-sync.processor.js';
import { NotifyProcessor } from './workers/notify.processor.js';
import { TiktokSyncProcessor } from './workers/tiktok-sync.processor.js';

export const QUEUE_B24_SYNC = 'b24-sync';
export const QUEUE_NOTIFY = 'notify';
export const QUEUE_TIKTOK_SYNC = 'tiktok-sync';

@Module({
  imports: [
    BullModule.registerQueue({ name: QUEUE_B24_SYNC }),
    BullModule.registerQueue({ name: QUEUE_NOTIFY }),
    BullModule.registerQueue({ name: QUEUE_TIKTOK_SYNC }),
  ],
  providers: [B24SyncProcessor, NotifyProcessor, TiktokSyncProcessor],
  exports: [BullModule],
})
export class QueuesModule {}


