import { IsNotEmpty, IsEnum, IsDateString, IsOptional, IsBoolean, IsString } from 'class-validator';
import { HolidayType } from '../models/enums';

export class CreateHolidayDto {
  @IsNotEmpty()
  @IsEnum(HolidayType)
  type: HolidayType;

  @IsNotEmpty()
  @IsDateString()
  startDate: Date;

  @IsOptional()
  @IsDateString()
  endDate?: Date;

  @IsOptional()
  @IsString()
  name?: string;

  @IsOptional()
  @IsBoolean()
  active?: boolean;
}

