import {
  Controller,
  Get,
  Post,
  Put,
  Patch,
  Delete,
  Body,
  Param,
  Query,
  UseGuards,
  HttpCode,
  HttpStatus,
} from '@nestjs/common';
import { LeavesService } from './leaves.service';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { RolesGuard } from '../Common/Gaurds/roles.gaurd';
import { Roles } from '../Common/Decorators/roles.decorator';
import { CurrentUser } from '../Common/Decorators/current-user.decorator';
import type { CurrentUserData } from '../Common/Decorators/current-user.decorator';
import { SystemRole } from '../employee-profile/enums/employee-profile.enums';
import {
  CreateLeaveRequestDto,
  UpdateLeaveRequestDto,
  ApproveLeaveRequestDto,
  RejectLeaveRequestDto,
  LeaveBalanceQueryDto,
} from './dto/leave-request.dto';
import { LeaveStatus } from './enums/leave-status.enum';

import { PatternDetectionService } from './services/pattern-detection.service';

@Controller('leaves')
@UseGuards(JwtAuthGuard, RolesGuard)
export class LeavesController {
  constructor(
    private readonly leavesService: LeavesService,
    private readonly patternDetectionService: PatternDetectionService
  ) {}

  // ==================== EMPLOYEE ENDPOINTS ====================

  /**
   * Create a new leave request
   * REQ-015: Employee submits leave request
   */
  @Post('requests')
  @Roles(SystemRole.DEPARTMENT_EMPLOYEE)
  @HttpCode(HttpStatus.CREATED)
  async createLeaveRequest(
    @CurrentUser() user: CurrentUserData,
    @Body() createDto: CreateLeaveRequestDto,
  ) {
    return this.leavesService.createLeaveRequest(user.employeeProfileId, createDto);
  }

  /**
   * Get employee's leave requests
   * REQ-020: View leave request status
   */
  @Get('requests/my-requests')
  @Roles(SystemRole.DEPARTMENT_EMPLOYEE)
  async getMyLeaveRequests(
    @CurrentUser() user: CurrentUserData,
    @Query('status') status?: LeaveStatus,
    @Query('page') page?: string,
    @Query('limit') limit?: string,
  ) {
    return this.leavesService.getEmployeeLeaveRequests(user.employeeProfileId, {
      status,
      page: page ? parseInt(page, 10) : 1,
      limit: limit ? parseInt(limit, 10) : 10,
    });
  }

  /**
   * Get employee's leave balance
   * REQ-003: View leave balance
   */
  @Get('balance')
  @Roles(SystemRole.DEPARTMENT_EMPLOYEE)
  async getMyLeaveBalance(
    @CurrentUser() user: CurrentUserData,
    @Query() query: LeaveBalanceQueryDto,
  ) {
    return this.leavesService.getEmployeeLeaveBalance(
      user.employeeProfileId,
      query.leaveTypeId,
    );
  }

  /**
   * Get specific leave request details
   * REQ-020: View leave request details
   */
  @Get('requests/:requestId')
  @Roles(SystemRole.DEPARTMENT_EMPLOYEE)
  async getLeaveRequestDetails(
    @CurrentUser() user: CurrentUserData,
    @Param('requestId') requestId: string,
  ) {
    // This would need authorization check to ensure employee can only view their own requests
    const requests = await this.leavesService.getEmployeeLeaveRequests(
      user.employeeProfileId,
      { page: 1, limit: 1000 },
    );
    const request = requests.requests.find((r: any) => r._id.toString() === requestId);
    
    if (!request) {
      throw new Error('Leave request not found');
    }
    
    return request;
  }

  /**
   * Cancel leave request
   * REQ-019: Cancel leave request
   */
  @Patch('requests/:requestId/cancel')
  @Roles(SystemRole.DEPARTMENT_EMPLOYEE)
  async cancelLeaveRequest(
    @CurrentUser() user: CurrentUserData,
    @Param('requestId') requestId: string,
  ) {
    return this.leavesService.cancelLeaveRequest(user.employeeProfileId, requestId);
  }

