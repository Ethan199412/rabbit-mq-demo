import { Module } from '@nestjs/common';
import { RabbitMQService } from './rabbit.service';
import { RabbitMqController } from './rabbit.controller';
import { ClientsModule, Transport } from '@nestjs/microservices';

@Module({
  controllers: [RabbitMqController],
  providers: [RabbitMQService],
  imports: [
    ClientsModule.register([
      {
        name: 'AMQ_TOPIC_CLIENT',
        transport: Transport.RMQ,
        options: {
          urls: ['amqp://admin:admin123@81.70.46.244:5672'], // 替换真实凭证
          exchange: 'amq.topic',
          //   exchangeType: 'topic', // 明确指定 Exchange 类型 [2]()
          queueOptions: { durable: true },
        },
      },
    ]),
  ],
  exports: [ClientsModule],
})
export class RabbitMqModule {
  constructor(private readonly rabbitMQService: RabbitMQService) {}

  //   async onApplicationBootstrap() {
  //     await this.rabbitMQService.connect();
  //   }
}
