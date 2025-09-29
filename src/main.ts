import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import * as express from 'express';
import { SwaggerModule, DocumentBuilder } from '@nestjs/swagger';
import { RequestMethod } from '@nestjs/common';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  app.use(
    express.json({
      verify: (req: any, _res, buf) => {
        (req as any).rawBody = buf.toString('utf8');
      },
    }),
  );

  const config = new DocumentBuilder()
    .setTitle('TikTok - Bitrix24 Integration API')
    .setDescription('API documentation for webhooks, management, config, and analytics')
    .setVersion('1.0.0')
    .build();
  const document = SwaggerModule.createDocument(app, config);
  SwaggerModule.setup('docs', app, document);

  app.setGlobalPrefix('api/v1', {
    exclude: [
      { path: 'webhooks/tiktok/leads', method: RequestMethod.ALL },
      { path: 'webhooks/bitrix24/deals', method: RequestMethod.ALL },
      { path: 'docs', method: RequestMethod.ALL },
    ],
  });

  // Legacy redirects for GET requests without prefix (leads/deals/config/analytics)
  app.use((req: any, res: any, next: any) => {
    if (req.method !== 'GET') return next();
    const url: string = req.url || '';
    const legacyBases = ['/leads', '/deals', '/config', '/analytics'];
    const matched = legacyBases.find((b) => url.startsWith(b + '/') || url === b);
    if (!matched) return next();
    const target = '/api/v1' + url;
    res.redirect(308, target);
  });

  await app.listen(process.env.PORT ?? 3000);
}
bootstrap();
