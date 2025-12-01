import { IsNotEmpty, IsString, IsOptional, IsBoolean } from 'class-validator';

export class CreateScheduleRuleDto {
  @IsNotEmpty()
  @IsString()
  name: string;

  @IsNotEmpty()
  @IsString()
  pattern: string;

  @IsOptional()
  @IsBoolean()
  active?: boolean;
}

