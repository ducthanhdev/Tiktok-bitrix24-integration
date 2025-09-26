import { Body, Controller, Get, HttpCode, HttpStatus, Put } from '@nestjs/common';
import { ConfigurationService } from './configuration.service';

@Controller('config')
export class ConfigurationController {
  constructor(private readonly configService: ConfigurationService) {}

  @Get('mappings')
  async getMappings() {
    return this.configService.get<Record<string, unknown>>('field_mapping');
  }

  @Put('mappings')
  @HttpCode(HttpStatus.NO_CONTENT)
  async putMappings(@Body() body: Record<string, unknown>) {
    await this.configService.set('field_mapping', body);
  }

  @Get('rules')
  async getRules() {
    return this.configService.get<Array<Record<string, unknown>>>('deal_rules');
  }

  @Put('rules')
  @HttpCode(HttpStatus.NO_CONTENT)
  async putRules(@Body() body: Array<Record<string, unknown>>) {
    await this.configService.set('deal_rules', body);
  }
}