  /**
   * Modify leave request (before approval)
   * REQ-018: Modify pending leave request
   */
  @Put('requests/:requestId')
  @Roles(SystemRole.DEPARTMENT_EMPLOYEE)
  async updateLeaveRequest(
    @CurrentUser() user: CurrentUserData,
    @Param('requestId') requestId: string,
    @Body() updateDto: UpdateLeaveRequestDto,
  ) {
    // First cancel the old request 
    await this.leavesService.cancelLeaveRequest(user.employeeProfileId, requestId);
    
    // Create new request with updated details
    const createDto: CreateLeaveRequestDto = {
      leaveTypeId: updateDto.leaveTypeId || '', // Would need to get from original request
      fromDate: updateDto.fromDate || '',
      toDate: updateDto.toDate || '',
      justification: updateDto.justification || '',
      attachmentId: updateDto.attachmentId,
    };
    
    return this.leavesService.createLeaveRequest(user.employeeProfileId, createDto);
  }

  // ==================== MANAGER ENDPOINTS ====================

  /**
   * Get pending leave requests for approval (as line manager)
   * REQ-020: Manager views pending requests
   */
  @Get('requests/pending-approval')
  @Roles(SystemRole.DEPARTMENT_HEAD, SystemRole.HR_ADMIN, SystemRole.HR_MANAGER)
  async getPendingLeaveRequests(
    @CurrentUser() user: CurrentUserData,
    @Query('page') page?: string,
    @Query('limit') limit?: string,
  ) {
    return this.leavesService.getPendingLeaveRequests(user.employeeProfileId, {
      page: page ? parseInt(page, 10) : 1,
      limit: limit ? parseInt(limit, 10) : 10,
    });
  }

  /**
   * Approve leave request (as line manager)
   * REQ-021: Manager approves leave request
   */
  @Post('requests/:requestId/approve')
  @Roles(SystemRole.DEPARTMENT_HEAD, SystemRole.HR_ADMIN, SystemRole.HR_MANAGER)
  async approveLeaveRequestByManager(
    @CurrentUser() user: CurrentUserData,
    @Param('requestId') requestId: string,
    @Body() approveDto: ApproveLeaveRequestDto,
  ) {
    return this.leavesService.approveLeaveRequestByManager(
      requestId,
      user.employeeProfileId,
      approveDto,
    );
  }

  /**
   * Reject leave request (as line manager)
   * REQ-022: Manager rejects leave request
   */
  @Post('requests/:requestId/reject')
  @Roles(SystemRole.DEPARTMENT_HEAD, SystemRole.HR_ADMIN, SystemRole.HR_MANAGER)
  async rejectLeaveRequestByManager(
    @CurrentUser() user: CurrentUserData,
    @Param('requestId') requestId: string,
    @Body() rejectDto: RejectLeaveRequestDto,
  ) {
    return this.leavesService.rejectLeaveRequestByManager(
      requestId,
      user.employeeProfileId,
      rejectDto,
    );
  }

  /**
   * Delegate approval to another manager
   * REQ-023: Delegate leave approval
   */
  @Post('requests/:requestId/delegate')
  @Roles(SystemRole.DEPARTMENT_HEAD)
  async delegateLeaveApproval(
    @CurrentUser() user: CurrentUserData,
    @Param('requestId') requestId: string,
    @Body('delegateToManagerId') delegateToManagerId: string,
  ) {
    return this.leavesService.delegateLeaveApproval(
      requestId,
      user.employeeProfileId,
      delegateToManagerId,
    );
  }

