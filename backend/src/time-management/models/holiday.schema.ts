import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument } from 'mongoose';
import { HolidayType } from './enums/index';

export type HolidayDocument = HydratedDocument<Holiday>;

@Schema({ timestamps: true })
export class Holiday {
  @Prop({ enum: HolidayType, required: true })
  type: HolidayType;

  @Prop({ required: true })
  startDate: Date;

  @Prop()
  endDate?: Date; // if missing, startDate == holiday day

  @Prop()
  name?: string;

  @Prop({ default: true })
  active: boolean;

  @Prop({ default: false })
  recurring: boolean; // yearly recurring holiday

  @Prop()
  description?: string;

  @Prop()
  region?: string; // for regional holidays
}

export const HolidaySchema = SchemaFactory.createForClass(Holiday);

