import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { Logger } from '@nestjs/common';
import { environment, rabbitmqConfig } from './config';
import { MicroserviceOptions } from '@nestjs/microservices';

async function bootstrap() {
  const logger = new Logger('Processor');
  // const app = await NestFactory.create(AppModule);
  // app.setGlobalPrefix('api/v1');
  // app.useGlobalPipes(
  //   new ValidationPipe({
  //     whitelist: true,
  //     forbidNonWhitelisted: true,
  //   }),
  // );
const app = await NestFactory.createMicroservice<MicroserviceOptions>(
    AppModule,
    {
      ...rabbitmqConfig,
    },
  );
  await app.listen();
  logger.log(`Application is running on: ${environment.port}`);
}
bootstrap();
