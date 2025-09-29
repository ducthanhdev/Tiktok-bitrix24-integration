import { Inject, Injectable, Logger } from '@nestjs/common';
import { AXIOS_B24 } from './http.module';
import type { AxiosInstance } from 'axios';
import { ConfigurationService } from '../config/configuration.service';

@Injectable()
export class Bitrix24Service {
  private readonly logger = new Logger(Bitrix24Service.name);
  constructor(
    @Inject(AXIOS_B24) private readonly http: AxiosInstance,
    private readonly configurationService: ConfigurationService,
  ) {}

  async upsertLeadFromTikTok(lead: {
    external_id: string;
    name: string;
    email?: string | null;
    phone?: string | null;
    campaign_name?: string | null;
    ad_name?: string | null;
    ttclid?: string | null;
    raw?: Record<string, unknown> | null;
  }): Promise<{ bitrixId: number | null }> {
    const payload = await this.buildPayloadFromMapping(lead);
    try {
      const existingId = await this.findLeadIdByEmailPhone(lead.email ?? undefined, lead.phone ?? undefined);
      if (existingId) {
        await this.http.post('/crm.lead.update.json', { id: existingId, fields: payload });
        this.logger.log(`Bitrix lead updated id=${existingId}`);
        return { bitrixId: existingId };
      }
      const createRes = await this.http.post('/crm.lead.add.json', { fields: payload });
      const id: number | undefined = createRes.data?.result;
      this.logger.log(`Bitrix lead created id=${id}`);
      return { bitrixId: id ?? null };
    } catch (e) {
      this.logger.error('Bitrix upsert lead failed', e as Error);
      return { bitrixId: null };
    }
  }

  async addTimelineNote(leadId: number, message: string): Promise<void> {
    try {
      await this.http.post('/crm.timeline.note.add.json', { fields: { ENTITY_ID: leadId, TEXT: message } });
    } catch (e) {
      this.logger.warn('Bitrix timeline note failed');
    }
  }

  private async buildPayloadFromMapping(lead: {
    name: string; email?: string | null; phone?: string | null; ttclid?: string | null; campaign_name?: string | null; ad_name?: string | null;
  }): Promise<Record<string, unknown>> {
    const mapping = await this.configurationService.get<Record<string, string>>('field_mapping');
    const payload: Record<string, unknown> = {};
    const source: Record<string, unknown> = {
      lead_data: { full_name: lead.name, email: lead.email, phone: lead.phone, ttclid: lead.ttclid },
      campaign: { campaign_name: lead.campaign_name, ad_name: lead.ad_name },
    };
    for (const [from, to] of Object.entries(mapping || {})) {
      const value = from.split('.').reduce<any>((acc, key) => (acc ? (acc as any)[key] : undefined), source);
      if (typeof to === 'string' && value !== undefined && value !== null) {
        payload[to] = value;
      }
    }
    return payload;
  }

  private async findLeadIdByEmailPhone(email?: string, phone?: string): Promise<number | null> {
    try {
      const filter: any = {};
      if (email) filter['EMAIL'] = email;
      if (phone) filter['PHONE'] = phone;
      if (Object.keys(filter).length === 0) return null;
      const res = await this.http.post('/crm.lead.list.json', { filter, select: ['ID'] });
      const list: Array<{ ID: string }> = res.data?.result ?? [];
      const first = list[0]?.ID;
      return first ? Number(first) : null;
    } catch {
      return null;
    }
  }

  async createDealForLead(params: { leadBitrixId: number; title: string; stageId?: string; probability?: number }): Promise<number | null> {
    try {
      const res = await this.http.post('/crm.deal.add.json', {
        fields: {
          TITLE: params.title,
          STAGE_ID: params.stageId ?? 'NEW',
          PROBABILITY: params.probability ?? 0,
          CONTACT_ID: null,
          // In Bitrix, binding lead to deal is indirect; we'll log a timeline note on the lead
        },
      });
      const id: number | undefined = res.data?.result;
      if (id) await this.addTimelineNote(params.leadBitrixId, `Deal created #${id}`);
      return id ?? null;
    } catch (e) {
      this.logger.error('Bitrix create deal failed', e as Error);
      return null;
    }
  }
}
