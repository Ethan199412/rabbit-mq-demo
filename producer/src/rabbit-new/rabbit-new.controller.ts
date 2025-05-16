import { Body, Controller, Post } from '@nestjs/common';
import { RabbitNewService } from './rabbit-new.service';

@Controller('rabbit-new')
export class RabbitNewController {
  constructor(private readonly messageService: RabbitNewService) {}

  @Post('china-topic')
  async sendFootballNews(
    @Body() body: { message: string; routing_key: string },
  ) {
    const { message, routing_key } = body;
    return this.messageService.sendFootballNews(routing_key, message);
  }
}
