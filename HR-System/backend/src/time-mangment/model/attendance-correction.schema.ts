import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';

export type AttendanceCorrectionDocument = AttendanceCorrection & Document;

@Schema({ timestamps: true })
export class AttendanceCorrection {
  @Prop({ type: Types.ObjectId, ref: 'Employee', required: true })
  employeeId: Types.ObjectId;

  @Prop({ required: true })
  correctionDate: Date;

  @Prop()
  originalClockIn?: Date;

  @Prop()
  originalClockOut?: Date;

  @Prop({ required: true })
  correctedClockIn: Date;

  @Prop({ required: true })
  correctedClockOut: Date;

  @Prop({ required: true })
  reason: string;

  @Prop({ 
    enum: ['pending', 'approved', 'rejected'],
    default: 'pending'
  })
  status: string;

  @Prop({ type: Types.ObjectId, ref: 'Employee' })
  requestedBy?: Types.ObjectId;

  @Prop({ type: Types.ObjectId, ref: 'Employee' })
  reviewedBy?: Types.ObjectId; // Line Manager or HR Admin

  @Prop()
  reviewedAt?: Date;

  @Prop()
  rejectionReason?: string;
}

export const AttendanceCorrectionSchema = SchemaFactory.createForClass(AttendanceCorrection);