import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';

export type AttendanceDocument = Attendance & Document;

@Schema({ timestamps: true })
export class Attendance {
  @Prop({ type: Types.ObjectId, ref: 'Employee', required: true })
  employeeId: Types.ObjectId;

  @Prop({ required: true })
  attendanceDate: Date;

  @Prop({ type: Types.ObjectId, ref: 'Shift' })
  shiftId?: Types.ObjectId;

  @Prop()
  clockIn?: Date;

  @Prop()
  clockOut?: Date;

  @Prop()
  totalHours?: number;

  @Prop({ 
    enum: ['present', 'absent', 'late', 'early-leave', 'half-day'],
    default: 'absent'
  })
  status: string;

  @Prop({ default: false })
  isRestDay: boolean;

  @Prop({ default: false })
  isHoliday: boolean;

  @Prop()
  latenessMinutes?: number;

  @Prop()
  earlyLeaveMinutes?: number;

  @Prop({ default: false })
  isCorrected: boolean;

  @Prop({ type: Types.ObjectId, ref: 'AttendanceCorrection' })
  correctionRequestId?: Types.ObjectId;

  @Prop()
  notes?: string;
}

export const AttendanceSchema = SchemaFactory.createForClass(Attendance);
AttendanceSchema.index({ employeeId: 1, attendanceDate: 1 }, { unique: true });