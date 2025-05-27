import { Body, Controller, Post } from '@nestjs/common';
import { OrderService } from './order.service';

@Controller('order')
export class OrderController {
  constructor(private readonly orderService: OrderService) {}
  @Post('create-order')
  async createOrder(@Body() body: { user_id: string; product_name: string }) {
    await this.orderService.createOrder(body);
  }
}
