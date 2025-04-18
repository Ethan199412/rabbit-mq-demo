import { Inject, Injectable, Logger, OnModuleDestroy } from '@nestjs/common';
// import * as amqp from 'amqplib';
// import { Cron, CronExpression } from '@nestjs/schedule';
import { ClientProxy } from '@nestjs/microservices';

@Injectable()
export class RabbitMQService {
  constructor(
    @Inject('AMQ_TOPIC_CLIENT') private readonly client: ClientProxy,
  ) {}

  async publishMessage(routingKey: string, payload: any) {
    // 发送到 amq.topic  Exchange [5]()
    await this.client.emit('', payload).toPromise();

    console.log(`Sent  to ${routingKey}:`, payload);
  }
}
