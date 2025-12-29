export enum AppraisalTemplateType {
  ANNUAL = 'ANNUAL',
  SEMI_ANNUAL = 'SEMI_ANNUAL',
  PROBATIONARY = 'PROBATIONARY',
  PROJECT = 'PROJECT',
  AD_HOC = 'AD_HOC',
}

/**
 * Appraisal Cycle Lifecycle
 * PLANNED   -> HR setup
 * ACTIVE    -> Managers evaluate
 * PUBLISHED -> Employees can view & dispute
 * CLOSED    -> Disputes resolved, no more actions
 * ARCHIVED  -> Historical read-only data
 */
export enum AppraisalCycleStatus {
  PLANNED = 'PLANNED',
  ACTIVE = 'ACTIVE',
  PUBLISHED = 'PUBLISHED',   // ✅ ADDED (CRITICAL)
  CLOSED = 'CLOSED',
  ARCHIVED = 'ARCHIVED',
}

export enum AppraisalAssignmentStatus {
  NOT_STARTED = 'NOT_STARTED',
  IN_PROGRESS = 'IN_PROGRESS',
  SUBMITTED = 'SUBMITTED',
  PUBLISHED = 'PUBLISHED',
  ACKNOWLEDGED = 'ACKNOWLEDGED',

  // Dispute & finalization
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
