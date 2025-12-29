// src/performance/models/appraisal-dispute.schema.ts

import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument, Types } from 'mongoose';
import { AppraisalDisputeStatus } from '../enums/performance.enums';

export type AppraisalDisputeDocument =
  HydratedDocument<AppraisalDispute>;

@Schema({ collection: 'appraisal_disputes', timestamps: true })
export class AppraisalDispute {
  @Prop({ type: Types.ObjectId, ref: 'AppraisalAssignment', required: true })
  assignmentId: Types.ObjectId;

  @Prop({ type: Types.ObjectId, ref: 'AppraisalCycle', required: true })
  cycleId: Types.ObjectId;

  @Prop({ type: Types.ObjectId, ref: 'EmployeeProfile', required: true })
  employeeProfileId: Types.ObjectId;

  @Prop({ type: Types.ObjectId, ref: 'EmployeeProfile', required: true })
  managerProfileId: Types.ObjectId;

  @Prop({ type: Types.ObjectId, ref: 'AppraisalRecord', required: true })
  appraisalRecordId: Types.ObjectId;

  @Prop({ type: Types.ObjectId, ref: 'EmployeeProfile', required: true })
  raisedByEmployeeProfileId: Types.ObjectId;

  @Prop({ type: String, required: true })
  reason: string;

  @Prop({ type: String })
  employeeComments?: string;

  @Prop({
    type: String,
    enum: Object.values(AppraisalDisputeStatus),
    default: AppraisalDisputeStatus.OPEN,
  })
  status: AppraisalDisputeStatus;

  @Prop({ type: String })
  hrDecisionNotes?: string;

  @Prop({ type: Date })
  resolvedAt?: Date;
}

export const AppraisalDisputeSchema =
  SchemaFactory.createForClass(AppraisalDispute);
