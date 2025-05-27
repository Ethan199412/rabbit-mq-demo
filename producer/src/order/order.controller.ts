import { Body, Controller, Post } from '@nestjs/common';
import { OrderService } from './order.service';

@Controller('order')
export class OrderController {
  constructor(private readonly orderService: OrderService) {}
  @Post('create-order')
  async createOrder(@Body() body: { userId: string; productName: string }) {
    await this.orderService.createOrder(body);
  }
}
