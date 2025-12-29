import { Controller, Get, Post, Put, Delete, Patch, Body, Param, Query } from '@nestjs/common';
import { TimeManagementService } from './time-management.service';
import {
  CreateAttendanceRecordDto,
  UpdateAttendanceRecordDto,
  CreateAttendanceCorrectionRequestDto,
  UpdateAttendanceCorrectionRequestDto,
  CreateAttendanceRulesDto,
  UpdateAttendanceRulesDto,
  CreateFlexiblePunchConfigDto,
  UpdateFlexiblePunchConfigDto,
  CreateRestDayConfigDto,
  UpdateRestDayConfigDto,
  CreateSyncLogDto,
  UpdateIntegrationConfigDto,
  UpdatePayrollClosureConfigDto,
  CreateApprovalWorkflowDto,
  UpdateApprovalWorkflowDto,
  CreateOvertimeRuleDto,
  UpdateOvertimeRuleDto,
  CreateLatenessRuleDto,
  UpdateLatenessRuleDto,
  CreateHolidayDto,
  UpdateHolidayDto,
  CreateShiftDto,
  UpdateShiftDto,
  CreateShiftAssignmentDto,
  UpdateShiftAssignmentDto,
  CreateShiftTypeDto,
  UpdateShiftTypeDto,
  CreateScheduleRuleDto,
  UpdateScheduleRuleDto,
  CreateTimeExceptionDto,
  UpdateTimeExceptionDto,
  CreateNotificationLogDto,
  UpdateNotificationLogDto,
  AttendanceRecordQueryDto,
  CorrectionRequestQueryDto,
  TimeExceptionQueryDto,
  ShiftAssignmentQueryDto,
  HolidayQueryDto,
  NotificationLogQueryDto,
  CheckAvailabilityDto,
  ScheduleInterviewDto,
  UpdateInterviewScheduleDto,
} from './dto';
import { ShiftAssignment } from './models/shift-assignment.schema';

@Controller('time-management')
export class TimeManagementController {
  constructor(private readonly timeManagementService: TimeManagementService) {}

  // ========== Attendance Records ==========
  @Post('attendance-records')
  async createAttendanceRecord(@Body() data: CreateAttendanceRecordDto) {
    return this.timeManagementService.createAttendanceRecord(data);
  }

  @Get('attendance-records')
  async findAllAttendanceRecords(@Query() query: AttendanceRecordQueryDto) {
    return this.timeManagementService.findAllAttendanceRecords(query);
  }

  @Get('attendance-records/:id')
  async findAttendanceRecordById(@Param('id') id: string) {
    return this.timeManagementService.findAttendanceRecordById(id);
  }

  @Put('attendance-records/:id')
  async updateAttendanceRecord(@Param('id') id: string, @Body() data: UpdateAttendanceRecordDto) {
    return this.timeManagementService.updateAttendanceRecord(id, data);
  }

  @Delete('attendance-records/:id')
  async deleteAttendanceRecord(@Param('id') id: string) {
    await this.timeManagementService.deleteAttendanceRecord(id);
    return { message: 'Attendance record deleted successfully' };
  }

  // Clock In/Out Operations
  @Post('attendance-records/clock-in')
  async clockIn(@Body() data: { employeeId: string; [key: string]: any }) {
    return this.timeManagementService.clockIn(data.employeeId, data);
  }

  @Post('attendance-records/clock-out')
  async clockOut(@Body() data: { employeeId: string; [key: string]: any }) {
    return this.timeManagementService.clockOut(data.employeeId, data);
  }

  // ========== Attendance Correction Requests ==========
  @Post('correction-requests')
  async createCorrectionRequest(@Body() data: CreateAttendanceCorrectionRequestDto) {
    return this.timeManagementService.createCorrectionRequest(data);
  }

  @Get('correction-requests')
  async findAllCorrectionRequests(@Query() query: CorrectionRequestQueryDto) {
    return this.timeManagementService.findAllCorrectionRequests(query);
  }

  @Get('correction-requests/:id')
  async findCorrectionRequestById(@Param('id') id: string) {
    return this.timeManagementService.findCorrectionRequestById(id);
  }

