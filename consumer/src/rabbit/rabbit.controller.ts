import { Controller, Get } from '@nestjs/common';
import { RabbitMQService } from './rabbit.service';

@Controller('rabbit')
export class RabbitMqController {
  constructor(private readonly rabbitService: RabbitMQService) {}

}
