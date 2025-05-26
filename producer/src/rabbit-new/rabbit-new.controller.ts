import { Body, Controller, Post } from '@nestjs/common';
import { RabbitNewService } from './rabbit-new.service';
import { AmqpConnection } from '@golevelup/nestjs-rabbitmq';
import { PublishReqDto } from './rabbit-new.dto';

@Controller('rabbit-new')
export class RabbitNewController {
  constructor(
    private readonly rabbitNewService: RabbitNewService,
    private readonly amqpConnection: AmqpConnection,
  ) {}

  @Post('publish')
  async publish(@Body() body: PublishReqDto) {
    // throw new Error('123');
    return this.rabbitNewService.publish(body);
  }

  @Post('china-topic')
  async sendFootballNews(
    @Body()
    body: {
      message: string;
      routing_key: string;
      num: number;
      persistent: boolean;
    },
  ) {
    const { message, routing_key, num, persistent } = body;
    return this.rabbitNewService.sendFootballNews(
      routing_key,
      message,
      num,
      persistent,
    );
  }

  @Post('china-temp-ex')
  async sendFootballNewsTemp(
    @Body()
    body: {
      message: string;
      routing_key: string;
      num: number;
      persistent: boolean;
    },
  ) {
    const { message, routing_key, num, persistent } = body;
    return this.rabbitNewService.sendFootballNewsTemp(
      routing_key,
      message,
      num,
      persistent,
    );
  }

  @Post('test')
  async testPageOut(@Body() body: { num: number }) {
    const { num } = body;
    for (let i = 0; i < num; i++) {
      this.amqpConnection.publish(
        '',
        'my_queue',
        { a: 123 },
        {
          deliverMode: 1,
        },
      );
    }
  }
}
