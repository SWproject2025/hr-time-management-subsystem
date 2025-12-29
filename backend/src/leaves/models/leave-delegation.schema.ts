
import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument, Types } from 'mongoose';

export type LeaveDelegationDocument = HydratedDocument<LeaveDelegation>;

@Schema({ timestamps: true })
export class LeaveDelegation {
  @Prop({ type: Types.ObjectId, ref: 'Employee', required: true })
  managerId: Types.ObjectId;

  @Prop({ type: Types.ObjectId, ref: 'Employee', required: true })
  delegateId: Types.ObjectId;

  @Prop({ required: true })
  startDate: Date;

  @Prop({ required: true })
  endDate: Date;

  @Prop()
  reason?: string;

  @Prop({ default: true })
  isActive: boolean;
}

export const LeaveDelegationSchema = SchemaFactory.createForClass(LeaveDelegation);
