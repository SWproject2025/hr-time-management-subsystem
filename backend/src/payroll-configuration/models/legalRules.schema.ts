import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument } from 'mongoose';

export type LegalRulesDocument = HydratedDocument<LegalRules>;

@Schema({ timestamps: true })
export class LegalRules {
    @Prop({ required: true })
    name: string;

    @Prop({ required: true })
    description: string;

    @Prop({ required: true, default: true })
    isActive: boolean;

    @Prop({ required: true })
    code: string;

    @Prop({ required: true })
    effectiveDate: Date;

}

export const LegalRulesSchema = SchemaFactory.createForClass(LegalRules);