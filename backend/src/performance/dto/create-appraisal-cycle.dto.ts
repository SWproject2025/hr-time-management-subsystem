// src/performance/dto/create-appraisal-cycle.dto.ts

import { AppraisalTemplateType } from '../enums/performance.enums';

export class CycleTemplateAssignmentDto {
  templateId: string;
  departmentIds?: string[];
}

/**
 * Used to auto-create AppraisalAssignment records
 * when creating or activating a cycle
 */
export class SeedAssignmentDto {
  employeeProfileId: string;
  managerProfileId: string;
  templateId: string;

  // REQUIRED (schema enforces this)
  departmentId: string;

  positionId?: string;
  dueDate?: string;
}

export class CreateAppraisalCycleDto {
  name: string;
  description?: string;

  cycleType: AppraisalTemplateType;

  startDate: string;
  endDate: string;

  managerDueDate?: string;
  employeeAcknowledgementDueDate?: string;

  templateAssignments?: CycleTemplateAssignmentDto[];

  /**
   * Optional seed data (for testing / demos)
   * Real systems usually auto-generate on activate
   */
  seedingAssignments?: SeedAssignmentDto[];
}
