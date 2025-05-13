import { Injectable, Logger, OnModuleInit } from '@nestjs/common';
import * as amqp from 'amqplib';
import { Cron, CronExpression } from '@nestjs/schedule';

export function InjectChannel(configName: string) {
  return (target: any, propertyKey: string, descriptor: PropertyDescriptor) => {
    const originalMethod = descriptor.value;

    descriptor.value = async function (...args: any[]) {
      // 动态获取参数（this 指向当前实例）
      // const { connection, amqTopicConfig } = optionsFactory(this);
      const config = this[configName];
      const { connection } = this;
      const { exchange, exchangeType, durable } = config;
      const channel = await connection.createChannel();

      await channel.assertExchange(exchange, exchangeType, {
        durable,
      });
      config.channel = channel; // 注入到实例属性

      const res = await originalMethod.apply(this, args);
      await channel.close();
      return res;
    };
  };
}

@Injectable()
export class RabbitMQService implements OnModuleInit {
  private readonly logger = new Logger(RabbitMQService.name);
  private connection: amqp.Connection;
  // private channel: amqp.Channel;

  private chinaChannel: amqp.Channel;

  private readonly basicConfig = {
    url: 'amqp://admin:admin123@81.70.46.244:5672',
  };

  private readonly amqTopicConfig = {
    ...this.basicConfig,
    exchange: 'amq.topic',
    exchangeType: 'topic',
    durable: true,
    channel: null,
  };

  private readonly chinaConfig = {
    ...this.basicConfig,
    exchange: 'china-direct',
    exchangeType: 'direct',
    durable: true,
  };

  private readonly chinaTopicConfig = {
    ...this.basicConfig,
    exchange: 'china-topic',
    exchangeType: 'topic',
    durable: true,
    channel: null,
  };

  async onModuleInit() {
    await this.connect();
  }

  // 初始化连接
  async connect() {
    try {
      this.connection = await amqp.connect(this.basicConfig.url);
      this.logger.log(' 成功连接到 RabbitMQ');
    } catch (error) {
      this.logger.error(` 连接失败: ${error.message}`);
      throw error;
    }
  }

  // 关闭连接
  async onModuleDestroy() {
    if (this.connection) {
      await this.connection.close();
      this.logger.log('RabbitMQ  连接已关闭');
    }
  }

  // 定时重试连接 [4]()
  @Cron(CronExpression.EVERY_30_SECONDS)
  async checkConnection() {
    if (!this.connection || this.connection.connectionClosed) {
      this.logger.warn(' 尝试重新连接...');
      await this.connect();
    }
  }

  async publishChinaMessage(routingKey: string, message: object) {
    if (!this.chinaChannel) {
      throw new Error('Channel not initialized');
    }

    try {
      await this.chinaChannel.publish(
        this.chinaConfig.exchange,
        routingKey,
        Buffer.from(JSON.stringify(message)),
        { persistent: true }, // 消息持久化
      );
      this.logger.log(` 消息已发送至 ${routingKey}`);
    } catch (error) {
      this.logger.error(` 消息发送失败: ${error.message}`);
      throw error;
    }
  }

  @InjectChannel('chinaTopicConfig')
  async publishChinaTopicMessage(routingKey: string, message: object) {
    console.log('[p1.10]', routingKey);
    const channel = this.chinaTopicConfig.channel as amqp.Channel;
    console.log('[p1.1]', routingKey);
    await channel.publish(
      'china-topic',
      routingKey,
      Buffer.from(JSON.stringify(message)),
      { persistent: true }, // 消息持久化
    );
  }
}
