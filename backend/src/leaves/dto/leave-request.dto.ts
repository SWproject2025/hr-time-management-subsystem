import { IsNotEmpty, IsDateString, IsString, IsOptional, IsMongoId, IsEnum } from 'class-validator';
import { Type } from 'class-transformer';

export class CreateLeaveRequestDto {
  @IsMongoId()
  @IsNotEmpty()
  leaveTypeId: string;

  @IsDateString()
  @IsNotEmpty()
  fromDate: string;

  @IsDateString()
  @IsNotEmpty()
  toDate: string;

  @IsString()
  @IsNotEmpty()
  justification: string;

  @IsOptional()
  @IsString()
  attachmentId?: string;
}

export class UpdateLeaveRequestDto {
  @IsOptional()
  @IsMongoId()
  leaveTypeId?: string;

  @IsOptional()
  @IsDateString()
  fromDate?: string;

  @IsOptional()
  @IsDateString()
  toDate?: string;

  @IsOptional()
  @IsString()
  justification?: string;

  @IsOptional()
  @IsString()
  attachmentId?: string;
}

export class ApproveLeaveRequestDto {
  @IsOptional()
  @IsString()
  comments?: string;
}

export class RejectLeaveRequestDto {
  @IsNotEmpty()
  @IsString()
  reason: string;
}

export class LeaveBalanceQueryDto {
  @IsOptional()
  @IsMongoId()
  leaveTypeId?: string;
}