  @Put('correction-requests/:id')
  async updateCorrectionRequest(@Param('id') id: string, @Body() data: UpdateAttendanceCorrectionRequestDto) {
    return this.timeManagementService.updateCorrectionRequest(id, data);
  }

  @Delete('correction-requests/:id')
  async deleteCorrectionRequest(@Param('id') id: string) {
    await this.timeManagementService.deleteCorrectionRequest(id);
    return { message: 'Correction request deleted successfully' };
  }

  // ========== Overtime Rules ==========
  @Post('overtime-rules')
  async createOvertimeRule(@Body() data: CreateOvertimeRuleDto) {
    return this.timeManagementService.createOvertimeRule(data);
  }

  @Get('overtime-rules')
  async findAllOvertimeRules(@Query() query: any) {
    return this.timeManagementService.findAllOvertimeRules(query);
  }

  @Get('overtime-rules/:id')
  async findOvertimeRuleById(@Param('id') id: string) {
    return this.timeManagementService.findOvertimeRuleById(id);
  }

  @Put('overtime-rules/:id')
  async updateOvertimeRule(@Param('id') id: string, @Body() data: UpdateOvertimeRuleDto) {
    return this.timeManagementService.updateOvertimeRule(id, data);
  }

  @Delete('overtime-rules/:id')
  async deleteOvertimeRule(@Param('id') id: string) {
    await this.timeManagementService.deleteOvertimeRule(id);
    return { message: 'Overtime rule deleted successfully' };
  }

  // ========== Lateness Rules ==========
  @Post('lateness-rules')
  async createLatenessRule(@Body() data: CreateLatenessRuleDto) {
    return this.timeManagementService.createLatenessRule(data);
  }

  @Get('lateness-rules')
  async findAllLatenessRules(@Query() query: any) {
    return this.timeManagementService.findAllLatenessRules(query);
  }

  @Get('lateness-rules/:id')
  async findLatenessRuleById(@Param('id') id: string) {
    return this.timeManagementService.findLatenessRuleById(id);
  }

  @Put('lateness-rules/:id')
  async updateLatenessRule(@Param('id') id: string, @Body() data: UpdateLatenessRuleDto) {
    return this.timeManagementService.updateLatenessRule(id, data);
  }

  @Delete('lateness-rules/:id')
  async deleteLatenessRule(@Param('id') id: string) {
    await this.timeManagementService.deleteLatenessRule(id);
    return { message: 'Lateness rule deleted successfully' };
  }

  // ========== Holidays ==========
  @Post('holidays')
  async createHoliday(@Body() data: CreateHolidayDto) {
    return this.timeManagementService.createHoliday(data);
  }

  @Get('holidays')
  async findAllHolidays(@Query() query: HolidayQueryDto) {
    return this.timeManagementService.findAllHolidays(query);
  }

  @Get('holidays/:id')
  async findHolidayById(@Param('id') id: string) {
    return this.timeManagementService.findHolidayById(id);
  }

  @Put('holidays/:id')
  async updateHoliday(@Param('id') id: string, @Body() data: UpdateHolidayDto) {
    return this.timeManagementService.updateHoliday(id, data);
  }

  @Delete('holidays/:id')
  async deleteHoliday(@Param('id') id: string) {
    await this.timeManagementService.deleteHoliday(id);
    return { message: 'Holiday deleted successfully' };
  }

  @Post('holidays/sync-national')
  async syncNationalCalendar() {
    return this.timeManagementService.syncNationalCalendar();
  }

  // ========== Shifts ==========
  @Post('shifts')
  async createShift(@Body() data: CreateShiftDto) {
    return this.timeManagementService.createShift(data);
  }

  @Get('shifts')
  async findAllShifts(@Query() query: any) {
    return this.timeManagementService.findAllShifts(query);
  }

  @Get('shifts/:id')
  async findShiftById(@Param('id') id: string) {
    return this.timeManagementService.findShiftById(id);
  }

  @Put('shifts/:id')
  async updateShift(@Param('id') id: string, @Body() data: UpdateShiftDto) {
    return this.timeManagementService.updateShift(id, data);
  }

  @Delete('shifts/:id')
  async deleteShift(@Param('id') id: string) {
    await this.timeManagementService.deleteShift(id);
    return { message: 'Shift deleted successfully' };
  }

