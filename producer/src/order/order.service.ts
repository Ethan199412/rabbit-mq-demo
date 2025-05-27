import { Injectable } from '@nestjs/common';
import { RabbitNewService } from 'src/rabbit-new/rabbit-new.service';
import store from 'src/store/store';

@Injectable()
export class OrderService {
  constructor(private readonly rabbitNewService: RabbitNewService) {}

  createOrder(body: { userId: string; productName: string }) {
    const recordId = Math.random().toString(36).substring(2, 15);

    // mock 改数据库
    store.records[recordId] = { id: recordId, status: 'UNPAID' };
  }
}
