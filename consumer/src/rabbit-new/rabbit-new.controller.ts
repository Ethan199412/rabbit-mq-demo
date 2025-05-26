import { Controller, Get } from '@nestjs/common';
import { RabbitNewService } from './rabbit-new.service';

@Controller('rabbit-new')
export class RabbitNewController {
  constructor(private readonly rabbitNewService: RabbitNewService) {}

  @Get('test')
  test() {
    // return this.rabbitNewService.test();
  }
}
