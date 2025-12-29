import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { AttendanceRecord, AttendanceRecordDocument } from './models/attendance-record.schema';
import { AttendanceCorrectionRequest, AttendanceCorrectionRequestDocument } from './models/attendance-correction-request.schema';
import { AttendanceRules, AttendanceRulesDocument } from './models/attendance-rules.schema';
import { FlexiblePunchConfig, FlexiblePunchConfigDocument } from './models/flexible-punch-config.schema';
import { RestDayConfig, RestDayConfigDocument } from './models/rest-day-config.schema';
import { SyncLog, SyncLogDocument, SyncSystem, SyncStatus } from './models/sync-log.schema';
import { IntegrationConfig, IntegrationConfigDocument } from './models/integration-config.schema';
import { PayrollClosureConfig, PayrollClosureConfigDocument } from './models/payroll-closure-config.schema';
import { ApprovalWorkflow, ApprovalWorkflowDocument } from './models/approval-workflow.schema';
import { OvertimeRule, OvertimeRuleDocument } from './models/overtime-rule.schema';
import { LatenessRule, LatenessRuleDocument } from './models/lateness-rule.schema';
import { Holiday, HolidayDocument } from './models/holiday.schema';
import { Shift, ShiftDocument } from './models/shift.schema';
import { ShiftAssignment, ShiftAssignmentDocument } from './models/shift-assignment.schema';
import { ShiftType, ShiftTypeDocument } from './models/shift-type.schema';
import { ScheduleRule, ScheduleRuleDocument } from './models/schedule-rule.schema';
import { TimeException, TimeExceptionDocument } from './models/time-exception.schema';
import { NotificationLog, NotificationLogDocument } from './models/notification-log.schema';
import { EmployeeProfile, EmployeeProfileDocument } from '../employee-profile/models/employee-profile.schema';
import {
  PunchType,
  TimeExceptionStatus,
} from './models/enums/index';
import {
  // Attendance Records
  CreateAttendanceRecordDto,
  UpdateAttendanceRecordDto,
  // Attendance Correction Requests
  CreateAttendanceCorrectionRequestDto,
  UpdateAttendanceCorrectionRequestDto,
  // Attendance Rules
  CreateAttendanceRulesDto,
  UpdateAttendanceRulesDto,
  // Flexible Punch Configuration
  CreateFlexiblePunchConfigDto,
  UpdateFlexiblePunchConfigDto,
  // Rest Day Configuration
  CreateRestDayConfigDto,
  UpdateRestDayConfigDto,
  // Sync Logs
  CreateSyncLogDto,
  // Integration Configuration
  UpdateIntegrationConfigDto,
  // Payroll Closure Configuration
  UpdatePayrollClosureConfigDto,
  // Approval Workflow Configuration
  CreateApprovalWorkflowDto,
  UpdateApprovalWorkflowDto,
  // Overtime Rules
  CreateOvertimeRuleDto,
  UpdateOvertimeRuleDto,
  // Lateness Rules
  CreateLatenessRuleDto,
  UpdateLatenessRuleDto,
  // Holidays
  CreateHolidayDto,
  UpdateHolidayDto,
  // Shifts
  CreateShiftDto,
  UpdateShiftDto,
  // Shift Assignments
  CreateShiftAssignmentDto,
  UpdateShiftAssignmentDto,
  // Shift Types
  CreateShiftTypeDto,
  UpdateShiftTypeDto,
  // Schedule Rules
  CreateScheduleRuleDto,
  UpdateScheduleRuleDto,
  // Time Exceptions
  CreateTimeExceptionDto,
  UpdateTimeExceptionDto,
  // Notification Logs
  CreateNotificationLogDto,
  UpdateNotificationLogDto,
} from './dto';