  /**
   * Set delegation (REQ-023)
   */
  @Post('delegation')
  @Roles(SystemRole.DEPARTMENT_HEAD)
  async setDelegation(
    @CurrentUser() user: CurrentUserData,
    @Body('delegateId') delegateId: string,
    @Body('startDate') startDate: Date,
    @Body('endDate') endDate: Date,
    @Body('reason') reason?: string,
  ) {
    return this.leavesService.setDelegation(
        user.employeeProfileId,
        delegateId,
        startDate,
        endDate,
        reason
    );
  }

  /**
   * Get active delegations
   */
  @Get('delegation/active')
  @Roles(SystemRole.DEPARTMENT_HEAD)
  async getActiveDelegations(@CurrentUser() user: CurrentUserData) {
      return this.leavesService.getActiveDelegations(user.employeeProfileId);
  }

  // ==================== HR ADMIN ENDPOINTS ====================

  /**
   * Get all leave requests for HR review
   * REQ-025: HR Admin views all requests
   */
  @Get('admin/requests')
  @Roles(SystemRole.HR_ADMIN, SystemRole.HR_MANAGER)
  async getAllLeaveRequestsForHR(
    @Query('status') status?: LeaveStatus,
    @Query('page') page?: string,
    @Query('limit') limit?: string,
  ) {
    return this.leavesService.getAllLeaveRequestsForHR({
      status,
      page: page ? parseInt(page, 10) : 1,
      limit: limit ? parseInt(limit, 10) : 10,
    });
  }

  /**
   * Final approval by HR Admin
   * REQ-025: HR Admin approves leave request
   */
  @Post('admin/requests/:requestId/approve')
  @Roles(SystemRole.HR_ADMIN, SystemRole.HR_MANAGER)
  async approveLeaveRequestByHR(
    @CurrentUser() user: CurrentUserData,
    @Param('requestId') requestId: string,
    @Body() approveDto: ApproveLeaveRequestDto,
  ) {
    return this.leavesService.approveLeaveRequestByHR(
      requestId,
      user.employeeProfileId,
      approveDto,
    );
  }

  /**
   * Override manager rejection
   * REQ-026: HR Admin overrides manager decision
   */
  @Post('admin/requests/:requestId/override')
  @Roles(SystemRole.HR_ADMIN, SystemRole.HR_MANAGER)
  async overrideLeaveRequestByHR(
    @CurrentUser() user: CurrentUserData,
    @Param('requestId') requestId: string,
    @Body() approveDto: ApproveLeaveRequestDto,
  ) {
    return this.leavesService.overrideLeaveRequestByHR(
      requestId,
      user.employeeProfileId,
      approveDto,
    );
  }

  /**
   * Validate and approve attached documents
   * REQ-028: HR validates supporting documents
   */
  @Post('admin/requests/:requestId/validate-documents')
  @Roles(SystemRole.HR_ADMIN, SystemRole.HR_MANAGER)
  async validateLeaveDocuments(
    @CurrentUser() user: CurrentUserData,
    @Param('requestId') requestId: string,
    @Body('isValid') isValid: boolean,
    @Body('comments') comments?: string,
  ) {
    // Implementation would validate the attached documents
    return {
      message: 'Document validation completed',
      requestId,
      isValid,
      comments,
    };
  }

  /**
   * Create manual leave adjustment
   * REQ-013: HR creates manual adjustment
   */
  @Post('admin/adjustments')
  @Roles(SystemRole.HR_ADMIN, SystemRole.HR_MANAGER)
  async createLeaveAdjustment(
    @CurrentUser() user: CurrentUserData,
    @Body('employeeId') employeeId: string,
    @Body('leaveTypeId') leaveTypeId: string,
    @Body('adjustmentType') adjustmentType: string,
    @Body('amount') amount: number,
    @Body('reason') reason: string,
  ) {
    return this.leavesService.createLeaveAdjustment(
      employeeId,
      leaveTypeId,
      adjustmentType,
      amount,
      reason,
      user.employeeProfileId,
    );
  }

