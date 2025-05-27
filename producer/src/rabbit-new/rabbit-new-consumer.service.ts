import { Injectable } from '@nestjs/common';
import {
  AmqpConnection,
  InjectRabbitMQConfig,
  RabbitRPC,
  RabbitSubscribe,
} from '@golevelup/nestjs-rabbitmq';
import { PublishReqDto, PublishDelayReqDto } from './rabbit-new.dto';
import { ConsumeMessage } from 'amqplib';

@Injectable()
export class RabbitNewConsumerService {
  constructor(private readonly amqpConnection: AmqpConnection) {}

  @RabbitSubscribe({ queue: 'order.10' })
  subscribe(
    msg: { code: number; text: string; id: string },
    amqpMsg: ConsumeMessage,
  ) {
    console.log('[p1.0] msg', msg);
  }
}
