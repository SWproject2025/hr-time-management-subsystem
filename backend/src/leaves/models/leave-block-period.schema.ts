import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument, Types } from 'mongoose';

export type LeaveBlockPeriodDocument = HydratedDocument<LeaveBlockPeriod>;

@Schema({ collection: 'leave_block_periods', timestamps: true })
export class LeaveBlockPeriod {
  @Prop({ required: true })
  name: string; // e.g., "Year-End Freeze", "Peak Season"

  @Prop({ required: true })
  startDate: Date;

  @Prop({ required: true })
  endDate: Date;

  @Prop()
  reason: string;

  @Prop({ default: true })
  isActive: boolean;

  @Prop({ type: [String], default: [] })
  exemptLeaveTypes: string[]; // Leave type codes that are exempt from block
}

export const LeaveBlockPeriodSchema = SchemaFactory.createForClass(LeaveBlockPeriod);
