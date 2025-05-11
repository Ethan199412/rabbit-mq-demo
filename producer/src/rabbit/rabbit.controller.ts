import { Controller, Get, Param, Query } from '@nestjs/common';
import { RabbitMQService } from './rabbit.service';
import { ChinaMqMessageDto } from './rabbit.dto';

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

  @Get('produce_china')
  async sendChinaMessage(@Query() query: ChinaMqMessageDto) {
    const { routing_key } = query;
    console.log('[p1.0] get request');
    // const routingKey = 'china-sports';
    const payload = {
      timestamp: new Date(),
      message: 'chian-haha',
    };

    await this.rabbitService.publishChinaMessage(routing_key, payload);
    return { status: 'Message sent' };
  }
}
