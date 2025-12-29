import { IsOptional, IsString, IsDateString, IsEnum, IsInt, Min, Max, IsIn } from 'class-validator';
import { Type } from 'class-transformer';
import { PaySlipPaymentStatus } from '../../../payroll-execution/enums/payroll-execution-enum';

export class PayslipQueryDto {
  @IsOptional()
  @IsDateString()
  fromDate?: string; // Start date for filtering payslips (ISO date string)

  @IsOptional()
  @IsDateString()
  toDate?: string; // End date for filtering payslips (ISO date string)

  @IsOptional()
  @IsString()
  payrollRunId?: string; // Filter by specific payroll run ID

  @IsOptional()
  @IsEnum(PaySlipPaymentStatus)
  paymentStatus?: PaySlipPaymentStatus; // Filter by payment status (PENDING, PAID)

  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  page?: number = 1; // Page number for pagination (default: 1)

  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  @Max(100)
  limit?: number = 10; // Number of items per page (default: 10, max: 100)

  @IsOptional()
  @IsString()
  sortBy?: string = 'createdAt'; // Field to sort by (default: createdAt)

  @IsOptional()
  @IsIn(['asc', 'desc'])
  sortOrder?: 'asc' | 'desc' = 'desc'; // Sort order (default: desc)
}

