import { Module } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import axios, { AxiosInstance } from 'axios';

export const AXIOS_B24 = 'AXIOS_B24';

@Module({
  providers: [
    {
      provide: AXIOS_B24,
      inject: [ConfigService],
      useFactory: (config: ConfigService): AxiosInstance => {
        const baseURL = config.get<string>('B24_BASE_URL');
        const token = config.get<string>('B24_TOKEN');
        const instance = axios.create({ baseURL, timeout: 10000 });
        instance.interceptors.request.use((req) => {
          if (!req.params) req.params = {};
          if (token) (req.params as any).auth = token;
          return req;
        });
        return instance;
      },
    },
  ],
  exports: [AXIOS_B24],
})
export class HttpModule {}


