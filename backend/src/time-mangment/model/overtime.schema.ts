import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';

export type OvertimeDocument = Overtime & Document;

@Schema({ timestamps: true })
export class Overtime {
  @Prop({ type: Types.ObjectId, ref: 'Employee', required: true })
  employeeId: Types.ObjectId;

  @Prop({ required: true })
  overtimeDate: Date;

  @Prop({ required: true })
  startTime: Date;

  @Prop({ required: true })
  endTime: Date;

  @Prop({ required: true })
  totalHours: number;

  @Prop({ 
    enum: ['pending', 'approved', 'rejected', 'auto-approved'],
    default: 'pending'
  })
  status: string;

  @Prop()
  reason?: string;

  @Prop({ type: Types.ObjectId, ref: 'Employee' })
  approvedBy?: Types.ObjectId; // Line Manager or HR Admin

  @Prop()
  approvedAt?: Date;

  @Prop()
  rejectionReason?: string;

  @Prop({ default: false })
  isWeekend: boolean;

  @Prop({ default: false })
  isHoliday: boolean;
}

export const OvertimeSchema = SchemaFactory.createForClass(Overtime);