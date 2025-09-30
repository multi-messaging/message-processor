import { Controller, Get, Logger } from '@nestjs/common';
import { AppService } from './app.service';
import { MessagePattern } from '@nestjs/microservices';

@Controller()
export class AppController {
  private readonly logger = new Logger(AppController.name);

  constructor(private readonly appService: AppService) {}

  @MessagePattern('message-processor.health.check')
  async healthCheck() {
    this.logger.log('Health check de Messages Processor ejecutado');
    return {
      success: true,
      service: 'messages-processor',
      status: 'healthy',
      timestamp: new Date().toISOString(),
    };
  }
}
