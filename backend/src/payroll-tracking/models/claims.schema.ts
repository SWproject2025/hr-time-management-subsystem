import { Prop, Schema, SchemaFactory, } from '@nestjs/mongoose';
import mongoose, { HydratedDocument } from 'mongoose';
import { EmployeeProfile as Employee } from '../../employee-profile/models/employee-profile.schema';
import { ClaimStatus } from '../enums/payroll-tracking-enum';
import { ApprovalHistoryEntry, ApprovalHistoryEntrySchema, Attachment, AttachmentSchema } from './common.schema';

export type claimsDocument = HydratedDocument<claims>

@Schema({ timestamps: true })
export class claims {
    @Prop({ required: true, unique: true })
    claimId: string; // for frontend view purposes ex: CLAIM-0001

    @Prop({ required: true })
    description: string;

    @Prop({ required: true })
    claimType: string // for example: medical, etc

    @Prop({ type: mongoose.Schema.Types.ObjectId, ref: Employee.name, required: true })
    employeeId: mongoose.Types.ObjectId;

    @Prop({ type: mongoose.Schema.Types.ObjectId, ref: Employee.name })
    financeStaffId?: mongoose.Types.ObjectId;

    @Prop({ type: mongoose.Schema.Types.ObjectId, ref: Employee.name })
    payrollSpecialistId?: mongoose.Types.ObjectId;

    @Prop({ type: mongoose.Schema.Types.ObjectId, ref: Employee.name })
    payrollManagerId?: mongoose.Types.ObjectId;

    @Prop({ required: true })
    amount: number;

    @Prop({})
    approvedAmount?: number;

    @Prop({ required: true, type: String, enum: ClaimStatus, default: ClaimStatus.UNDER_REVIEW })
    status: ClaimStatus;// under review,pending_manager_approval, approved, rejected

    @Prop()
    rejectionReason?: string;

    @Prop()
    resolutionComment?: string;

    // Approval history tracking
    @Prop({ type: [ApprovalHistoryEntrySchema], default: [] })
    approvalHistory: ApprovalHistoryEntry[]; // Complete history of all approval actions

    // Attachments/document references
    @Prop({ type: [AttachmentSchema], default: [] })
    attachments: Attachment[]; // Supporting documents for the claim (receipts, invoices, etc.)

    // Status change timestamps
    @Prop()
    submittedAt?: Date; // When the claim was first submitted

    @Prop()
    reviewedAt?: Date; // When specialist reviewed it

    @Prop()
    managerApprovedAt?: Date; // When manager approved it

    @Prop()
    managerRejectedAt?: Date; // When manager rejected it

    @Prop()
    resolvedAt?: Date; // When it was finally resolved (approved or rejected)
}

export const claimsSchema = SchemaFactory.createForClass(claims);
