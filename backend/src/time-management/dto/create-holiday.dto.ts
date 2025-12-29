import { IsNotEmpty, IsEnum, IsDateString, IsOptional, IsBoolean, IsString } from 'class-validator';
import { HolidayType } from '../models/enums';

export class CreateHolidayDto {
  @IsNotEmpty()
  @IsEnum(HolidayType)
  type: HolidayType;

  @IsNotEmpty()
  @IsDateString()
  startDate: string;

  @IsOptional()
  @IsDateString()
  endDate?: string;

  @IsOptional()
  @IsString()
  name?: string;

  @IsOptional()
  @IsBoolean()
  active?: boolean;

  @IsOptional()
  @IsBoolean()
  recurring?: boolean;

  @IsOptional()
  @IsString()
  description?: string;

  @IsOptional()
  @IsString()
  region?: string;
}

