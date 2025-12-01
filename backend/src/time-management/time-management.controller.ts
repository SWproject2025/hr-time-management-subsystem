import { Controller, Get, Post, Put, Delete, Body, Param, Query } from '@nestjs/common';
import { TimeManagementService } from './time-management.service';
import {
  CreateAttendanceRecordDto,
  UpdateAttendanceRecordDto,
  CreateAttendanceCorrectionRequestDto,
  UpdateAttendanceCorrectionRequestDto,
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
}
