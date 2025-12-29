// src/types/performance.ts

export type ObjectId = string;

// =========================
// Enums (match backend)
// =========================

export enum AppraisalTemplateType {
  ANNUAL = 'ANNUAL',
  SEMI_ANNUAL = 'SEMI_ANNUAL',
  PROBATIONARY = 'PROBATIONARY',
  PROJECT = 'PROJECT',
  AD_HOC = 'AD_HOC',
}

export enum AppraisalCycleStatus {
  PLANNED = 'PLANNED',
  ACTIVE = 'ACTIVE',
  PUBLISHED = 'PUBLISHED',
  CLOSED = 'CLOSED',
  ARCHIVED = 'ARCHIVED',
}

export enum AppraisalAssignmentStatus {
  NOT_STARTED = 'NOT_STARTED',
  IN_PROGRESS = 'IN_PROGRESS',
  SUBMITTED = 'SUBMITTED',
  PUBLISHED = 'PUBLISHED',
  ACKNOWLEDGED = 'ACKNOWLEDGED',
  UNDER_DISPUTE = 'UNDER_DISPUTE',
  FINALIZED = 'FINALIZED',
}

export enum AppraisalRecordStatus {
  DRAFT = 'DRAFT',
  MANAGER_SUBMITTED = 'MANAGER_SUBMITTED',
  HR_PUBLISHED = 'HR_PUBLISHED',
  ARCHIVED = 'ARCHIVED',
}

export enum AppraisalDisputeStatus {
  OPEN = 'OPEN',
  UNDER_REVIEW = 'UNDER_REVIEW',
  ADJUSTED = 'ADJUSTED',
  REJECTED = 'REJECTED',
}

export enum AppraisalRatingScaleType {
  THREE_POINT = 'THREE_POINT',
  FIVE_POINT = 'FIVE_POINT',
  TEN_POINT = 'TEN_POINT',
}

// =========================
// Shared Types
// =========================

export type RatingEntry = {
  key: string;
  title: string;
  ratingValue: number;
  ratingLabel?: string;
  weightedScore?: number;
  comments?: string;
};

export type RatingScaleDefinition = {
  type: AppraisalRatingScaleType;
  min: number;
  max: number;

  // Backend schema supports these (step has default 1, labels default [])
  step?: number;
  labels?: string[];
};

export type EvaluationCriterion = {
  key: string;
  title: string;
  details?: string;
  weight?: number; // 0..100
  maxScore?: number;

  // Backend schema has required default true.
  // Backend Create DTO allows omit => keep optional here.
  required?: boolean;
};

// =========================
// Models (API responses)
// =========================

export type AppraisalTemplate = {
  _id: ObjectId;
  name: string;
  description?: string;

  templateType: AppraisalTemplateType;
  ratingScale: RatingScaleDefinition;
  criteria: EvaluationCriterion[];

  instructions?: string;

  applicableDepartmentIds: ObjectId[];
  applicablePositionIds: ObjectId[];

  isActive: boolean;

  createdAt?: string;
  updatedAt?: string;
};

export type CycleTemplateAssignment = {
  templateId: ObjectId;
  departmentIds: ObjectId[];
};

export type AppraisalCycle = {
  _id: ObjectId;
  name: string;
  description?: string;

  cycleType: AppraisalTemplateType;
  startDate: string;
  endDate: string;

  managerDueDate?: string;
  employeeAcknowledgementDueDate?: string;

  templateAssignments: CycleTemplateAssignment[];

  status: AppraisalCycleStatus;

  publishedAt?: string;
  closedAt?: string;
  archivedAt?: string;

  createdAt?: string;
  updatedAt?: string;
};

