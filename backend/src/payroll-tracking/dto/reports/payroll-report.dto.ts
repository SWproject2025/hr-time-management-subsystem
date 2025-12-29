import { IsOptional, IsDateString, IsString, IsEnum, IsIn } from 'class-validator';
import { Type } from 'class-transformer';

export enum ReportFormat {
  PDF = 'pdf',
  EXCEL = 'excel',
  JSON = 'json',
}

export class PayrollReportDto {
  @IsOptional()
  @IsDateString()
  fromDate?: string; // Start date for the report period (ISO date string)

  @IsOptional()
  @IsDateString()
  toDate?: string; // End date for the report period (ISO date string)

  @IsOptional()
  @IsString()
  payrollRunId?: string; // Filter by specific payroll run ID

  @IsOptional()
  @IsEnum(ReportFormat)
  format?: ReportFormat = ReportFormat.JSON; // Export format (pdf, excel, json)

  @IsOptional()
  @IsString()
  departmentId?: string; // Filter by department (optional, for department-specific reports)
}
