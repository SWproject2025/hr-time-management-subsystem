import { IsString, IsNotEmpty } from 'class-validator';

export class ApprovePayrollPeriodDto {
  @IsString()
  @IsNotEmpty()
  payrollManagerId: string;
}