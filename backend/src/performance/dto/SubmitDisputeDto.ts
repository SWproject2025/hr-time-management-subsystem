// src/performance/dto/SubmitDisputeDto.ts

import { IsNotEmpty, IsOptional, IsString } from 'class-validator';

export class SubmitDisputeDto {
  @IsString()
  @IsNotEmpty()
  reason: string; // Why the employee is disputing the appraisal

  @IsString()
  @IsOptional()
  employeeComments?: string; // Detailed comments from the employee (optional)
}
