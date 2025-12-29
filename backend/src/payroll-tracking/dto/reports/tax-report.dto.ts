import { IsOptional,IsString, IsDateString, IsInt, Min, Max, IsEnum } from 'class-validator';
import { Type } from 'class-transformer';
import { ReportFormat } from './payroll-report.dto';

export class TaxReportDto {
  @IsOptional()
  @IsDateString()
  fromDate?: string; // Start date for the tax report period (ISO date string)

  @IsOptional()
  @IsDateString()
  toDate?: string; // End date for the tax report period (ISO date string)

  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(2000)
  @Max(2100)
  year?: number; // Year for annual tax report

  @IsOptional()
  @IsEnum(ReportFormat)
  format?: ReportFormat = ReportFormat.JSON; // Export format (pdf, excel, json)

  @IsOptional()
  @IsString()
  departmentId?: string; // Filter by department (optional)
}
