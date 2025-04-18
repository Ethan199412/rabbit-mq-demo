import { Controller, Get } from '@nestjs/common';
import { RabbitMQService } from './rabbit.service';

@Controller('rabbit')
export class RabbitMqController {
  constructor(private readonly rabbitService: RabbitMQService) {}

  @Get('test')
  async sendTestMessage() {
    console.log('[p1.0] get request');
    const routingKey = '';
    const payload = {
      timestamp: new Date(),
      message: 'haha',
    };

    await this.rabbitService.publishMessage(routingKey, payload);
    return { status: 'Message sent' };
  }
}