  /**
   * Get employee leave balance (for HR)
   * REQ-003: HR views employee balance
   */
  @Get('admin/employees/:employeeId/balance')
  @Roles(SystemRole.HR_ADMIN, SystemRole.HR_MANAGER)
  async getEmployeeLeaveBalanceForHR(
    @Param('employeeId') employeeId: string,
    @Query() query: LeaveBalanceQueryDto,
  ) {
    return this.leavesService.getEmployeeLeaveBalance(employeeId, query.leaveTypeId);
  }

  /**
   * Process leave accrual manually
   * REQ-040: Process accrual
   */
  @Post('admin/accrual/process')
  @Roles(SystemRole.HR_ADMIN, SystemRole.HR_MANAGER)
  async processLeaveAccrual(
    @Body('employeeId') employeeId: string,
    @Body('leaveTypeId') leaveTypeId: string,
  ) {
    await this.leavesService.processLeaveAccrual(employeeId, leaveTypeId);
    return { message: 'Leave accrual processed successfully' };
  }

  /**
   * Process year-end carry forward
   * REQ-041: Year-end processing
   */
  @Post('admin/year-end/process')
  @Roles(SystemRole.HR_ADMIN, SystemRole.HR_MANAGER)
  async processYearEndCarryForward(
    @Body('employeeId') employeeId: string,
    @Body('leaveTypeId') leaveTypeId: string,
  ) {
    await this.leavesService.processYearEndCarryForward(employeeId, leaveTypeId);
    return { message: 'Year-end carry forward processed successfully' };
  }

  // ==================== LEAVE POLICY ENDPOINTS ====================

  /**
   * Get all leave types
   * REQ-006: View leave types
   */
  @Get('types')
  @Roles(SystemRole.DEPARTMENT_EMPLOYEE)
  async getAllLeaveTypes() {
    const leaveTypes = await this.leavesService.getAllLeaveTypes();
    return {
      message: 'Leave types retrieved successfully',
      leaveTypes,
    };
  }

  /**
   * Create leave type (HR Admin only)
   * REQ-006: Create leave type
   */
  @Post('admin/types')
  @Roles(SystemRole.HR_ADMIN, SystemRole.HR_MANAGER)
  async createLeaveType(
    @Body('code') code: string,
    @Body('name') name: string,
    @Body('categoryId') categoryId: string,
    @Body('description') description?: string,
    @Body('paid') paid?: boolean,
    @Body('deductible') deductible?: boolean,
  ) {
    const leaveType = await this.leavesService.createLeaveType({
      code,
      name,
      categoryId,
      description,
      paid,
      deductible,
    });
    return {
      message: 'Leave type created successfully',
      leaveType,
    };
  }

  /**
   * Get all leave policies
   */
  @Get('admin/policies')
  @Roles(SystemRole.HR_ADMIN, SystemRole.HR_MANAGER)
  async getLeavePolicies() {
      return this.leavesService.getLeavePolicies();
  }

  /**
   * Configure leave policy
   * REQ-007: Configure entitlement rules
   */
  @Post('admin/policies')
  @Roles(SystemRole.HR_ADMIN, SystemRole.HR_MANAGER)
  async createLeavePolicy(
    @Body('leaveTypeId') leaveTypeId: string,
    @Body('accrualMethod') accrualMethod: string,
    @Body('monthlyRate') monthlyRate?: number,
    @Body('yearlyRate') yearlyRate?: number,
    @Body('carryForwardAllowed') carryForwardAllowed?: boolean,
    @Body('maxCarryForward') maxCarryForward?: number,
  ) {
    return this.leavesService.createLeavePolicy({
      leaveTypeId,
      accrualMethod,
      monthlyRate,
      yearlyRate,
      carryForwardAllowed,
      maxCarryForward,
    });
  }

