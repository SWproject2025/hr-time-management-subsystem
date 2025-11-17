import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';

export type HolidayCalendarDocument = HolidayCalendar & Document;

@Schema({ timestamps: true })
export class HolidayCalendar {
  @Prop({ required: true })
  holidayName: string;

  @Prop({ required: true })
  holidayDate: Date;

  @Prop({ 
    enum: ['national', 'company', 'religious'],
    default: 'national'
  })
  holidayType: string;

  @Prop({ default: true })
  isRecurring: boolean;

  @Prop()
  year?: number; // For non-recurring holidays

  @Prop({ default: true })
  isActive: boolean;
}

export const HolidayCalendarSchema = SchemaFactory.createForClass(HolidayCalendar);
HolidayCalendarSchema.index({ holidayDate: 1 });