import { IsNotEmpty, IsString, IsOptional, IsEnum } from 'class-validator';
import { CorrectionRequestStatus } from '../models/enums';

export class CreateAttendanceCorrectionRequestDto {
  @IsNotEmpty()
  @IsString()
  employeeId: string;

  @IsNotEmpty()
  @IsString()
  attendanceRecord: string;

  @IsOptional()
  @IsString()
  reason?: string;

  @IsOptional()
  @IsEnum(CorrectionRequestStatus)
  status?: CorrectionRequestStatus;
}

