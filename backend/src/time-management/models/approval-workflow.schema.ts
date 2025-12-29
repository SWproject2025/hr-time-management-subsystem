import { Schema, Prop, SchemaFactory } from "@nestjs/mongoose";
import { HydratedDocument } from "mongoose";

export type ApprovalWorkflowDocument = HydratedDocument<ApprovalWorkflow>;

export enum ExceptionType {
  ATTENDANCE_CORRECTION = 'ATTENDANCE_CORRECTION',
  OVERTIME_REQUEST = 'OVERTIME_REQUEST',
  TIME_EXCEPTION = 'TIME_EXCEPTION',
  LEAVE_REQUEST = 'LEAVE_REQUEST',
}

@Schema({ timestamps: true })
export class AutoApproveConditions {
  @Prop()
  amount?: number; // For overtime: max hours, for leave: max days

  @Prop()
  duration?: number; // For leave requests: max days

  @Prop({ default: false })
  enabled: boolean;
}

@Schema({ timestamps: true })
export class NotificationSettings {
  @Prop({ default: true })
  email: boolean;

  @Prop({ default: true })
  inApp: boolean;

  @Prop({ default: false })
  sms: boolean;

  @Prop({ default: true })
  notifyOnSubmission: boolean;

  @Prop({ default: true })
  notifyOnApproval: boolean;

  @Prop({ default: true })
  notifyOnRejection: boolean;

  @Prop({ default: true })
  notifyOnEscalation: boolean;
}

@Schema({ timestamps: true })
export class ApprovalWorkflow {
  @Prop({ enum: ExceptionType, required: true })
  exceptionType: ExceptionType;

  @Prop({ type: [String], required: true })
  approvalChain: string[]; // Array of role IDs in approval order

  @Prop({ default: 48, min: 1, max: 168 }) // hours
  autoEscalateAfter: number;

  @Prop({ required: true })
  escalateToRole: string;

  @Prop({ type: AutoApproveConditions, default: () => ({ enabled: false }) })
  autoApproveConditions: AutoApproveConditions;

  @Prop({ type: NotificationSettings, default: () => ({}) })
  notifications: NotificationSettings;

  @Prop({ default: true })
  active: boolean;

  @Prop({ default: Date.now })
  createdAt: Date;

  @Prop({ default: Date.now })
  updatedAt: Date;
}

export const ApprovalWorkflowSchema = SchemaFactory.createForClass(ApprovalWorkflow);
