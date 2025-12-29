import { IsEnum, IsNumber, IsOptional, IsDateString, IsBoolean, Min, Max } from 'class-validator';
import { PunchPolicy } from '../models/enums';
import { PunchRoundingRule } from '../models/attendance-rules.schema';

export class CreateAttendanceRulesDto {
  @IsOptional()
  @IsEnum(PunchPolicy)
  multiplePunchesPolicy?: PunchPolicy;

  @IsOptional()
  @IsNumber()
  @Min(0)
  @Max(480)
  earlyClockInTolerance?: number;

  @IsOptional()
  @IsNumber()
  @Min(0)
  @Max(480)
  lateClockOutTolerance?: number;

  @IsOptional()
  @IsNumber()
  @Min(1)
  @Max(60)
  minimumTimeBetweenPunches?: number;

  @IsOptional()
  @IsEnum(PunchRoundingRule)
  punchRoundingRule?: PunchRoundingRule;

  @IsOptional()
  @IsDateString()
  effectiveFrom?: string;

  @IsOptional()
  @IsBoolean()
  isActive?: boolean;
}
