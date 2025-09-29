import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import axios from 'axios';

@Injectable()
export class NotificationsService {
  private readonly logger = new Logger(NotificationsService.name);
  constructor(private readonly config: ConfigService) {}

  async notifyDealCreated(payload: { title: string; assigned_to?: string | null; probability?: number; pipeline_id?: string | null }) {
    const webhook = this.config.get<string>('SLACK_WEBHOOK_URL');
    if (!webhook) {
      this.logger.log(`[MockNotify] Deal created: ${payload.title}`);
      return;
    }
    try {
      await axios.post(webhook, {
        text: `Deal created: *${payload.title}* (assigned_to: ${payload.assigned_to ?? '-'}, probability: ${payload.probability ?? 0}%, pipeline: ${payload.pipeline_id ?? '-'})`,
      });
    } catch (e) {
      this.logger.warn('Slack notify failed');
    }
  }
}


