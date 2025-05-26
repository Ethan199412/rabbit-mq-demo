import { Injectable } from '@nestjs/common';
import {
  AmqpConnection,
  InjectRabbitMQConfig,
  RabbitRPC,
  RabbitSubscribe,
} from '@golevelup/nestjs-rabbitmq';
import { PublishReqDto } from './rabbit-new.dto';

@Injectable()
export class RabbitNewService {
  constructor(private readonly amqpConnection: AmqpConnection) {}

  async onModuleInit() {
    // this.amqpConnection.channels['channel'];
    // console.log('[p1.1]', this.amqpConnection.channel);
    // await this.amqpConnection.managedChannel.
    // console.log(
    //   '[p1.20]',
    //   this.amqpConnection.managedChannels['AmqpConnection'],
    // );
    // this.amqpConnection.managedChannels['AmqpConnection'].on('ack', (msg) => {
    //   console.log('[p1.1] ack', msg);
    // });
    // this.amqpConnection.managedChannels['AmqpConnection'].on(
    //   'return',
    //   (msg) => {
    //     console.log('[p1.11] return', msg);
    //   },
    // );
  }

  async publish(body: PublishReqDto) {
    let { num } = body;
    const { message, routing_key, exchange } = body;

    // 在这里通过 confirm 指定生产者确认
    num = num || 1;
    for (let i = 0; i < num; i++) {
      const withIdMessage = { ...message, id: String(Math.random()).slice(2) };
      this.amqpConnection.publish(
        exchange,
        routing_key, // 完整routing key[4]()
        withIdMessage,
        {},
      );
    }
    return { success: true };
  }

  async sendFootballNews(
    routing_key: string,
    message: string,
    num: number,
    persistent = true,
  ) {
    // 在这里通过 confirm 指定生产者确认
    num = num || 1;
    for (let i = 0; i < num; i++) {
      this.amqpConnection.publish(
        'china-topic',
        routing_key, // 完整routing key[4]()
        { content: message },
        {
          persistent: false, // 控制消息持久化
          headers: { 'x-delay': 0 }, // 可选延时设置
          //   confirm: true,
          options: {
            corrlationId: +new Date(),
          },
          deliverMode: 1,
        },
        //   (err) => {},
      );
      console.log('[p1.0] res', { persistent });
    }
    return { success: true };
  }

  async sendFootballNewsTemp(
    routing_key: string,
    message: string,
    num: number,
    persistent = true,
  ) {
    // 在这里通过 confirm 指定生产者确认
    num = num || 1;
    for (let i = 0; i < num; i++) {
      this.amqpConnection.publish(
        'china-temp-ex',
        routing_key, // 完整routing key[4]()
        { content: message },
        {
          persistent: false, // 控制消息持久化
          headers: { 'x-delay': 0 }, // 可选延时设置
          //   confirm: true,
          options: {
            corrlationId: +new Date(),
          },
          deliverMode: 1,
        },
        //   (err) => {},
      );
      console.log('[p1.0] res', { persistent });
    }
    return { success: true };
  }

  //   @RabbitSubscribe({
  //     exchange: 'china-topic',
  //     routingKey: 'china.sports',
  //     // queue: '',
  //   })
  //   handleConfirm(msg: { ack: boolean }) {
  //     console.log('[p1.21] msg', msg);
  //   }
}
