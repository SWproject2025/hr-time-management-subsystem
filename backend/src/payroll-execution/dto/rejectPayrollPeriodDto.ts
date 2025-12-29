import { IsString, IsNotEmpty } from 'class-validator';

export class RejectPayrollPeriodDto {
  @IsString()
  @IsNotEmpty()
  rejectionReason: string;
}