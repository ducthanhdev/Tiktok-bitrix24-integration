import { Injectable, HttpService, HttpException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class Bitrix24Service {
  constructor(
    private readonly http: HttpService,
    private readonly config: ConfigService,
  ) {}

  async createLead(fields: Record<string, any>): Promise<number> {
    const endpoint = this.config.get<string>('BITRIX24_WEBHOOK_URL');
    if (!endpoint) throw new HttpException('Bitrix24 endpoint not configured', 500);
    const url = `${endpoint}/crm.lead.add.json`;
    try {
      const response = await this.http.post(url, { fields }).toPromise();
      if (response.data && response.data.result) {
        return response.data.result;
      }
      throw new HttpException('Bitrix24 response invalid', 500);
    } catch (err) {
      throw new HttpException('Bitrix24 API error: ' + err.message, 500);
    }
  }
}
