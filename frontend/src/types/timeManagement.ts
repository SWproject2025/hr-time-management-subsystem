// Types for Time Management subsystem
// Mirrors backend DTOs in backend/src/time-management/dto

export type ObjectId = string;

// ======= Enums =======
export enum ShiftKind {
  NORMAL = 'NORMAL',
  SPLIT = 'SPLIT',
  OVERNIGHT = 'OVERNIGHT',
  ROTATIONAL = 'ROTATIONAL',
}

export enum PunchType {
  IN = 'IN',
  OUT = 'OUT',
}

export enum ShiftAssignmentStatus {
  ACTIVE = 'ACTIVE',
  INACTIVE = 'INACTIVE',
  CANCELLED = 'CANCELLED',
}

export enum AttendanceValidationStatus {
  VALID = 'VALID',
  FLAGGED = 'FLAGGED',
  PENDING_REVIEW = 'PENDING_REVIEW',
}

export enum CorrectionRequestStatus {
  PENDING = 'PENDING',
  APPROVED = 'APPROVED',
  REJECTED = 'REJECTED',
}

export enum HolidayType {
  PUBLIC = 'PUBLIC',
  REGIONAL = 'REGIONAL',
  OPTIONAL = 'OPTIONAL',
}

export enum TimeExceptionType {
  CORRECTION = 'CORRECTION',
  OVERTIME_REQUEST = 'OVERTIME_REQUEST',
  PERMISSION = 'PERMISSION',
}

export enum TimeExceptionStatus {
  OPEN = 'OPEN',
  RESOLVED = 'RESOLVED',
  REJECTED = 'REJECTED',
}

// ======= Models / Interfaces =======

export interface ShiftType {
  _id: ObjectId;
  name: string;
  kind: ShiftKind;
  description?: string;
  active?: boolean;
  createdAt?: string;
  updatedAt?: string;
}

export interface Shift {
  _id: ObjectId;
  name: string;
  shiftType: ObjectId | ShiftType;
  startTime: string; // HH:mm or ISO time string
  endTime: string; // HH:mm or ISO time string
  breakMinutes?: number;
  breakStartTime?: string;
  punchPolicy?: string; // backend enum - keep flexible
  graceInMinutes?: number;
  graceOutMinutes?: number;
  requiresApprovalForOvertime?: boolean;
  active?: boolean;
  createdAt?: string;
  updatedAt?: string;
}

export interface ShiftAssignment {
  _id: ObjectId;
  employeeId?: ObjectId;
  departmentId?: ObjectId;
  positionId?: ObjectId;
  shiftId: ObjectId | Shift;
  scheduleRuleId?: ObjectId;
  startDate: string; // ISO date
  endDate?: string; // ISO date
  status?: ShiftAssignmentStatus;
  createdAt?: string;
  updatedAt?: string;
}

export interface Punch {
  type: PunchType;
  time: string; // ISO date-time
}

export interface AttendanceRecord {
  _id: ObjectId;
  employeeId: ObjectId;
  punches?: Punch[];
  totalWorkMinutes?: number;
  hasMissedPunch?: boolean;
  exceptionIds?: ObjectId[];
  finalisedForPayroll?: boolean;
  validationStatus?: AttendanceValidationStatus;
  createdAt?: string;
  updatedAt?: string;
}

export interface CorrectionRequest {
  _id: ObjectId;
  employeeId: ObjectId;
  attendanceRecord: ObjectId | AttendanceRecord;
  reason?: string;
  status?: CorrectionRequestStatus;
  createdAt?: string;
  updatedAt?: string;
}

export interface Holiday {
  _id: ObjectId;
  name?: string;
  type: HolidayType;
  startDate: string; // ISO date
  endDate?: string; // ISO date
  active?: boolean;
  createdAt?: string;
  updatedAt?: string;
}

export interface ScheduleRule {
  _id: ObjectId;
  name: string;
  pattern: string; // CRON-like, RRULE or custom pattern from backend
  description?: string;
  // For rotational/flexible patterns add a free-form field the UI can interpret
  rotationalPattern?: string;
  flexibleHours?: {
    minDailyMinutes?: number;
    maxDailyMinutes?: number;
  };
  active?: boolean;
  createdAt?: string;
  updatedAt?: string;
}

export interface OvertimeRule {
  _id: ObjectId;
  name: string;
  description?: string;
  // Calculation logic expressed as fields the frontend can show/edit:
  multiplier?: number; // e.g., 1.5, 2.0
  minMinutesForOvertime?: number;
  maxDailyOvertimeMinutes?: number;
  requiresApproval?: boolean;
  approved?: boolean;
  active?: boolean;
  createdAt?: string;
  updatedAt?: string;
}

export interface LatenessRule {
  _id: ObjectId;
  name: string;
  description?: string;
  gracePeriodMinutes?: number;
  deductionForEachMinute?: number;
  active?: boolean;
  createdAt?: string;
  updatedAt?: string;
}

export interface TimeException {
  _id: ObjectId;
  employeeId: ObjectId;
  type: TimeExceptionType;
  attendanceRecordId: ObjectId;
  assignedTo: ObjectId;
  reason?: string;
  status?: TimeExceptionStatus;
  resolutionNote?: string;
  createdAt?: string;
  updatedAt?: string;
}

export interface NotificationLog {
  _id: ObjectId;
  to: ObjectId;
  type: string; // e.g., 'SHIFT_EXPIRY', 'MISSED_PUNCH'
  message?: string;
  metadata?: Record<string, any>;
  read?: boolean;
  createdAt?: string;
  updatedAt?: string;
}

// ======= Helper / DTO shapes (frontend-friendly) =======
export type CreateShiftTypeDto = Partial<ShiftType>;
export type UpdateShiftTypeDto = Partial<ShiftType>;

export type CreateShiftDto = Partial<Shift>;
export type UpdateShiftDto = Partial<Shift>;

export type CreateShiftAssignmentDto = Partial<ShiftAssignment>;
export type UpdateShiftAssignmentDto = Partial<ShiftAssignment>;

export type CreateAttendanceRecordDto = Partial<AttendanceRecord>;
export type UpdateAttendanceRecordDto = Partial<AttendanceRecord>;

export type CreateCorrectionRequestDto = Partial<CorrectionRequest>;
export type UpdateCorrectionRequestDto = Partial<CorrectionRequest>;

export type CreateHolidayDto = Partial<Holiday>;
export type UpdateHolidayDto = Partial<Holiday>;

export type CreateScheduleRuleDto = Partial<ScheduleRule>;
export type UpdateScheduleRuleDto = Partial<ScheduleRule>;

export type CreateOvertimeRuleDto = Partial<OvertimeRule>;
export type UpdateOvertimeRuleDto = Partial<OvertimeRule>;

export type CreateLatenessRuleDto = Partial<LatenessRule>;
export type UpdateLatenessRuleDto = Partial<LatenessRule>;

export type CreateTimeExceptionDto = Partial<TimeException>;
export type UpdateTimeExceptionDto = Partial<TimeException>;

export type CreateNotificationLogDto = Partial<NotificationLog>;
export type UpdateNotificationLogDto = Partial<NotificationLog>;


