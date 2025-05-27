import { Module } from '@nestjs/common';
import { OrderController } from './order.controller';
import { OrderService } from './order.service';
import { PrismaModule } from 'src/prisma/prisma.module';
import { RabbitNewModule } from 'src/rabbit-new/rabbit-new.module';

@Module({
  controllers: [OrderController],
  providers: [OrderService],
  imports: [PrismaModule, RabbitNewModule],
})
export class OrderModule {}