@Injectable()
export class TimeManagementService {
  // Helper function to safely get employee name
  private getEmployeeName(employeeId: any): string {
    if (!employeeId) return 'Unknown';

    // If it's a populated object with firstName/lastName
    if (typeof employeeId === 'object' && employeeId.firstName && employeeId.lastName) {
      return `${employeeId.firstName} ${employeeId.lastName}`;
    }

    // If it's just an ObjectId or string
    return String(employeeId);
  }
  constructor(
    @InjectModel(AttendanceRecord.name) private attendanceRecordModel: Model<AttendanceRecordDocument>,
    @InjectModel(AttendanceCorrectionRequest.name) private correctionRequestModel: Model<AttendanceCorrectionRequestDocument>,
    @InjectModel(AttendanceRules.name) private attendanceRulesModel: Model<AttendanceRulesDocument>,
    @InjectModel(FlexiblePunchConfig.name) private flexiblePunchConfigModel: Model<FlexiblePunchConfigDocument>,
    @InjectModel(RestDayConfig.name) private restDayConfigModel: Model<RestDayConfigDocument>,
    @InjectModel(SyncLog.name) private syncLogModel: Model<SyncLogDocument>,
    @InjectModel(IntegrationConfig.name) private integrationConfigModel: Model<IntegrationConfigDocument>,
    @InjectModel(PayrollClosureConfig.name) private payrollClosureConfigModel: Model<PayrollClosureConfigDocument>,
    @InjectModel(ApprovalWorkflow.name) private approvalWorkflowModel: Model<ApprovalWorkflowDocument>,
    @InjectModel(OvertimeRule.name) private overtimeRuleModel: Model<OvertimeRuleDocument>,
    @InjectModel(LatenessRule.name) private latenessRuleModel: Model<LatenessRuleDocument>,
    @InjectModel(Holiday.name) private holidayModel: Model<HolidayDocument>,
    @InjectModel(Shift.name) private shiftModel: Model<ShiftDocument>,
    @InjectModel(ShiftAssignment.name) private shiftAssignmentModel: Model<ShiftAssignmentDocument>,
    @InjectModel(ShiftType.name) private shiftTypeModel: Model<ShiftTypeDocument>,
    @InjectModel(ScheduleRule.name) private scheduleRuleModel: Model<ScheduleRuleDocument>,
    @InjectModel(TimeException.name) private timeExceptionModel: Model<TimeExceptionDocument>,
    @InjectModel(NotificationLog.name) private notificationLogModel: Model<NotificationLogDocument>,
    @InjectModel(EmployeeProfile.name) private employeeProfileModel: Model<EmployeeProfileDocument>,
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

  async updateAttendanceRecord(id: string, data: UpdateAttendanceRecordDto): Promise<AttendanceRecordDocument | null> {
    return this.attendanceRecordModel.findByIdAndUpdate(id, data, { new: true }).exec();
  }

  async deleteAttendanceRecord(id: string): Promise<void> {
    await this.attendanceRecordModel.findByIdAndDelete(id).exec();
  }

  // Clock In/Out Operations
  async clockIn(employeeId: string, payload: any = {}): Promise<AttendanceRecordDocument> {
    console.log('Clock-in request for employeeId:', employeeId);

    // Validate employeeId
    if (!employeeId || !Types.ObjectId.isValid(employeeId)) {
      throw new Error(`Invalid employee ID: ${employeeId}`);
    }

    const today = new Date();
    const startOfDay = new Date(today.getFullYear(), today.getMonth(), today.getDate());
    const endOfDay = new Date(today.getFullYear(), today.getMonth(), today.getDate() + 1);

    console.log('Looking for attendance record between:', startOfDay, 'and', endOfDay);

    try {
      // Find existing record for today
      let record = await this.attendanceRecordModel.findOne({
        employeeId: new Types.ObjectId(employeeId),
        createdAt: { $gte: startOfDay, $lt: endOfDay }
      }).exec();

      console.log('Found existing record:', record ? 'yes' : 'no');

      const punch = { type: PunchType.IN, time: new Date() };
      console.log('Adding punch:', punch);

      if (record) {
        // Add punch to existing record
        record.punches = record.punches || [];
        record.punches.push(punch);
        const saved = await record.save();
        console.log('Updated existing record successfully');
        return saved;
      } else {
        // Create new record
        console.log('Creating new attendance record');
        const newRecord = await this.createAttendanceRecord({
          employeeId,
          punches: [punch],
          ...payload
        });
        console.log('Created new record successfully');
        return newRecord;
      }
    } catch (error) {
      console.error('Clock-in error:', error);
      throw error;
    }
  }

  async clockOut(employeeId: string, payload: any = {}): Promise<AttendanceRecordDocument> {
    console.log('Clock-out request for employeeId:', employeeId);

    // Validate employeeId
    if (!employeeId || !Types.ObjectId.isValid(employeeId)) {
      throw new Error(`Invalid employee ID: ${employeeId}`);
    }

    const today = new Date();
    const startOfDay = new Date(today.getFullYear(), today.getMonth(), today.getDate());
    const endOfDay = new Date(today.getFullYear(), today.getMonth(), today.getDate() + 1);

    console.log('Looking for attendance record between:', startOfDay, 'and', endOfDay);

    try {
      // Find existing record for today
      const record = await this.attendanceRecordModel.findOne({
        employeeId: new Types.ObjectId(employeeId),
        createdAt: { $gte: startOfDay, $lt: endOfDay }
      }).exec();

      console.log('Found existing record:', record ? 'yes' : 'no');

      if (!record) {
        throw new Error('No attendance record found for today - please clock in first');
      }

      const punch = { type: PunchType.OUT, time: new Date() };
      console.log('Adding punch:', punch);

      record.punches = record.punches || [];
      record.punches.push(punch);

      const saved = await record.save();
      console.log('Clock-out successful');
      return saved;
    } catch (error) {
      console.error('Clock-out error:', error);
      throw error;
    }
  }

  // Attendance Correction Requests
  async createCorrectionRequest(data: CreateAttendanceCorrectionRequestDto | Partial<AttendanceCorrectionRequest>): Promise<AttendanceCorrectionRequestDocument> {
    const requestData: any = { ...data };

    // Handle employeeId
    if (data.employeeId && typeof data.employeeId === 'string') {
      requestData.employeeId = new Types.ObjectId(data.employeeId);
    }

    // Handle attendance record - either find existing or create new
    let attendanceRecordId = (data as any).attendanceRecord;
    const requestedDate = (data as any).date;

    if (attendanceRecordId && typeof attendanceRecordId === 'string') {
      // Direct attendance record ID provided
      try {
        requestData.attendanceRecord = new Types.ObjectId(attendanceRecordId);
      } catch (error) {
        throw new Error(`Invalid attendance record ID format: ${attendanceRecordId}`);
      }
    } else if (requestedDate) {
      // Date provided - find or create attendance record for this employee and date
      const recordDate = new Date(requestedDate);
      const startOfDay = new Date(recordDate.getFullYear(), recordDate.getMonth(), recordDate.getDate());
      const endOfDay = new Date(recordDate.getFullYear(), recordDate.getMonth(), recordDate.getDate() + 1);

      // Try to find existing attendance record for this employee and date
      let existingRecord: AttendanceRecordDocument | null = await this.attendanceRecordModel.findOne({
        employeeId: requestData.employeeId,
        createdAt: { $gte: startOfDay, $lt: endOfDay }
      }).exec();

      if (!existingRecord) {
        // Create a new attendance record for this date
        console.log(`Creating new attendance record for employee ${requestData.employeeId} on ${requestedDate}`);
        const attendanceRecordData: CreateAttendanceRecordDto = {
          employeeId: data.employeeId as string,
          punches: [], // Empty punches - this will be corrected
        };
        existingRecord = await this.createAttendanceRecord(attendanceRecordData);
      }

      if (existingRecord) {
        requestData.attendanceRecord = existingRecord._id;
      } else {
        throw new Error('Failed to create attendance record for correction request');
      }
    } else {
      throw new Error('Either attendanceRecord ID or date must be provided for correction request');
    }

    // Remove the date field as it's not part of the schema
    delete requestData.date;

    return this.correctionRequestModel.create(requestData);
  }

  async findAllCorrectionRequests(filter?: any): Promise<AttendanceCorrectionRequestDocument[]> {
    return this.correctionRequestModel.find(filter).populate('employeeId').populate('attendanceRecord').exec();
  }

  async findCorrectionRequestById(id: string): Promise<AttendanceCorrectionRequestDocument | null> {
    return this.correctionRequestModel.findById(id).populate('employeeId').populate('attendanceRecord').exec();
  }

  async updateCorrectionRequest(id: string, data: UpdateAttendanceCorrectionRequestDto): Promise<AttendanceCorrectionRequestDocument | null> {
    return this.correctionRequestModel.findByIdAndUpdate(id, data, { new: true }).exec();
  }

  async deleteCorrectionRequest(id: string): Promise<void> {
    await this.correctionRequestModel.findByIdAndDelete(id).exec();
  }

  // Overtime Rules
  async createOvertimeRule(data: CreateOvertimeRuleDto): Promise<OvertimeRuleDocument> {
    return this.overtimeRuleModel.create(data);
  }

  async findAllOvertimeRules(filter?: any): Promise<OvertimeRuleDocument[]> {
    return this.overtimeRuleModel.find(filter).exec();
  }

  async findOvertimeRuleById(id: string): Promise<OvertimeRuleDocument | null> {
    return this.overtimeRuleModel.findById(id).exec();
  }

  async updateOvertimeRule(id: string, data: UpdateOvertimeRuleDto): Promise<OvertimeRuleDocument | null> {
    return this.overtimeRuleModel.findByIdAndUpdate(id, data, { new: true }).exec();
  }

  async deleteOvertimeRule(id: string): Promise<void> {
    await this.overtimeRuleModel.findByIdAndDelete(id).exec();
  }

  // Lateness Rules
  async createLatenessRule(data: CreateLatenessRuleDto): Promise<LatenessRuleDocument> {
    return this.latenessRuleModel.create(data);
  }

  async findAllLatenessRules(filter?: any): Promise<LatenessRuleDocument[]> {
    return this.latenessRuleModel.find(filter).exec();
  }

  async findLatenessRuleById(id: string): Promise<LatenessRuleDocument | null> {
    return this.latenessRuleModel.findById(id).exec();
  }

  async updateLatenessRule(id: string, data: UpdateLatenessRuleDto): Promise<LatenessRuleDocument | null> {
    return this.latenessRuleModel.findByIdAndUpdate(id, data, { new: true }).exec();
  }

  async deleteLatenessRule(id: string): Promise<void> {
    await this.latenessRuleModel.findByIdAndDelete(id).exec();
  }

  // Holidays
  async createHoliday(data: CreateHolidayDto): Promise<HolidayDocument> {
    return this.holidayModel.create(data);
  }

  async findAllHolidays(filter?: any): Promise<HolidayDocument[]> {
    return this.holidayModel.find(filter).exec();
  }

  async findHolidayById(id: string): Promise<HolidayDocument | null> {
    return this.holidayModel.findById(id).exec();
  }

  async updateHoliday(id: string, data: UpdateHolidayDto): Promise<HolidayDocument | null> {
    return this.holidayModel.findByIdAndUpdate(id, data, { new: true }).exec();
  }

  async deleteHoliday(id: string): Promise<void> {
    await this.holidayModel.findByIdAndDelete(id).exec();
  }

  async syncNationalCalendar(): Promise<{ message: string; synced: number }> {
    // This would typically integrate with a national holiday API
    // For now, return a placeholder response
    return {
      message: 'National calendar sync completed',
      synced: 0 // Number of holidays synced
    };
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

  async updateShift(id: string, data: UpdateShiftDto): Promise<ShiftDocument | null> {
    return this.shiftModel.findByIdAndUpdate(id, data, { new: true }).exec();
  }

  async deleteShift(id: string): Promise<void> {
    await this.shiftModel.findByIdAndDelete(id).exec();
  }

  // Shift Assignments
  async createShiftAssignment(data: CreateShiftAssignmentDto | Partial<ShiftAssignment>): Promise<ShiftAssignmentDocument> {
    try {
      // Validate required fields
      if (!data.shiftId) {
        throw new Error('Shift ID is required for shift assignment');
      }
      if (!data.startDate || !data.endDate) {
        throw new Error('Start date and end date are required for shift assignment');
      }
      if (!data.employeeId && !data.departmentId && !data.positionId) {
        throw new Error('Either employee ID, department ID, or position ID must be provided');
      }

      const assignmentData: any = {
        ...data,
      };

      // Convert string IDs to ObjectIds with validation
      try {
        assignmentData.shiftId = new Types.ObjectId(data.shiftId);
      } catch (error) {
        throw new Error(`Invalid shift ID format: ${data.shiftId}`);
      }

      if (data.employeeId) {
        try {
          assignmentData.employeeId = new Types.ObjectId(data.employeeId);
        } catch (error) {
          throw new Error(`Invalid employee ID format: ${data.employeeId}`);
        }
      }

      if (data.departmentId) {
        try {
          assignmentData.departmentId = new Types.ObjectId(data.departmentId);
        } catch (error) {
          throw new Error(`Invalid department ID format: ${data.departmentId}`);
        }
      }

      if (data.positionId) {
        try {
          assignmentData.positionId = new Types.ObjectId(data.positionId);
        } catch (error) {
          throw new Error(`Invalid position ID format: ${data.positionId}`);
        }
      }

      if (data.scheduleRuleId) {
        try {
          assignmentData.scheduleRuleId = new Types.ObjectId(data.scheduleRuleId);
        } catch (error) {
          throw new Error(`Invalid schedule rule ID format: ${data.scheduleRuleId}`);
        }
      }

      // Convert dates if they're strings
      if (data.startDate && typeof data.startDate === 'string') {
        assignmentData.startDate = new Date(data.startDate);
      }
      if (data.endDate && typeof data.endDate === 'string') {
        assignmentData.endDate = new Date(data.endDate);
      }

      const result = await this.shiftAssignmentModel.create(assignmentData);
      return result;
    } catch (error: any) {
      console.error('Error creating shift assignment:', error.message);
      throw error;
    }
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

  async updateShiftAssignment(id: string, data: UpdateShiftAssignmentDto): Promise<ShiftAssignmentDocument | null> {
    return this.shiftAssignmentModel.findByIdAndUpdate(id, data, { new: true }).exec();
  }

  async deleteShiftAssignment(id: string): Promise<void> {
    await this.shiftAssignmentModel.findByIdAndDelete(id).exec();
  }

  // Bulk Shift Assignment
  async bulkAssignShifts(assignments: Partial<ShiftAssignment>[]): Promise<ShiftAssignmentDocument[]> {
    const createdAssignments: ShiftAssignmentDocument[] = [];
    const errors: string[] = [];

    console.log(`Starting bulk assignment of ${assignments.length} shift assignments`);

    for (let i = 0; i < assignments.length; i++) {
      try {
        console.log(`Processing assignment ${i + 1}/${assignments.length}:`, assignments[i]);
        const assignment = assignments[i];

        // Check if this is a department/position-based assignment
        if ((assignment.departmentId || assignment.positionId) && !assignment.employeeId) {
          // This is a bulk assignment to a department or position
          const employees = await this.findEmployeesForBulkAssignment(
            typeof assignment.departmentId === 'string' ? assignment.departmentId : undefined,
            typeof assignment.positionId === 'string' ? assignment.positionId : undefined
          );
          console.log(`Found ${employees.length} employees for bulk assignment`);

          // Create individual assignments for each employee
          for (const employee of employees) {
            try {
              const individualAssignment = {
                ...assignment,
                employeeId: employee._id,
                departmentId: undefined, // Remove departmentId since we have employeeId
                positionId: undefined,   // Remove positionId since we have employeeId
              };
              const created = await this.createShiftAssignment(individualAssignment);
              createdAssignments.push(created);
              console.log(`Successfully created assignment for employee ${employee.firstName} ${employee.lastName}`);
            } catch (employeeError: any) {
              const errorMsg = `Failed to create assignment for employee ${employee.firstName} ${employee.lastName}: ${employeeError.message}`;
              console.error(errorMsg);
              errors.push(errorMsg);
            }
          }
        } else {
          // This is a regular individual assignment
          const created = await this.createShiftAssignment(assignment);
          createdAssignments.push(created);
          console.log(`Successfully created individual assignment ${i + 1}`);
        }
      } catch (error: any) {
        const errorMsg = `Failed to process assignment ${i + 1}: ${error.message}`;
        console.error(errorMsg);
        errors.push(errorMsg);
      }
    }

    if (errors.length > 0) {
      console.error(`Bulk assignment completed with ${errors.length} errors`);
      throw new Error(`Bulk assignment failed: ${errors.join('; ')}`);
    }

    console.log(`Bulk assignment completed successfully: ${createdAssignments.length} assignments created`);
    return createdAssignments;
  }

  async previewBulkAssignment(data: { departmentId?: string; positionId?: string; shiftId: string; startDate: string; endDate?: string }) {
    const employees = await this.findEmployeesForBulkAssignment(data.departmentId, data.positionId);

    return {
      totalEmployees: employees.length,
      employees: employees.map(emp => ({
        id: emp._id,
        name: `${emp.firstName} ${emp.lastName}`,
        employeeNumber: emp.employeeNumber
      }))
    };
  }

  private async findEmployeesForBulkAssignment(departmentId?: string, positionId?: string): Promise<any[]> {
    let query: any = {};

    if (departmentId) {
      query.primaryDepartmentId = new Types.ObjectId(departmentId);
    }

    if (positionId) {
      query.primaryPositionId = new Types.ObjectId(positionId);
    }

    return await this.employeeProfileModel
      .find(query)
      .select('_id firstName lastName employeeNumber')
      .lean();
  }

  // Shift Types
  async createShiftType(data: CreateShiftTypeDto): Promise<ShiftTypeDocument> {
    return this.shiftTypeModel.create(data);
  }

  async findAllShiftTypes(filter?: any): Promise<ShiftTypeDocument[]> {
    return this.shiftTypeModel.find(filter).exec();
  }

  async findShiftTypeById(id: string): Promise<ShiftTypeDocument | null> {
    return this.shiftTypeModel.findById(id).exec();
  }

  async updateShiftType(id: string, data: UpdateShiftTypeDto): Promise<ShiftTypeDocument | null> {
    return this.shiftTypeModel.findByIdAndUpdate(id, data, { new: true }).exec();
  }

  async deleteShiftType(id: string): Promise<void> {
    await this.shiftTypeModel.findByIdAndDelete(id).exec();
  }

  // Schedule Rules
  async createScheduleRule(data: CreateScheduleRuleDto): Promise<ScheduleRuleDocument> {
    return this.scheduleRuleModel.create(data);
  }

  async findAllScheduleRules(filter?: any): Promise<ScheduleRuleDocument[]> {
    return this.scheduleRuleModel.find(filter).exec();
  }

  async findScheduleRuleById(id: string): Promise<ScheduleRuleDocument | null> {
    return this.scheduleRuleModel.findById(id).exec();
  }

  async updateScheduleRule(id: string, data: UpdateScheduleRuleDto): Promise<ScheduleRuleDocument | null> {
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

  async updateTimeException(id: string, data: UpdateTimeExceptionDto): Promise<TimeExceptionDocument | null> {
    return this.timeExceptionModel.findByIdAndUpdate(id, data, { new: true }).exec();
  }

  async deleteTimeException(id: string): Promise<void> {
    await this.timeExceptionModel.findByIdAndDelete(id).exec();
  }

  // Exception Approval/Rejection
  async approveTimeException(id: string): Promise<TimeExceptionDocument | null> {
    return this.updateTimeException(id, { status: TimeExceptionStatus.RESOLVED });
  }

  async rejectTimeException(id: string, reason?: string): Promise<TimeExceptionDocument | null> {
    return this.updateTimeException(id, { status: TimeExceptionStatus.REJECTED });
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

  async updateNotificationLog(id: string, data: UpdateNotificationLogDto): Promise<NotificationLogDocument | null> {
    return this.notificationLogModel.findByIdAndUpdate(id, data, { new: true }).exec();
  }

  async deleteNotificationLog(id: string): Promise<void> {
    await this.notificationLogModel.findByIdAndDelete(id).exec();
  }

  // Mark Notification as Read
  async markNotificationAsRead(id: string): Promise<NotificationLogDocument | null> {
    return this.updateNotificationLog(id, { read: true });
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
    const { panelMemberIds, startDate, endDate, excludeInterviewId } = data;

    // Get all shift assignments for panel members within the date range
    const shiftAssignments = await this.shiftAssignmentModel.find({
      employeeId: { $in: panelMemberIds.map(id => new Types.ObjectId(id)) },
      $or: [
        {
          startDate: { $lte: endDate },
          $or: [{ endDate: { $gte: startDate } }, { endDate: null }]
        }
      ],
      status: 'APPROVED'
    }).populate('shiftId').exec();

    // Get holidays within the date range
    const holidays = await this.holidayModel.find({
      $or: [
        {
          startDate: { $lte: endDate },
          $or: [{ endDate: { $gte: startDate } }, { endDate: null }]
        }
      ],
      active: true
    }).exec();

    // Calculate availability for each panel member
    const panelAvailability = await Promise.all(
      panelMemberIds.map(async (panelMemberId) => {
        const memberShifts = shiftAssignments.filter(
          assignment => assignment.employeeId && assignment.employeeId.toString() === panelMemberId
        );

        // Calculate working hours for each day in the range
        const availability: Array<{
          date: Date;
          available: boolean;
          shift?: { name: string; startTime: string; endTime: string };
          reason?: string;
        }> = [];
        const currentDate = new Date(startDate);

        while (currentDate <= endDate) {
          const dayOfWeek = currentDate.getDay(); // 0 = Sunday, 1 = Monday, etc.
          const isHoliday = holidays.some(holiday =>
            holiday.startDate <= currentDate &&
            (!holiday.endDate || holiday.endDate >= currentDate)
          );

          if (!isHoliday) {
            // Find applicable shift for this day
            const applicableShift = memberShifts.find(assignment => {
              const shiftStart = assignment.startDate;
              const shiftEnd = assignment.endDate || new Date('2099-12-31');
              return currentDate >= shiftStart && currentDate <= shiftEnd;
            });

            if (applicableShift && applicableShift.shiftId) {
              const shift = applicableShift.shiftId as any;
              availability.push({
                date: new Date(currentDate),
                available: true,
                shift: {
                  name: shift.name,
                  startTime: shift.startTime,
                  endTime: shift.endTime
                }
              });
            } else {
              availability.push({
                date: new Date(currentDate),
                available: false,
                reason: 'No shift assigned'
              });
            }
          } else {
            availability.push({
              date: new Date(currentDate),
              available: false,
              reason: 'Holiday'
            });
          }

          currentDate.setDate(currentDate.getDate() + 1);
        }

        return {
          panelMemberId,
          availability,
          totalAvailableDays: availability.filter(day => day.available).length,
          totalDays: availability.length
        };
      })
    );

    return {
      success: true,
      panelMemberIds,
      dateRange: { startDate, endDate },
      panelAvailability,
      summary: {
        totalPanelMembers: panelMemberIds.length,
        averageAvailability: panelAvailability.reduce((sum, member) =>
          sum + (member.totalAvailableDays / member.totalDays), 0
        ) / panelMemberIds.length
      }
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
    const { applicationId, scheduledDate, method, panelMemberIds, videoLink, location, notes } = data;

    // Validate that all panel members are available at the scheduled time
    const availabilityCheck = await this.checkPanelAvailability({
      panelMemberIds,
      startDate: new Date(scheduledDate),
      endDate: new Date(scheduledDate)
    });

    const unavailableMembers = availabilityCheck.panelAvailability.filter(
      member => !member.availability[0]?.available
    );

    if (unavailableMembers.length > 0) {
      throw new Error(`Some panel members are not available: ${unavailableMembers.map(m => m.panelMemberId).join(', ')}`);
    }

    // Generate interview ID (in a real implementation, this would be handled by recruitment module)
    const interviewId = new Types.ObjectId().toString();

    // Create notification logs for all panel members
    const notificationPromises = panelMemberIds.map(panelMemberId =>
      this.createNotificationLog({
        to: panelMemberId,
        title: 'Interview Scheduled',
        body: `You have been scheduled for an interview on ${scheduledDate.toLocaleString()}. Method: ${method}${location ? `, Location: ${location}` : ''}${videoLink ? `, Video Link: ${videoLink}` : ''}`,
        type: 'INTERVIEW_SCHEDULED',
        priority: 'NORMAL',
        metadata: {
          interviewId,
          applicationId,
          scheduledDate,
          method,
          location,
          videoLink
        }
      })
    );

    // Create notification for candidate (assuming we can get candidate ID from application)
    notificationPromises.push(
      this.createNotificationLog({
        to: applicationId, // This should be candidate ID in real implementation
        title: 'Interview Confirmation',
        body: `Your interview has been scheduled for ${scheduledDate.toLocaleString()}. Method: ${method}${location ? `, Location: ${location}` : ''}${videoLink ? `, Video Link: ${videoLink}` : ''}`,
        type: 'INTERVIEW_CONFIRMATION',
        priority: 'HIGH',
        metadata: {
          interviewId,
          scheduledDate,
          method,
          location,
          videoLink,
          notes
        }
      })
    );

    await Promise.all(notificationPromises);

    return {
      success: true,
      message: 'Interview scheduled successfully',
      interviewId,
      applicationId,
      scheduledDate,
      method,
      panelMemberIds,
      location,
      videoLink,
      notes,
      notificationsSent: notificationPromises.length
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
    // In a real implementation, this would fetch the interview from recruitment module
    // For now, we'll simulate the update

    const updates = Object.keys(data).filter(key => data[key as keyof typeof data] !== undefined);

    // If date or panel members changed, validate availability
    if ((data.scheduledDate || data.panelMemberIds) && data.panelMemberIds) {
      const availabilityCheck = await this.checkPanelAvailability({
        panelMemberIds: data.panelMemberIds,
        startDate: data.scheduledDate || new Date(),
        endDate: data.scheduledDate || new Date()
      });

      const unavailableMembers = availabilityCheck.panelAvailability.filter(
        member => !member.availability[0]?.available
      );

      if (unavailableMembers.length > 0) {
        throw new Error(`Some panel members are not available for the new schedule: ${unavailableMembers.map(m => m.panelMemberId).join(', ')}`);
      }
    }

    // Send update notifications to all affected parties
    const notificationPromises: Promise<any>[] = [];

    if (data.panelMemberIds) {
      notificationPromises.push(...data.panelMemberIds.map(panelMemberId =>
        this.createNotificationLog({
          to: panelMemberId,
          title: 'Interview Schedule Updated',
          body: `Your interview schedule has been updated. ${data.scheduledDate ? `New date: ${data.scheduledDate.toLocaleString()}` : ''} ${data.method ? `Method: ${data.method}` : ''} ${data.location ? `Location: ${data.location}` : ''} ${data.videoLink ? `Video Link: ${data.videoLink}` : ''}`,
          type: 'INTERVIEW_UPDATED',
          priority: 'NORMAL',
          metadata: {
            interviewId,
            updates: data
          }
        })
      ));
    }

    // Notify candidate
    notificationPromises.push(
      this.createNotificationLog({
        to: 'candidate-id', // This should be retrieved from the interview record
        title: 'Interview Schedule Updated',
        body: `Your interview schedule has been updated. ${data.scheduledDate ? `New date: ${data.scheduledDate.toLocaleString()}` : ''} ${data.method ? `Method: ${data.method}` : ''} ${data.location ? `Location: ${data.location}` : ''} ${data.videoLink ? `Video Link: ${data.videoLink}` : ''}`,
        type: 'INTERVIEW_UPDATED',
        priority: 'HIGH',
        metadata: {
          interviewId,
          updates: data
        }
      })
    );

    await Promise.all(notificationPromises);

    return {
      success: true,
      message: 'Interview schedule updated successfully',
      interviewId,
      updates: data,
      fieldsUpdated: updates,
      notificationsSent: notificationPromises.length
    };
  }

  // ========== Payroll Integration ==========
  /**
   * Sync attendance data with payroll system
   */
  async syncWithPayroll(periodId: string, attendanceData: any[]): Promise<any> {
    const startTime = Date.now();
    console.log(`Starting payroll sync for period ${periodId} with ${attendanceData.length} records`);

    try {
      // Log the sync start
      await this.createSyncLog({
        system: SyncSystem.PAYROLL,
        operation: 'SYNC_ATTENDANCE_DATA',
        status: SyncStatus.IN_PROGRESS,
        recordsProcessed: 0,
        message: `Started syncing ${attendanceData.length} attendance records for period ${periodId}`,
        duration: 0,
        triggeredBy: 'SYSTEM',
        metadata: { periodId }
      });

      // Process attendance data (in a real implementation, this would send to external payroll API)
      const processedRecords = attendanceData.map(record => ({
        employeeId: record.employeeId,
        periodId,
        totalHours: record.totalWorkMinutes ? record.totalWorkMinutes / 60 : 0,
        regularHours: record.regularHours || 0,
        overtimeHours: record.overtimeHours || 0,
        absences: record.absences || 0,
        lateMinutes: record.lateMinutes || 0,
        status: 'SYNCED'
      }));

      // Calculate summary statistics
      const summary = {
        totalRecords: processedRecords.length,
        totalHours: processedRecords.reduce((sum, r) => sum + r.totalHours, 0),
        totalOvertime: processedRecords.reduce((sum, r) => sum + r.overtimeHours, 0),
        totalAbsences: processedRecords.reduce((sum, r) => sum + r.absences, 0),
        averageLateMinutes: processedRecords.reduce((sum, r) => sum + r.lateMinutes, 0) / processedRecords.length
      };

      const duration = Date.now() - startTime;

      // Log successful completion
      await this.createSyncLog({
        system: SyncSystem.PAYROLL,
        operation: 'SYNC_ATTENDANCE_DATA',
        status: SyncStatus.SUCCESS,
        recordsProcessed: processedRecords.length,
        message: `Successfully synced ${processedRecords.length} attendance records for period ${periodId}`,
        duration,
        triggeredBy: 'SYSTEM',
        metadata: {
          periodId,
          summary,
          processedRecords: processedRecords.slice(0, 10) // Store sample records
        }
      });

      return {
        success: true,
        message: 'Payroll sync completed successfully',
        periodId,
        recordsSynced: processedRecords.length,
        duration,
        summary,
        status: 'COMPLETED'
      };

    } catch (error: any) {
      const duration = Date.now() - startTime;

      // Log failure
      await this.createSyncLog({
        system: SyncSystem.PAYROLL,
        operation: 'SYNC_ATTENDANCE_DATA',
        status: SyncStatus.ERROR,
        recordsProcessed: 0,
        message: `Payroll sync failed for period ${periodId}`,
        duration,
        triggeredBy: 'SYSTEM',
        errorDetails: error.message,
        metadata: { periodId }
      });

      throw new Error(`Payroll sync failed: ${error.message}`);
    }
  }

  /**
   * Get pending payroll sync status
   */
  async getPendingPayrollSync(): Promise<any> {
    // Get the most recent payroll sync
    const lastSync = await this.syncLogModel
      .findOne({ system: SyncSystem.PAYROLL })
      .sort({ timestamp: -1 })
      .exec();

    // Check for attendance records that haven't been synced
    const currentDate = new Date();
    const lastMonth = new Date(currentDate.getFullYear(), currentDate.getMonth() - 1, 1);
    const thisMonth = new Date(currentDate.getFullYear(), currentDate.getMonth(), 1);

    // Count attendance records from last month that might need syncing
    const pendingRecords = await this.attendanceRecordModel.countDocuments({
      createdAt: { $gte: lastMonth, $lt: thisMonth },
      finalisedForPayroll: false
    }).exec();

    // Get any failed syncs from the last 24 hours
    const recentFailures = await this.syncLogModel.countDocuments({
      system: SyncSystem.PAYROLL,
      status: SyncStatus.ERROR,
      timestamp: { $gte: new Date(Date.now() - 24 * 60 * 60 * 1000) }
    }).exec();

    const nextScheduledSync = this.calculateNextSync('DAILY', lastSync?.timestamp);

    return {
      lastSync: lastSync?.timestamp || null,
      lastSyncStatus: lastSync?.status || 'NEVER_RUN',
      pendingRecords,
      recentFailures,
      nextScheduledSync,
      status: pendingRecords > 0 ? 'PENDING_RECORDS' : 'IDLE',
      message: pendingRecords > 0
        ? `${pendingRecords} attendance records pending payroll sync`
        : 'All records synced'
    };
  }

  /**
   * Validate attendance data before payroll sync
   */
  async validateAttendanceForPayroll(startDate: string, endDate: string): Promise<any> {
    const start = new Date(startDate);
    const end = new Date(endDate);

    console.log(`Validating attendance records from ${start.toISOString()} to ${end.toISOString()}`);

    // Get all attendance records in the period
    const records = await this.attendanceRecordModel
      .find({
        createdAt: { $gte: start, $lte: end }
      })
      .populate('employeeId', 'firstName lastName employeeNumber')
      .exec();

    const issues: Array<{
      recordId: any;
      employeeName: string;
      employeeNumber: any;
      date: any;
      issues: string[];
    }> = [];
    const validationSummary = {
      totalRecords: records.length,
      validRecords: 0,
      recordsWithIssues: 0,
      missingPunches: 0,
      incompleteRecords: 0,
      overtimeIssues: 0
    };

    // Validate each record
    for (const record of records) {
      const recordIssues: string[] = [];

      // Check for missing punches
      if (!record.punches || record.punches.length === 0) {
        recordIssues.push('No punches recorded');
        validationSummary.missingPunches++;
      } else {
        // Check for incomplete punch pairs
        const inPunches = record.punches.filter(p => p.type === PunchType.IN);
        const outPunches = record.punches.filter(p => p.type === PunchType.OUT);

        if (inPunches.length !== outPunches.length) {
          recordIssues.push('Unmatched clock-in/clock-out punches');
          validationSummary.incompleteRecords++;
        }

        // Check for overtime (assuming 8 hours = 480 minutes)
        if (record.totalWorkMinutes && record.totalWorkMinutes > 480) {
          // This might be valid, but flag for review
          recordIssues.push(`Overtime hours: ${(record.totalWorkMinutes - 480) / 60} hours`);
          validationSummary.overtimeIssues++;
        }
      }

      if (recordIssues.length > 0) {
        issues.push({
          recordId: record._id,
          employeeName: this.getEmployeeName(record.employeeId),
          employeeNumber: (record.employeeId as any)?.employeeNumber,
          date: (record as any).createdAt,
          issues: recordIssues
        });
        validationSummary.recordsWithIssues++;
      } else {
        validationSummary.validRecords++;
      }
    }

    const validationStatus = validationSummary.recordsWithIssues === 0 ? 'VALID' : 'ISSUES_FOUND';

    return {
      success: true,
      validationPeriod: { startDate, endDate },
      summary: validationSummary,
      validationStatus,
      issues: issues.slice(0, 100), // Limit to first 100 issues
      message: validationStatus === 'VALID'
        ? 'All attendance records validated successfully'
        : `${validationSummary.recordsWithIssues} records have validation issues`,
      recommendations: validationStatus === 'ISSUES_FOUND' ? [
        'Review records with missing punches',
        'Verify unmatched clock-in/out pairs',
        'Confirm overtime approvals',
        'Check for system data entry errors'
      ] : []
    };
  }

  // ========== ATTENDANCE RULES ==========
  /**
   * Get current attendance rules
   */
  async getAttendanceRules(): Promise<AttendanceRulesDocument | null> {
    return this.attendanceRulesModel.findOne({ isActive: true }).exec();
  }

  /**
   * Create or update attendance rules
   */
  async updateAttendanceRules(data: Partial<AttendanceRules>): Promise<AttendanceRulesDocument> {
    // First, deactivate any existing active rules
    await this.attendanceRulesModel.updateMany(
      { isActive: true },
      { isActive: false }
    );

    // Create new active rules
    const newRules = new this.attendanceRulesModel({
      ...data,
      isActive: true,
      effectiveFrom: data.effectiveFrom ? new Date(data.effectiveFrom) : new Date(),
    });

    // Validate DTO data types - convert dates to strings if needed
    const dtoData = {
      ...data,
      effectiveFrom: data.effectiveFrom ? new Date(data.effectiveFrom).toISOString() : new Date().toISOString(),
    };

    return newRules.save();
  }

  // ========== FLEXIBLE PUNCH CONFIGURATION ==========
  /**
   * Get current flexible punch configuration
   */
  async getFlexiblePunchConfig(): Promise<FlexiblePunchConfigDocument | null> {
    return this.flexiblePunchConfigModel.findOne({ isActive: true }).exec();
  }

  /**
   * Create or update flexible punch configuration
   */
  async updateFlexiblePunchConfig(data: Partial<FlexiblePunchConfig>): Promise<FlexiblePunchConfigDocument> {
    // First, deactivate any existing active configurations
    await this.flexiblePunchConfigModel.updateMany(
      { isActive: true },
      { isActive: false }
    );

    // Create new active configuration
    const newConfig = new this.flexiblePunchConfigModel({
      ...data,
      isActive: true,
      effectiveFrom: data.effectiveFrom ? new Date(data.effectiveFrom) : new Date(),
    });

    return newConfig.save();
  }

  // ========== REST DAY CONFIGURATIONS ==========
  async getRestDayConfigurations(): Promise<RestDayConfigDocument[]> {
    return this.restDayConfigModel.find({ active: true }).sort({ createdAt: -1 }).exec();
  }

  async createRestDayConfiguration(data: Partial<RestDayConfig>): Promise<RestDayConfigDocument> {
    const config = new this.restDayConfigModel({
      ...data,
      active: true,
      effectiveFrom: data.effectiveFrom ? new Date(data.effectiveFrom) : new Date(),
    });
    return config.save();
  }

  async updateRestDayConfiguration(id: string, data: Partial<RestDayConfig>): Promise<RestDayConfigDocument | null> {
    return this.restDayConfigModel.findByIdAndUpdate(
      id,
      {
        ...data,
        effectiveFrom: data.effectiveFrom ? new Date(data.effectiveFrom) : undefined,
        updatedAt: new Date()
      },
      { new: true }
    ).exec();
  }

  async updateDefaultRestDays(data: Partial<RestDayConfig>): Promise<RestDayConfigDocument> {
    // First, deactivate any existing default configurations
    await this.restDayConfigModel.updateMany(
      { type: 'DEFAULT', active: true },
      { active: false }
    );

    // Create or update the default configuration
    const existingDefault = await this.restDayConfigModel.findOne({ type: 'DEFAULT' }).exec();

    if (existingDefault) {
      return this.restDayConfigModel.findByIdAndUpdate(
        existingDefault._id,
        {
          ...data,
          type: 'DEFAULT',
          active: true,
          effectiveFrom: data.effectiveFrom ? new Date(data.effectiveFrom) : new Date(),
          updatedAt: new Date()
        },
        { new: true }
      ).exec() as Promise<RestDayConfigDocument>;
    } else {
      const config = new this.restDayConfigModel({
        ...data,
        type: 'DEFAULT',
        active: true,
        effectiveFrom: data.effectiveFrom ? new Date(data.effectiveFrom) : new Date(),
      });
      return config.save();
    }
  }

  async deleteRestDayConfiguration(id: string): Promise<void> {
    await this.restDayConfigModel.findByIdAndDelete(id).exec();
  }

  // ========== SYSTEM INTEGRATION & SYNCHRONIZATION ==========
  async getPayrollSyncStatus(): Promise<any> {
    // Get the latest sync log for payroll
    const latestLog = await this.syncLogModel
      .findOne({ system: 'PAYROLL' })
      .sort({ timestamp: -1 })
      .exec();

    // Calculate records synced today
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);

    const todayLogs = await this.syncLogModel
      .find({
        system: 'PAYROLL',
        timestamp: { $gte: today, $lt: tomorrow },
        status: 'SUCCESS'
      })
      .exec();

    const recordsSyncedToday = {
      attendance: todayLogs.reduce((sum, log) => sum + (log.metadata?.attendanceRecords || 0), 0),
      overtime: todayLogs.reduce((sum, log) => sum + (log.metadata?.overtimeRecords || 0), 0),
      penalty: todayLogs.reduce((sum, log) => sum + (log.metadata?.penaltyRecords || 0), 0),
    };

    // Get integration config for frequency
    const config = await this.integrationConfigModel.findOne().exec();

    return {
      lastSync: latestLog?.timestamp || null,
      frequency: config?.syncFrequency || 'DAILY',
      recordsSyncedToday,
      status: latestLog?.status || 'ERROR',
      lastSyncMessage: latestLog?.message || 'No sync performed yet',
      nextSync: this.calculateNextSync(config?.syncFrequency || 'DAILY', latestLog?.timestamp)
    };
  }

  async getLeaveSyncStatus(): Promise<any> {
    // Get the latest sync log for leave management
    const latestLog = await this.syncLogModel
      .findOne({ system: 'LEAVE_MANAGEMENT' })
      .sort({ timestamp: -1 })
      .exec();

    // Calculate active leaves today
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);

    const todayLogs = await this.syncLogModel
      .find({
        system: 'LEAVE_MANAGEMENT',
        timestamp: { $gte: today, $lt: tomorrow },
        status: 'SUCCESS'
      })
      .exec();

    const activeLeavesToday = todayLogs.reduce((sum, log) => sum + (log.metadata?.activeLeaves || 0), 0);

    // Get integration config for frequency
    const config = await this.integrationConfigModel.findOne().exec();

    return {
      lastSync: latestLog?.timestamp || null,
      frequency: config?.syncFrequency || 'DAILY',
      recordsSyncedToday: {
        attendance: activeLeavesToday, // Using attendance field to show active leaves
        overtime: 0,
        penalty: 0
      },
      status: latestLog?.status || 'ERROR',
      lastSyncMessage: latestLog?.message || 'No sync performed yet',
      nextSync: this.calculateNextSync(config?.syncFrequency || 'DAILY', latestLog?.timestamp)
    };
  }

  async syncWithPayrollNow(): Promise<any> {
    const startTime = Date.now();

    try {
      // Log the sync start
      await this.createSyncLog({
        system: SyncSystem.PAYROLL,
        operation: 'MANUAL_SYNC',
        status: SyncStatus.SUCCESS,
        recordsProcessed: 0,
        message: 'Manual payroll sync initiated',
        duration: 0,
        triggeredBy: 'USER',
        metadata: {}
      });

      // Simulate sync operations - in real implementation, this would call external APIs
      const attendanceRecords = await this.attendanceRecordModel.countDocuments({
        createdAt: { $gte: new Date(Date.now() - 24 * 60 * 60 * 1000) }
      }).exec();

      const overtimeRecords = await this.timeExceptionModel.countDocuments({
        type: 'OVERTIME_REQUEST',
        createdAt: { $gte: new Date(Date.now() - 24 * 60 * 60 * 1000) }
      }).exec();

      const penaltyRecords = await this.timeExceptionModel.countDocuments({
        type: 'LATE',
        createdAt: { $gte: new Date(Date.now() - 24 * 60 * 60 * 1000) }
      }).exec();

      const duration = Date.now() - startTime;

      // Log successful sync
      await this.createSyncLog({
        system: SyncSystem.PAYROLL,
        operation: 'SYNC_ATTENDANCE_DATA',
        status: SyncStatus.SUCCESS,
        recordsProcessed: attendanceRecords + overtimeRecords + penaltyRecords,
        message: `Successfully synced ${attendanceRecords} attendance, ${overtimeRecords} overtime, and ${penaltyRecords} penalty records`,
        duration,
        triggeredBy: 'USER',
        metadata: {
          attendanceRecords,
          overtimeRecords,
          penaltyRecords
        }
      });

      return {
        success: true,
        message: 'Payroll sync completed successfully',
        recordsSynced: {
          attendance: attendanceRecords,
          overtime: overtimeRecords,
          penalty: penaltyRecords
        }
      };

    } catch (error: any) {
      const duration = Date.now() - startTime;

      // Log failed sync
      await this.createSyncLog({
        system: SyncSystem.PAYROLL,
        operation: 'SYNC_ATTENDANCE_DATA',
        status: SyncStatus.ERROR,
        recordsProcessed: 0,
        message: 'Payroll sync failed',
        duration,
        triggeredBy: 'USER',
        errorDetails: error.message,
        metadata: {}
      });

      throw error;
    }
  }

  async syncWithLeaveManagementNow(): Promise<any> {
    const startTime = Date.now();

    try {
      // Log the sync start
      await this.createSyncLog({
        system: SyncSystem.LEAVE_MANAGEMENT,
        operation: 'MANUAL_SYNC',
        status: SyncStatus.SUCCESS,
        recordsProcessed: 0,
        message: 'Manual leave management sync initiated',
        duration: 0,
        triggeredBy: 'USER',
        metadata: {}
      });

      // Simulate sync operations - in real implementation, this would call external APIs
      // Count active leaves that affect today's attendance
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      const tomorrow = new Date(today);
      tomorrow.setDate(tomorrow.getDate() + 1);

      // This is a placeholder - in real implementation, you'd query leave records
      // that overlap with today
      const activeLeavesToday = await this.timeExceptionModel.countDocuments({
        type: 'ABSENCE',
        createdAt: { $gte: today, $lt: tomorrow }
      }).exec();

      const duration = Date.now() - startTime;

      // Log successful sync
      await this.createSyncLog({
        system: SyncSystem.LEAVE_MANAGEMENT,
        operation: 'SYNC_LEAVE_DATA',
        status: SyncStatus.SUCCESS,
        recordsProcessed: activeLeavesToday,
        message: `Successfully synced leave data. ${activeLeavesToday} employees on leave today.`,
        duration,
        triggeredBy: 'USER',
        metadata: {
          activeLeaves: activeLeavesToday
        }
      });

      return {
        success: true,
        message: 'Leave management sync completed successfully',
        activeLeavesToday
      };

    } catch (error: any) {
      const duration = Date.now() - startTime;

      // Log failed sync
      await this.createSyncLog({
        system: SyncSystem.LEAVE_MANAGEMENT,
        operation: 'SYNC_LEAVE_DATA',
        status: SyncStatus.ERROR,
        recordsProcessed: 0,
        message: 'Leave management sync failed',
        duration,
        triggeredBy: 'USER',
        errorDetails: error.message,
        metadata: {}
      });

      throw error;
    }
  }

  async getSyncLogs(limit: number = 50): Promise<SyncLogDocument[]> {
    return this.syncLogModel
      .find()
      .sort({ timestamp: -1 })
      .limit(limit)
      .exec();
  }

  async createSyncLog(logData: Partial<SyncLog>): Promise<SyncLogDocument> {
    const log = new this.syncLogModel({
      ...logData,
      timestamp: logData.timestamp ? new Date(logData.timestamp) : new Date()
    });
    return log.save();
  }

  async retryFailedSync(logId: string): Promise<any> {
    const originalLog = await this.syncLogModel.findById(logId).exec();
    if (!originalLog) {
      throw new Error('Sync log not found');
    }

    // For now, just create a new sync log with the same operation
    // In a real implementation, this would retry the actual sync operation
    await this.createSyncLog({
      system: originalLog.system,
      operation: `RETRY_${originalLog.operation}`,
      status: SyncStatus.SUCCESS,
      recordsProcessed: originalLog.recordsProcessed,
      message: `Retried operation: ${originalLog.operation}`,
      duration: 0,
      triggeredBy: 'SYSTEM',
      metadata: originalLog.metadata
    });

    return { success: true, message: 'Retry operation completed' };
  }

  async getIntegrationConfig(): Promise<IntegrationConfigDocument | null> {
    return this.integrationConfigModel.findOne().exec();
  }

  async updateIntegrationConfig(config: UpdateIntegrationConfigDto): Promise<IntegrationConfigDocument> {
    const existingConfig = await this.integrationConfigModel.findOne().exec();

    if (existingConfig) {
      return this.integrationConfigModel.findByIdAndUpdate(
        existingConfig._id,
        { ...config, lastModified: new Date() },
        { new: true }
      ).exec() as Promise<IntegrationConfigDocument>;
    } else {
      const newConfig = new this.integrationConfigModel({
        ...config,
        lastModified: new Date()
      });
      return newConfig.save();
    }
  }

  private calculateNextSync(frequency: string, lastSync: Date | undefined): Date | null {
    if (!lastSync) return null;

    const nextSync = new Date(lastSync);

    switch (frequency) {
      case 'REAL_TIME':
        return null; // Real-time doesn't have scheduled syncs
      case 'HOURLY':
        nextSync.setHours(nextSync.getHours() + 1);
        break;
      case 'DAILY':
        nextSync.setDate(nextSync.getDate() + 1);
        break;
      case 'WEEKLY':
        nextSync.setDate(nextSync.getDate() + 7);
        break;
      default:
        return null;
    }

    return nextSync;
  }

  // ========== PRE-PAYROLL CLOSURE AUTOMATION ==========
  async getPayrollClosureConfig(): Promise<PayrollClosureConfigDocument | null> {
    return this.payrollClosureConfigModel.findOne().sort({ createdAt: -1 }).exec();
  }

  async updatePayrollClosureConfig(config: Partial<PayrollClosureConfig>): Promise<PayrollClosureConfigDocument> {
    const existingConfig = await this.payrollClosureConfigModel.findOne().exec();

    if (existingConfig) {
      return this.payrollClosureConfigModel.findByIdAndUpdate(
        existingConfig._id,
        {
          ...config,
          payrollCycleEnd: config.payrollCycleEnd ? new Date(config.payrollCycleEnd) : undefined,
          updatedAt: new Date()
        },
        { new: true }
      ).exec() as Promise<PayrollClosureConfigDocument>;
    } else {
      const newConfig = new this.payrollClosureConfigModel({
        ...config,
        payrollCycleEnd: config.payrollCycleEnd ? new Date(config.payrollCycleEnd) : new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
      });
      return newConfig.save();
    }
  }

  async getPendingPayrollApprovals(): Promise<any[]> {
    // Get pending overtime requests
    const overtimeRequests = await this.timeExceptionModel
      .find({ type: 'OVERTIME_REQUEST', status: 'PENDING' })
      .populate('employeeId', 'firstName lastName')
      .exec();

    // Get pending time exceptions
    const timeExceptions = await this.timeExceptionModel
      .find({
        type: { $in: ['MISSED_PUNCH', 'LATE', 'EARLY_LEAVE', 'SHORT_TIME'] },
        status: 'PENDING'
      })
      .populate('employeeId', 'firstName lastName')
      .exec();

    // Get pending attendance corrections
    const attendanceCorrections = await this.correctionRequestModel
      .find({ status: 'PENDING' })
      .populate('employeeId', 'firstName lastName')
      .exec();

    const config = await this.getPayrollClosureConfig();
    const escalationHours = config?.autoEscalationHours || 48;

    // Format the results
    const approvals = [
      ...overtimeRequests.map((req: any) => ({
        _id: req._id,
        type: 'OVERTIME' as const,
        employeeName: this.getEmployeeName(req.employeeId),
        submittedDate: req.createdAt,
        description: req.notes || 'Overtime request',
        status: req.status,
        escalated: false, // Would need escalation logic
        escalationDue: new Date((req.createdAt as Date).getTime() + escalationHours * 60 * 60 * 1000)
      })),
      ...timeExceptions.map((exc: any) => ({
        _id: exc._id,
        type: 'TIME_EXCEPTION' as const,
        employeeName: this.getEmployeeName(exc.employeeId),
        submittedDate: exc.createdAt,
        description: `${exc.type.replace('_', ' ')} - ${exc.notes || 'No description'}`,
        status: exc.status,
        escalated: false,
        escalationDue: new Date((exc.createdAt as Date).getTime() + escalationHours * 60 * 60 * 1000)
      })),
      ...attendanceCorrections.map((corr: any) => ({
        _id: corr._id,
        type: 'ATTENDANCE_CORRECTION' as const,
        employeeName: this.getEmployeeName(corr.employeeId),
        submittedDate: corr.createdAt,
        description: corr.reason || 'Attendance correction request',
        status: corr.status,
        escalated: false,
        escalationDue: new Date((corr.createdAt as Date).getTime() + escalationHours * 60 * 60 * 1000)
      }))
    ];

    return approvals;
  }

  async getPayrollValidationStatus(): Promise<any> {
    // Count various items that need validation
    const totalAttendanceRecords = await this.attendanceRecordModel.countDocuments().exec();
    const totalOvertimeRequests = await this.timeExceptionModel.countDocuments({ type: 'OVERTIME_REQUEST' }).exec();
    const totalTimeExceptions = await this.timeExceptionModel.countDocuments({
      type: { $in: ['MISSED_PUNCH', 'LATE', 'EARLY_LEAVE', 'SHORT_TIME'] }
    }).exec();
    const totalCorrectionRequests = await this.correctionRequestModel.countDocuments().exec();
    const totalShifts = await this.shiftAssignmentModel.countDocuments().exec();

    // Count resolved/validated items
    const validatedAttendanceRecords = await this.attendanceRecordModel.countDocuments({ status: 'APPROVED' }).exec();
    const processedOvertimeRequests = await this.timeExceptionModel.countDocuments({
      type: 'OVERTIME_REQUEST',
      status: { $in: ['APPROVED', 'REJECTED'] }
    }).exec();
    const resolvedTimeExceptions = await this.timeExceptionModel.countDocuments({
      type: { $in: ['MISSED_PUNCH', 'LATE', 'EARLY_LEAVE', 'SHORT_TIME'] },
      status: { $in: ['APPROVED', 'REJECTED', 'RESOLVED'] }
    }).exec();
    const appliedCorrections = await this.correctionRequestModel.countDocuments({
      status: { $in: ['APPROVED', 'REJECTED'] }
    }).exec();
    const confirmedShifts = await this.shiftAssignmentModel.countDocuments({ status: 'APPROVED' }).exec();

    const totalItems = totalAttendanceRecords + totalOvertimeRequests + totalTimeExceptions + totalCorrectionRequests + totalShifts;
    const validatedItems = validatedAttendanceRecords + processedOvertimeRequests + resolvedTimeExceptions + appliedCorrections + confirmedShifts;
    const pendingItemsCount = totalItems - validatedItems;

    return {
      attendanceValidated: validatedAttendanceRecords === totalAttendanceRecords,
      overtimeProcessed: processedOvertimeRequests === totalOvertimeRequests,
      correctionsApplied: appliedCorrections === totalCorrectionRequests,
      exceptionsResolved: resolvedTimeExceptions === totalTimeExceptions,
      shiftsConfirmed: confirmedShifts === totalShifts,
      pendingItemsCount,
      totalItems
    };
  }

  async forceEscalatePendingApprovals(): Promise<any> {
    // Update all pending items to escalated status
    // This would typically trigger notifications to higher-level approvers
    const updatedOvertime = await this.timeExceptionModel.updateMany(
      { type: 'OVERTIME_REQUEST', status: 'PENDING' },
      { status: 'ESCALATED' }
    ).exec();

    const updatedExceptions = await this.timeExceptionModel.updateMany(
      {
        type: { $in: ['MISSED_PUNCH', 'LATE', 'EARLY_LEAVE', 'SHORT_TIME'] },
        status: 'PENDING'
      },
      { status: 'ESCALATED' }
    ).exec();

    const updatedCorrections = await this.correctionRequestModel.updateMany(
      { status: 'PENDING' },
      { status: 'ESCALATED' }
    ).exec();

    return {
      success: true,
      escalatedCounts: {
        overtime: updatedOvertime.modifiedCount,
        exceptions: updatedExceptions.modifiedCount,
        corrections: updatedCorrections.modifiedCount
      }
    };
  }

  async generatePrePayrollReport(): Promise<any> {
    // Generate comprehensive report for pre-payroll closure
    const config = await this.getPayrollClosureConfig();
    const validationStatus = await this.getPayrollValidationStatus();
    const pendingApprovals = await this.getPendingPayrollApprovals();

    // Get summary statistics
    const attendanceSummary = await this.attendanceRecordModel.aggregate([
      {
        $group: {
          _id: null,
          totalRecords: { $sum: 1 },
          totalWorkMinutes: { $sum: '$totalWorkMinutes' },
          approvedRecords: { $sum: { $cond: [{ $eq: ['$status', 'APPROVED'] }, 1, 0] } }
        }
      }
    ]).exec();

    const overtimeSummary = await this.timeExceptionModel.aggregate([
      { $match: { type: 'OVERTIME_REQUEST' } },
      {
        $group: {
          _id: null,
          totalRequests: { $sum: 1 },
          approvedRequests: { $sum: { $cond: [{ $eq: ['$status', 'APPROVED'] }, 1, 0] } },
          pendingRequests: { $sum: { $cond: [{ $eq: ['$status', 'PENDING'] }, 1, 0] } }
        }
      }
    ]).exec();

    return {
      generatedAt: new Date(),
      payrollCycleEnd: config?.payrollCycleEnd,
      validationStatus,
      pendingApprovalsCount: pendingApprovals.length,
      summary: {
        attendance: attendanceSummary[0] || { totalRecords: 0, totalWorkMinutes: 0, approvedRecords: 0 },
        overtime: overtimeSummary[0] || { totalRequests: 0, approvedRequests: 0, pendingRequests: 0 }
      },
      checklistStatus: config?.closureChecklist || {},
      recommendations: this.generateRecommendations(validationStatus, pendingApprovals.length)
    };
  }

  private generateRecommendations(validationStatus: any, pendingCount: number): string[] {
    const recommendations: string[] = [];

    if (!validationStatus.attendanceValidated) {
      recommendations.push('Complete validation of all attendance records before payroll closure');
    }

    if (!validationStatus.overtimeProcessed) {
      recommendations.push('Process all pending overtime requests');
    }

    if (!validationStatus.exceptionsResolved) {
      recommendations.push('Resolve all time exceptions and discrepancies');
    }

    if (!validationStatus.correctionsApplied) {
      recommendations.push('Apply or reject all pending attendance corrections');
    }

    if (pendingCount > 0) {
      recommendations.push(`${pendingCount} approvals are still pending - consider escalating if approaching deadline`);
    }

    if (recommendations.length === 0) {
      recommendations.push('All validations complete - ready for payroll closure');
    }

    return recommendations;
  }

  // ========== EXCEPTION & APPROVAL WORKFLOW CONFIGURATION ==========
  async getApprovalWorkflows(): Promise<ApprovalWorkflowDocument[]> {
    return this.approvalWorkflowModel.find({ active: true }).sort({ createdAt: -1 }).exec();
  }

  async createApprovalWorkflow(data: CreateApprovalWorkflowDto): Promise<ApprovalWorkflowDocument> {
    // Ensure only one workflow per exception type
    await this.approvalWorkflowModel.updateMany(
      { exceptionType: data.exceptionType, active: true },
      { active: false }
    );

    const workflow = new this.approvalWorkflowModel({
      ...data,
      active: true
    });
    return workflow.save();
  }

  async updateApprovalWorkflow(id: string, data: UpdateApprovalWorkflowDto): Promise<ApprovalWorkflowDocument | null> {
    return this.approvalWorkflowModel.findByIdAndUpdate(
      id,
      {
        ...data,
        updatedAt: new Date()
      },
      { new: true }
    ).exec();
  }

  async deleteApprovalWorkflow(id: string): Promise<void> {
    await this.approvalWorkflowModel.findByIdAndDelete(id).exec();
  }

  async getApprovalWorkflowByType(exceptionType: string): Promise<ApprovalWorkflowDocument | null> {
    return this.approvalWorkflowModel.findOne({
      exceptionType,
      active: true
    }).exec();
  }

  // ============ DASHBOARD METRICS & ALERTS ============
  async getDashboardMetrics() {
    const today = new Date();
    const startOfToday = new Date(today.getFullYear(), today.getMonth(), today.getDate());
    const endOfToday = new Date(today.getFullYear(), today.getMonth(), today.getDate() + 1);

    // Get today's attendance records
    const todayRecords = await this.attendanceRecordModel.countDocuments({
      createdAt: { $gte: startOfToday, $lt: endOfToday }
    }).exec();

    // Get pending exceptions
    const pendingExceptions = await this.timeExceptionModel.countDocuments({
      status: TimeExceptionStatus.OPEN
    }).exec();

    // Get total employees (using shift assignments as proxy for active employees)
    const totalEmployees = await this.shiftAssignmentModel.distinct('employeeId').then(ids => ids.length);

    // Get today's clocked in employees
    const clockedInToday = await this.attendanceRecordModel.distinct('employeeId', {
      createdAt: { $gte: startOfToday, $lt: endOfToday },
      'punches.type': PunchType.IN
    }).exec();

    // Get on leave employees (this would need integration with leave management)
    const onLeaveToday = 0; // Placeholder

    return {
      totalEmployees,
      clockedInToday: clockedInToday.length,
      onLeaveToday,
      pendingExceptions,
      attendanceRecordsToday: todayRecords,
      attendanceRate: totalEmployees > 0 ? (clockedInToday.length / totalEmployees * 100).toFixed(1) : '0'
    };
  }

  async getShiftExpiryNotifications(daysAhead: number = 30) {
    const today = new Date();
    const futureDate = new Date(today.getTime() + daysAhead * 24 * 60 * 60 * 1000);

    const expiringAssignments = await this.shiftAssignmentModel
      .find({
        endDate: { $gte: today, $lte: futureDate },
        status: 'APPROVED'
      })
      .populate('employeeId', 'firstName lastName employeeNumber')
      .populate('shiftId', 'name startTime endTime')
      .populate('departmentId', 'name')
      .sort({ endDate: 1 })
      .exec();

    const notifications = expiringAssignments.map(assignment => ({
      id: assignment._id,
      employeeName: this.getEmployeeName(assignment.employeeId),
      employeeNumber: (assignment.employeeId as any)?.employeeNumber,
      shiftName: (assignment.shiftId as any)?.name || 'Unknown Shift',
      department: (assignment.departmentId as any)?.name || 'Unknown Department',
      endDate: assignment.endDate,
      daysUntilExpiry: assignment.endDate ? Math.ceil((assignment.endDate.getTime() - today.getTime()) / (1000 * 60 * 60 * 24)) : 0
    }));

    // Group by expiry timeframe
    const urgent = notifications.filter(n => n.daysUntilExpiry <= 7);
    const soon = notifications.filter(n => n.daysUntilExpiry > 7 && n.daysUntilExpiry <= 14);
    const upcoming = notifications.filter(n => n.daysUntilExpiry > 14);

    return {
      totalExpiring: notifications.length,
      urgentCount: urgent.length,
      soonCount: soon.length,
      upcomingCount: upcoming.length,
      notifications: {
        urgent,
        soon,
        upcoming
      },
      summary: {
        employeesAffected: new Set(notifications.map(n => n.employeeNumber)).size,
        departmentsAffected: new Set(notifications.map(n => n.department)).size
      }
    };
  }

  async getPendingApprovalsRequiringEscalation() {
    // Get current payroll closure config to determine escalation thresholds
    const closureConfig = await this.payrollClosureConfigModel.findOne({ isActive: true }).exec();

    const escalationThreshold = (closureConfig as any)?.autoEscalationHours || 48; // Default 48 hours
    const escalationThresholdMs = escalationThreshold * 60 * 60 * 1000;

    // Get pending exceptions that are past escalation threshold
    const thresholdDate = new Date(Date.now() - escalationThresholdMs);

    const pendingExceptions = await this.timeExceptionModel
      .find({
        status: TimeExceptionStatus.OPEN,
        createdAt: { $lt: thresholdDate }
      })
      .populate('employeeId', 'firstName lastName employeeNumber')
      .populate('assignedTo', 'firstName lastName employeeNumber')
      .sort({ createdAt: 1 })
      .exec();

    // Calculate days until payroll closure (if configured)
    let daysUntilClosure: number | null = null;
    if ((closureConfig as any)?.payrollCycleEnd) {
      const closureDate = new Date((closureConfig as any).payrollCycleEnd);
      daysUntilClosure = Math.max(0, Math.ceil((closureDate.getTime() - Date.now()) / (1000 * 60 * 60 * 24)));
    }

    return {
      totalPending: pendingExceptions.length,
      requiringEscalation: pendingExceptions.length,
      escalationThresholdHours: escalationThreshold,
      daysUntilPayrollClosure: daysUntilClosure,
      exceptions: pendingExceptions.map(exception => ({
        id: exception._id,
        employeeName: this.getEmployeeName(exception.employeeId),
        assignedTo: this.getEmployeeName(exception.assignedTo),
        type: exception.type,
        createdAt: (exception as any).createdAt,
        hoursPending: Math.floor((Date.now() - (exception as any).createdAt.getTime()) / (1000 * 60 * 60)),
        daysPending: Math.floor((Date.now() - (exception as any).createdAt.getTime()) / (1000 * 60 * 60 * 24))
      }))
    };
  }

  async getMissingPunchAlertsSummary() {
    const today = new Date();
    const startOfToday = new Date(today.getFullYear(), today.getMonth(), today.getDate());
    const endOfToday = new Date(today.getFullYear(), today.getMonth(), today.getDate() + 1);

    // Get all attendance records for today
    const todayRecords = await this.attendanceRecordModel
      .find({
        createdAt: { $gte: startOfToday, $lt: endOfToday }
      })
      .populate('employeeId', 'firstName lastName employeeNumber')
      .exec();

    // Get employees who should be working today (have shift assignments)
    const todayAssignments = await this.shiftAssignmentModel
      .find({
        $or: [
          { startDate: { $lte: today }, endDate: null },
          { startDate: { $lte: today }, endDate: { $gte: today } }
        ],
        status: 'APPROVED'
      })
      .populate('employeeId', 'firstName lastName employeeNumber')
      .populate('departmentId', 'name')
      .exec();

    const expectedEmployees = new Map();
    todayAssignments.forEach(assignment => {
      if (assignment.employeeId) {
        const employeeId = assignment.employeeId.toString();
        const employee = assignment.employeeId as any;
        expectedEmployees.set(employeeId, {
          id: employeeId,
          name: `${employee.firstName} ${employee.lastName}`,
          employeeNumber: employee.employeeNumber,
          department: (assignment.departmentId as any)?.name || 'Unknown'
        });
      }
    });

    // Find missing punches
    const missingPunches: any[] = [];
    for (const [employeeId, employee] of expectedEmployees) {
      const hasRecord = todayRecords.some(record =>
        record.employeeId?.toString() === employeeId
      );

      if (!hasRecord) {
        missingPunches.push(employee);
      }
    }

    // Group by department
    const byDepartment: Record<string, any[]> = missingPunches.reduce((acc: Record<string, any[]>, employee: any) => {
      const dept = employee.department;
      if (!acc[dept]) acc[dept] = [];
      acc[dept].push(employee);
      return acc;
    }, {});

    return {
      totalMissing: missingPunches.length,
      expectedEmployees: expectedEmployees.size,
      attendanceRate: expectedEmployees.size > 0 ?
        ((expectedEmployees.size - missingPunches.length) / expectedEmployees.size * 100).toFixed(1) : '0',
      byDepartment: Object.entries(byDepartment).map(([department, employees]) => ({
        department,
        count: employees.length,
        employees: employees.slice(0, 5), // Show first 5 employees
        totalAffected: employees.length
      })),
      topMissingDepartments: Object.entries(byDepartment)
        .sort(([,a]: [string, any[]], [,b]: [string, any[]]) => b.length - a.length)
        .slice(0, 3)
        .map(([department, employees]: [string, any[]]) => ({ department, count: employees.length }))
    };
  }

  async getSystemSyncStatusOverview() {
    // Get last payroll sync
    const lastPayrollSync = await this.syncLogModel
      .findOne({ system: SyncSystem.PAYROLL })
      .sort({ timestamp: -1 })
      .exec();

    // Get last leave sync
    const lastLeaveSync = await this.syncLogModel
      .findOne({ system: SyncSystem.LEAVE_MANAGEMENT })
      .sort({ timestamp: -1 })
      .exec();

    // Get integration configs
    const payrollConfig = await this.integrationConfigModel.findOne().exec();

    // Calculate sync health
    const getSyncHealth = (lastSync: any, frequency: string) => {
      if (!lastSync) return { status: 'NEVER_SYNCED', color: 'gray' };

      const now = Date.now();
      const lastSyncTime = lastSync.timestamp.getTime();

      let expectedInterval;
      switch (frequency) {
        case 'DAILY': expectedInterval = 24 * 60 * 60 * 1000; break;
        case 'WEEKLY': expectedInterval = 7 * 24 * 60 * 60 * 1000; break;
        case 'MONTHLY': expectedInterval = 30 * 24 * 60 * 60 * 1000; break;
        default: expectedInterval = 24 * 60 * 60 * 1000;
      }

      const timeSinceLastSync = now - lastSyncTime;
      const overdue = timeSinceLastSync > expectedInterval * 1.5; // 50% grace period

      if (lastSync.status === SyncStatus.ERROR) return { status: 'ERROR', color: 'red' };
      if (overdue) return { status: 'OVERDUE', color: 'yellow' };
      return { status: 'HEALTHY', color: 'green' };
    };

    const payrollHealth = getSyncHealth(lastPayrollSync, (payrollConfig as any)?.syncFrequency || 'DAILY');
    const leaveHealth = getSyncHealth(lastLeaveSync, (payrollConfig as any)?.syncFrequency || 'DAILY');

    return {
      payrollSync: {
        lastSync: lastPayrollSync?.timestamp || null,
        status: lastPayrollSync?.status || 'NEVER_SYNCED',
        recordsProcessed: lastPayrollSync?.recordsProcessed || 0,
        health: payrollHealth,
        frequency: (payrollConfig as any)?.syncFrequency || 'DAILY',
        autoSync: (payrollConfig as any)?.payrollEnabled || false
      },
      leaveSync: {
        lastSync: lastLeaveSync?.timestamp || null,
        status: lastLeaveSync?.status || 'NEVER_SYNCED',
        recordsProcessed: lastLeaveSync?.recordsProcessed || 0,
        health: leaveHealth,
        frequency: (payrollConfig as any)?.syncFrequency || 'DAILY',
        autoSync: (payrollConfig as any)?.leaveManagementEnabled || false
      },
      overallHealth: payrollHealth.color === 'green' && leaveHealth.color === 'green' ? 'green' :
                     payrollHealth.color === 'red' || leaveHealth.color === 'red' ? 'red' : 'yellow'
    };
  }

  async bulkRenewShifts(shiftIds: string[], newEndDate: Date) {
    const result = await this.shiftAssignmentModel
      .updateMany(
        { _id: { $in: shiftIds.map(id => new Types.ObjectId(id)) } },
        { $set: { endDate: newEndDate, updatedAt: new Date() } }
      )
      .exec();

    // Log the bulk renewal action
    await this.createSyncLog({
      system: SyncSystem.PAYROLL,
      operation: 'BULK_SHIFT_RENEWAL',
      status: SyncStatus.SUCCESS,
      recordsProcessed: result.modifiedCount,
      message: `Bulk renewed ${result.modifiedCount} shift assignments to ${newEndDate.toISOString().split('T')[0]}`,
      duration: 0,
      triggeredBy: 'SYSTEM',
      metadata: { shiftIds, newEndDate: newEndDate.toISOString() }
    });

    return {
      success: true,
      modifiedCount: result.modifiedCount,
      newEndDate,
      message: `Successfully renewed ${result.modifiedCount} shift assignments`
    };
  }
}
