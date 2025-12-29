import { Prop, Schema, SchemaFactory, } from '@nestjs/mongoose';
import mongoose, { HydratedDocument } from 'mongoose';
import {  EmployeeProfile as Employee} from '../../employee-profile/models/employee-profile.schema';
import { PayRollPaymentStatus, PayRollStatus } from '../enums/payroll-execution-enum';

export type payrollRunsDocument = HydratedDocument<payrollRuns>

@Schema({ timestamps: true, collection: 'payrollruns' })  // ✅ Added collection name
export class payrollRuns {
  @Prop({ required: true, unique: true })
  runId: string;
  
  @Prop({ required: true })
  payrollPeriod: Date;
  
  @Prop({ required: true, type: String, enum: PayRollStatus, default: PayRollStatus.DRAFT })
  status: PayRollStatus;

  @Prop({ required: true })
  entity: string;

  @Prop({ required: true })
  employees: number;
  
  @Prop({ required: true })
  exceptions: number;
  
  @Prop({ required: true })
  totalnetpay: number;

  @Prop({ required: true, type: mongoose.Schema.Types.ObjectId, ref: Employee.name })
  payrollSpecialistId: mongoose.Schema.Types.ObjectId;

  @Prop({ required: true, type: String, enum: PayRollPaymentStatus, default: PayRollPaymentStatus.PENDING })
  paymentStatus: PayRollPaymentStatus;

  @Prop({ type: mongoose.Schema.Types.ObjectId, ref: Employee.name })  // ✅ Removed required: true
  payrollManagerId?: mongoose.Schema.Types.ObjectId;
  
  @Prop({ type: mongoose.Schema.Types.ObjectId, ref: Employee.name })
  financeStaffId?: mongoose.Schema.Types.ObjectId;

  @Prop()
  rejectionReason?: string;

  @Prop()
  unlockReason?: string;

  @Prop()
  managerApprovalDate?: Date;

  @Prop()
  financeApprovalDate?: Date;
}

export const payrollRunsSchema = SchemaFactory.createForClass(payrollRuns);