  // ========== Shift Assignments ==========
  @Post('shift-assignments')
  async createShiftAssignment(@Body() data: CreateShiftAssignmentDto) {
    return this.timeManagementService.createShiftAssignment(data);
  }

  @Get('shift-assignments')
  async findAllShiftAssignments(@Query() query: ShiftAssignmentQueryDto) {
    return this.timeManagementService.findAllShiftAssignments(query);
  }

  @Get('shift-assignments/:id')
  async findShiftAssignmentById(@Param('id') id: string) {
    return this.timeManagementService.findShiftAssignmentById(id);
  }

  @Put('shift-assignments/:id')
  async updateShiftAssignment(@Param('id') id: string, @Body() data: UpdateShiftAssignmentDto) {
    return this.timeManagementService.updateShiftAssignment(id, data);
  }

  @Delete('shift-assignments/:id')
  async deleteShiftAssignment(@Param('id') id: string) {
    await this.timeManagementService.deleteShiftAssignment(id);
    return { message: 'Shift assignment deleted successfully' };
  }

  // Bulk Shift Assignment
  @Post('shift-assignments/bulk-assign')
  async bulkAssignShifts(@Body() data: { assignments: Partial<ShiftAssignment>[] }) {
    console.log('Backend: Received bulk assignment request:', data);
    if (!data.assignments || !Array.isArray(data.assignments)) {
      throw new Error('Invalid request: assignments array is required');
    }
    if (data.assignments.length === 0) {
      throw new Error('Invalid request: assignments array cannot be empty');
    }
    return this.timeManagementService.bulkAssignShifts(data.assignments);
  }

  @Post('shift-assignments/bulk-preview')
  async previewBulkAssignment(@Body() data: { departmentId?: string; positionId?: string; shiftId: string; startDate: string; endDate?: string }) {
    console.log('Backend: Received bulk assignment preview request:', data);
    if (!data.shiftId) {
      throw new Error('Shift ID is required');
    }
    if (!data.startDate) {
      throw new Error('Start date is required');
    }
    if (!data.departmentId && !data.positionId) {
      throw new Error('Either department ID or position ID is required');
    }
    return this.timeManagementService.previewBulkAssignment(data);
  }

  // ========== Shift Types ==========
  @Post('shift-types')
  async createShiftType(@Body() data: CreateShiftTypeDto) {
    return this.timeManagementService.createShiftType(data);
  }

  @Get('shift-types')
  async findAllShiftTypes(@Query() query: any) {
    return this.timeManagementService.findAllShiftTypes(query);
  }

  @Get('shift-types/:id')
  async findShiftTypeById(@Param('id') id: string) {
    return this.timeManagementService.findShiftTypeById(id);
  }

  @Put('shift-types/:id')
  async updateShiftType(@Param('id') id: string, @Body() data: UpdateShiftTypeDto) {
    return this.timeManagementService.updateShiftType(id, data);
  }

  @Delete('shift-types/:id')
  async deleteShiftType(@Param('id') id: string) {
    await this.timeManagementService.deleteShiftType(id);
    return { message: 'Shift type deleted successfully' };
  }

  // ========== Schedule Rules ==========
  @Post('schedule-rules')
  async createScheduleRule(@Body() data: CreateScheduleRuleDto) {
    return this.timeManagementService.createScheduleRule(data);
  }

  @Get('schedule-rules')
  async findAllScheduleRules(@Query() query: any) {
    return this.timeManagementService.findAllScheduleRules(query);
  }

  @Get('schedule-rules/:id')
  async findScheduleRuleById(@Param('id') id: string) {
    return this.timeManagementService.findScheduleRuleById(id);
  }

  @Put('schedule-rules/:id')
  async updateScheduleRule(@Param('id') id: string, @Body() data: UpdateScheduleRuleDto) {
    return this.timeManagementService.updateScheduleRule(id, data);
  }

  @Delete('schedule-rules/:id')
  async deleteScheduleRule(@Param('id') id: string) {
    await this.timeManagementService.deleteScheduleRule(id);
    return { message: 'Schedule rule deleted successfully' };
  }

