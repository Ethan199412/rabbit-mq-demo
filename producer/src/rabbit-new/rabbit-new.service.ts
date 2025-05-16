import { Injectable } from '@nestjs/common';
import {
  AmqpConnection,
  InjectRabbitMQConfig,
} from '@golevelup/nestjs-rabbitmq';

@Injectable()
export class RabbitNewService {
  constructor(private readonly amqpConnection: AmqpConnection) {}

  onModuleInit() {
    this.amqpConnection.channels['channel'];
    console.log('[p1.1]', this.amqpConnection.channel);
  }

  async sendFootballNews(routing_key: string, message: string) {
    await this.amqpConnection.publish(
      'china-topic',
      routing_key, // 完整routing key[4]()
      { content: message },
      {
        persistent: true, // 消息持久化
        headers: { 'x-delay': 0 }, // 可选延时设置
      },
    );
    return { success: true };
  }
}
