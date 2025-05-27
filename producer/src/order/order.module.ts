import { Module } from '@nestjs/common';
import { OrderController } from './order.controller';
import { OrderService } from './order.service';
import { RabbitMqModule } from 'src/rabbit/rabbit.module';
import { RabbitNewModule } from 'src/rabbit-new/rabbit-new.module';

@Module({
  controllers: [OrderController],
  providers: [OrderService],
  imports: [RabbitNewModule],
})
export class OrderModule {}
