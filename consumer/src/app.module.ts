import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { RabbitMqModule } from './rabbit/rabbit.module';

@Module({
  imports: [RabbitMqModule],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
