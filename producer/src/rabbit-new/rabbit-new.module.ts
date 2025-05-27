import { Module } from '@nestjs/common';
import { RabbitNewService } from './rabbit-new.service';
import {
  RabbitMQChannelConfig,
  RabbitMQModule,
} from '@golevelup/nestjs-rabbitmq';
import { RabbitNewController } from './rabbit-new.controller';
import { RabbitNewConsumerService } from './rabbit-new-consumer.service';

// const a: RabbitMQChannelConfig;
@Module({
  providers: [RabbitNewService, RabbitNewConsumerService],
  controllers: [RabbitNewController],
  imports: [
    RabbitMQModule.forRoot({
      uri: 'amqp://admin:admin123@81.70.46.244:5672',
      connectionInitOptions: { wait: false },
      connectionManagerOptions: {},
    }),
  ],
  exports: [RabbitMQModule],
})
export class RabbitNewModule {}
