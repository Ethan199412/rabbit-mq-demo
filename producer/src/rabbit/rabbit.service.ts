import {
  Injectable,
  Logger,
  OnModuleDestroy,
  OnModuleInit,
} from '@nestjs/common';
import * as amqp from 'amqplib';
import { Cron, CronExpression } from '@nestjs/schedule';

interface IAmqpConfig {
  exchange: string;
  exchangeType: string;
  durable: boolean;
  channel: amqp.Channel;
}

export const InjectChannel = (options: {
  connection: any;
  config: IAmqpConfig;
}) => {
  return (target: any, propertyKey: string, descriptor: PropertyDescriptor) => {
    const originalMethod = descriptor.value;

    descriptor.value = async function (...args: any[]) {
      console.log('[p1.2]', { options });
      const { connection, config } = options;
      const channel = await connection.createChannel();
      const { exchange, exchangeType, durable } = config;
      console.log('[p1.3] config', config);
      try {
        // 声明交换器
        await channel.assertExchange(exchange, exchangeType, {
          durable,
        });

        config.channel = channel;
        // 将 channel 注入到方法参数中
        // args.unshift(channel);

        // 执行原始方法
        const result = await originalMethod.apply(this, args);

        return result;
      } finally {
        // 确保无论方法执行成功还是失败，都关闭 channel
        await channel.close();
      }
    };

    return descriptor;
  };
};

// 修改装饰器定义
export function InjectChannel2(
  // optionsFactory: (instance: any) => { connection: any; config: any },
  configName: string,
) {
  return (target: any, propertyKey: string, descriptor: PropertyDescriptor) => {
    const originalMethod = descriptor.value;

    descriptor.value = async function (...args: any[]) {
      // 动态获取参数
      // const { connection, config } = optionsFactory(this); // 此处 this 指向实例
      const config = this[configName];
      const connection = this.connection;
      console.log('[p1.21]', { options: config });
      const { exchange, exchangeType, durable } = config;
      const channel = await connection.createChannel();

      config.channel = channel;
      // ...原有逻辑

      console.log('[p1.22]', { config });
      await channel.assertExchange(exchange, exchangeType, {
        durable,
      });

      // config.channel = channel;
      // 将 channel 注入到方法参数中
      // args.unshift(channel);

      // 执行原始方法
      const result = await originalMethod.apply(this, args);
      await channel.close();
      return result;
    };
  };
}

export function InjectDependencies() {
  return function (target: any, propertyKey: string) {
    const originalInit = target.constructor.prototype.onModuleInit;
    target.constructor.prototype.onModuleInit = function () {
      this[propertyKey] = {
        connection: this.connection,
        amqTopicConfig: this.amqTopicConfig,
      };
      originalInit?.apply(this);
    };
  };
}

@Injectable()
export class RabbitMQService implements OnModuleInit {
  private readonly logger = new Logger(RabbitMQService.name);
  private connection: amqp.Connection;
  // private channel: amqp.Channel;

  private chinaChannel: amqp.Channel;

  @InjectDependencies()
  private options = {};

  // RabbitMQ 配置 [4]()
  private readonly config = {
    url: 'amqp://admin:admin123@81.70.46.244:5672',
    // exchange: 'amq.topic',
    // exchangeType: 'topic',
    // durable: true,
  };

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

  async onModuleInit() {
    this.connect();
  }

  // 关闭连接
  async onModuleDestroy() {
    if (this.connection) {
      // await this.channel.close();
      await this.connection.close();
      this.logger.log('RabbitMQ  连接已关闭');
    }
  }

  // 初始化连接
  async connect() {
    try {
      this.connection = await amqp.connect(this.config.url);
      // this.channel = await this.connection.createChannel();
      // this.chinaChannel = await this.connection.createChannel();

      // await this.channel.assertExchange(
      //   this.config.exchange,
      //   this.config.exchangeType,
      //   { durable: this.config.durable },
      // );

      // await this.chinaChannel.assertExchange(
      //   this.chinaConfig.exchange,
      //   this.chinaConfig.exchangeType,
      //   { durable: true },
      // );

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
  // @InjectChannel(() => {
  //   connection: this.connection,
  //   config: this.amqTopicConfig,
  // })
  @InjectChannel2('amqTopicConfig')
  async publishMessage(routingKey: string, message: object) {
    // if (!this.channel) {
    //   throw new Error('Channel not initialized');
    // }

    // const channel = await this.connection.createChannel();
    // this.chinaChannel = await this.connection.createChannel();

    // await channel.assertExchange(
    //   this.amqTopicConfig.exchange,
    //   this.amqTopicConfig.exchangeType,
    //   { durable: this.amqTopicConfig.durable },
    // );
    const { channel } = this.amqTopicConfig;
    try {
      await channel.publish(
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
}
