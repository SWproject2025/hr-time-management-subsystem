import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import {
  LeaveEntitlement,
  LeaveEntitlementDocument,
} from '../models/leave-entitlement.schema';
import { LeaveType } from '../models/leave-type.schema';

/**
 * Leave Settlement Service
 * Handles final settlement calculations during employee offboarding
 * Implements BR 52, BR 53 for leave encashment
 */

@Injectable()
export class LeaveSettlementService {
  constructor(
    @InjectModel(LeaveEntitlement.name)
    private entitlementModel: Model<LeaveEntitlementDocument>,
    @InjectModel(LeaveType.name)
    private leaveTypeModel: Model<any>,
  ) {}

  /**
   * Calculate final settlement for employee
   * BR 52: Final settlement rules
   * BR 53: Encashment formula
   */
  async calculateFinalSettlement(
    employeeId: string,
    dailySalaryRate: number,
  ): Promise<{
    totalEncashment: number;
    details: Array<{
      leaveType: string;
      remainingDays: number;
      encashableDays: number;
      encashmentAmount: number;
    }>;
  }> {
    // Get all entitlements for employee
    const entitlements = await this.entitlementModel
      .find({ employeeId: new Types.ObjectId(employeeId) })
      .populate('leaveTypeId', 'code name paid')
      .lean();

    const details: Array<{
      leaveType: string;
      remainingDays: number;
      encashableDays: number;
      encashmentAmount: number;
    }> = [];
    let totalEncashment = 0;


    for (const entitlement of entitlements) {
      const leaveType: any = entitlement.leaveTypeId;

      // Only encash paid annual leave (BR 52)
      if (leaveType.paid && leaveType.code === 'AL') {
        const remainingDays = entitlement.remaining;

        // Maximum 30 days can be encashed (BR 53)
        const encashableDays = Math.min(remainingDays, 30);

        // Encashment Formula: DailySalaryRate × NumberofUnusedLeaveDays (capped at 30)
        const encashmentAmount = dailySalaryRate * encashableDays;

        details.push({
          leaveType: leaveType.name,
          remainingDays,
          encashableDays,
          encashmentAmount,
        });

        totalEncashment += encashmentAmount;
      } else {
        // Non-encashable leave types
        details.push({
          leaveType: leaveType.name,
          remainingDays: entitlement.remaining,
          encashableDays: 0,
          encashmentAmount: 0,
        });
      }
    }

    return {
      totalEncashment,
      details,
    };
  }

  /**
   * Generate final settlement report
   */
  async generateSettlementReport(
    employeeId: string,
    dailySalaryRate: number,
  ): Promise<string> {
    const settlement = await this.calculateFinalSettlement(
      employeeId,
      dailySalaryRate,
    );

    let report = '=== LEAVE FINAL SETTLEMENT REPORT ===\n\n';
    report += `Employee ID: ${employeeId}\n`;
    report += `Daily Salary Rate: ${dailySalaryRate.toFixed(2)}\n`;
    report += `Settlement Date: ${new Date().toLocaleDateString()}\n\n`;
    report += '--- Leave Balance Details ---\n';

    settlement.details.forEach((detail) => {
      report += `\n${detail.leaveType}:\n`;
      report += `  Remaining Days: ${detail.remainingDays}\n`;
      report += `  Encashable Days: ${detail.encashableDays}\n`;
      report += `  Encashment Amount: ${detail.encashmentAmount.toFixed(2)}\n`;
    });

    report += `\n--- Total Encashment ---\n`;
    report += `Total Amount: ${settlement.totalEncashment.toFixed(2)}\n`;

    return report;
  }

  /**
   * Process final settlement (update balances to zero)
   */
  async processFinalSettlement(employeeId: string): Promise<void> {
    await this.entitlementModel.updateMany(
      { employeeId: new Types.ObjectId(employeeId) },
      {
        $set: {
          remaining: 0,
          pending: 0,
          accruedActual: 0,
          accruedRounded: 0,
        },
      },
    );
  }
}
