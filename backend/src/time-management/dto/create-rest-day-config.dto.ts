import { IsEnum, IsArray, IsString, IsOptional, IsDateString, IsBoolean } from 'class-validator';
import { RestDayConfigType } from '../models/rest-day-config.schema';

export class CreateRestDayConfigDto {
  @IsEnum(RestDayConfigType)
  type: RestDayConfigType;

  @IsOptional()
  @IsString()
  departmentId?: string;

  @IsOptional()
  @IsString()
  positionId?: string;

  @IsArray()
  @IsString({ each: true })
  restDays: string[];

  @IsOptional()
  @IsDateString()
  effectiveFrom: string;

  @IsOptional()
  @IsBoolean()
  active?: boolean;
}
