import { Module } from '@nestjs/common';
import { RabbitNewController } from './rabbit-new.controller';
import { RabbitNewService } from './rabbit-new.service';
import { RabbitMQModule } from '@golevelup/nestjs-rabbitmq';

@Module({
  controllers: [RabbitNewController],
  providers: [RabbitNewService],
  imports: [
    RabbitMQModule.forRoot({
      uri: 'amqp://admin:admin123@81.70.46.244:5672',
      connectionInitOptions: { wait: false },
      enableControllerDiscovery: true,
      // defaultAckMode: 'manual',
    }),
  ],
})
export class RabbitNewModule {}