  // ========== Time Exceptions ==========
  @Post('time-exceptions')
  async createTimeException(@Body() data: CreateTimeExceptionDto) {
    return this.timeManagementService.createTimeException(data);
  }

  @Get('time-exceptions')
  async findAllTimeExceptions(@Query() query: TimeExceptionQueryDto) {
    return this.timeManagementService.findAllTimeExceptions(query);
  }

  @Get('time-exceptions/:id')
  async findTimeExceptionById(@Param('id') id: string) {
    return this.timeManagementService.findTimeExceptionById(id);
  }

  @Put('time-exceptions/:id')
  async updateTimeException(@Param('id') id: string, @Body() data: UpdateTimeExceptionDto) {
    return this.timeManagementService.updateTimeException(id, data);
  }

  @Delete('time-exceptions/:id')
  async deleteTimeException(@Param('id') id: string) {
    await this.timeManagementService.deleteTimeException(id);
    return { message: 'Time exception deleted successfully' };
  }

  // Exception Approval/Rejection
  @Patch('time-exceptions/:id/approve')
  async approveTimeException(@Param('id') id: string) {
    return this.timeManagementService.approveTimeException(id);
  }

  @Patch('time-exceptions/:id/reject')
  async rejectTimeException(@Param('id') id: string, @Body() data?: { reason?: string }) {
    return this.timeManagementService.rejectTimeException(id, data?.reason);
  }

  // ========== Notification Logs ==========
  @Post('notification-logs')
  async createNotificationLog(@Body() data: CreateNotificationLogDto) {
    return this.timeManagementService.createNotificationLog(data);
  }

  @Get('notification-logs')
  async findAllNotificationLogs(@Query() query: NotificationLogQueryDto) {
    return this.timeManagementService.findAllNotificationLogs(query);
  }

  @Get('notification-logs/:id')
  async findNotificationLogById(@Param('id') id: string) {
    return this.timeManagementService.findNotificationLogById(id);
  }

  @Put('notification-logs/:id')
  async updateNotificationLog(@Param('id') id: string, @Body() data: UpdateNotificationLogDto) {
    return this.timeManagementService.updateNotificationLog(id, data);
  }

  @Delete('notification-logs/:id')
  async deleteNotificationLog(@Param('id') id: string) {
    await this.timeManagementService.deleteNotificationLog(id);
    return { message: 'Notification log deleted successfully' };
  }

  // Mark Notification as Read
  @Patch('notification-logs/:id/mark-read')
  async markNotificationAsRead(@Param('id') id: string) {
    return this.timeManagementService.markNotificationAsRead(id);
  }

  // ========== Interview Scheduling (REC-010, REC-021) ==========
  @Post('interview-scheduling/check-availability')
  async checkPanelAvailability(@Body() data: CheckAvailabilityDto) {
    // This endpoint checks panel member availability for interview scheduling
    // Implementation would check shift assignments, existing interviews, and schedule rules
    return this.timeManagementService.checkPanelAvailability(data);
  }

  @Post('interview-scheduling/schedule')
  async scheduleInterview(@Body() data: ScheduleInterviewDto) {
    // This endpoint schedules an interview and sends calendar invites
    // Implementation would integrate with recruitment module and notification system
    return this.timeManagementService.scheduleInterview(data);
  }

  @Put('interview-scheduling/:interviewId')
  async updateInterviewSchedule(@Param('interviewId') interviewId: string, @Body() data: UpdateInterviewScheduleDto) {
    // This endpoint updates an existing interview schedule
    return this.timeManagementService.updateInterviewSchedule(interviewId, data);
  }

  // ========== Payroll Integration ==========
  @Post('payroll/sync')
  async syncWithPayroll(@Body() data: { periodId: string; attendanceData: any[] }) {
    return this.timeManagementService.syncWithPayroll(data.periodId, data.attendanceData);
  }

  @Get('payroll/sync/pending')
  async getPendingPayrollSync() {
    return this.timeManagementService.getPendingPayrollSync();
  }

  @Post('payroll/validate-attendance')
  async validateAttendanceForPayroll(@Body() data: { startDate: string; endDate: string }) {
    return this.timeManagementService.validateAttendanceForPayroll(data.startDate, data.endDate);
  }

