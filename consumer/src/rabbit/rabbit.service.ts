import { Injectable, OnModuleInit } from '@nestjs/common';
import * as amqp from 'amqplib';

@Injectable()
export class RabbitMQService implements OnModuleInit {
  private connection: amqp.Connection;
  private channel: amqp.Channel;

  private readonly config = {
    url: 'amqp://admin:admin123@81.70.46.244:5672',
    exchange: 'amq.topic',
    exchangeType: 'topic',
    durable: true,
  };

  async onModuleInit() {
    await this.initialize();
  }

  private async initialize() {
    try {
      // 1. 创建连接
      this.connection = await amqp.connect(this.config.url);

      // 2. 创建通道
      this.channel = await this.connection.createChannel();

      // 3. 声明队列（确保队列存在）
      await this.channel.assertQueue('test1', {
        durable: true, // 持久化队列
      });

      // 4. 消费消息
      this.channel.consume(
        'test1',
        (msg) => {
          if (msg !== null) {
            console.log(' 收到消息:', msg.content.toString());

            // 手动确认消息（关闭自动确认）
            this.channel.ack(msg);
          }
        },
        { noAck: false },
      ); // 关闭自动确认

      console.log(' 消费者已启动');
    } catch (error) {
      console.error(' 连接失败:', error);
      setTimeout(() => this.initialize(), 5000); // 失败重连
    }
  }
}
