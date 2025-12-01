import { IsNotEmpty, IsString, IsOptional, IsBoolean } from 'class-validator';

export class CreateOvertimeRuleDto {
  @IsNotEmpty()
  @IsString()
  name: string;

  @IsOptional()
  @IsString()
  description?: string;

  @IsOptional()
  @IsBoolean()
  active?: boolean;

  @IsOptional()
  @IsBoolean()
  approved?: boolean;
}

