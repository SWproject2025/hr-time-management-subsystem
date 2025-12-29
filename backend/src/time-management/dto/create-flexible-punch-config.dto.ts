import { IsEnum, IsNumber, IsOptional, IsDateString, IsBoolean, IsObject, Min, Max, ValidateNested } from 'class-validator';
import { Type } from 'class-transformer';
import { PunchMethod } from '../models/flexible-punch-config.schema';

class EditingPermissionsDto {
  @IsOptional()
  @IsBoolean()
  canEditOwn?: boolean;

  @IsOptional()
  @IsBoolean()
  canEditTeam?: boolean;

  @IsOptional()
  @IsBoolean()
  canEditAll?: boolean;

  @IsOptional()
  @IsBoolean()
  managers?: boolean;

  @IsOptional()
  @IsBoolean()
  hr?: boolean;

  @IsOptional()
  @IsBoolean()
  admin?: boolean;
}

export class CreateFlexiblePunchConfigDto {
  @IsOptional()
  @IsEnum(PunchMethod)
  punchMethods?: PunchMethod;

  @IsOptional()
  @IsBoolean()
  geolocationRequired?: boolean;

  @IsOptional()
  @IsNumber()
  @Min(10)
  @Max(5000)
  geolocationRadius?: number;

  @IsOptional()
  @ValidateNested()
  @Type(() => EditingPermissionsDto)
  editingPermissions?: EditingPermissionsDto;

  @IsOptional()
  @IsNumber()
  @Min(0)
  @Max(480)
  gracePeriodMinutes?: number;

  @IsOptional()
  @IsBoolean()
  allowLateCorrections?: boolean;

  @IsOptional()
  @IsNumber()
  @Min(1)
  @Max(365)
  maxCorrectionDays?: number;

  @IsOptional()
  @IsBoolean()
  requireApprovalForCorrections?: boolean;

  @IsOptional()
  @IsBoolean()
  notifyOnCorrections?: boolean;

  @IsOptional()
  @IsDateString()
  effectiveFrom?: string;

  @IsOptional()
  @IsBoolean()
  isActive?: boolean;
}
