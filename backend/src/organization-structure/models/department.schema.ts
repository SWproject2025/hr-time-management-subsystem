import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument, Types } from 'mongoose';
import { Position } from './position.schema';

export type DepartmentDocument = HydratedDocument<Department>;

@Schema({ collection: 'departments', timestamps: true })
export class Department {
  @Prop({ type: String, required: true, unique: true })
  code: string;

  @Prop({ type: String, required: true })
  name: string;

  @Prop({ type: String })
  description?: string;

  /**
   * Whether the department is currently active in the organizational structure.
   * Use this instead of deleting documents to preserve history.
   */
  @Prop({ type: Boolean, default: true })
  active: boolean;

  /**
   * Date from which the department is considered active.
   */
  @Prop({ type: Date, default: () => new Date() })
  startDate: Date;

  /**
   * Date at which the department stopped being active.
   * Used for delimitation instead of hard deletion.
   */
  @Prop({ type: Date, default: null })
  endDate: Date | null;

  @Prop({ type: Types.ObjectId, ref: 'Position' })
  headPositionId?: Types.ObjectId;
}

export const DepartmentSchema = SchemaFactory.createForClass(Department);
