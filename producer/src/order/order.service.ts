import { Injectable } from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';
import { RabbitNewService } from 'src/rabbit-new/rabbit-new.service';
import store from 'src/store/store';

@Injectable()
export class OrderService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly rabbitNewService: RabbitNewService,
  ) {}

  async createOrder(body: { user_id: string; product_name: string }) {
    const { user_id, product_name } = body;

    // 第一步，写数据库
    const res = await this.prisma.order_tab.create({
      data: {
        product_name,
        status: 'UNPAID',
      },
    });
    // 第二步，发送消息到延时 exchange
    await this.rabbitNewService.publishDelay({
      delay: 10000, // 延时10秒
      exchange: 'order.delay',
      routing_key: '#.10',
      num: 1,
      message: {
        text: '订单',
        code: 1,
      },
    });

    return res;
  }
}
