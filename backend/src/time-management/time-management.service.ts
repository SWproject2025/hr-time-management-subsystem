import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { AttendanceRecord, AttendanceRecordDocument } from './models/attendance-record.schema';
import { AttendanceCorrectionRequest, AttendanceCorrectionRequestDocument } from './models/attendance-correction-request.schema';
import { OvertimeRule, OvertimeRuleDocument } from './models/overtime-rule.schema';
import { LatenessRule, LatenessRuleDocument } from './models/lateness-rule.schema';
import { Holiday, HolidayDocument } from './models/holiday.schema';
import { Shift, ShiftDocument } from './models/shift.schema';
import { ShiftAssignment, ShiftAssignmentDocument } from './models/shift-assignment.schema';
import { ShiftType, ShiftTypeDocument } from './models/shift-type.schema';
import { ScheduleRule, ScheduleRuleDocument } from './models/schedule-rule.schema';
import { TimeException, TimeExceptionDocument } from './models/time-exception.schema';
import { NotificationLog, NotificationLogDocument } from './models/notification-log.schema';
import {
  CreateAttendanceRecordDto,
  CreateAttendanceCorrectionRequestDto,
  CreateShiftDto,
  CreateShiftAssignmentDto,
  CreateTimeExceptionDto,
  CreateNotificationLogDto,
} from './dto';

@Injectable()
export class TimeManagementService {
  constructor(
    @InjectModel(AttendanceRecord.name) private attendanceRecordModel: Model<AttendanceRecordDocument>,
    @InjectModel(AttendanceCorrectionRequest.name) private correctionRequestModel: Model<AttendanceCorrectionRequestDocument>,
    @InjectModel(OvertimeRule.name) private overtimeRuleModel: Model<OvertimeRuleDocument>,
    @InjectModel(LatenessRule.name) private latenessRuleModel: Model<LatenessRuleDocument>,
    @InjectModel(Holiday.name) private holidayModel: Model<HolidayDocument>,
    @InjectModel(Shift.name) private shiftModel: Model<ShiftDocument>,
    @InjectModel(ShiftAssignment.name) private shiftAssignmentModel: Model<ShiftAssignmentDocument>,
    @InjectModel(ShiftType.name) private shiftTypeModel: Model<ShiftTypeDocument>,
    @InjectModel(ScheduleRule.name) private scheduleRuleModel: Model<ScheduleRuleDocument>,
    @InjectModel(TimeException.name) private timeExceptionModel: Model<TimeExceptionDocument>,
    @InjectModel(NotificationLog.name) private notificationLogModel: Model<NotificationLogDocument>,
  ) {}

  // Attendance Records
  async createAttendanceRecord(data: CreateAttendanceRecordDto | Partial<AttendanceRecord>): Promise<AttendanceRecordDocument> {
    const recordData: any = {
      ...data,
      employeeId: new Types.ObjectId(data.employeeId),
    };
    if (data.exceptionIds) {
      recordData.exceptionIds = data.exceptionIds.map(id => new Types.ObjectId(id));
    }
    return this.attendanceRecordModel.create(recordData);
  }

  async findAllAttendanceRecords(filter?: any): Promise<AttendanceRecordDocument[]> {
    return this.attendanceRecordModel.find(filter).populate('employeeId').populate('exceptionIds').exec();
  }

  async findAttendanceRecordById(id: string): Promise<AttendanceRecordDocument | null> {
    return this.attendanceRecordModel.findById(id).populate('employeeId').populate('exceptionIds').exec();
  }

  async updateAttendanceRecord(id: string, data: Partial<AttendanceRecord>): Promise<AttendanceRecordDocument | null> {
    return this.attendanceRecordModel.findByIdAndUpdate(id, data, { new: true }).exec();
  }

  async deleteAttendanceRecord(id: string): Promise<void> {
    await this.attendanceRecordModel.findByIdAndDelete(id).exec();
  }

