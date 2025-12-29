import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { LeaveEntitlement, LeaveEntitlementDocument } from '../models/leave-entitlement.schema';
import { LeavePolicy, LeavePolicyDocument } from '../models/leave-policy.schema';
import { LeaveType, LeaveTypeDocument } from '../models/leave-type.schema';

/**
 * Leave Entitlement Service
 * Manages employee leave entitlements
 * REQ-007: Entitlement rules configuration
 * BR 7: Vacation package management
 */

@Injectable()
export class LeaveEntitlementService {
  constructor(
    @InjectModel(LeaveEntitlement.name)
    private entitlementModel: Model<LeaveEntitlementDocument>,
    @InjectModel(LeavePolicy.name)
    private policyModel: Model<LeavePolicyDocument>,
    @InjectModel(LeaveType.name)
    private leaveTypeModel: Model<LeaveTypeDocument>,
  ) {}

  /**
   * Get all entitlements with optional filters
   */
  async getAllEntitlements(filters?: {
    employeeId?: string;
    leaveTypeId?: string;
    page?: number;
    limit?: number;
  }) {
    const page = filters?.page || 1;
    const limit = filters?.limit || 50;
    const skip = (page - 1) * limit;

    const query: any = {};
    if (filters?.employeeId) {
      query.employeeId = new Types.ObjectId(filters.employeeId);
    }
    if (filters?.leaveTypeId) {
      query.leaveTypeId = new Types.ObjectId(filters.leaveTypeId);
    }

    const [entitlements, total] = await Promise.all([
      this.entitlementModel
        .find(query)
        .populate('employeeId', 'firstName lastName employeeNumber')
        .populate('leaveTypeId', 'code name')
        .skip(skip)
        .limit(limit)
        .sort({ createdAt: -1 })
        .lean(),
      this.entitlementModel.countDocuments(query),
    ]);

    return {
      entitlements,
      pagination: {
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit),
      },
    };
  }

  /**
   * Get entitlements for specific employee
   */
  async getEmployeeEntitlements(employeeId: string) {
    const entitlements = await this.entitlementModel
      .find({ employeeId: new Types.ObjectId(employeeId) })
      .populate('leaveTypeId', 'code name paid')
      .lean();

    return entitlements;
  }

  /**
   * Create personalized entitlement for employee
   * BR 7: Assign vacation package
   */
  async createEntitlement(data: {
    employeeId: string;
    leaveTypeId: string;
    yearlyEntitlement: number;
    carryForward?: number;
  }) {
    // Check if entitlement already exists
    const existing = await this.entitlementModel.findOne({
      employeeId: new Types.ObjectId(data.employeeId),
      leaveTypeId: new Types.ObjectId(data.leaveTypeId),
    });

    if (existing) {
      throw new BadRequestException(
        'Entitlement already exists for this employee and leave type',
      );
    }

    // Verify leave type exists
    const leaveType = await this.leaveTypeModel.findById(data.leaveTypeId);
    if (!leaveType) {
      throw new NotFoundException('Leave type not found');
    }

    const entitlement = new this.entitlementModel({
      employeeId: new Types.ObjectId(data.employeeId),
      leaveTypeId: new Types.ObjectId(data.leaveTypeId),
      yearlyEntitlement: data.yearlyEntitlement,
      accruedActual: 0,
      accruedRounded: 0,
      carryForward: data.carryForward || 0,
      taken: 0,
      pending: 0,
      remaining: data.yearlyEntitlement + (data.carryForward || 0),
      lastAccrualDate: new Date(),
      nextResetDate: this.calculateNextResetDate(),
    });

    return entitlement.save();
  }

  /**
   * Update existing entitlement
   */
  async updateEntitlement(
    id: string,
    updateData: {
      yearlyEntitlement?: number;
      carryForward?: number;
    },
  ) {
    const entitlement = await this.entitlementModel.findById(id);
    if (!entitlement) {
      throw new NotFoundException('Entitlement not found');
    }

    if (updateData.yearlyEntitlement !== undefined) {
      entitlement.yearlyEntitlement = updateData.yearlyEntitlement;
    }

    if (updateData.carryForward !== undefined) {
      entitlement.carryForward = updateData.carryForward;
    }

    // Recalculate remaining balance
    entitlement.remaining =
      entitlement.yearlyEntitlement +
      entitlement.carryForward -
      entitlement.taken -
      entitlement.pending;

    return entitlement.save();
  }

  /**
   * Delete entitlement
   */
  async deleteEntitlement(id: string) {
    const entitlement = await this.entitlementModel.findById(id);
    if (!entitlement) {
      throw new NotFoundException('Entitlement not found');
    }

    // Check if entitlement has been used
    if (entitlement.taken > 0) {
      throw new BadRequestException(
        'Cannot delete entitlement with existing usage. Consider archiving instead.',
      );
    }

    await this.entitlementModel.findByIdAndDelete(id);
    return { message: 'Entitlement deleted successfully' };
  }

  /**
   * Initialize entitlements for new employee based on policies
   * REQ-007: Auto-assign entitlements based on eligibility
   */
  async initializeEmployeeEntitlements(
    employeeId: string,
    employmentType: string,
    tenure?: number,
  ) {
    const policies = await this.policyModel
      .find()
      .populate('leaveTypeId', 'code name')
      .lean();

    const entitlements: Promise<any>[] = [];

    for (const policy of policies) {
      // Check eligibility based on policy rules
      if (this.checkPolicyEligibility(policy, employmentType, tenure)) {
        const yearlyEntitlement = policy.yearlyRate || 0;

        const entitlement = new this.entitlementModel({
          employeeId: new Types.ObjectId(employeeId),
          leaveTypeId: policy.leaveTypeId,
          yearlyEntitlement,
          accruedActual: 0,
          accruedRounded: 0,
          carryForward: 0,
          taken: 0,
          pending: 0,
          remaining: yearlyEntitlement,
          lastAccrualDate: new Date(),
          nextResetDate: this.calculateNextResetDate(),
        });

        entitlements.push(entitlement.save());
      }
    }

    return Promise.all(entitlements);
  }

  /**
   * Bulk update entitlements (for annual adjustments)
   */
  async bulkUpdateEntitlements(updates: Array<{
    employeeId: string;
    leaveTypeId: string;
    yearlyEntitlement: number;
  }>) {
    const results: Array<{ success: boolean; entitlement?: any; error?: string }> = [];

    for (const update of updates) {
      try {
        const entitlement = await this.entitlementModel.findOne({
          employeeId: new Types.ObjectId(update.employeeId),
          leaveTypeId: new Types.ObjectId(update.leaveTypeId),
        });

        if (entitlement) {
          entitlement.yearlyEntitlement = update.yearlyEntitlement;
          entitlement.remaining =
            update.yearlyEntitlement +
            entitlement.carryForward -
            entitlement.taken -
            entitlement.pending;
          await entitlement.save();
          results.push({ success: true, entitlement });
        } else {
          results.push({ success: false, error: 'Entitlement not found' });
        }
      } catch (error) {
        results.push({ success: false, error: error.message });
      }
    }

    return results;
  }

  /**
   * Helper: Check if employee is eligible for leave type based on policy
   */
  private checkPolicyEligibility(
    policy: any,
    employmentType: string,
    tenure?: number,
  ): boolean {
    // If no eligibility rules, grant access
    if (!policy.eligibility) {
      return true;
    }

    // Check tenure requirement
    if (
      policy.eligibility.minTenureMonths &&
      tenure !== undefined &&
      tenure < policy.eligibility.minTenureMonths
    ) {
      return false;
    }

    // Check contract type
    if (
      policy.eligibility.contractTypesAllowed &&
      policy.eligibility.contractTypesAllowed.length > 0 &&
      !policy.eligibility.contractTypesAllowed.includes(employmentType)
    ) {
      return false;
    }

    return true;
  }

  /**
   * Helper: Calculate next reset date (typically next January 1st)
   */
  private calculateNextResetDate(): Date {
    const now = new Date();
    const nextYear = now.getFullYear() + 1;
    return new Date(nextYear, 0, 1); // January 1st of next year
  }
}
