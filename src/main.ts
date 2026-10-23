import 'reflect-metadata';

import { Logger } from '@nestjs/common';
import { NestFactory } from '@nestjs/core';

import { AppModule } from './app.module.js';

const logger = new Logger('Bootstrap');

async function bootstrap(): Promise<void> {
  const app = await NestFactory.createApplicationContext(AppModule, {
    abortOnError: false,
  });

  try {
    logger.log('Gladio initialized.');
  } finally {
    await app.close();
  }
}

bootstrap().catch((error: unknown) => {
  logger.error(
    'Gladio initialization failed.',
    error instanceof Error ? error.stack : undefined,
  );
  process.exitCode = 1;
});
