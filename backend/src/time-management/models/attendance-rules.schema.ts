import { Schema, Prop, SchemaFactory } from "@nestjs/mongoose";
import { HydratedDocument } from "mongoose";

export type AttendanceRulesDocument = HydratedDocument<AttendanceRules>;

export enum PunchPolicy {
  MULTIPLE = 'MULTIPLE',
  FIRST_LAST = 'FIRST_LAST',
}

export enum PunchRoundingRule {
  NONE = 'NONE',
  NEAREST_5 = 'NEAREST_5',
  NEAREST_10 = 'NEAREST_10',
  NEAREST_15 = 'NEAREST_15',
}

@Schema()
export class AttendanceRules {
  @Prop({ enum: PunchPolicy, default: PunchPolicy.MULTIPLE })
  multiplePunchesPolicy: PunchPolicy;

  @Prop({ default: 15, min: 0, max: 480 }) // minutes
  earlyClockInTolerance: number;

  @Prop({ default: 15, min: 0, max: 480 }) // minutes
  lateClockOutTolerance: number;

  @Prop({ default: 5, min: 1, max: 60 }) // minutes
  minimumTimeBetweenPunches: number;

  @Prop({ enum: PunchRoundingRule, default: PunchRoundingRule.NONE })
  punchRoundingRule: PunchRoundingRule;

  @Prop({ default: Date.now })
  effectiveFrom: Date;

  @Prop({ default: true })
  isActive: boolean;

  @Prop({ default: Date.now })
  createdAt: Date;

  @Prop({ default: Date.now })
  updatedAt: Date;
}

export const AttendanceRulesSchema = SchemaFactory.createForClass(AttendanceRules);
