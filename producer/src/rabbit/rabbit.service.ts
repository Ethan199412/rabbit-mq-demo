import { Injectable, Logger, OnModuleDestroy } from '@nestjs/common';
import * as amqp from 'amqplib';
import { Cron, CronExpression } from '@nestjs/schedule';

@Injectable()
export class RabbitMQService {
  private readonly logger = new Logger(RabbitMQService.name);
  private connection: amqp.Connection;
  private channel: amqp.Channel;

  private chinaChannel: amqp.Channel;

  // RabbitMQ 配置 [4]()
  private readonly config = {
    url: 'amqp://admin:admin123@81.70.46.244:5672',
    exchange: 'amq.topic',
    exchangeType: 'topic',
    durable: true,
  };

  private readonly basicConfig = {
    url: 'amqp://admin:admin123@81.70.46.244:5672',
  };

  private readonly chinaConfig = {
    ...this.basicConfig,
    exchange: 'china-direct',
    exchangeType: 'direct',
    durable: true,
  };

  // 初始化连接
  async connect() {
    try {
      this.connection = await amqp.connect(this.config.url);
      this.channel = await this.connection.createChannel();
      this.chinaChannel = await this.connection.createChannel();

      await this.channel.assertExchange(
        this.config.exchange,
        this.config.exchangeType,
        { durable: this.config.durable },
      );

      await this.chinaChannel.assertExchange(
        this.chinaConfig.exchange,
        this.chinaConfig.exchangeType,
        { durable: true },
      );

      this.logger.log(' 成功连接到 RabbitMQ');
    } catch (error) {
      this.logger.error(` 连接失败: ${error.message}`);
      throw error;
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

  // 发送消息
  async publishMessage(routingKey: string, message: object) {
    if (!this.channel) {
      throw new Error('Channel not initialized');
    }

    try {
      await this.channel.publish(
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

  // 关闭连接
  async onModuleDestroy() {
    if (this.connection) {
      await this.channel.close();
      await this.connection.close();
      this.logger.log('RabbitMQ  连接已关闭');
    }
  }
}
