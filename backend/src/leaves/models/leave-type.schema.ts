import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument, Types } from 'mongoose';
import { AttachmentType } from '../enums/attachment-type.enum';

export type LeaveTypeDocument = HydratedDocument<LeaveType>;

@Schema({ collection: 'leave_types', timestamps: true })
export class LeaveType {
  @Prop({ required: true, unique: true })
  code: string;

  @Prop({ required: true })
  name: string;

  @Prop({ type: Types.ObjectId, ref: 'LeaveCategory', required: true })
  categoryId: Types.ObjectId;

  @Prop()
  description?: string;

  @Prop({ default: true })
  paid: boolean;

  @Prop({ default: true })
  deductible: boolean;

  @Prop({ default: false })
  requiresAttachment: boolean;

  @Prop({ enum: AttachmentType })
  attachmentType?: AttachmentType;

  @Prop({ default: null })
  minTenureMonths?: number;

  @Prop({ default: null })
  maxDurationDays?: number;

  @Prop({ default: true })
  isActive: boolean;

  @Prop({ type: String })
  payrollCode?: string;
}

export const LeaveTypeSchema = SchemaFactory.createForClass(LeaveType);