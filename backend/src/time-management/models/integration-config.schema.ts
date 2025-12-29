import { Schema, Prop, SchemaFactory } from "@nestjs/mongoose";
import { HydratedDocument } from "mongoose";

export type IntegrationConfigDocument = HydratedDocument<IntegrationConfig>;

export enum SyncFrequency {
  REAL_TIME = 'REAL_TIME',
  HOURLY = 'HOURLY',
  DAILY = 'DAILY',
  WEEKLY = 'WEEKLY',
}

@Schema({ timestamps: true })
export class IntegrationConfig {
  @Prop({ default: true })
  payrollEnabled: boolean;

  @Prop({ default: true })
  leaveManagementEnabled: boolean;

  @Prop({ default: true })
  autoSyncEnabled: boolean;

  @Prop({ enum: SyncFrequency, default: SyncFrequency.DAILY })
  syncFrequency: SyncFrequency;

  @Prop({ default: true })
  failureAlertsEnabled: boolean;

  @Prop({ type: [String], default: [] })
  alertEmails: string[];

  // Payroll specific settings
  @Prop()
  payrollApiEndpoint?: string;

  @Prop()
  payrollApiKey?: string;

  // Leave management specific settings
  @Prop()
  leaveApiEndpoint?: string;

  @Prop()
  leaveApiKey?: string;

  @Prop({ default: Date.now })
  lastModified: Date;
}

export const IntegrationConfigSchema = SchemaFactory.createForClass(IntegrationConfig);
