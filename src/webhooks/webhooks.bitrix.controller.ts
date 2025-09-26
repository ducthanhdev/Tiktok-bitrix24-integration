import { Body, Controller, HttpCode, Post } from '@nestjs/common';

@Controller('webhooks/bitrix24')
export class BitrixWebhooksController {
  @Post('deals')
  @HttpCode(200)
  async receiveDeal(@Body() body: unknown) {
    // For now, acknowledge receipt. Later: update local deal/lead state.
    return { status: 'ok' };
  }
}


