import { Injectable, OnModuleInit } from '@nestjs/common';
import * as amqp from 'amqplib';

export function InjectChannel(configName: string) {
  return (target: any, propertyKey: string, descriptor: PropertyDescriptor) => {
    const originalMethod = descriptor.value;

    descriptor.value = async function (...args: any[]) {
      // 动态获取参数（this 指向当前实例）
      // const { connection, amqTopicConfig } = optionsFactory(this);
      const config = this[configName];
      const { connection } = this;
      const { queue } = config;
      const channel = await connection.createChannel();

      const assertRes = await channel.assertQueue(queue, {
        durable: true, // 持久化队列
      });
      console.log('[p1.1]', { assertRes });
      config.channel = channel; // 注入到实例属性

      const res = await originalMethod.apply(this, args);
      // await channel.close();
      return res;
    };
  };
}

@Injectable()
export class RabbitMQService implements OnModuleInit {
  private connection: amqp.Connection;
  private channel: amqp.Channel;

  private readonly basicConfig = {
    url: 'amqp://admin:admin123@81.70.46.244:5672',
  };

  private readonly testConfig = {
    ...this.basicConfig,
    queue: 'test1',
    durable: true,
    channel: null,
  };

  private readonly chinaSportsConfig = {
    ...this.basicConfig,
    queue: 'china.sports',
    durable: true,
    channel: null,
  };

  async onModuleInit() {
    await this.initialize();
  }

  private async initialize() {
    try {
      // 1. 创建连接
      this.connection = await amqp.connect(this.basicConfig.url);
      this.consumeTest();
      this.consumeChinaSports();
    } catch (error) {
      console.error(' 连接失败:', error);
      setTimeout(() => this.initialize(), 5000); // 失败重连
    }
  }

  @InjectChannel('testConfig')
  async consumeTest() {
    // 2. 创建通道
    const { channel } = this.testConfig;

    // 4. 消费消息
    channel.consume(
      'test1',
      (msg) => {
        if (msg !== null) {
          console.log(' 收到消息:', msg.content.toString());

          // 手动确认消息（关闭自动确认）
          channel.ack(msg);
        }
      },
      { noAck: false },
    ); // 关闭自动确认

    console.log(' 消费者已启动');
  }

  @InjectChannel('chinaSportsConfig')
  async consumeChinaSports() {
    // 2. 创建通道
    const { channel } = this.chinaSportsConfig;

    // 4. 消费消息
    channel.consume(
      channel.queue,
      (msg) => {
        if (msg !== null) {
          console.log(' 收到消息:', msg.content.toString());

          // 手动确认消息（关闭自动确认）
          channel.ack(msg);
        }
      },
      { noAck: false },
    ); // 关闭自动确认

    console.log(' 消费者已启动');
  }
}
