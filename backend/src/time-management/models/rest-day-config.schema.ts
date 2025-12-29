import { Schema, Prop, SchemaFactory } from "@nestjs/mongoose";
import { HydratedDocument } from "mongoose";

export type RestDayConfigDocument = HydratedDocument<RestDayConfig>;

export enum RestDayConfigType {
  DEFAULT = 'DEFAULT',
  DEPARTMENT = 'DEPARTMENT',
  POSITION = 'POSITION',
}

@Schema({ timestamps: true })
export class RestDayConfig {
  @Prop({ enum: RestDayConfigType, required: true })
  type: RestDayConfigType;

  @Prop()
  departmentId?: string;

  @Prop()
  positionId?: string;

  @Prop({ type: [String], required: true })
  restDays: string[]; // Array of day names: 'monday', 'tuesday', etc.

  @Prop({ required: true })
  effectiveFrom: Date;

  @Prop({ default: true })
  active: boolean;

  @Prop({ default: Date.now })
  createdAt: Date;

  @Prop({ default: Date.now })
  updatedAt: Date;
}

export const RestDayConfigSchema = SchemaFactory.createForClass(RestDayConfig);
