import { Module } from '@nestjs/common';
import { RabbitMQService } from './rabbit.service';
import { RabbitMqController } from './rabbit.controller';
import { ClientsModule, Transport } from '@nestjs/microservices';

@Module({
  controllers: [RabbitMqController],
  providers: [RabbitMQService],
  imports: [],
  //   exports: [ClientsModule],
})
export class RabbitMqModule {
  constructor(private readonly rabbitMQService: RabbitMQService) {}

  //   async onApplicationBootstrap() {
  //     await this.rabbitMQService.connect();
  //   }
}
