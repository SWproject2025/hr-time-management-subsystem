import { Schema, Prop, SchemaFactory } from "@nestjs/mongoose";

import { HydratedDocument } from "mongoose";

export type ShiftTypeDocument = HydratedDocument<ShiftType>;

@Schema()
export class ShiftType {
    @Prop({required: true})
    name: string

    @Prop({enum: ['NORMAL', 'SPLIT', 'OVERNIGHT', 'ROTATIONAL'], default: 'NORMAL'})
    kind: string;

    @Prop()
    startTime: string;

    @Prop()
    endTime: string;

    @Prop({default: 0})
    breakMinutes: number;

    @Prop({default: true})
    active: boolean;
}

export const ShiftTypeSchema = SchemaFactory.createForClass(ShiftType);
