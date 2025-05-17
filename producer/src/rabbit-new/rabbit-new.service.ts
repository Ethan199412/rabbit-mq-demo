import { Injectable } from '@nestjs/common';
import {
  AmqpConnection,
  InjectRabbitMQConfig,
  RabbitRPC,
  RabbitSubscribe,
} from '@golevelup/nestjs-rabbitmq';

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

  async sendFootballNews(routing_key: string, message: string) {
    // 在这里通过 confirm 指定生产者确认
    const res = await this.amqpConnection.publish(
      'china-topic',
      routing_key, // 完整routing key[4]()
      { content: message },
      {
        persistent: true, // 消息持久化
        headers: { 'x-delay': 0 }, // 可选延时设置
        confirm: true,
        options: {
          corrlationId: +new Date(),
        },
      },
      //   (err) => {},
    );
    console.log('[p1.0] res', res);
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
