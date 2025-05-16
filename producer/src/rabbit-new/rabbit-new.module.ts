import { Module } from '@nestjs/common';
import { RabbitNewService } from './rabbit-new.service';
import { RabbitMQModule } from '@golevelup/nestjs-rabbitmq';
import { RabbitNewController } from './rabbit-new.controller';

@Module({
  providers: [RabbitNewService],
  controllers: [RabbitNewController],
  imports: [
    RabbitMQModule.forRoot({
      exchanges: [
        {
          name: 'china-topic',
          type: 'topic',
        },
      ],
      uri: 'amqp://admin:admin123@81.70.46.244:5672',
      channels: {
        channel: {
          prefetchCount: 5,
          default: true,
        },
      },
      // channels: {
      //   'china-topic': {
      //     default: true,
      //     confirm: true
      //   },
      // },
      connectionInitOptions: { wait: false },
    }),
  ],
  exports: [RabbitMQModule],
})
export class RabbitNewModule {}
