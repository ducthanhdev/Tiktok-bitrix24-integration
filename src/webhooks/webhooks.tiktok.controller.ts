import { Body, Controller, Headers, HttpCode, Post, Req } from '@nestjs/common';
import { WebhooksService } from './webhooks.service';
import type { Request } from 'express';

@Controller('webhooks/tiktok')
export class TiktokWebhooksController {
  constructor(private readonly service: WebhooksService) {}

  @Post('leads')
  @HttpCode(200)
  async receiveLead(@Body() body: unknown, @Headers('tiktok-signature') sig: string | undefined, @Req() req: Request) {
    const raw = (req as any).rawBody ?? JSON.stringify(body);
    this.service.verifyTiktokSignature(typeof raw === 'string' ? raw : JSON.stringify(body), sig);
    const result = await this.service.handleTiktokLead(body as any, body);
    return { status: 'ok', leadId: result.leadId };
  }
}


