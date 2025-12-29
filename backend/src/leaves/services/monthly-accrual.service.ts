import { Injectable } from '@nestjs/common';
import { Cron, CronExpression } from '@nestjs/schedule';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { LeaveEntitlement, LeaveEntitlementDocument } from '../models/leave-entitlement.schema';
import { LeavePolicy, LeavePolicyDocument } from '../models/leave-policy.schema';
import { RoundingRule } from '../enums/rounding-rule.enum';
import { LeaveRequest } from '../models/leave-request.schema';
import { EmployeeProfileService } from '../../employee-profile/employee-profile.service';
import { EmployeeStatus } from '../../employee-profile/enums/employee-profile.enums';
import { Inject, forwardRef } from '@nestjs/common';
import { LeaveStatus } from '../enums/leave-status.enum';


/**
 * Monthly Accrual Service
 * Handles automated monthly leave accrual calculations
 * REQ-040: Monthly accrual processing
 */

@Injectable()
export class MonthlyAccrualService {
  constructor(
    @InjectModel(LeaveEntitlement.name)
    private entitlementModel: Model<LeaveEntitlementDocument>,
    @InjectModel(LeavePolicy.name)
    private policyModel: Model<LeavePolicyDocument>,
    @InjectModel(LeaveRequest.name)
    private leaveRequestModel: Model<LeaveRequest>,
    @Inject(forwardRef(() => EmployeeProfileService))
    private readonly employeeProfileService: EmployeeProfileService,
  ) {}

  /**
   * Process monthly accrual for all employees
   * Runs on the 1st of every month at midnight
   */
  @Cron(CronExpression.EVERY_1ST_DAY_OF_MONTH_AT_MIDNIGHT)
  async processMonthlyAccrual() {
    console.log('📅 Starting monthly leave accrual processing...');
    
    try {
      // Get all policies with monthly accrual
      const policies = await this.policyModel
        .find({ accrualMethod: 'MONTHLY' })
        .lean();

      console.log(`Found ${policies.length} policies with monthly accrual`);

      let updatedCount = 0;

      for (const policy of policies) {
        // Get all entitlements for this leave type
        const entitlements = await this.entitlementModel.find({
          leaveTypeId: policy.leaveTypeId,
        });

        for (const entitlement of entitlements) {
          // BR 11: Check for Unpaid Leave or Suspension
          try {
             const employee = await this.employeeProfileService.getProfile(entitlement.employeeId.toString());
             
             // Check Status
             if (!employee || employee.status === EmployeeStatus.SUSPENDED || employee.status === EmployeeStatus.TERMINATED) {
                 console.log(`Skipping accrual for employee ${entitlement.employeeId}: Status is ${employee?.status}`);
                 continue;
             }

             // Check Unpaid Leave covering today (1st of month)
             const today = new Date();
             const activeUnpaidLeave = await this.leaveRequestModel.findOne({
                employeeId: entitlement.employeeId,
                status: LeaveStatus.APPROVED,
                'dates.from': { $lte: today },
                'dates.to': { $gte: today },
             }).populate('leaveTypeId');

             if (activeUnpaidLeave) {
                const activeLeaveType = activeUnpaidLeave.leaveTypeId as any;
                if (activeLeaveType && activeLeaveType.paid === false) {
                    console.log(`Skipping accrual for employee ${entitlement.employeeId}: Currently on Unpaid Leave`);
                    continue;
                }
             }

          } catch (e) {
              console.error(`Error checking eligibility for accrual for employee ${entitlement.employeeId}`, e);
              // Decide whether to continue or skip. Safest to skip if we can't verify.
              continue;
          }

          // Calculate accrual
          const monthlyAccrual = policy.monthlyRate || 0;
          entitlement.accruedActual += monthlyAccrual;

          // Apply rounding rule
          if (policy.roundingRule === RoundingRule.ROUND_UP) {
            entitlement.accruedRounded = Math.ceil(entitlement.accruedActual);
          } else if (policy.roundingRule === RoundingRule.ROUND_DOWN) {
            entitlement.accruedRounded = Math.floor(entitlement.accruedActual);
          } else {
            entitlement.accruedRounded = entitlement.accruedActual;
          }



          // Update remaining balance
          entitlement.remaining =
            entitlement.yearlyEntitlement +
            entitlement.carryForward +
            entitlement.accruedRounded -
            entitlement.taken -
            entitlement.pending;

          entitlement.lastAccrualDate = new Date();
          await entitlement.save();
          updatedCount++;
        }
      }

      console.log(`✅ Monthly accrual completed: ${updatedCount} entitlements updated`);
    } catch (error) {
      console.error('❌ Error processing monthly accrual:', error);
    }
  }

  /**
   * Manual trigger for accrual (for testing or corrections)
   */
  async manualAccrualTrigger() {
    console.log('🔧 Manually triggering accrual processing...');
    await this.processMonthlyAccrual();
  }
}
