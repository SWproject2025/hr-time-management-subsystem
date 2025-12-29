import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument, Types } from 'mongoose';

export type AttachmentDocument = HydratedDocument<Attachment>;

@Schema({ collection: 'attachments', timestamps: true })
export class Attachment {
  @Prop({ required: true })
  filename: string;

  @Prop({ required: true })
  originalName: string;

  @Prop({ required: true })
  mimetype: string;

  @Prop({ required: true })
  path: string;

  @Prop()
  size: number;

  @Prop({ type: Types.ObjectId, ref: 'EmployeeProfile' })
  uploadedBy: Types.ObjectId;
}

export const AttachmentSchema = SchemaFactory.createForClass(Attachment);