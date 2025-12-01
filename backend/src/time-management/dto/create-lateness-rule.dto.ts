import { IsNotEmpty, IsString, IsOptional, IsBoolean, IsNumber, Min } from 'class-validator';

export class CreateLatenessRuleDto {
  @IsNotEmpty()
  @IsString()
  name: string;

  @IsOptional()
  @IsString()
  description?: string;

  @IsOptional()
  @IsNumber()
  @Min(0)
  gracePeriodMinutes?: number;

  @IsOptional()
  @IsNumber()
  @Min(0)
  deductionForEachMinute?: number;

  @IsOptional()
  @IsBoolean()
  active?: boolean;
}

