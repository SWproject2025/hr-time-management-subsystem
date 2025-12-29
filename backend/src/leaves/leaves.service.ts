import {
  Injectable,
  NotFoundException,
  BadRequestException,
  ForbiddenException,
  Inject,
  forwardRef,
} from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import {
  LeaveRequest,
  LeaveRequestDocument,
} from './models/leave-request.schema'; // Ensure this file exists and is correctly exported
// If the file does not exist, create it or correct the import path.
import { LeaveType, LeaveTypeDocument } from './models/leave-type.schema';
import {
  LeaveEntitlement,
  LeaveEntitlementDocument,
} from './models/leave-entitlement.schema';
import { LeavePolicy, LeavePolicyDocument } from './models/leave-policy.schema';
import {
  LeaveAdjustment,
  LeaveAdjustmentDocument,
} from './models/leave-adjustment.schema';
import { Calendar, CalendarDocument } from './models/calendar.schema';
import { LeaveDelegation, LeaveDelegationDocument } from './models/leave-delegation.schema';
import { LeaveStatus } from './enums/leave-status.enum'; // Adjusted path to the correct location
import { AccrualMethod } from './enums/accrual-method.enum'; // Adjust the path if necessary
import {
  CreateLeaveRequestDto,
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  UpdateLeaveRequestDto,
  ApproveLeaveRequestDto,
  RejectLeaveRequestDto,
} from './dto/leave-request.dto';
import { EmailService } from '../Common/email/email.service';
import { IntegrationService } from './services/integration.service';
import { EmployeeProfileService } from '../employee-profile/employee-profile.service';
import { EmployeeStatus } from '../employee-profile/enums/employee-profile.enums';
import { LeaveSettlementService } from './services/leave-settlement.service';

@Injectable()
export class LeavesService {
  constructor(
    @InjectModel(LeaveRequest.name)
    private leaveRequestModel: Model<LeaveRequestDocument>,
    @InjectModel(LeaveType.name)
    private leaveTypeModel: Model<LeaveTypeDocument>,
    @InjectModel(LeaveEntitlement.name)
    private leaveEntitlementModel: Model<LeaveEntitlementDocument>,
    @InjectModel(LeavePolicy.name)
    private leavePolicyModel: Model<LeavePolicyDocument>,
    @InjectModel(LeaveAdjustment.name)
    private leaveAdjustmentModel: Model<LeaveAdjustmentDocument>,
    @InjectModel(LeaveDelegation.name)
    private leaveDelegationModel: Model<LeaveDelegationDocument>,
    @InjectModel(Calendar.name)
    private calendarModel: Model<CalendarDocument>,
    private emailService: EmailService,
    private integrationService: IntegrationService,
    @Inject(forwardRef(() => EmployeeProfileService))
    private readonly employeeProfileService: EmployeeProfileService,
    private readonly leaveSettlementService: LeaveSettlementService,
  ) {}

  // ==================== EMPLOYEE SERVICES ====================

  /**
   * Create leave request (REQ-015)
   * Sends email notification to manager
   */
  async createLeaveRequest(employeeId: string, createDto: CreateLeaveRequestDto) {
    // Validate leave type
    const leaveType = await this.leaveTypeModel.findById(createDto.leaveTypeId);
    if (!leaveType) {
      throw new NotFoundException('Leave type not found');
    }

    // Calculate duration
    const fromDate = new Date(createDto.fromDate);
    const toDate = new Date(createDto.toDate);
    const durationDays = await this.calculateLeaveDuration(fromDate, toDate);

    if (durationDays <= 0) {
      throw new BadRequestException('Invalid date range');
    }

    // Check eligibility (BR 8)
    await this.checkLeaveEligibility(employeeId, createDto.leaveTypeId);

    // Check balance (BR 31)
    const entitlement = await this.leaveEntitlementModel.findOne({
      employeeId: new Types.ObjectId(employeeId),
      leaveTypeId: new Types.ObjectId(createDto.leaveTypeId),
    });

    if (!entitlement) {
      throw new BadRequestException('No leave entitlement found for this leave type');
    }

    // Check if sufficient balance
    const availableBalance = entitlement.remaining - entitlement.pending;
    if (durationDays > availableBalance) {
      throw new BadRequestException(
        `Insufficient leave balance. Available: ${availableBalance} days, Requested: ${durationDays} days`
      );
    }

    // Check for overlapping leave requests (BR 28)
    await this.checkOverlappingLeaves(employeeId, fromDate, toDate);

    // Create leave request
    const leaveRequest = new this.leaveRequestModel({
      employeeId: new Types.ObjectId(employeeId),
      leaveTypeId: new Types.ObjectId(createDto.leaveTypeId),
      dates: { from: fromDate, to: toDate },
      durationDays,
      justification: createDto.justification,
      attachmentId: createDto.attachmentId ? new Types.ObjectId(createDto.attachmentId) : undefined,
      status: LeaveStatus.PENDING,
      approvalFlow: [
        {
          role: 'line_manager',
          status: LeaveStatus.PENDING,
        },
      ],
    });

    const savedRequest = await leaveRequest.save();

    // Update pending balance
    entitlement.pending += durationDays;
    await entitlement.save();

    // Send email notification to manager (REQ-029)
    try {
      const populatedRequest = await savedRequest.populate([
        { path: 'leaveTypeId', select: 'code name' },
        { path: 'employeeId', select: 'employeeNumber firstName lastName workEmail' },
      ]);

      // Get manager email from organization structure
      let managerEmail = await this.integrationService.getManagerEmail(employeeId);
      
      // Fallback if no manager found found (e.g. CEO or data issue)
      if (!managerEmail) {
        console.warn(`No manager found for employee ${employeeId}, using default admin email`);
        managerEmail = 'admin@company.com'; 
      }
      
      await this.emailService.sendLeaveRequestNotification(
        managerEmail,
        `${(populatedRequest.employeeId as any).firstName} ${(populatedRequest.employeeId as any).lastName}`,
        (populatedRequest.leaveTypeId as any).name,
        fromDate.toLocaleDateString(),
        toDate.toLocaleDateString(),
        savedRequest._id.toString(),
      );
    } catch (emailError) {
      console.error('Failed to send email notification:', emailError);
      // Don't fail the request if email fails
    }

    return savedRequest.populate([
      { path: 'leaveTypeId', select: 'code name' },
      { path: 'employeeId', select: 'employeeNumber firstName lastName' },
    ]);
  }

