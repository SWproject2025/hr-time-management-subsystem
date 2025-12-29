import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument, Types } from 'mongoose';

export type LeaveAttachmentDocument = HydratedDocument<LeaveAttachment>;

@Schema({ collection: 'leave_attachments', timestamps: true })
export class LeaveAttachment {
  @Prop({ required: true })
  fileId: string; // Unique file identifier

  @Prop({ type: Types.ObjectId, ref: 'LeaveRequest', required: true })
  requestId: Types.ObjectId;

  @Prop({ required: true })
  fileName: string;

  @Prop({ required: true })
  originalName: string;

  @Prop({ required: true })
  fileType: string; // MIME type

  @Prop({ required: true })
  fileSize: number; // in bytes

  @Prop({ required: true })
  filePath: string; // Storage path

  @Prop({ type: Types.ObjectId, ref: 'EmployeeProfile', required: true })
  uploadedBy: Types.ObjectId;

  @Prop({ default: Date.now })
  uploadedAt: Date;

  @Prop({ default: true })
  isActive: boolean;
}

export const LeaveAttachmentSchema = SchemaFactory.createForClass(LeaveAttachment);