  // ========== ATTENDANCE RULES ==========
  @Get('attendance-rules')
  async getAttendanceRules() {
    return this.timeManagementService.getAttendanceRules();
  }

  @Put('attendance-rules')
  async updateAttendanceRules(@Body() data: UpdateAttendanceRulesDto) {
    return this.timeManagementService.updateAttendanceRules(data);
  }

  // ========== FLEXIBLE PUNCH CONFIGURATION ==========
  @Get('flexible-punch-config')
  async getFlexiblePunchConfig() {
    return this.timeManagementService.getFlexiblePunchConfig();
  }

  @Put('flexible-punch-config')
  async updateFlexiblePunchConfig(@Body() data: UpdateFlexiblePunchConfigDto) {
    return this.timeManagementService.updateFlexiblePunchConfig(data);
  }

  // ========== REST DAY CONFIGURATIONS ==========
  @Get('rest-day-configurations')
  async getRestDayConfigurations() {
    return this.timeManagementService.getRestDayConfigurations();
  }

  @Post('rest-day-configurations')
  async createRestDayConfiguration(@Body() data: CreateRestDayConfigDto) {
    const processedData = {
      ...data,
      effectiveFrom: data.effectiveFrom ? new Date(data.effectiveFrom) : new Date()
    };
    return this.timeManagementService.createRestDayConfiguration(processedData);
  }

  @Put('rest-day-configurations/:id')
  async updateRestDayConfiguration(@Param('id') id: string, @Body() data: UpdateRestDayConfigDto) {
    return this.timeManagementService.updateRestDayConfiguration(id, data);
  }

  @Put('rest-day-configurations/default')
  async updateDefaultRestDays(@Body() data: UpdateRestDayConfigDto) {
    return this.timeManagementService.updateDefaultRestDays(data);
  }

  @Delete('rest-day-configurations/:id')
  async deleteRestDayConfiguration(@Param('id') id: string) {
    await this.timeManagementService.deleteRestDayConfiguration(id);
    return { message: 'Rest day configuration deleted successfully' };
  }

  // ========== SYSTEM INTEGRATION & SYNCHRONIZATION ==========
  @Get('integration/payroll/status')
  async getPayrollSyncStatus() {
    return this.timeManagementService.getPayrollSyncStatus();
  }

  @Get('integration/leave/status')
  async getLeaveSyncStatus() {
    return this.timeManagementService.getLeaveSyncStatus();
  }

  @Post('integration/payroll/sync-now')
  async syncWithPayrollNow() {
    return this.timeManagementService.syncWithPayrollNow();
  }

  @Post('integration/leave/sync-now')
  async syncWithLeaveManagementNow() {
    return this.timeManagementService.syncWithLeaveManagementNow();
  }

  @Get('integration/sync-logs')
  async getSyncLogs(@Query('limit') limit?: string) {
    const limitNum = limit ? parseInt(limit) : 50;
    return this.timeManagementService.getSyncLogs(limitNum);
  }

  @Post('integration/sync-logs/:logId/retry')
  async retryFailedSync(@Param('logId') logId: string) {
    return this.timeManagementService.retryFailedSync(logId);
  }

  @Get('integration/config')
  async getIntegrationConfig() {
    return this.timeManagementService.getIntegrationConfig();
  }

  @Put('integration/config')
  async updateIntegrationConfig(@Body() config: UpdateIntegrationConfigDto) {
    return this.timeManagementService.updateIntegrationConfig(config);
  }

  // ========== PRE-PAYROLL CLOSURE AUTOMATION ==========
  @Get('payroll-closure/config')
  async getPayrollClosureConfig() {
    return this.timeManagementService.getPayrollClosureConfig();
  }

  @Put('payroll-closure/config')
  async updatePayrollClosureConfig(@Body() config: UpdatePayrollClosureConfigDto) {
    const processedConfig = {
      ...config,
      payrollCycleEnd: config.payrollCycleEnd ? new Date(config.payrollCycleEnd) : undefined,
      closureChecklist: config.closureChecklist ? {
        ...config.closureChecklist,
        attendanceValidated: config.closureChecklist.attendanceValidated ?? false,
        overtimeProcessed: config.closureChecklist.overtimeProcessed ?? false,
        exceptionsResolved: config.closureChecklist.exceptionsResolved ?? false,
        correctionsApplied: config.closureChecklist.correctionsApplied ?? false,
        shiftsConfirmed: config.closureChecklist.shiftsConfirmed ?? false
      } : undefined
    };
    return this.timeManagementService.updatePayrollClosureConfig(processedConfig);
  }

