import { IsDateString, IsNumber, IsString, IsOptional, IsBoolean, IsObject, ValidateNested, Min, Max } from 'class-validator';
import { Type } from 'class-transformer';

class ClosureChecklistDto {
  @IsOptional()
  @IsBoolean()
  attendanceValidated?: boolean;

  @IsOptional()
  @IsBoolean()
  overtimeProcessed?: boolean;

  @IsOptional()
  @IsBoolean()
  correctionsApplied?: boolean;

  @IsOptional()
  @IsBoolean()
  exceptionsResolved?: boolean;

  @IsOptional()
  @IsBoolean()
  shiftsConfirmed?: boolean;
}

export class UpdatePayrollClosureConfigDto {
  @IsOptional()
  @IsDateString()
  payrollCycleEnd?: string;

  @IsOptional()
  @IsNumber()
  @Min(1)
  @Max(168)
  autoEscalationHours?: number;

  @IsOptional()
  @IsString()
  escalateToRole?: string;

  @IsOptional()
  @IsString()
  escalateToPerson?: string;

  @IsOptional()
  @ValidateNested()
  @Type(() => ClosureChecklistDto)
  closureChecklist?: ClosureChecklistDto;

  @IsOptional()
  @IsBoolean()
  notificationsEnabled?: boolean;

  @IsOptional()
  @IsBoolean()
  autoClosureEnabled?: boolean;
}
