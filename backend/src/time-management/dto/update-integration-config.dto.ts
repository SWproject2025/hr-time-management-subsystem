import { IsEnum, IsBoolean, IsOptional, IsArray, IsString } from 'class-validator';
import { SyncFrequency } from '../models/integration-config.schema';

export class UpdateIntegrationConfigDto {
  @IsOptional()
  @IsBoolean()
  payrollEnabled?: boolean;

  @IsOptional()
  @IsBoolean()
  leaveManagementEnabled?: boolean;

  @IsOptional()
  @IsBoolean()
  autoSyncEnabled?: boolean;

  @IsOptional()
  @IsEnum(SyncFrequency)
  syncFrequency?: SyncFrequency;

  @IsOptional()
  @IsBoolean()
  failureAlertsEnabled?: boolean;

  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  alertEmails?: string[];

  @IsOptional()
  @IsString()
  payrollApiEndpoint?: string;

  @IsOptional()
  @IsString()
  payrollApiKey?: string;

  @IsOptional()
  @IsString()
  leaveApiEndpoint?: string;

  @IsOptional()
  @IsString()
  leaveApiKey?: string;
}
