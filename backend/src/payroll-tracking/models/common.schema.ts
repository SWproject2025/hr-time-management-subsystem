import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import mongoose from 'mongoose';
import { EmployeeProfile as Employee } from '../../employee-profile/models/employee-profile.schema';

// Approval history entry schema - shared between disputes and claims
@Schema({ _id: false })
export class ApprovalHistoryEntry {
    @Prop({ type: mongoose.Schema.Types.ObjectId, ref: Employee.name, required: true })
    userId: mongoose.Types.ObjectId; // Who performed the action

    @Prop({ required: true })
    action: string; // 'submitted', 'approved', 'rejected', 'confirmed'

    @Prop({ required: true })
    role: string; // Role of the person (e.g., 'employee', 'payroll_specialist', 'payroll_manager', 'finance_staff')

    @Prop({ required: true, default: Date.now })
    timestamp: Date; // When the action occurred

    @Prop()
    comment?: string; // Optional comment or reason

    @Prop()
    previousStatus?: string; // Previous status before this action

    @Prop()
    newStatus?: string; // New status after this action
}

export const ApprovalHistoryEntrySchema = SchemaFactory.createForClass(ApprovalHistoryEntry);

// Attachment schema - shared between disputes and claims
@Schema({ _id: false })
export class Attachment {
    @Prop({ required: true })
    fileName: string; // Original file name

    @Prop({ required: true })
    filePath: string; // Path or URL to the file

    @Prop()
    fileType?: string; // MIME type or file extension

    @Prop()
    fileSize?: number; // File size in bytes

    @Prop({ default: Date.now })
    uploadedAt: Date; // When the file was uploaded
}

export const AttachmentSchema = SchemaFactory.createForClass(Attachment);

