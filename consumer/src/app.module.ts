import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { RabbitMqModule } from './rabbit/rabbit.module';
import { RabbitNewModule } from './rabbit-new/rabbit-new.module';

@Module({
  imports: [RabbitNewModule],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