  @Get('payroll-closure/pending-approvals')
  async getPendingPayrollApprovals() {
    return this.timeManagementService.getPendingPayrollApprovals();
  }

  @Get('payroll-closure/validation-status')
  async getPayrollValidationStatus() {
    return this.timeManagementService.getPayrollValidationStatus();
  }

  @Post('payroll-closure/force-escalate')
  async forceEscalatePendingApprovals() {
    return this.timeManagementService.forceEscalatePendingApprovals();
  }

  @Post('payroll-closure/generate-report')
  async generatePrePayrollReport() {
    return this.timeManagementService.generatePrePayrollReport();
  }

  // ========== EXCEPTION & APPROVAL WORKFLOW CONFIGURATION ==========
  @Get('approval-workflows')
  async getApprovalWorkflows() {
    return this.timeManagementService.getApprovalWorkflows();
  }

  @Post('approval-workflows')
  async createApprovalWorkflow(@Body() data: CreateApprovalWorkflowDto) {
    const processedData = {
      ...data,
      autoApproveConditions: data.autoApproveConditions ? {
        ...data.autoApproveConditions,
        enabled: data.autoApproveConditions.enabled ?? false
      } : { enabled: false },
      notifications: data.notifications ? {
        email: data.notifications.email ?? true,
        inApp: data.notifications.inApp ?? true,
        sms: data.notifications.sms ?? false,
        notifyOnSubmission: data.notifications.notifyOnSubmission ?? true,
        notifyOnApproval: data.notifications.notifyOnApproval ?? true,
        notifyOnRejection: data.notifications.notifyOnRejection ?? true,
        notifyOnEscalation: data.notifications.notifyOnEscalation ?? true
      } : undefined
    };
    return this.timeManagementService.createApprovalWorkflow(processedData);
  }

  @Put('approval-workflows/:id')
  async updateApprovalWorkflow(@Param('id') id: string, @Body() data: UpdateApprovalWorkflowDto) {
    return this.timeManagementService.updateApprovalWorkflow(id, data);
  }

  @Delete('approval-workflows/:id')
  async deleteApprovalWorkflow(@Param('id') id: string) {
    await this.timeManagementService.deleteApprovalWorkflow(id);
    return { message: 'Approval workflow deleted successfully' };
  }

  @Get('approval-workflows/type/:exceptionType')
  async getApprovalWorkflowByType(@Param('exceptionType') exceptionType: string) {
    return this.timeManagementService.getApprovalWorkflowByType(exceptionType);
  }

  // ============ DASHBOARD METRICS & ALERTS ============
  @Get('dashboard/metrics')
  async getDashboardMetrics() {
    return this.timeManagementService.getDashboardMetrics();
  }

  @Get('dashboard/shift-expiry-notifications')
  async getShiftExpiryNotifications(@Query('daysAhead') daysAhead: string = '30') {
    return this.timeManagementService.getShiftExpiryNotifications(parseInt(daysAhead));
  }

  @Get('dashboard/pending-approvals-escalation')
  async getPendingApprovalsRequiringEscalation() {
    return this.timeManagementService.getPendingApprovalsRequiringEscalation();
  }

  @Get('dashboard/missing-punch-alerts')
  async getMissingPunchAlertsSummary() {
    return this.timeManagementService.getMissingPunchAlertsSummary();
  }

  @Get('dashboard/sync-status-overview')
  async getSystemSyncStatusOverview() {
    return this.timeManagementService.getSystemSyncStatusOverview();
  }

  @Post('dashboard/bulk-renew-shifts')
  async bulkRenewShifts(@Body() body: { shiftIds: string[]; newEndDate: string }) {
    return this.timeManagementService.bulkRenewShifts(body.shiftIds, new Date(body.newEndDate));
  }
}
