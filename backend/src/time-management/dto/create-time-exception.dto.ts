import { IsNotEmpty, IsString, IsOptional, IsEnum } from 'class-validator';
import { TimeExceptionType, TimeExceptionStatus } from '../models/enums';

export class CreateTimeExceptionDto {
  @IsNotEmpty()
  @IsString()
  employeeId: string;

  @IsNotEmpty()
  @IsEnum(TimeExceptionType)
  type: TimeExceptionType;

  @IsNotEmpty()
  @IsString()
  attendanceRecordId: string;

  @IsNotEmpty()
  @IsString()
  assignedTo: string;

  @IsOptional()
  @IsEnum(TimeExceptionStatus)
  status?: TimeExceptionStatus;

  @IsOptional()
  @IsString()
  reason?: string;
}