  // Attendance Correction Requests
  async createCorrectionRequest(data: CreateAttendanceCorrectionRequestDto | Partial<AttendanceCorrectionRequest>): Promise<AttendanceCorrectionRequestDocument> {
    const requestData: any = { ...data };
    if (data.employeeId && typeof data.employeeId === 'string') {
      requestData.employeeId = new Types.ObjectId(data.employeeId);
    }
    const attendanceRecordId = (data as any).attendanceRecord;
    if (attendanceRecordId && typeof attendanceRecordId === 'string') {
      requestData.attendanceRecord = new Types.ObjectId(attendanceRecordId);
    }
    return this.correctionRequestModel.create(requestData);
  }

  async findAllCorrectionRequests(filter?: any): Promise<AttendanceCorrectionRequestDocument[]> {
    return this.correctionRequestModel.find(filter).populate('employeeId').populate('attendanceRecord').exec();
  }

  async findCorrectionRequestById(id: string): Promise<AttendanceCorrectionRequestDocument | null> {
    return this.correctionRequestModel.findById(id).populate('employeeId').populate('attendanceRecord').exec();
  }

  async updateCorrectionRequest(id: string, data: Partial<AttendanceCorrectionRequest>): Promise<AttendanceCorrectionRequestDocument | null> {
    return this.correctionRequestModel.findByIdAndUpdate(id, data, { new: true }).exec();
  }

  async deleteCorrectionRequest(id: string): Promise<void> {
    await this.correctionRequestModel.findByIdAndDelete(id).exec();
  }

  // Overtime Rules
  async createOvertimeRule(data: Partial<OvertimeRule>): Promise<OvertimeRuleDocument> {
    return this.overtimeRuleModel.create(data);
  }

  async findAllOvertimeRules(filter?: any): Promise<OvertimeRuleDocument[]> {
    return this.overtimeRuleModel.find(filter).exec();
  }

  async findOvertimeRuleById(id: string): Promise<OvertimeRuleDocument | null> {
    return this.overtimeRuleModel.findById(id).exec();
  }

  async updateOvertimeRule(id: string, data: Partial<OvertimeRule>): Promise<OvertimeRuleDocument | null> {
    return this.overtimeRuleModel.findByIdAndUpdate(id, data, { new: true }).exec();
  }

  async deleteOvertimeRule(id: string): Promise<void> {
    await this.overtimeRuleModel.findByIdAndDelete(id).exec();
  }

  // Lateness Rules
  async createLatenessRule(data: Partial<LatenessRule>): Promise<LatenessRuleDocument> {
    return this.latenessRuleModel.create(data);
  }

  async findAllLatenessRules(filter?: any): Promise<LatenessRuleDocument[]> {
    return this.latenessRuleModel.find(filter).exec();
  }

  async findLatenessRuleById(id: string): Promise<LatenessRuleDocument | null> {
    return this.latenessRuleModel.findById(id).exec();
  }

  async updateLatenessRule(id: string, data: Partial<LatenessRule>): Promise<LatenessRuleDocument | null> {
    return this.latenessRuleModel.findByIdAndUpdate(id, data, { new: true }).exec();
  }

  async deleteLatenessRule(id: string): Promise<void> {
    await this.latenessRuleModel.findByIdAndDelete(id).exec();
  }

  // Holidays
  async createHoliday(data: Partial<Holiday>): Promise<HolidayDocument> {
    return this.holidayModel.create(data);
  }

  async findAllHolidays(filter?: any): Promise<HolidayDocument[]> {
    return this.holidayModel.find(filter).exec();
  }

  async findHolidayById(id: string): Promise<HolidayDocument | null> {
    return this.holidayModel.findById(id).exec();
  }

  async updateHoliday(id: string, data: Partial<Holiday>): Promise<HolidayDocument | null> {
    return this.holidayModel.findByIdAndUpdate(id, data, { new: true }).exec();
  }

  async deleteHoliday(id: string): Promise<void> {
    await this.holidayModel.findByIdAndDelete(id).exec();
  }

  // Shifts
  async createShift(data: CreateShiftDto | Partial<Shift>): Promise<ShiftDocument> {
    const shiftData: any = {
      ...data,
      shiftType: new Types.ObjectId(data.shiftType),
    };
    return this.shiftModel.create(shiftData);
  }

  async findAllShifts(filter?: any): Promise<ShiftDocument[]> {
    return this.shiftModel.find(filter).populate('shiftType').exec();
  }

