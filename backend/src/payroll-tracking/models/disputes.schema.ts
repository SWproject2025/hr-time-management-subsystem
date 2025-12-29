
import { Prop, Schema, SchemaFactory, } from '@nestjs/mongoose';
import mongoose, { HydratedDocument } from 'mongoose';
import { EmployeeProfile as Employee } from '../../employee-profile/models/employee-profile.schema';
import { DisputeStatus } from '../enums/payroll-tracking-enum';
import { ApprovalHistoryEntry, ApprovalHistoryEntrySchema, Attachment, AttachmentSchema } from './common.schema';

export type disputesDocument = HydratedDocument<disputes>

@Schema({ timestamps: true })
export class disputes {
    @Prop({ required: true, unique: true })
    disputeId: string; // for frontend view purposes ex: DISP-0001

    @Prop({ required: true })
    description: string;

    @Prop({ type: mongoose.Schema.Types.ObjectId, ref: Employee.name, required: true })
    employeeId: mongoose.Types.ObjectId;

    @Prop({ type: mongoose.Schema.Types.ObjectId, ref: Employee.name })
    financeStaffId?: mongoose.Types.ObjectId;

    @Prop({ type: mongoose.Schema.Types.ObjectId, ref: Employee.name })
    payrollSpecialistId?: mongoose.Types.ObjectId;

    @Prop({ type: mongoose.Schema.Types.ObjectId, ref: Employee.name })
    payrollManagerId?: mongoose.Types.ObjectId;

    @Prop({ type: mongoose.Schema.Types.ObjectId, ref: 'paySlip', required: true })
    payslipId: mongoose.Types.ObjectId;

    @Prop({ required: true, type: String, enum: DisputeStatus, default: DisputeStatus.UNDER_REVIEW })
    status: DisputeStatus;// under review,pending_manager_approval, approved, rejected

    @Prop()
    rejectionReason?: string;

    @Prop()
    resolutionComment?: string;

    // Approval history tracking
    @Prop({ type: [ApprovalHistoryEntrySchema], default: [] })
    approvalHistory: ApprovalHistoryEntry[]; // Complete history of all approval actions

    // Attachments/document references
    @Prop({ type: [AttachmentSchema], default: [] })
    attachments: Attachment[]; // Supporting documents for the dispute

    // Status change timestamps
    @Prop()
    submittedAt?: Date; // When the dispute was first submitted

    @Prop()
    reviewedAt?: Date; // When specialist reviewed it

    @Prop()
    managerApprovedAt?: Date; // When manager approved it

    @Prop()
    managerRejectedAt?: Date; // When manager rejected it

    @Prop()
    resolvedAt?: Date; // When it was finally resolved (approved or rejected)
}

export const disputesSchema = SchemaFactory.createForClass(disputes);
