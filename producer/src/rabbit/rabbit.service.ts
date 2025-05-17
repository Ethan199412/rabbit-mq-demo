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
      // connection.createConfirmChannel();

      await channel.assertExchange(exchange, exchangeType, {
        durable,
      });
      config.channel = channel; // 注入到实例属性

      const res = await originalMethod.apply(this, args);
      await channel.close();
      config.channel = null; // 清除 channel 引用
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

  private pendingConfirms: {
    correlationId: string;
    resolve: (...res: any) => void;
    reject: (err: Error) => void;
  }[] = [];

  async onModuleInit() {
    await this.connect();
  }

  // 初始化连接
  async connect() {
    try {
      this.connection = await amqp.connect(
        'amqp://admin:admin123@81.70.46.244:5672',
        {
          // 添加重试机制
          reconnect: true,
          reconnectBackoffTime: 5000, // 5秒重试间隔
        },
      );
      // this.connection = await amqp.connect({
      //   protocol: 'amqp',
      //   // url: this.basicConfig.url,
      //   host: '81.70.46.244',
      //   port: 5672,
      //   username: 'admin',
      //   password: 'admin123',
      //   // retry: {
      //   //   maxAttempts: 3,
      //   //   interval: 1000,
      //   // },
      // });
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

  @InjectChannel('amqTopicConfig')
  async publishMessage(routingKey: string, message: object) {
    const channel = this.amqTopicConfig.channel as amqp.Channel;

    await channel.publish(
      'amq.topic',
      routingKey,
      Buffer.from(JSON.stringify(message)),
      { persistent: true }, // 消息持久化
    );
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
      (err, ok) => {
        if (err) {
          console.log('消息发送失败');
          return;
        }
        console.log('消息已确认');
      },
    );

    // channel.on('return', (msg) => {});
  }

  async publishConfirmMessage(routingKey: string, message: object) {
    const channel = await this.connection.createConfirmChannel();
    const exchange = 'china-topic';
    // console.log('[p1.30]', { channel });
    await channel.assertExchange(exchange, 'topic', { durable: true });

    const correlationId = Date.now().toString();

    const payload = Buffer.from(JSON.stringify(message));

    return new Promise((resolve, reject) => {
      // 将当前的 Promise 放入队列，等待 ack/nack 顺序处理
      this.pendingConfirms.push({ correlationId, resolve, reject });

      const success = channel.publish(
        exchange,
        routingKey,
        payload,
        { correlationId }, // correlationId 设置在消息属性中
      );

      // 非常关键！监听 channel 上的 'drain' 或执行 flush
      // 但我们不能在这里直接知道 ack/nack，我们要监听全局确认事件

      // 手动调用 channel.once() 是不可行的：amqplib 是顺序 ack，所以你必须按顺序处理

      // 让 amqplib 处理回调：
      channel.once('ack', () => {
        const confirm = this.pendingConfirms.shift();
        if (confirm) {
          console.log(`✅ ACK for ${confirm.correlationId}`);
          confirm.resolve(confirm.correlationId);
        }
      });

      channel.once('nack', () => {
        const confirm = this.pendingConfirms.shift();
        if (confirm) {
          console.log(`❌ NACK for ${confirm.correlationId}`);
          confirm.reject(new Error('Message NACKed by broker'));
        }
      });

      if (!success) {
        reject(new Error('Publish returned false (backpressure)'));
      }
    }).then((correlationId) => correlationId);
  }
}
