import { IsNotEmpty, IsString, IsOptional, IsBoolean, IsNumber, IsArray, ValidateNested, IsDateString } from 'class-validator';
import { Type } from 'class-transformer';
import { PunchType } from '../models/enums';

export class PunchDto {
  @IsNotEmpty()
  @IsString()
  type: PunchType;

  @IsNotEmpty()
  @IsDateString()
  time: Date;
}

export class CreateAttendanceRecordDto {
  @IsNotEmpty()
  @IsString()
  employeeId: string;

  @IsOptional()
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => PunchDto)
  punches?: PunchDto[];

  @IsOptional()
  @IsNumber()
  totalWorkMinutes?: number;

  @IsOptional()
  @IsBoolean()
  hasMissedPunch?: boolean;

  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  exceptionIds?: string[];

  @IsOptional()
  @IsBoolean()
  finalisedForPayroll?: boolean;
}

