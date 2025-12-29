import { IsDateString, IsNotEmpty } from 'class-validator';

export class EditPayrollPeriodDto {
  @IsDateString()
  @IsNotEmpty()
  payrollPeriod: Date;
}