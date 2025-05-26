import { Nack, RabbitSubscribe } from '@golevelup/nestjs-rabbitmq';
import { Injectable } from '@nestjs/common';
import { ConsumeMessage } from 'amqplib';

@Injectable()
export class RabbitNewService {
  badMsgMapping: Record<string, number> = {};

  @RabbitSubscribe({ queue: 'china.politics' })
  async test(
    msg: { code: number; text: string; id: string },
    amqpMsg: ConsumeMessage,
  ) {
    // message would be requeue
    console.log('[p1.10]', msg);
    const { code, text, id } = msg;
    if (code == 1) {
      return { success: true };
    }

    if (code == 2) {
      return new Nack(false); // 直接丢弃
    }

    if (code == 3) {
      const currentTimes = this.badMsgMapping[id] || 0;
      if (currentTimes < 3) {
        this.badMsgMapping[id] = currentTimes + 1;
        return new Nack(true); // 重新入队
      }
      return new Nack(false); // 直接丢弃
    }
  }
}
