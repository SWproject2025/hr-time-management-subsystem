import { Injectable } from '@nestjs/common';

@Injectable()
export class TimeMangmentService {
  getHealth(): string {
    return 'Time management module is healthy';
  }
}

