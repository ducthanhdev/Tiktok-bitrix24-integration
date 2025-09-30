import { NestFactory } from '@nestjs/core';
import { AppModule } from '../src/app.module';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import { writeFileSync } from 'node:fs';

async function run() {
  const app = await NestFactory.create(AppModule, { logger: false as any });
  const config = new DocumentBuilder().setTitle('API').setVersion('1.0.0').build();
  const doc = SwaggerModule.createDocument(app, config);
  writeFileSync('openapi.json', JSON.stringify(doc, null, 2), 'utf8');
  await app.close();
  // eslint-disable-next-line no-console
  console.log('OpenAPI exported to openapi.json');
}

run().catch((e) => {
  // eslint-disable-next-line no-console
  console.error(e);
  process.exit(1);
});


