import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import * as express from 'express';
import { SwaggerModule, DocumentBuilder } from '@nestjs/swagger';

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

  await app.listen(process.env.PORT ?? 3000);
}
bootstrap();
