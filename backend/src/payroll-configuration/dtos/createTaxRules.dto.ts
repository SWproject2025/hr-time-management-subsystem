import { IsString, IsNumber, IsOptional, Min, IsNotEmpty, IsDate, IsEnum, Max } from 'class-validator';
import { ConfigStatus } from '../enums/payroll-configuration-enums';

export class CreateTaxRuleDto {
  
  @IsString()
  @IsNotEmpty()
  name: string;

  @IsNumber()
  @Min(0)
  @Max(100)
  rate: number;

  @IsOptional()
  @IsString()
  @IsNotEmpty() 
  description?: string;

}

