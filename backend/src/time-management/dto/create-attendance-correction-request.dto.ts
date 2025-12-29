import { IsNotEmpty, IsString, IsOptional, IsEnum, IsDateString } from 'class-validator';
import { CorrectionRequestStatus } from '../models/enums';

export class CreateAttendanceCorrectionRequestDto {
  @IsNotEmpty()
  @IsString()
  employeeId: string;

  @IsOptional()
  @IsString()
  attendanceRecord?: string; // Optional - can be ObjectId or we'll find by date

  @IsOptional()
  @IsDateString()
  date?: string; // Alternative to attendanceRecord - we'll find/create the record

  @IsOptional()
  @IsString()
  reason?: string;

  @IsOptional()
  requested?: any; // Store requested changes

  @IsOptional()
  @IsEnum(CorrectionRequestStatus)
  status?: CorrectionRequestStatus;
}

