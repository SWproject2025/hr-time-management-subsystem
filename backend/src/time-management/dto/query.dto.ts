import { IsOptional, IsString, IsDateString, IsEnum, IsArray, IsBoolean } from 'class-validator';
import { Type } from 'class-transformer';
import { CorrectionRequestStatus, TimeExceptionType, TimeExceptionStatus, ShiftAssignmentStatus, HolidayType } from '../models/enums';

export class AttendanceRecordQueryDto {
  @IsOptional()
  @IsString()
  employeeId?: string;

  @IsOptional()
  @IsDateString()
  startDate?: string;

  @IsOptional()
  @IsDateString()
  endDate?: string;

  @IsOptional()
  @IsBoolean()
  @Type(() => Boolean)
  finalisedForPayroll?: boolean;
}

export class CorrectionRequestQueryDto {
  @IsOptional()
  @IsString()
  employeeId?: string;

  @IsOptional()
  @IsEnum(CorrectionRequestStatus)
  status?: CorrectionRequestStatus;
}

export class TimeExceptionQueryDto {
  @IsOptional()
  @IsString()
  employeeId?: string;

  @IsOptional()
  @IsEnum(TimeExceptionType)
  type?: TimeExceptionType;

  @IsOptional()
  @IsEnum(TimeExceptionStatus)
  status?: TimeExceptionStatus;

  @IsOptional()
  @IsString()
  assignedTo?: string;
}

export class ShiftAssignmentQueryDto {
  @IsOptional()
  @IsString()
  employeeId?: string;

  @IsOptional()
  @IsString()
  departmentId?: string;

  @IsOptional()
  @IsString()
  positionId?: string;

  @IsOptional()
  @IsString()
  shiftId?: string;

  @IsOptional()
  @IsEnum(ShiftAssignmentStatus)
  status?: ShiftAssignmentStatus;

  @IsOptional()
  @IsDateString()
  startDate?: string;

  @IsOptional()
  @IsDateString()
  endDate?: string;
}

export class HolidayQueryDto {
  @IsOptional()
  @IsEnum(HolidayType)
  type?: HolidayType;

  @IsOptional()
  @IsDateString()
  startDate?: string;

  @IsOptional()
  @IsDateString()
  endDate?: string;

  @IsOptional()
  @IsBoolean()
  @Type(() => Boolean)
  active?: boolean;
}

export class NotificationLogQueryDto {
  @IsOptional()
  @IsString()
  to?: string;

  @IsOptional()
  @IsString()
  type?: string;

  @IsOptional()
  @IsDateString()
  startDate?: string;

  @IsOptional()
  @IsDateString()
  endDate?: string;
}