  /**
   * Get leave requests for employee (REQ-020)
   */
  async getEmployeeLeaveRequests(employeeId: string, filters?: { status?: LeaveStatus; page?: number; limit?: number }) {
    const { status, page = 1, limit = 10 } = filters || {};
    const query: any = { employeeId: new Types.ObjectId(employeeId) };

    if (status) {
      query.status = status;
    }

    const skip = (page - 1) * limit;

    const [requests, total] = await Promise.all([
      this.leaveRequestModel
        .find(query)
        .populate('leaveTypeId', 'code name')
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit)
        .lean(),
      this.leaveRequestModel.countDocuments(query),
    ]);

    return {
      requests,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    };
  }

  /**
   * Get leave balance for employee (REQ-003)
   */
  async getEmployeeLeaveBalance(employeeId: string, leaveTypeId?: string) {
    const query: any = { employeeId: new Types.ObjectId(employeeId) };
    if (leaveTypeId) {
      query.leaveTypeId = new Types.ObjectId(leaveTypeId);
    }

    const entitlements = await this.leaveEntitlementModel
      .find(query)
      .populate('leaveTypeId', 'code name paid deductible')
      .lean();

    return entitlements.map((ent) => ({
      leaveType: ent.leaveTypeId,
      yearlyEntitlement: ent.yearlyEntitlement,
      accruedActual: ent.accruedActual,
      accruedRounded: ent.accruedRounded,
      carryForward: ent.carryForward,
      taken: ent.taken,
      pending: ent.pending,
      remaining: ent.remaining,
      lastAccrualDate: ent.lastAccrualDate,
      nextResetDate: ent.nextResetDate,
    }));
  }

  /**
   * Cancel leave request (REQ-019)
   */
  async cancelLeaveRequest(employeeId: string, requestId: string) {
    const request = await this.leaveRequestModel.findById(requestId);
    if (!request) {
      throw new NotFoundException('Leave request not found');
    }

    if (request.employeeId.toString() !== employeeId) {
      throw new ForbiddenException('You can only cancel your own leave requests');
    }

    if (request.status !== LeaveStatus.PENDING) {
      throw new BadRequestException(`Cannot cancel leave request with status: ${request.status}`);
    }

    // Update request status
    request.status = LeaveStatus.CANCELLED;
    await request.save();

    // Update pending balance
    const entitlement = await this.leaveEntitlementModel.findOne({
      employeeId: new Types.ObjectId(employeeId),
      leaveTypeId: request.leaveTypeId,
    });

    if (entitlement) {
      entitlement.pending -= request.durationDays;
      await entitlement.save();
    }

    return request;
  }

  // ==================== MANAGER SERVICES ====================

  /**
   * Get pending leave requests for approval (REQ-020)
   */
  async getPendingLeaveRequests(managerId: string, filters?: { page?: number; limit?: number }) {
    const { page = 1, limit = 10 } = filters || {};

    // 1. Get Direct Reports
    const directReports = await this.integrationService.getDirectReports(managerId);
    let targetEmployeeIds = new Set(directReports);

    // 2. Get Delegated Reports (Where I am the delegate)
    const today = new Date();
    const activeDelegationsToMe = await this.leaveDelegationModel.find({
        delegateId: new Types.ObjectId(managerId),
        isActive: true,
        startDate: { $lte: today },
        endDate: { $gte: today }
    });

    for (const delegation of activeDelegationsToMe) {
        const delegatedReports = await this.integrationService.getDirectReports(delegation.managerId.toString());
        delegatedReports.forEach(id => targetEmployeeIds.add(id));
    }

    const employeeIdsArray = Array.from(targetEmployeeIds).map(id => new Types.ObjectId(id));
    
    if (employeeIdsArray.length === 0) {
        return {
            requests: [],
            pagination: { page, limit, total: 0, totalPages: 0 }
        };
    }

    // 3. Query Requests
    const query = {
      employeeId: { $in: employeeIdsArray },
      status: LeaveStatus.PENDING,
      'approvalFlow.role': 'line_manager',
      'approvalFlow.status': LeaveStatus.PENDING,
    };

    const skip = (page - 1) * limit;

    const [requests, total] = await Promise.all([
      this.leaveRequestModel
        .find(query)
        .populate('leaveTypeId', 'code name')
        .populate('employeeId', 'employeeNumber firstName lastName')
        .sort({ createdAt: 1 })
        .skip(skip)
        .limit(limit)
        .lean(),
      this.leaveRequestModel.countDocuments(query),
    ]);

    return {
      requests,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    };
  }

  /**
   * Set delegation for manager (REQ-023)
   */
  async setDelegation(managerId: string, delegateId: string, startDate: Date, endDate: Date, reason?: string) {
      // Validate dates
      if (startDate > endDate) {
          throw new BadRequestException('Start date must be before end date');
      }

      // Deactivate existing conflicting delegations?
      // For now, allow multiple, but typically one active.

      const delegation = new this.leaveDelegationModel({
          managerId: new Types.ObjectId(managerId),
          delegateId: new Types.ObjectId(delegateId),
          startDate,
          endDate,
          reason,
          isActive: true
      });

      return delegation.save();
  }

  /**
   * Create or update leave policy (REQ-007)
   */
  async createLeavePolicy(data: {
    leaveTypeId: string;
    accrualMethod: string;
    monthlyRate?: number;
    yearlyRate?: number;
    carryForwardAllowed?: boolean;
    maxCarryForward?: number;
    eligibility?: any;
  }) {
    // Check if policy exists
    let policy = await this.leavePolicyModel.findOne({
      leaveTypeId: new Types.ObjectId(data.leaveTypeId),
    });

    if (policy) {
      // Update
      policy.accrualMethod = data.accrualMethod as AccrualMethod;
      policy.monthlyRate = data.monthlyRate ?? 0;
      policy.yearlyRate = data.yearlyRate ?? 0;
      policy.carryForwardAllowed = data.carryForwardAllowed ?? false;
      policy.maxCarryForward = data.maxCarryForward ?? 0;
      if (data.eligibility) policy.eligibility = data.eligibility;
      return policy.save();
    } else {
      // Create
      policy = new this.leavePolicyModel({
        leaveTypeId: new Types.ObjectId(data.leaveTypeId),
        accrualMethod: data.accrualMethod,
        monthlyRate: data.monthlyRate ?? 0,
        yearlyRate: data.yearlyRate ?? 0,
        carryForwardAllowed: data.carryForwardAllowed ?? false,
        maxCarryForward: data.maxCarryForward ?? 0,
        eligibility: data.eligibility,
      });
      return policy.save();
    }
  }

  /**
   * Get active delegations for a manager
   */
  async getActiveDelegations(managerId: string) {
      return this.leaveDelegationModel.find({
          managerId: new Types.ObjectId(managerId),
          isActive: true
      }).populate('delegateId', 'firstName lastName employeeNumber');
  }

  /**
   * Get all leave policies (for Admin)
   */
  async getLeavePolicies() {
      return this.leavePolicyModel.find().populate('leaveTypeId', 'code name').lean();
  }

  /**
   * Approve leave request by manager (REQ-021)
   */
  async approveLeaveRequestByManager(requestId: string, managerId: string, approveDto: ApproveLeaveRequestDto) {
    const request = await this.leaveRequestModel.findById(requestId);
    if (!request) {
      throw new NotFoundException('Leave request not found');
    }

    if (request.status !== LeaveStatus.PENDING) {
      throw new BadRequestException(`Cannot approve request with status: ${request.status}`);
    }

    // Update approval flow
    const managerApproval = request.approvalFlow.find((flow) => flow.role === 'line_manager');
    if (managerApproval) {
      managerApproval.status = LeaveStatus.APPROVED;
      managerApproval.decidedBy = new Types.ObjectId(managerId);
      managerApproval.decidedAt = new Date();
    }

    // Add HR approval step
    request.approvalFlow.push({
      role: 'hr_admin',
      status: LeaveStatus.PENDING,
    });

    await request.save();

    // Note: Email to employee will be sent after HR final approval
    return request.populate([
      { path: 'leaveTypeId', select: 'code name' },
      { path: 'employeeId', select: 'employeeNumber firstName lastName' },
    ]);
  }

  /**
   * Reject leave request by manager (REQ-022)
   * Sends rejection email to employee
   */
  async rejectLeaveRequestByManager(requestId: string, managerId: string, rejectDto: RejectLeaveRequestDto) {
    const request = await this.leaveRequestModel.findById(requestId);
    if (!request) {
      throw new NotFoundException('Leave request not found');
    }

    if (request.status !== LeaveStatus.PENDING) {
      throw new BadRequestException(`Cannot reject request with status: ${request.status}`);
    }

    // Update status
    request.status = LeaveStatus.REJECTED;

    // Update approval flow
    const managerApproval = request.approvalFlow.find((flow) => flow.role === 'line_manager');
    if (managerApproval) {
      managerApproval.status = LeaveStatus.REJECTED;
      managerApproval.decidedBy = new Types.ObjectId(managerId);
      managerApproval.decidedAt = new Date();
    }

    await request.save();

    // Update pending balance
    const entitlement = await this.leaveEntitlementModel.findOne({
      employeeId: request.employeeId,
      leaveTypeId: request.leaveTypeId,
    });

    if (entitlement) {
      entitlement.pending -= request.durationDays;
      await entitlement.save();
    }

    // Send rejection email to employee (REQ-030)
    try {
      const populatedRequest = await request.populate([
        { path: 'leaveTypeId', select: 'code name' },
        { path: 'employeeId', select: 'employeeNumber firstName lastName workEmail' },
      ]);

      await this.emailService.sendLeaveRejectedNotification(
        (populatedRequest.employeeId as any).workEmail,
        (populatedRequest.leaveTypeId as any).name,
        request.dates.from.toLocaleDateString(),
        request.dates.to.toLocaleDateString(),
        rejectDto.reason,
      );
    } catch (emailError) {
      console.error('Failed to send rejection email:', emailError);
    }

    return request;
  }

  // ==================== HR ADMIN SERVICES ====================

  /**
   * Get all leave requests for HR review (REQ-025)
   */
  async getAllLeaveRequestsForHR(filters?: { status?: LeaveStatus; page?: number; limit?: number }) {
    const { status, page = 1, limit = 10 } = filters || {};
    const query: any = {};

    if (status) {
      query.status = status;
    } else {
      // Default to requests needing HR approval
      query['approvalFlow.role'] = 'hr_admin';
      query['approvalFlow.status'] = LeaveStatus.PENDING;
    }

    const skip = (page - 1) * limit;

    const [requests, total] = await Promise.all([
      this.leaveRequestModel
        .find(query)
        .populate('leaveTypeId', 'code name')
        .populate('employeeId', 'employeeNumber firstName lastName')
        .sort({ createdAt: 1 })
        .skip(skip)
        .limit(limit)
        .lean(),
      this.leaveRequestModel.countDocuments(query),
    ]);

    return {
      requests,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    };
  }

  /**
   * Final approval by HR Admin (REQ-025)
   */
  async approveLeaveRequestByHR(requestId: string, hrAdminId: string, approveDto: ApproveLeaveRequestDto) {
    const request = await this.leaveRequestModel.findById(requestId);
    if (!request) {
      throw new NotFoundException('Leave request not found');
    }

    // Check if manager approved
    const managerApproval = request.approvalFlow.find((flow) => flow.role === 'line_manager');
    if (!managerApproval || managerApproval.status !== LeaveStatus.APPROVED) {
      throw new BadRequestException('Leave request must be approved by manager first');
    }

    // Update approval flow
    const hrApproval = request.approvalFlow.find((flow) => flow.role === 'hr_admin');
    if (hrApproval) {
      hrApproval.status = LeaveStatus.APPROVED;
      hrApproval.decidedBy = new Types.ObjectId(hrAdminId);
      hrApproval.decidedAt = new Date();
    }

    // Final approval
    request.status = LeaveStatus.APPROVED;
    await request.save();

    // Update leave balance (REQ-029)
    const entitlement = await this.leaveEntitlementModel.findOne({
      employeeId: request.employeeId,
      leaveTypeId: request.leaveTypeId,
    });

    if (entitlement) {
      entitlement.pending -= request.durationDays;
      entitlement.taken += request.durationDays;
      entitlement.remaining = entitlement.accruedRounded + entitlement.carryForward - entitlement.taken;
      await entitlement.save();
    }

    // Send final approval email to employee (REQ-030)
    try {
      const populatedRequest = await request.populate([
        { path: 'leaveTypeId', select: 'code name' },
        { path: 'employeeId', select: 'employeeNumber firstName lastName workEmail' },
      ]);

      await this.emailService.sendLeaveApprovedNotification(
        (populatedRequest.employeeId as any).workEmail,
        (populatedRequest.leaveTypeId as any).name,
        request.dates.from.toLocaleDateString(),
        request.dates.to.toLocaleDateString(),
      );
    } catch (emailError) {
      console.error('Failed to send approval email:', emailError);
    }

    // Sync with Time Management module (REQ-042)
    try {
      await this.syncLeaveToTimeManagement(request);
    } catch (error) {
      console.error('Failed to sync with Time Management:', error);
      // Don't fail the approval if sync fails - can be retried
    }

    // Sync with Payroll module (REQ-042)
    try {
      await this.syncLeaveToPayroll(request);
    } catch (error) {
      console.error('Failed to sync with Payroll:', error);
      // Don't fail the approval if sync fails - can be retried
    }

    return request.populate([
      { path: 'leaveTypeId', select: 'code name' },
      { path: 'employeeId', select: 'employeeNumber firstName lastName' },
    ]);
  }

  /**
   * Override rejection by HR Admin (REQ-026)
   */
  async overrideLeaveRequestByHR(requestId: string, hrAdminId: string, approveDto: ApproveLeaveRequestDto) {
    const request = await this.leaveRequestModel.findById(requestId);
    if (!request) {
      throw new NotFoundException('Leave request not found');
    }

    // HR can override manager rejection
    request.status = LeaveStatus.APPROVED;

    // Update all approval flows to approved
    request.approvalFlow.forEach((flow) => {
      flow.status = LeaveStatus.APPROVED;
      if (flow.role === 'hr_admin') {
        flow.decidedBy = new Types.ObjectId(hrAdminId);
        flow.decidedAt = new Date();
      }
    });

    await request.save();

    // Update leave balance
    const entitlement = await this.leaveEntitlementModel.findOne({
      employeeId: request.employeeId,
      leaveTypeId: request.leaveTypeId,
    });

    if (entitlement) {
      entitlement.pending -= request.durationDays;
      entitlement.taken += request.durationDays;
      entitlement.remaining = entitlement.accruedRounded + entitlement.carryForward - entitlement.taken;
      await entitlement.save();
    }

    return request;
  }

  /**
   * Delegate leave approval to another manager (REQ-023)
   */
  async delegateLeaveApproval(
    requestId: string,
    fromManagerId: string,
    toManagerId: string,
  ) {
    const request = await this.leaveRequestModel.findById(requestId);
    if (!request) {
      throw new NotFoundException('Leave request not found');
    }

    if (request.status !== LeaveStatus.PENDING) {
      throw new BadRequestException(`Cannot delegate request with status: ${request.status}`);
    }

    // Update the delegatedBy field
    request.delegatedBy = new Types.ObjectId(toManagerId);
    await request.save();

    // Send notification to delegated manager
    try {
      const populatedRequest = await request.populate([
        { path: 'leaveTypeId', select: 'code name' },
        { path: 'employeeId', select: 'employeeNumber firstName lastName workEmail' },
      ]);

      // Get delegated manager email from organization structure
      const delegateEmail = await this.integrationService.getManagerEmail(toManagerId) || 'hr@company.com';
      
      await this.emailService.sendDelegationNotification(
        delegateEmail,
        `${(populatedRequest.employeeId as any).firstName} ${(populatedRequest.employeeId as any).lastName}`,
        (populatedRequest.leaveTypeId as any).name,
        request.dates.from.toLocaleDateString(),
        request.dates.to.toLocaleDateString(),
        requestId,
      );
    } catch (error) {
      console.error('Failed to send delegation notification:', error);
    }

    return request;
  }

  /**
   * Create manual leave adjustment (REQ-013)
   */
  async createLeaveAdjustment(
    employeeId: string,
    leaveTypeId: string,
    adjustmentType: string,
    amount: number,
    reason: string,
    hrUserId: string,
  ) {
    const adjustment = new this.leaveAdjustmentModel({
      employeeId: new Types.ObjectId(employeeId),
      leaveTypeId: new Types.ObjectId(leaveTypeId),
      adjustmentType,
      amount,
      reason,
      hrUserId: new Types.ObjectId(hrUserId),
    });

    await adjustment.save();

    // Update entitlement
    const entitlement = await this.leaveEntitlementModel.findOne({
      employeeId: new Types.ObjectId(employeeId),
      leaveTypeId: new Types.ObjectId(leaveTypeId),
    });

    if (entitlement) {
      if (adjustmentType === 'ADD') {
        entitlement.yearlyEntitlement += amount;
        entitlement.remaining += amount;
      } else if (adjustmentType === 'DEDUCT') {
        entitlement.yearlyEntitlement -= amount;
        entitlement.remaining -= amount;
      }
      await entitlement.save();
    }

    return adjustment;
  }

  // ==================== HELPER METHODS ====================

  /*
   * Calculate leave duration excluding weekends and holidays (BR 23)
   * Enhanced to properly fetch calendar holidays
   */
  private async calculateLeaveDuration(fromDate: Date, toDate: Date): Promise<number> {
    const currentDate = new Date(fromDate);
    const currentYear = fromDate.getFullYear();

    // Get holidays for the period
    const calendar = await this.calendarModel.findOne({
      year: currentYear,
    }).populate('holidays');

    const holidayDates = new Set<string>();

    if (calendar && calendar.holidays) {
      calendar.holidays.forEach((holiday: any) => {
        if (!holiday.startDate) return;

        const start = new Date(holiday.startDate);
        // If endDate is present, use it; otherwise assume 1 day
        const end = holiday.endDate ? new Date(holiday.endDate) : new Date(holiday.startDate);

        const tempDate = new Date(start);
        while (tempDate <= end) {
          holidayDates.add(tempDate.toISOString().split('T')[0]);
          tempDate.setDate(tempDate.getDate() + 1);
        }
      });
    }

    let duration = 0;
    while (currentDate <= toDate) {
      const dayOfWeek = currentDate.getDay();
      const dateString = currentDate.toISOString().split('T')[0];

      // Skip weekends (Saturday = 6, Sunday = 0)
      if (dayOfWeek !== 0 && dayOfWeek !== 6) {
        // Skip Holidays
        if (!holidayDates.has(dateString)) {
           duration++;
        }
      }
      currentDate.setDate(currentDate.getDate() + 1);
    }

    return duration;
  }

  /**
   * Check leave eligibility (BR 8)
   */
  private async checkLeaveEligibility(employeeId: string, leaveTypeId: string): Promise<void> {
    const leaveType = await this.leaveTypeModel.findById(leaveTypeId);
    if (!leaveType) {
      throw new NotFoundException('Leave type not found');
    }

    const employee = await this.employeeProfileService.getProfile(employeeId);
    if (!employee) {
        throw new NotFoundException('Employee profile not found');
    }

    // Check minimum tenure if required
    if (leaveType.minTenureMonths) {
       const hireDate = new Date(employee.dateOfHire);
       const now = new Date();
       const tenureMonths = (now.getFullYear() - hireDate.getFullYear()) * 12 + (now.getMonth() - hireDate.getMonth());
       
       if (tenureMonths < leaveType.minTenureMonths) {
           throw new BadRequestException(`Minimum tenure of ${leaveType.minTenureMonths} months required.`);
       }
    }

    // Check other eligibility criteria based on leave policy
    const policy = await this.leavePolicyModel.findOne({ leaveTypeId: new Types.ObjectId(leaveTypeId) });
    if (policy?.eligibility) {
        // Contract Type Check
        if (policy.eligibility.contractTypesAllowed && policy.eligibility.contractTypesAllowed.length > 0) {
            if (!policy.eligibility.contractTypesAllowed.includes(employee.contractType)) {
                throw new BadRequestException(`This leave type is not available for contract type: ${employee.contractType}`);
            }
        }
        
        // Position Check (if policy restricts certain positions)
         if (policy.eligibility.positionsAllowed && policy.eligibility.positionsAllowed.length > 0) {
             const employeePositionId = employee.primaryPositionId?.toString();
             if (employeePositionId && !policy.eligibility.positionsAllowed.includes(employeePositionId)) {
                 throw new BadRequestException(`This leave type is not available for your position.`);
             }
         }
    }
  }

  /**
   * Check for overlapping leave requests (BR 28)
   */
  private async checkOverlappingLeaves(employeeId: string, fromDate: Date, toDate: Date): Promise<void> {
    const overlapping = await this.leaveRequestModel.findOne({
      employeeId: new Types.ObjectId(employeeId),
      status: { $in: [LeaveStatus.PENDING, LeaveStatus.APPROVED] },
      $or: [
        {
          'dates.from': { $lte: toDate },
          'dates.to': { $gte: fromDate },
        },
      ],
    });

    if (overlapping) {
      throw new BadRequestException('Leave request overlaps with existing leave');
    }
  }

  /**
   * Process leave accrual (REQ-040)
   */
  async processLeaveAccrual(employeeId: string, leaveTypeId: string): Promise<void> {
    // BR 11: Accrual must pause during unpaid leave or suspension
    const employee = await this.employeeProfileService.getProfile(employeeId);
    if (!employee || employee.status === EmployeeStatus.SUSPENDED || employee.status === EmployeeStatus.TERMINATED) {
        console.log(`Skipping accrual for employee ${employeeId}: Status is ${employee?.status}`);
        return;
    }

    // Check if currently on Unpaid Leave
    const today = new Date();
    const activeUnpaidLeave = await this.leaveRequestModel.findOne({
        employeeId: new Types.ObjectId(employeeId),
        status: LeaveStatus.APPROVED,
        'dates.from': { $lte: today },
        'dates.to': { $gte: today },
    }).populate('leaveTypeId');

    if (activeUnpaidLeave) {
        const activeLeaveType = activeUnpaidLeave.leaveTypeId as any;
        if (activeLeaveType && activeLeaveType.paid === false) {
             console.log(`Skipping accrual for employee ${employeeId}: Currently on Unpaid Leave`);
             return;
        }
    }

    const policy = await this.leavePolicyModel.findOne({ leaveTypeId: new Types.ObjectId(leaveTypeId) });
    if (!policy) {
      return;
    }

    const entitlement = await this.leaveEntitlementModel.findOne({
      employeeId: new Types.ObjectId(employeeId),
      leaveTypeId: new Types.ObjectId(leaveTypeId),
    });

    if (!entitlement) {
      return;
    }

    // Calculate accrual based on method
    let accrualAmount = 0;
    if (policy.accrualMethod === AccrualMethod.MONTHLY) {
      accrualAmount = policy.monthlyRate;
    } else if (policy.accrualMethod === AccrualMethod.YEARLY) {
      accrualAmount = policy.yearlyRate / 12; // Monthly equivalent
    }

    // Update entitlement
    entitlement.accruedActual += accrualAmount;
    entitlement.accruedRounded = Math.floor(entitlement.accruedActual); // Apply rounding rule
    entitlement.remaining = entitlement.accruedRounded + entitlement.carryForward - entitlement.taken;
    entitlement.lastAccrualDate = new Date();

    await entitlement.save();
  }

  /**
   * Process year-end carry forward (REQ-041)
   */
  async processYearEndCarryForward(employeeId: string, leaveTypeId: string): Promise<void> {
    const policy = await this.leavePolicyModel.findOne({ leaveTypeId: new Types.ObjectId(leaveTypeId) });
    if (!policy || !policy.carryForwardAllowed) {
      return;
    }

    const entitlement = await this.leaveEntitlementModel.findOne({
      employeeId: new Types.ObjectId(employeeId),
      leaveTypeId: new Types.ObjectId(leaveTypeId),
    });

    if (!entitlement) {
      return;
    }

    // Calculate carry forward amount
    let carryForwardAmount = entitlement.remaining;
    
    // Apply max carry forward cap (e.g., 45 days)
    if (policy.maxCarryForward > 0) {
      carryForwardAmount = Math.min(carryForwardAmount, policy.maxCarryForward);
    }

    // Reset for new year
    entitlement.carryForward = carryForwardAmount;
    entitlement.accruedActual = 0;
    entitlement.accruedRounded = 0;
    entitlement.taken = 0;
    entitlement.pending = 0;
    entitlement.remaining = carryForwardAmount;
    entitlement.nextResetDate = new Date(new Date().getFullYear() + 1, 0, 1); // Next year Jan 1

    await entitlement.save();
  }

  /**
   * Get all active leave types
   */
  async getAllLeaveTypes(): Promise<any[]> {
    return this.leaveTypeModel.find().lean();
  }

  /**
   * Create a new leave type
   */
  async createLeaveType(data: {
    code: string;
    name: string;
    categoryId: string;
    description?: string;
    paid?: boolean;
    deductible?: boolean;
  }): Promise<any> {
    const leaveType = new this.leaveTypeModel({
      code: data.code,
      name: data.name,
      categoryId: new Types.ObjectId(data.categoryId),
      description: data.description,
      paid: data.paid ?? true,
      deductible: data.deductible ?? true,
      isActive: true,
    });

    return leaveType.save();
  }

  /**
   * Sync approved leave to Time Management module (REQ-042)
   * Blocks attendance for approved leave dates
   */
  private async syncLeaveToTimeManagement(request: any): Promise<void> {
    await this.integrationService.syncToTimeManagement(request);
  }

  /**
   * Sync approved leave to Payroll module (REQ-042)
   * Links leave to payroll codes for salary adjustments
   */
  private async syncLeaveToPayroll(request: any): Promise<void> {
    const leaveType = await this.leaveTypeModel.findById(request.leaveTypeId);
    await this.integrationService.syncToPayroll(request, leaveType);
  }

  /**
   * Update leave type
   */
  async updateLeaveType(id: string, data: any): Promise<any> {
    const leaveType = await this.leaveTypeModel.findById(id);
    if (!leaveType) {
      throw new NotFoundException('Leave type not found');
    }

    Object.assign(leaveType, data);
    return leaveType.save();
  }

  /**
   * Get all leave adjustments with pagination
   */
  async getAdjustments(filters?: { page?: number; limit?: number }): Promise<any> {
    const { page = 1, limit = 20 } = filters || {};
    const skip = (page - 1) * limit;

    const [adjustments, total] = await Promise.all([
      this.leaveAdjustmentModel
        .find()
        .populate('employeeId', 'firstName lastName employeeNumber')
        .populate('leaveTypeId', 'code name')
        .populate('hrUserId', 'firstName lastName')
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit)
        .lean(),
      this.leaveAdjustmentModel.countDocuments(),
    ]);

    return {
      adjustments,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    };
  }

  /**
   * Get calendar by year
   */
  async getCalendarByYear(year: number): Promise<any> {
    let calendar = await this.calendarModel.findOne({ year }).lean();
    
    if (!calendar) {
      // Return empty calendar structure if not found
      return {
        year,
        holidays: [],
        blockedPeriods: [],
      };
    }

    return calendar;
  }

  /**
   * Add holiday to calendar
   */
  async addHoliday(year: number, holiday: { date: string; name: string; description?: string }): Promise<any> {
    let calendar = await this.calendarModel.findOne({ year });
    
    if (!calendar) {
      calendar = new this.calendarModel({
        year,
        holidays: [],
        blockedPeriods: [],
      });
    }

    // Check if holiday already exists
    const existingIndex = (calendar.holidays || []).findIndex(
      (h: any) => h.date === holiday.date
    );

    if (existingIndex >= 0) {
      throw new BadRequestException('Holiday already exists for this date');
    }

    if (!calendar.holidays) {
      calendar.holidays = [];
    }
    calendar.holidays.push(holiday as any);
    
    return calendar.save();
  }

  /**
   * Delete holiday from calendar
   */
  async deleteHoliday(year: number, date: string): Promise<any> {
    const calendar = await this.calendarModel.findOne({ year });
    
    if (!calendar) {
      throw new NotFoundException('Calendar not found for this year');
    }

    const decodedDate = decodeURIComponent(date);
    calendar.holidays = (calendar.holidays || []).filter(
      (h: any) => h.date !== decodedDate
    );

    return calendar.save();
  }

  /**
   * Check team scheduling conflict (BR 28 - team level)
   */
  async checkTeamConflict(employeeId: string, fromDate: Date, toDate: Date): Promise<{
    hasConflict: boolean;
    message?: string;
    teamMembersOnLeave: number;
    teamSize: number;
  }> {
    // Get employee's supervisor to find team members
    const employee = await this.employeeProfileService.getProfile(employeeId);
    if (!employee || !employee.supervisorPositionId) {
      return { hasConflict: false, teamMembersOnLeave: 0, teamSize: 0 };
    }

    // Get all team members (peers - same supervisor)
    // Using directReports from the supervisor's position holder
    const supervisorId = employee.supervisorPositionId.toString();
    let teamMembers: string[] = [];
    try {
      teamMembers = await this.integrationService.getDirectReports(supervisorId);
    } catch {
      // If we can't get team members, don't block the request
      return { hasConflict: false, teamMembersOnLeave: 0, teamSize: 0 };
    }

    const teamSize = teamMembers.length;

    if (teamSize <= 1) {
      return { hasConflict: false, teamMembersOnLeave: 0, teamSize };
    }

    // Check how many are on leave during requested period
    const overlappingLeaves = await this.leaveRequestModel.countDocuments({
      employeeId: { $in: teamMembers.map((id: string) => new Types.ObjectId(id)) },
      status: LeaveStatus.APPROVED,
      $or: [
        {
          'dates.from': { $lte: toDate },
          'dates.to': { $gte: fromDate },
        },
      ],
    });

    const threshold = 0.3; // 30% of team
    const maxAllowed = Math.floor(teamSize * threshold);
    const hasConflict = overlappingLeaves >= maxAllowed;

    return {
      hasConflict,
      message: hasConflict
        ? `Too many team members (${overlappingLeaves}/${teamSize}) already on leave during this period`
        : undefined,
      teamMembersOnLeave: overlappingLeaves,
      teamSize,
    };
  }

  /**
   * Get HR Dashboard Statistics
   * Provides real-time statistics for the HR admin dashboard
   */
  async getDashboardStats(): Promise<{
    totalEmployees: number;
    onLeaveToday: number;
    approvedThisMonth: number;
    pendingApprovals: number;
    pendingHRReview: number;
  }> {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const endOfToday = new Date(today);
    endOfToday.setHours(23, 59, 59, 999);

    const startOfMonth = new Date(today.getFullYear(), today.getMonth(), 1);
    const endOfMonth = new Date(today.getFullYear(), today.getMonth() + 1, 0, 23, 59, 59, 999);

    // Get total employees (from entitlements as a proxy)
    const totalEmployees = await this.leaveEntitlementModel.distinct('employeeId').then((ids) => ids.length);

    // Get employees on leave today
    const onLeaveToday = await this.leaveRequestModel.countDocuments({
      status: LeaveStatus.APPROVED,
      'dates.from': { $lte: endOfToday },
      'dates.to': { $gte: today },
    });

    // Get leaves approved this month
    const approvedThisMonth = await this.leaveRequestModel.countDocuments({
      status: LeaveStatus.APPROVED,
      updatedAt: { $gte: startOfMonth, $lte: endOfMonth },
    });

    // Get pending manager approvals
    const pendingApprovals = await this.leaveRequestModel.countDocuments({
      status: LeaveStatus.PENDING,
      'approvalFlow.role': 'line_manager',
      'approvalFlow.status': LeaveStatus.PENDING,
    });

    // Get pending HR review
    const pendingHRReview = await this.leaveRequestModel.countDocuments({
      'approvalFlow.role': 'hr_admin',
      'approvalFlow.status': LeaveStatus.PENDING,
    });

    return {
      totalEmployees,
      onLeaveToday,
      approvedThisMonth,
      pendingApprovals,
      pendingHRReview,
    };
  }

  /**
   * Get team leave calendar for managers
   * Shows who is on leave and upcoming leaves for the team
   */
  async getTeamLeaveCalendar(managerId: string, startDate: Date, endDate: Date): Promise<{
    teamMembers: any[];
    leavesInPeriod: any[];
  }> {
    // Get direct reports
    const directReports = await this.integrationService.getDirectReports(managerId);
    
    if (!directReports || directReports.length === 0) {
      return { teamMembers: [], leavesInPeriod: [] };
    }

    const employeeIds = directReports.map((id: string) => new Types.ObjectId(id));

    // Get team member details
    const teamMembers = await Promise.all(
      directReports.map(async (id: string) => {
        try {
          const profile = await this.employeeProfileService.getProfile(id);
          return {
            id,
            firstName: profile?.firstName,
            lastName: profile?.lastName,
            employeeNumber: profile?.employeeNumber,
          };
        } catch {
          return { id, firstName: 'Unknown', lastName: 'Employee' };
        }
      })
    );

    // Get approved leaves for the period
    const leavesInPeriod = await this.leaveRequestModel
      .find({
        employeeId: { $in: employeeIds },
        status: LeaveStatus.APPROVED,
        $or: [
          {
            'dates.from': { $lte: endDate },
            'dates.to': { $gte: startDate },
          },
        ],
      })
      .populate('leaveTypeId', 'code name')
      .populate('employeeId', 'firstName lastName employeeNumber')
      .lean();

    return {
      teamMembers,
      leavesInPeriod,
    };
  }

  // ==================== OFFBOARDING & SETTLEMENT ====================

  /**
   * Calculate final leave settlement for terminating employee
   * OFF-013: Final settlement during offboarding
   * BR 52, BR 53: Encashment calculation
   */
  async calculateFinalSettlement(employeeId: string, dailySalaryRate: number) {
    return this.leaveSettlementService.calculateFinalSettlement(
      employeeId,
      dailySalaryRate,
    );
  }

  /**
   * Process final settlement (zero out balances)
   * OFF-013: Complete leave settlement
   */
  async processFinalSettlement(employeeId: string) {
    return this.leaveSettlementService.processFinalSettlement(employeeId);
  }

  /**
   * Generate settlement report
   * OFF-013: Generate settlement documentation
   */
  async generateSettlementReport(employeeId: string, dailySalaryRate: number) {
    return this.leaveSettlementService.generateSettlementReport(
      employeeId,
      dailySalaryRate,
    );
  }
}


