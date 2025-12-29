import { Schema, Prop, SchemaFactory } from "@nestjs/mongoose";
import { HydratedDocument } from "mongoose";

export type PayrollClosureConfigDocument = HydratedDocument<PayrollClosureConfig>;

@Schema({ timestamps: true })
export class ClosureChecklist {
  @Prop({ default: false })
  attendanceValidated: boolean;

  @Prop({ default: false })
  overtimeProcessed: boolean;

  @Prop({ default: false })
  correctionsApplied: boolean;

  @Prop({ default: false })
  exceptionsResolved: boolean;

  @Prop({ default: false })
  shiftsConfirmed: boolean;
}

@Schema({ timestamps: true })
export class PayrollClosureConfig {
  @Prop({ required: true })
  payrollCycleEnd: Date;

  @Prop({ default: 48, min: 1, max: 168 }) // hours
  autoEscalationHours: number;

  @Prop({ default: 'MANAGER' })
  escalateToRole: string;

  @Prop()
  escalateToPerson?: string;

  @Prop({ type: ClosureChecklist, default: () => ({}) })
  closureChecklist: ClosureChecklist;

  @Prop({ default: true })
  notificationsEnabled: boolean;

  @Prop({ default: false })
  autoClosureEnabled: boolean;

  @Prop({ default: Date.now })
  createdAt: Date;

  @Prop({ default: Date.now })
  updatedAt: Date;
}

export const PayrollClosureConfigSchema = SchemaFactory.createForClass(PayrollClosureConfig);
