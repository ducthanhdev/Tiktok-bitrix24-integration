import { Processor, WorkerHost } from '@nestjs/bullmq';
import { QUEUE_NOTIFY } from '../queues.module';
import type { Job } from 'bullmq';
import { Injectable } from '@nestjs/common';
import { NotificationsService } from '../../notifications/notifications.service';

@Processor(QUEUE_NOTIFY)
@Injectable()
export class NotifyProcessor extends WorkerHost {
  constructor(private readonly notifications: NotificationsService) { super(); }
  async process(job: Job): Promise<void> {
    if (job.name === 'dealCreated') {
      await this.notifications.notifyDealCreated(job.data);
    }
  }
}


