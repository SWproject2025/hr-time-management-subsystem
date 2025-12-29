import { Schema, Prop, SchemaFactory } from "@nestjs/mongoose";
import { HydratedDocument } from "mongoose";

export type SyncLogDocument = HydratedDocument<SyncLog>;

export enum SyncSystem {
  PAYROLL = 'PAYROLL',
  LEAVE_MANAGEMENT = 'LEAVE_MANAGEMENT',
  HR_SYSTEM = 'HR_SYSTEM',
}

export enum SyncStatus {
  SUCCESS = 'SUCCESS',
  ERROR = 'ERROR',
  WARNING = 'WARNING',
  IN_PROGRESS = 'IN_PROGRESS',
}

@Schema({ timestamps: true })
export class SyncLog {
  @Prop({ enum: SyncSystem, required: true })
  system: SyncSystem;

  @Prop({ required: true })
  operation: string; // e.g., 'SYNC_ATTENDANCE', 'SYNC_OVERTIME', etc.

  @Prop({ enum: SyncStatus, required: true })
  status: SyncStatus;

  @Prop({ default: 0 })
  recordsProcessed: number;

  @Prop()
  message: string;

  @Prop({ default: 0 })
  duration: number; // in milliseconds

  @Prop()
  triggeredBy: string; // user ID or 'SYSTEM'

  @Prop({ type: Object })
  metadata: Record<string, any>; // additional data like error details, record IDs, etc.

  @Prop()
  errorDetails?: string;

  @Prop({ default: Date.now })
  timestamp: Date;
}

export const SyncLogSchema = SchemaFactory.createForClass(SyncLog);
