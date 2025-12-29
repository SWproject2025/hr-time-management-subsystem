import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument, Types } from 'mongoose';

export type JobRequisitionDocument = HydratedDocument<JobRequisition>;

@Schema({ collection: 'job_requisitions', timestamps: true })
export class JobRequisition {
  @Prop({ type: String, required: true })
  jobTitle: string;

  @Prop({ type: Types.ObjectId, ref: 'Department', required: true })
  departmentId: Types.ObjectId;

  @Prop({ type: Types.ObjectId, ref: 'Position', required: true })
  positionId: Types.ObjectId;

  @Prop({ type: String })
  location?: string;

  @Prop({ type: Number, required: true, min: 1 })
  openings: number;

  @Prop({ type: [String], default: [] })
  qualifications: string[];

  @Prop({ type: [String], default: [] })
  skills: string[];

  @Prop({
    type: String,
    enum: ['open', 'closed'],
    default: 'open',
  })
  status: 'open' | 'closed';
}

export const JobRequisitionSchema =
  SchemaFactory.createForClass(JobRequisition);


