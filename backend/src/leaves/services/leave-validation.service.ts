/**
 * Enhanced Validation Service for Leaves
 * Implements business rules: BR 8, BR 29, BR 31, BR 41, BR 55, REQ-031
 */

import { Injectable, BadRequestException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { LeaveType } from '../models/leave-type.schema';
import { LeaveRequest } from '../models/leave-request.schema';
import { LeaveBlockPeriod } from '../models/leave-block-period.schema';
import { LeaveEntitlement } from '../models/leave-entitlement.schema';

@Injectable()
export class LeaveValidationService {
  constructor(
    @InjectModel(LeaveType.name) private leaveTypeModel: Model<LeaveType>,
    @InjectModel(LeaveRequest.name) private leaveRequestModel: Model<LeaveRequest>,
    @InjectModel(LeaveBlockPeriod.name) private blockPeriodModel: Model<LeaveBlockPeriod>,
    @InjectModel(LeaveEntitlement.name) private entitlementModel: Model<LeaveEntitlement>,
  ) {}

  /**
   * BR 8: Check tenure-based eligibility
   */
  async checkTenureEligibility(
    employeeHireDate: Date,
    leaveTypeId: string,
  ): Promise<void> {
    const leaveType = await this.leaveTypeModel.findById(leaveTypeId);
    
    if (!leaveType || !leaveType.minTenureMonths) {
      return; // No tenure requirement
    }

    const tenureMonths = this.calculateTenureMonths(employeeHireDate);
    
    if (tenureMonths < leaveType.minTenureMonths) {
      throw new BadRequestException(
        `Minimum tenure of ${leaveType.minTenureMonths} months required for ${leaveType.name}. Current tenure: ${tenureMonths} months`,
      );
    }
  }

  /**
   * BR 29: Handle excess leave (auto-convert to unpaid or block)
   */
  async handleExcessLeave(
    requestedDays: number,
    availableBalance: number,
    leaveTypeId: string,
  ): Promise<{
    type: 'FULLY_PAID' | 'PARTIALLY_UNPAID' | 'BLOCKED';
    paidDays: number;
    unpaidDays: number;
    requiresConfirmation: boolean;
  }> {
    if (requestedDays <= availableBalance) {
      return {
        type: 'FULLY_PAID',
        paidDays: requestedDays,
        unpaidDays: 0,
        requiresConfirmation: false,
      };
    }

    const leaveType = await this.leaveTypeModel.findById(leaveTypeId);
    const allowConversion = true; // Configurable policy

    if (allowConversion) {
      return {
        type: 'PARTIALLY_UNPAID',
        paidDays: availableBalance,
        unpaidDays: requestedDays - availableBalance,
        requiresConfirmation: true,
      };
    } else {
      return {
        type: 'BLOCKED',
        paidDays: 0,
        unpaidDays: 0,
        requiresConfirmation: false,
      };
    }
  }

  /**
   * BR 41: Check cumulative leave limits (e.g., max 15 days sick leave per year)
   */
  async checkCumulativeLimit(
    employeeId: string,
    leaveTypeId: string,
    requestedDays: number,
  ): Promise<void> {
    const currentYear = new Date().getFullYear();
    
    // Get cumulative limit for leave type (could be in config)
    const cumulativeLimits: Record<string, number> = {
      'SL': 15, // Sick Leave: 15 days max per year
      'EL': 5,  // Emergency Leave: 5 days max per year
    };

    const leaveType = await this.leaveTypeModel.findById(leaveTypeId);
    const limit = cumulativeLimits[leaveType?.code || ''];

    if (!limit) {
      return; // No cumulative limit for this leave type
    }

    // Calculate total taken this year
    const startOfYear = new Date(currentYear, 0, 1);
    const endOfYear = new Date(currentYear, 11, 31);

    const takenRequests = await this.leaveRequestModel.find({
      employeeId: new Types.ObjectId(employeeId),
      leaveTypeId: new Types.ObjectId(leaveTypeId),
      status: { $in: ['APPROVED', 'PENDING'] },
      'dates.from': { $gte: startOfYear, $lte: endOfYear },
    });

    const totalTaken = takenRequests.reduce((sum, req) => sum + req.durationDays, 0);
    const totalAfterRequest = totalTaken + requestedDays;

    if (totalAfterRequest > limit) {
      throw new BadRequestException(
        `Annual limit of ${limit} days for ${leaveType?.name || 'this leave type'} would be exceeded. Already taken: ${totalTaken} days`,
      );
    }
  }


  /**
   * BR 55: Check if dates fall within block periods
   */
  async checkBlockPeriods(
    fromDate: Date,
    toDate: Date,
    leaveTypeCode: string,
  ): Promise<void> {
    const activeBlockPeriods = await this.blockPeriodModel.find({
      isActive: true,
      startDate: { $lte: toDate },
      endDate: { $gte: fromDate },
    });

    for (const period of activeBlockPeriods) {
      // Check if leave type is exempt
      if (period.exemptLeaveTypes?.includes(leaveTypeCode)) {
        continue;
      }

      throw new BadRequestException(
        `Leave is blocked during ${period.name} (${this.formatDate(period.startDate)} - ${this.formatDate(period.endDate)}). Reason: ${period.reason}`,
      );
    }
  }

  /**
   * REQ-031: Validate post-leave request (backdated)
   */
  async validatePostLeaveRequest(fromDate: Date): Promise<boolean> {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const from = new Date(fromDate);
    from.setHours(0, 0, 0, 0);

    if (from >= today) {
      return false; // Not a post-leave request
    }

    // Check grace period (configurable, default 7 days)
    const gracePeriodDays = 7;
    const daysSinceLeave = Math.floor((today.getTime() - from.getTime()) / (1000 * 60 * 60 * 24));

    if (daysSinceLeave > gracePeriodDays) {
      throw new BadRequestException(
        `Post-leave requests must be submitted within ${gracePeriodDays} days. This request is ${daysSinceLeave} days late.`,
      );
    }

    return true; // Is a valid post-leave request
  }

  // Helper methods
  private calculateTenureMonths(hireDate: Date): number {
    const now = new Date();
    const months = (now.getFullYear() - hireDate.getFullYear()) * 12 +
                   (now.getMonth() - hireDate.getMonth());
    return Math.max(0, months);
  }

  private formatDate(date: Date): string {
    return date.toLocaleDateString('en-US', { 
      year: 'numeric', 
      month: 'short', 
      day: 'numeric' 
    });
  }
}
