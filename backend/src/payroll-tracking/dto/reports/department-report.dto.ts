import { IsNotEmpty, IsString, IsOptional, IsDateString, IsEnum } from 'class-validator';
import { ReportFormat } from './payroll-report.dto';

export class DepartmentReportDto {
  @IsNotEmpty({ message: 'Department ID is required' })
  @IsString()
  departmentId: string; // Department ID for the report

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
}
