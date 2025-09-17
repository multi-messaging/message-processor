import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { Logger } from '@nestjs/common';
import { environment } from './config';

async function bootstrap() {
  const logger = new Logger('Processor');
  const app = await NestFactory.create(AppModule);

  await app.listen(environment.port || 3000);
  logger.log(`Application is running on: ${environment.port}`);
}
bootstrap();
