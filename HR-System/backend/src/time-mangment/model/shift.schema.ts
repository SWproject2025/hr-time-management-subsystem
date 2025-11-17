import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';

export type ShiftDocument = Shift & Document;

@Schema({ timestamps: true })
export class Shift {
  @Prop({ required: true, unique: true })
  shiftCode: string;

  @Prop({ required: true })
  shiftName: string;

  @Prop({ 
    required: true, 
    enum: ['normal', 'split', 'overnight', 'rotational'] 
  })
  shiftType: string;

  @Prop({ required: true })
  startTime: string; // Format: "HH:mm"

  @Prop({ required: true })
  endTime: string; // Format: "HH:mm"

  @Prop({ required: true })
  duration: number; // in hours

  @Prop({ default: true })
  isActive: boolean;

  @Prop()
  description?: string;
}

export const ShiftSchema = SchemaFactory.createForClass(Shift);