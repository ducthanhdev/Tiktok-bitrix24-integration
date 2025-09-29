import { Processor, WorkerHost } from '@nestjs/bullmq';
import { QUEUE_TIKTOK_SYNC } from '../queues.module';
import type { Job } from 'bullmq';
import { Injectable, Logger } from '@nestjs/common';
import axios from 'axios';

@Processor(QUEUE_TIKTOK_SYNC)
@Injectable()
export class TiktokSyncProcessor extends WorkerHost {
  private readonly logger = new Logger(TiktokSyncProcessor.name);
  async process(job: Job): Promise<void> {
    if (job.name === 'conversion') {
      const url = process.env.TIKTOK_CONV_URL;
      const token = process.env.TIKTOK_CONV_TOKEN;
      if (!url || !token) {
        this.logger.log('[MockTikTokSync] conversion sent');
        return;
      }
      await axios.post(url, job.data, { headers: { Authorization: `Bearer ${token}` } });
    }
  }
}