  async findShiftById(id: string): Promise<ShiftDocument | null> {
    return this.shiftModel.findById(id).populate('shiftType').exec();
  }

  async updateShift(id: string, data: Partial<Shift>): Promise<ShiftDocument | null> {
    return this.shiftModel.findByIdAndUpdate(id, data, { new: true }).exec();
  }

  async deleteShift(id: string): Promise<void> {
    await this.shiftModel.findByIdAndDelete(id).exec();
  }

  // Shift Assignments
  async createShiftAssignment(data: CreateShiftAssignmentDto | Partial<ShiftAssignment>): Promise<ShiftAssignmentDocument> {
    const assignmentData: any = {
      ...data,
      shiftId: new Types.ObjectId(data.shiftId),
    };
    if (data.employeeId) {
      assignmentData.employeeId = new Types.ObjectId(data.employeeId);
    }
    if (data.departmentId) {
      assignmentData.departmentId = new Types.ObjectId(data.departmentId);
    }
    if (data.positionId) {
      assignmentData.positionId = new Types.ObjectId(data.positionId);
    }
    if (data.scheduleRuleId) {
      assignmentData.scheduleRuleId = new Types.ObjectId(data.scheduleRuleId);
    }
    return this.shiftAssignmentModel.create(assignmentData);
  }

  async findAllShiftAssignments(filter?: any): Promise<ShiftAssignmentDocument[]> {
    return this.shiftAssignmentModel.find(filter)
      .populate('employeeId')
      .populate('departmentId')
      .populate('positionId')
      .populate('shiftId')
      .populate('scheduleRuleId')
      .exec();
  }

  async findShiftAssignmentById(id: string): Promise<ShiftAssignmentDocument | null> {
    return this.shiftAssignmentModel.findById(id)
      .populate('employeeId')
      .populate('departmentId')
      .populate('positionId')
      .populate('shiftId')
      .populate('scheduleRuleId')
      .exec();
  }

  async updateShiftAssignment(id: string, data: Partial<ShiftAssignment>): Promise<ShiftAssignmentDocument | null> {
    return this.shiftAssignmentModel.findByIdAndUpdate(id, data, { new: true }).exec();
  }

  async deleteShiftAssignment(id: string): Promise<void> {
    await this.shiftAssignmentModel.findByIdAndDelete(id).exec();
  }

  // Shift Types
  async createShiftType(data: Partial<ShiftType>): Promise<ShiftTypeDocument> {
    return this.shiftTypeModel.create(data);
  }

  async findAllShiftTypes(filter?: any): Promise<ShiftTypeDocument[]> {
    return this.shiftTypeModel.find(filter).exec();
  }

  async findShiftTypeById(id: string): Promise<ShiftTypeDocument | null> {
    return this.shiftTypeModel.findById(id).exec();
  }

  async updateShiftType(id: string, data: Partial<ShiftType>): Promise<ShiftTypeDocument | null> {
    return this.shiftTypeModel.findByIdAndUpdate(id, data, { new: true }).exec();
  }

  async deleteShiftType(id: string): Promise<void> {
    await this.shiftTypeModel.findByIdAndDelete(id).exec();
  }

  // Schedule Rules
  async createScheduleRule(data: Partial<ScheduleRule>): Promise<ScheduleRuleDocument> {
    return this.scheduleRuleModel.create(data);
  }

  async findAllScheduleRules(filter?: any): Promise<ScheduleRuleDocument[]> {
    return this.scheduleRuleModel.find(filter).exec();
  }

  async findScheduleRuleById(id: string): Promise<ScheduleRuleDocument | null> {
    return this.scheduleRuleModel.findById(id).exec();
  }

  async updateScheduleRule(id: string, data: Partial<ScheduleRule>): Promise<ScheduleRuleDocument | null> {
    return this.scheduleRuleModel.findByIdAndUpdate(id, data, { new: true }).exec();
  }

  async deleteScheduleRule(id: string): Promise<void> {
    await this.scheduleRuleModel.findByIdAndDelete(id).exec();
  }

