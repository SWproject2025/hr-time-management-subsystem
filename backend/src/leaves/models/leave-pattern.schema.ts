import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument, Types } from 'mongoose';

export type LeavePatternDocument = HydratedDocument<LeavePattern>;

export enum PatternType {
  MONDAY_FRIDAY = 'MONDAY_FRIDAY',
  ADJACENT_TO_HOLIDAY = 'ADJACENT_TO_HOLIDAY',
  EXCESSIVE_SICK = 'EXCESSIVE_SICK'
}

@Schema({ timestamps: true })
export class LeavePattern {
  @Prop({ type: Types.ObjectId, ref: 'EmployeeProfile', required: true })
  employeeId: Types.ObjectId;

  @Prop({ enum: PatternType, required: true })
  patternType: PatternType;

  @Prop({ required: true })
  occurrences: number;

  @Prop({ required: true })
  details: string; // "Detected 6 Monday/Friday leaves in the last 3 months"

  @Prop({ default: false })
  acknowledged: boolean;

  @Prop({ type: Types.ObjectId, ref: 'User' })
  acknowledgedBy?: Types.ObjectId;

  @Prop()
  acknowledgedAt?: Date;

  @Prop({ required: true })
  detectionDate: Date;
}

export const LeavePatternSchema = SchemaFactory.createForClass(LeavePattern);
