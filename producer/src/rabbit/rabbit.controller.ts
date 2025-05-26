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

    await this.rabbitService.publishMessage(1000000, payload);
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

  @Get('produce_china_temp')
  async sendChinaTempMessage(@Query() query: ChinaMqMessageDto) {
    // for (let i = 0; i < 100000; i++) {
    const { routing_key } = query;
    console.log('[p1.0] get request');
    // const routingKey = 'china-sports';
    const payload = {
      timestamp: new Date(),
      message: 'chian-haha',
    };

    await this.rabbitService.publishTempMessage(routing_key, payload);
    // }
    return { status: 'Message sent' };
  }

  @Get('produce_china_topic')
  async sendChinaTopicMessage(@Query() query: ChinaMqMessageDto) {
    const { routing_key } = query;
    console.log('[p1.0] get request');
    // const routingKey = 'china-sports';
    const payload = {
      timestamp: new Date(),
      message: 'china-haha1',
    };

    await this.rabbitService.publishChinaTopicMessage(routing_key, payload);
    return { status: 'Message sent' };
  }

  @Get('produce_china_topic_confirm')
  async sendChinaTopicConfirmMessage(@Query() query: ChinaMqMessageDto) {
    const { routing_key } = query;
    console.log('[p1.0] get request');
    // const routingKey = 'china-sports';
    const payload = {
      timestamp: new Date(),
      message: 'china-haha1',
    };

    await this.rabbitService.publishConfirmMessage(routing_key, payload);
    return { status: 'Message sent' };
  }
}
