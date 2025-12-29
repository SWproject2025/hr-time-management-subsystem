import { Schema, Prop, SchemaFactory } from "@nestjs/mongoose";
import { HydratedDocument } from "mongoose";

export type FlexiblePunchConfigDocument = HydratedDocument<FlexiblePunchConfig>;

export enum PunchMethod {
  WEB = 'WEB',
  MOBILE = 'MOBILE',
  BOTH = 'BOTH',
}

@Schema()
export class EditingPermissions {
  @Prop({ default: true })
  canEditOwn: boolean;

  @Prop({ default: false })
  canEditTeam: boolean;

  @Prop({ default: false })
  canEditAll: boolean;

  @Prop({ default: true })
  managers: boolean;

  @Prop({ default: true })
  hr: boolean;

  @Prop({ default: true })
  admin: boolean;
}

@Schema()
export class FlexiblePunchConfig {
  @Prop({ enum: PunchMethod, default: PunchMethod.BOTH })
  punchMethods: PunchMethod;

  @Prop({ default: false })
  geolocationRequired: boolean;

  @Prop({ default: 100, min: 10, max: 5000 }) // meters
  geolocationRadius: number;

  @Prop({ type: EditingPermissions, default: () => ({}) })
  editingPermissions: EditingPermissions;

  @Prop({ default: 15, min: 0, max: 480 }) // minutes
  gracePeriodMinutes: number;

  @Prop({ default: true })
  allowLateCorrections: boolean;

  @Prop({ default: 7, min: 1, max: 365 }) // days
  maxCorrectionDays: number;

  @Prop({ default: true })
  requireApprovalForCorrections: boolean;

  @Prop({ default: true })
  notifyOnCorrections: boolean;

  @Prop({ default: Date.now })
  effectiveFrom: Date;

  @Prop({ default: true })
  isActive: boolean;

  @Prop({ default: Date.now })
  createdAt: Date;

  @Prop({ default: Date.now })
  updatedAt: Date;
}

export const FlexiblePunchConfigSchema = SchemaFactory.createForClass(FlexiblePunchConfig);
