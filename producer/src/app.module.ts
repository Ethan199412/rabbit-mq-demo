import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { RabbitMqModule } from './rabbit/rabbit.module';
import { ScheduleModule } from '@nestjs/schedule';
import { RabbitNewModule } from './rabbit-new/rabbit-new.module';

@Module({
  imports: [RabbitMqModule, ScheduleModule.forRoot(), RabbitNewModule],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
