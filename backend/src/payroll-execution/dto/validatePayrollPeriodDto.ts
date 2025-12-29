import { IsDateString, IsNotEmpty } from 'class-validator';

export class ValidatePayrollPeriodDto {
  @IsDateString()
  @IsNotEmpty()
  payrollPeriod: Date;
}