import { Processor, WorkerHost } from '@nestjs/bullmq';
import { QUEUE_B24_SYNC } from '../queues.module';
import type { Job } from 'bullmq';
import { Injectable, Logger } from '@nestjs/common';
import { Bitrix24Service } from '../../bitrix24/bitrix24.service';

@Processor(QUEUE_B24_SYNC)
@Injectable()
export class B24SyncProcessor extends WorkerHost {
  private readonly logger = new Logger(B24SyncProcessor.name);
  constructor(private readonly b24: Bitrix24Service) { super(); }
  async process(job: Job): Promise<void> {
    try {
      if (job.name === 'upsertLead') {
        await this.b24.upsertLeadFromTikTok(job.data);
      }
    } catch (e) {
      this.logger.error('B24 sync failed', e as Error);
      throw e;
    }
  }
}


