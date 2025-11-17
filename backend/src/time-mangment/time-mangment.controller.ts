import { Controller, Get } from '@nestjs/common';
import { TimeMangmentService } from './time-mangment.service';

@Controller('time-mangment')
export class TimeMangmentController {
  constructor(private readonly timeMangmentService: TimeMangmentService) {}

  @Get('health')
  getHealth(): string {
    return this.timeMangmentService.getHealth();
  }
}

