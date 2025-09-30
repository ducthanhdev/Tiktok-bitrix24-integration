import { Injectable } from '@nestjs/common';

@Injectable()
export class AppService {
  getStatus() {
    return { 
      status: 'ok', 
      service: 'TikTok-Bitrix24 Integration API',
      version: '1.0.0'
    };
  }
}
