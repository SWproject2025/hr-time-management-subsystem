import { ApprovalStatus } from '../enums/approval-status.enum';

export class UpdateClearanceItemDto {
  status?: ApprovalStatus;
  comments?: string;
  updatedBy: string;
}
