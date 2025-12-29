import { IsString, IsNotEmpty, IsOptional, IsEnum } from 'class-validator';
import { RefundStatus } from '../../enums/payroll-tracking-enum';

export class UpdateRefundStatusDto {
  @IsEnum(RefundStatus, { message: 'Invalid refund status' })
  @IsNotEmpty({ message: 'Status is required' })
  status: RefundStatus; // New status for the refund

  @IsString()
  @IsOptional()
  paidInPayrollRunId?: string; // Optional payroll run ID when status is PAID
}
