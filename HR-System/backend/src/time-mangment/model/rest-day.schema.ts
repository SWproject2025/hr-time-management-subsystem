import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';

export type RestDayDocument = RestDay & Document;

@Schema({ timestamps: true })
export class RestDay {
  @Prop({ type: Types.ObjectId, ref: 'Employee' })
  employeeId?: Types.ObjectId; // If null, applies to all employees

  @Prop({ type: Types.ObjectId, ref: 'Department' })
  departmentId?: Types.ObjectId;

  @Prop({ 
    required: true,
    enum: ['monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday', 'sunday']
  })
  dayOfWeek: string;

  @Prop({ default: true })
  isActive: boolean;
}

export const RestDaySchema = SchemaFactory.createForClass(RestDay);