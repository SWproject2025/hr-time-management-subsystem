import { IsEnum, IsArray, IsString, IsNumber, IsOptional, IsBoolean, IsObject, ValidateNested, Min, Max } from 'class-validator';
import { Type } from 'class-transformer';
import { ExceptionType } from '../models/approval-workflow.schema';

class AutoApproveConditionsDto {
  @IsOptional()
  @IsNumber()
  @Min(0)
  amount?: number;

  @IsOptional()
  @IsNumber()
  @Min(0)
  duration?: number;

  @IsOptional()
  @IsBoolean()
  enabled?: boolean;
}

class NotificationSettingsDto {
  @IsOptional()
  @IsBoolean()
  email?: boolean;

  @IsOptional()
  @IsBoolean()
  inApp?: boolean;

  @IsOptional()
  @IsBoolean()
  sms?: boolean;

  @IsOptional()
  @IsBoolean()
  notifyOnSubmission?: boolean;

  @IsOptional()
  @IsBoolean()
  notifyOnApproval?: boolean;

  @IsOptional()
  @IsBoolean()
  notifyOnRejection?: boolean;

  @IsOptional()
  @IsBoolean()
  notifyOnEscalation?: boolean;
}

export class CreateApprovalWorkflowDto {
  @IsEnum(ExceptionType)
  exceptionType: ExceptionType;

  @IsArray()
  @IsString({ each: true })
  approvalChain: string[];

  @IsOptional()
  @IsNumber()
  @Min(1)
  @Max(168)
  autoEscalateAfter?: number;

  @IsOptional()
  @IsString()
  escalateToRole?: string;

  @IsOptional()
  @ValidateNested()
  @Type(() => AutoApproveConditionsDto)
  autoApproveConditions?: AutoApproveConditionsDto;

  @IsOptional()
  @ValidateNested()
  @Type(() => NotificationSettingsDto)
  notifications?: NotificationSettingsDto;

  @IsOptional()
  @IsBoolean()
  active?: boolean;
}
