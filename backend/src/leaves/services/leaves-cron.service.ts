import { Injectable } from '@nestjs/common';
import { Cron, CronExpression } from '@nestjs/schedule';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { ConfigService } from '@nestjs/config';
import { LeaveRequest } from '../models/leave-request.schema';
import { EmailService } from '../../Common/email/email.service';



@Injectable()
export class LeavesCronService {
  private readonly hrNotificationEmail: string;

  constructor(
    @InjectModel(LeaveRequest.name)
    private leaveRequestModel: Model<LeaveRequest>,
    private emailService: EmailService,
    private configService: ConfigService,
  ) {
    this.hrNotificationEmail = this.configService.get<string>('HR_NOTIFICATION_EMAIL') || 'hr@company.com';
  }

  /**
   * REQ-028: Auto-escalate requests pending > 48 hours
   * Runs every 6 hours
   */
  @Cron(CronExpression.EVERY_6_HOURS)
  async checkPendingApprovals() {
    console.log('🔍 Checking for overdue leave approvals...');

    const threshold = new Date();
    threshold.setHours(threshold.getHours() - 48);

    // Find requests that are PENDING and older than 48 hours
    // And specifically where the Manager approval is still PENDING (not yet approved)
    const overdueRequests = await this.leaveRequestModel
      .find({
        status: 'PENDING',
        escalatedAt: { $exists: false },
        createdAt: { $lt: threshold },
        'approvalFlow': {
           $elemMatch: { role: 'line_manager', status: 'PENDING' }
        }
      })
      .populate('employeeId', 'firstName lastName workEmail')
      .populate('leaveTypeId', 'name')
      .exec();

    console.log(`Found ${overdueRequests.length} overdue requests`);

    for (const request of overdueRequests) {
      try {
        // Mark as escalated
        request.escalatedAt = new Date();
        
        // Add HR Admin to approval flow if NOT already there
        const hrStepExists = request.approvalFlow.some(step => step.role === 'hr_admin');
        if (!hrStepExists) {
            request.approvalFlow.push({
                role: 'hr_admin',
                status: 'PENDING' as any // Casting to avoid import issues if enum not imported
            });
            console.log(`Updated approval flow for ${request._id} to include HR Admin`);
        }

        await request.save();

        // Send escalation email to HR
        const employee = request.employeeId as any;
        const leaveType = request.leaveTypeId as any;

        // Ensure email service has this method or we use a generic internal method
        if (this.emailService.sendEscalationNotification) {
            await this.emailService.sendEscalationNotification(
            this.hrNotificationEmail,
            employee.workEmail,
            `${employee.firstName} ${employee.lastName}`,
            leaveType.name,
            request._id.toString(),
            );
        } else {
             console.warn('EmailService.sendEscalationNotification is not defined');
        }

        console.log(`✅ Escalated request ${request._id}`);
      } catch (error) {
        console.error(`❌ Failed to escalate request ${request._id}:`, error);
      }
    }
  }

  /**
   * REQ-040: Monthly leave accrual
   * Note: Monthly accrual is handled by MonthlyAccrualService which has its own @Cron decorator.
   * This method is kept for any additional processing or logging needs.
   */
  @Cron(CronExpression.EVERY_1ST_DAY_OF_MONTH_AT_MIDNIGHT)
  async processMonthlyAccrual() {
    console.log('📅 Monthly leave accrual triggered - handled by MonthlyAccrualService');
    // Actual accrual processing is done by MonthlyAccrualService
  }
}