export type AppraisalAssignment = {
  _id: ObjectId;

  cycleId: ObjectId | AppraisalCycle;
  templateId: ObjectId | AppraisalTemplate;

  employeeProfileId: ObjectId | any;
  managerProfileId: ObjectId | any;

  departmentId: ObjectId | any;
  positionId?: ObjectId | any;

  status: AppraisalAssignmentStatus;

  assignedAt?: string;
  dueDate?: string;

  submittedAt?: string;
  publishedAt?: string;
  employeeAcknowledgedAt?: string;

  latestAppraisalId?: ObjectId;
  disputeId?: ObjectId;
};

export type AppraisalRecord = {
  _id: ObjectId;

  assignmentId: ObjectId;
  cycleId: ObjectId;
  templateId: ObjectId;

  employeeProfileId: ObjectId;
  managerProfileId: ObjectId;

  ratings: RatingEntry[];

  totalScore?: number;
  overallRatingLabel?: string;

  managerSummary?: string;
  strengths?: string;
  improvementAreas?: string;

  status: AppraisalRecordStatus;

  managerSubmittedAt?: string;
  hrPublishedAt?: string;

  archivedAt?: string;
  createdAt?: string;
  updatedAt?: string;
};

export type AppraisalDispute = {
  _id: ObjectId;

  assignmentId: ObjectId;
  cycleId: ObjectId;

  employeeProfileId: ObjectId;
  managerProfileId: ObjectId;

  appraisalRecordId: ObjectId;
  raisedByEmployeeProfileId: ObjectId;

  reason: string;
  employeeComments?: string;

  status: AppraisalDisputeStatus;

  hrDecisionNotes?: string;
  resolvedAt?: string;

  createdAt?: string;
  updatedAt?: string;
};

// =========================
// DTOs (frontend requests)
// =========================

// Matches backend CreateAppraisalTemplateDto
// ✅ ratingScale uses RatingScaleDefinition so your form can include step/labels
export type CreateTemplateDto = {
  name: string;
  description?: string;

  templateType: AppraisalTemplateType;

  ratingScale: RatingScaleDefinition;

  criteria: EvaluationCriterion[];

  instructions?: string;

  applicableDepartmentIds?: string[];
  applicablePositionIds?: string[];

  isActive?: boolean;
};

// Matches backend UpdateAppraisalTemplateDto (all optional)
export type UpdateTemplateDto = {
  name?: string;
  description?: string;
  templateType?: AppraisalTemplateType;

  ratingScale?: RatingScaleDefinition;

  criteria?: EvaluationCriterion[];

  instructions?: string;

  applicableDepartmentIds?: string[];
  applicablePositionIds?: string[];

  isActive?: boolean;
};

export type CreateCycleDto = {
  name: string;
  description?: string;

  cycleType: AppraisalTemplateType;

  startDate: string;
  endDate: string;

  managerDueDate?: string;
  employeeAcknowledgementDueDate?: string;

  templateAssignments?: Array<{
    templateId: string;
    departmentIds?: string[];
  }>;

  seedingAssignments?: Array<{
    employeeProfileId: string;
    managerProfileId: string;
    templateId: string;
    departmentId: string;
    positionId?: string;
    dueDate?: string;
  }>;
};

export type SubmitAppraisalDto = {
  ratings: RatingEntry[];
  totalScore?: number;
  overallRatingLabel?: string;
  managerSummary?: string;
  strengths?: string;
  improvementAreas?: string;
};

// ✅ Recommended: if your backend route is:
// POST /performance/employee/:employeeProfileId/appraisals/:assignmentId/dispute
// then employeeProfileId should NOT be in the body.
export type SubmitDisputeBodyDto = {
  reason: string;
  employeeComments?: string;
};

// If you are still using the older frontend shape somewhere, keep this too:
export type SubmitDisputeDto = {
  employeeProfileId: string;
  reason: string;
  employeeComments?: string;
};

export type ResolveDisputeDto = {
  status: AppraisalDisputeStatus;
  hrDecisionNotes?: string;
  adjustedTotalScore?: number;
  adjustedOverallRatingLabel?: string;
};