  /**
   * Set up organizational calendar
   * REQ-010: Configure holidays and blocked days
   */
  @Post('admin/calendar')
  @Roles(SystemRole.HR_ADMIN, SystemRole.HR_MANAGER, SystemRole.SYSTEM_ADMIN)
  async configureCalendar(
    @Body('year') year: number,
    @Body('holidays') holidays: any[],
    @Body('blockedPeriods') blockedPeriods?: any[],
  ) {
    // Add each holiday to the calendar
    const results: Array<{ date: string; status: string; reason?: string }> = [];
    for (const holiday of holidays || []) {
      try {
        await this.leavesService.addHoliday(year, {
          date: holiday.date,
          name: holiday.name,
          description: holiday.description,
        });
        results.push({ date: holiday.date, status: 'added' });
      } catch (error) {
        results.push({ date: holiday.date, status: 'skipped', reason: error.message });
      }
    }

    return {
      message: 'Calendar configured successfully',
      year,
      holidaysProcessed: results,
    };
  }

  // ==================== DASHBOARD & STATISTICS ====================

  /**
   * Get HR Dashboard Statistics
   * Provides real-time stats for HR admin dashboard
   */
  @Get('admin/dashboard/stats')
  @Roles(SystemRole.HR_ADMIN, SystemRole.HR_MANAGER)
  async getDashboardStats() {
    return this.leavesService.getDashboardStats();
  }

  /**
   * Get Team Leave Calendar (for Managers)
   * Shows team members' leave schedule
   */
  @Get('team-calendar')
  @Roles(SystemRole.DEPARTMENT_HEAD, SystemRole.HR_ADMIN, SystemRole.HR_MANAGER)
  async getTeamLeaveCalendar(
    @CurrentUser() user: CurrentUserData,
    @Query('startDate') startDate: string,
    @Query('endDate') endDate: string,
  ) {
    const start = new Date(startDate || new Date());
    const end = new Date(endDate || new Date(Date.now() + 30 * 24 * 60 * 60 * 1000)); // Default 30 days
    return this.leavesService.getTeamLeaveCalendar(user.employeeProfileId, start, end);
  }

  // ==================== ANALYTICS ENDPOINTS ====================

  /**
   * Get irregular leave patterns for an employee
   * Used by managers to flag irregular leave patterns
   */
  @Get('admin/analytics/patterns/:employeeId')
  @Roles(SystemRole.HR_ADMIN, SystemRole.HR_MANAGER, SystemRole.DEPARTMENT_HEAD)
  async getLeavePatterns(
    @Param('employeeId') employeeId: string,
  ) {
    return this.patternDetectionService.getPatterns(employeeId);
  }

  /**
   * Acknowledge irregular leave pattern
   */
  @Patch('admin/analytics/patterns/:patternId/acknowledge')
  @Roles(SystemRole.HR_ADMIN, SystemRole.HR_MANAGER, SystemRole.DEPARTMENT_HEAD)
  async acknowledgeLeavePattern(
    @CurrentUser() user: CurrentUserData,
    @Param('patternId') patternId: string,
  ) {
    return this.patternDetectionService.acknowledgePattern(patternId, user.employeeProfileId);
  }

  // ==================== CALENDAR ENDPOINTS ====================

  /**
   * Get calendar for a specific year
   */
  @Get('admin/calendar/:year')
  @Roles(SystemRole.HR_ADMIN, SystemRole.HR_MANAGER, SystemRole.SYSTEM_ADMIN)
  async getCalendarByYear(@Param('year') year: string) {
    return this.leavesService.getCalendarByYear(parseInt(year, 10));
  }

  /**
   * Add holiday to calendar
   */
  @Post('admin/calendar/:year/holidays')
  @Roles(SystemRole.HR_ADMIN, SystemRole.HR_MANAGER, SystemRole.SYSTEM_ADMIN)
  async addHoliday(
    @Param('year') year: string,
    @Body() holiday: { date: string; name: string; description?: string },
  ) {
    return this.leavesService.addHoliday(parseInt(year, 10), holiday);
  }

