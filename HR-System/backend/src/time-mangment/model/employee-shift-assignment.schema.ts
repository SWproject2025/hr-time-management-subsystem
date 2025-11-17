import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';

export type EmployeeShiftAssignmentDocument = EmployeeShiftAssignment & Document;

@Schema({ timestamps: true })
export class EmployeeShiftAssignment {
  @Prop({ type: Types.ObjectId, ref: 'Employee', required: true })
  employeeId: Types.ObjectId;

  @Prop({ type: Types.ObjectId, ref: 'Shift', required: true })
  shiftId: Types.ObjectId;

  @Prop({ required: true })
  effectiveFrom: Date;

  @Prop()
  effectiveTo?: Date;

  @Prop({ default: true })
  isActive: boolean;

  @Prop({ type: Types.ObjectId, ref: 'Department' })
  departmentId?: Types.ObjectId;

  @Prop({ type: Types.ObjectId, ref: 'Position' })
  positionId?: Types.ObjectId;
}

export const EmployeeShiftAssignmentSchema = SchemaFactory.createForClass(EmployeeShiftAssignment);
EmployeeShiftAssignmentSchema.index({ employeeId: 1, effectiveFrom: 1 });