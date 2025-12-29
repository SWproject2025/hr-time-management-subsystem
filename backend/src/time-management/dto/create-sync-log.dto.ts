import { IsEnum, IsString, IsNumber, IsOptional, IsObject, IsDateString } from 'class-validator';
import { SyncSystem, SyncStatus } from '../models/sync-log.schema';

export class CreateSyncLogDto {
  @IsEnum(SyncSystem)
  system: SyncSystem;

  @IsString()
  operation: string;

  @IsEnum(SyncStatus)
  status: SyncStatus;

  @IsOptional()
  @IsNumber()
  recordsProcessed?: number;

  @IsOptional()
  @IsString()
  message?: string;

  @IsOptional()
  @IsNumber()
  duration?: number;

  @IsOptional()
  @IsString()
  triggeredBy?: string;

  @IsOptional()
  @IsObject()
  metadata?: Record<string, any>;

  @IsOptional()
  @IsString()
  errorDetails?: string;

  @IsOptional()
  @IsDateString()
  timestamp?: string;
}