  // Time Exceptions
  async createTimeException(data: CreateTimeExceptionDto | Partial<TimeException>): Promise<TimeExceptionDocument> {
    const exceptionData: any = {
      ...data,
      employeeId: new Types.ObjectId(data.employeeId),
      attendanceRecordId: new Types.ObjectId(data.attendanceRecordId),
      assignedTo: new Types.ObjectId(data.assignedTo),
    };
    return this.timeExceptionModel.create(exceptionData);
  }

  async findAllTimeExceptions(filter?: any): Promise<TimeExceptionDocument[]> {
    return this.timeExceptionModel.find(filter)
      .populate('employeeId')
      .populate('attendanceRecordId')
      .populate('assignedTo')
      .exec();
  }

  async findTimeExceptionById(id: string): Promise<TimeExceptionDocument | null> {
    return this.timeExceptionModel.findById(id)
      .populate('employeeId')
      .populate('attendanceRecordId')
      .populate('assignedTo')
      .exec();
  }

  async updateTimeException(id: string, data: Partial<TimeException>): Promise<TimeExceptionDocument | null> {
    return this.timeExceptionModel.findByIdAndUpdate(id, data, { new: true }).exec();
  }

  async deleteTimeException(id: string): Promise<void> {
    await this.timeExceptionModel.findByIdAndDelete(id).exec();
  }

  // Notification Logs
  async createNotificationLog(data: CreateNotificationLogDto | Partial<NotificationLog>): Promise<NotificationLogDocument> {
    const logData: any = {
      ...data,
      to: new Types.ObjectId(data.to),
    };
    return this.notificationLogModel.create(logData);
  }

  async findAllNotificationLogs(filter?: any): Promise<NotificationLogDocument[]> {
    return this.notificationLogModel.find(filter).populate('to').exec();
  }

  async findNotificationLogById(id: string): Promise<NotificationLogDocument | null> {
    return this.notificationLogModel.findById(id).populate('to').exec();
  }

  async updateNotificationLog(id: string, data: Partial<NotificationLog>): Promise<NotificationLogDocument | null> {
    return this.notificationLogModel.findByIdAndUpdate(id, data, { new: true }).exec();
  }

  async deleteNotificationLog(id: string): Promise<void> {
    await this.notificationLogModel.findByIdAndDelete(id).exec();
  }

  // ========== Interview Scheduling (REC-010, REC-021) ==========
  /**
   * Check panel member availability for interview scheduling
   * Checks shift assignments, existing interviews, and schedule rules
   */
  async checkPanelAvailability(data: {
    panelMemberIds: string[];
    startDate: Date;
    endDate: Date;
    excludeInterviewId?: string;
  }): Promise<any> {
    // TODO: Implement availability checking logic
    // This would:
    // 1. Check shift assignments for each panel member
    // 2. Check existing interviews in the recruitment module
    // 3. Check schedule rules and holidays
    // 4. Return available time slots
    return {
      message: 'Availability check not yet implemented',
      panelMemberIds: data.panelMemberIds,
      startDate: data.startDate,
      endDate: data.endDate,
    };
  }

  /**
   * Schedule an interview and send calendar invites
   * Integrates with recruitment module and notification system
   */
  async scheduleInterview(data: {
    applicationId: string;
    scheduledDate: Date;
    method: string;
    panelMemberIds: string[];
    videoLink?: string;
    location?: string;
    notes?: string;
  }): Promise<any> {
    // TODO: Implement interview scheduling logic
    // This would:
    // 1. Create interview record in recruitment module
    // 2. Send calendar invites to panel members
    // 3. Send notification to candidate
    // 4. Log notification in notification log
    return {
      message: 'Interview scheduling not yet implemented',
      applicationId: data.applicationId,
      scheduledDate: data.scheduledDate,
    };
  }

  /**
   * Update an existing interview schedule
   */
  async updateInterviewSchedule(interviewId: string, data: {
    scheduledDate?: Date;
    method?: string;
    panelMemberIds?: string[];
    videoLink?: string;
    location?: string;
    notes?: string;
  }): Promise<any> {
    // TODO: Implement interview schedule update logic
    // This would:
    // 1. Update interview record in recruitment module
    // 2. Send updated calendar invites
    // 3. Notify all parties of changes
    return {
      message: 'Interview schedule update not yet implemented',
      interviewId,
      updates: data,
    };
  }
}
