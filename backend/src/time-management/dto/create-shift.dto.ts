import { IsNotEmpty, IsString, IsOptional, IsBoolean, IsNumber, IsEnum, Min } from 'class-validator';
import { PunchPolicy } from '../models/enums';

export class CreateShiftDto {
  @IsNotEmpty()
  @IsString()
  name: string;

  @IsNotEmpty()
  @IsString()
  shiftType: string;

  @IsNotEmpty()
  @IsString()
  startTime: string;

  @IsNotEmpty()
  @IsString()
  endTime: string;

  @IsOptional()
  @IsEnum(PunchPolicy)
  punchPolicy?: PunchPolicy;

  @IsOptional()
  @IsNumber()
  @Min(0)
  graceInMinutes?: number;

  @IsOptional()
  @IsNumber()
  @Min(0)
  graceOutMinutes?: number;

  @IsOptional()
  @IsBoolean()
  requiresApprovalForOvertime?: boolean;

  @IsOptional()
  @IsBoolean()
  active?: boolean;
}