  /**
   * Delete holiday from calendar
   */
  @Delete('admin/calendar/:year/holidays/:date')
  @Roles(SystemRole.HR_ADMIN, SystemRole.HR_MANAGER, SystemRole.SYSTEM_ADMIN)
  async deleteHoliday(
    @Param('year') year: string,
    @Param('date') date: string,
  ) {
    return this.leavesService.deleteHoliday(parseInt(year, 10), date);
  }

  // ==================== LEAVE TYPE MANAGEMENT ====================

  /**
   * Update leave type
   */
  @Put('admin/types/:id')
  @Roles(SystemRole.HR_ADMIN, SystemRole.HR_MANAGER)
  async updateLeaveType(
    @Param('id') id: string,
    @Body() updateData: any,
  ) {
    const leaveType = await this.leavesService.updateLeaveType(id, updateData);
    return {
      message: 'Leave type updated successfully',
      leaveType,
    };
  }

  // ==================== ADJUSTMENTS ====================

  /**
   * Get all adjustments with pagination
   */
  @Get('admin/adjustments')
  @Roles(SystemRole.HR_ADMIN, SystemRole.HR_MANAGER)
  async getAdjustments(
    @Query('page') page?: string,
    @Query('limit') limit?: string,
  ) {
    return this.leavesService.getAdjustments({
      page: page ? parseInt(page, 10) : 1,
      limit: limit ? parseInt(limit, 10) : 20,
    });
  }

  // ==================== TEAM CONFLICT CHECK ====================

  /**
   * Check team scheduling conflicts
   */
  @Post('check-team-conflict')
  @Roles(SystemRole.DEPARTMENT_EMPLOYEE)
  async checkTeamConflict(
    @CurrentUser() user: CurrentUserData,
    @Body('fromDate') fromDate: string,
    @Body('toDate') toDate: string,
  ) {
    return this.leavesService.checkTeamConflict(
      user.employeeProfileId,
      new Date(fromDate),
      new Date(toDate),
    );
  }

  // ==================== OFFBOARDING & SETTLEMENT ====================

  /**
   * Calculate final leave settlement for terminating employee
   * OFF-013: Final settlement during offboarding
   * BR 52, BR 53: Encashment calculation
   */
  @Get('admin/settlement/:employeeId')
  @Roles(SystemRole.HR_ADMIN, SystemRole.HR_MANAGER)
  async calculateFinalSettlement(
    @Param('employeeId') employeeId: string,
    @Query('dailySalaryRate') dailySalaryRate: string,
  ) {
    return this.leavesService.calculateFinalSettlement(
      employeeId,
      parseFloat(dailySalaryRate) || 0,
    );
  }

  /**
   * Process final settlement (zero out balances after encashment)
   * OFF-013: Complete leave settlement during offboarding
   */
  @Post('admin/settlement/:employeeId/process')
  @Roles(SystemRole.HR_ADMIN, SystemRole.HR_MANAGER)
  async processFinalSettlement(
    @Param('employeeId') employeeId: string,
    @Body('dailySalaryRate') dailySalaryRate: number,
  ) {
    // First calculate the settlement
    const settlement = await this.leavesService.calculateFinalSettlement(
      employeeId,
      dailySalaryRate,
    );

    // Then zero out the balances
    await this.leavesService.processFinalSettlement(employeeId);

    return {
      message: 'Final settlement processed successfully',
      settlement,
    };
  }

  /**
   * Generate settlement report for documentation
   * OFF-013: Generate settlement documentation
   */
  @Get('admin/settlement/:employeeId/report')
  @Roles(SystemRole.HR_ADMIN, SystemRole.HR_MANAGER)
  async generateSettlementReport(
    @Param('employeeId') employeeId: string,
    @Query('dailySalaryRate') dailySalaryRate: string,
  ) {
    return {
      report: await this.leavesService.generateSettlementReport(
        employeeId,
        parseFloat(dailySalaryRate) || 0,
      ),
    };
  }
}