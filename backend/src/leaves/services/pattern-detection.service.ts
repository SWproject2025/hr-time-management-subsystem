import { Injectable, Logger } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { LeaveRequest } from '../models/leave-request.schema';
import { LeavePattern, LeavePatternDocument, PatternType } from '../models/leave-pattern.schema';
import { LeaveStatus } from '../enums/leave-status.enum';
import { EmailService } from '../../Common/email/email.service';
import { EmployeeProfileService } from '../../employee-profile/employee-profile.service';

@Injectable()
export class PatternDetectionService {
  private readonly logger = new Logger(PatternDetectionService.name);

  constructor(
    @InjectModel(LeaveRequest.name) private leaveRequestModel: Model<LeaveRequest>,
    @InjectModel(LeavePattern.name) private leavePatternModel: Model<LeavePatternDocument>,
    private emailService: EmailService,
    private employeeService: EmployeeProfileService,
  ) {}

  /**
   * Detect irregular leave patterns
   * - Frequent Mondays/Fridays
   * - Leaves adjacent to holidays (future enhancement)
   */
  async detectIrregularPatterns(): Promise<void> {
    this.logger.log('Starting irregular pattern detection...');
    
    // Look back 3 months
    const threeMonthsAgo = new Date();
    threeMonthsAgo.setMonth(threeMonthsAgo.getMonth() - 3);

    const requests = await this.leaveRequestModel.find({
      status: LeaveStatus.APPROVED,
      'dates.from': { $gte: threeMonthsAgo },
    }).populate('employeeId');

    // Group by employee
    const employeeRequests: Record<string, any[]> = {};
    requests.forEach(req => {
      const empId = (req.employeeId as any)._id.toString();
      if (!employeeRequests[empId]) employeeRequests[empId] = [];
      employeeRequests[empId].push(req);
    });

    // Analyze each employee
    for (const empId in employeeRequests) {
      await this.analyzeEmployeePattern(empId, employeeRequests[empId]);
    }
  }

  private async analyzeEmployeePattern(employeeId: string, requests: any[]) {
    let mondayFridayCount = 0;

    for (const req of requests) {
      const from = new Date(req.dates.from);
      const to = new Date(req.dates.to);
      
      // extensive check for every day in the leave
      const current = new Date(from);
      while (current <= to) {
        const day = current.getDay();
        if (day === 1 || day === 5) { // Monday or Friday
            mondayFridayCount++;
        }
        current.setDate(current.getDate() + 1);
      }
    }

    // Threshold: e.g., > 5 Mondays/Fridays in 3 months
    if (mondayFridayCount > 5) {
       this.logger.warn(`Irregular Pattern Detected: Employee ${employeeId} has taken ${mondayFridayCount} Mondays/Fridays off in last 3 months.`);
       
       // Save to DB
       await this.savePattern(
           employeeId, 
           PatternType.MONDAY_FRIDAY, 
           mondayFridayCount, 
           `Detected ${mondayFridayCount} Monday/Friday leaves in the last 3 months`
       );
    }
  }

  private async savePattern(employeeId: string, type: PatternType, occurrences: number, details: string) {
      // Check if open pattern exists for this month/period to avoid duplicates?
      // For now, simple check if one exists unacknowledged
      const existing = await this.leavePatternModel.findOne({
          employeeId: new Types.ObjectId(employeeId),
          patternType: type,
          acknowledged: false
      });

      if (existing) {
          existing.occurrences = occurrences;
          existing.details = details;
          existing.detectionDate = new Date();
          await existing.save();
      } else {
          const pattern = new this.leavePatternModel({
              employeeId: new Types.ObjectId(employeeId),
              patternType: type,
              occurrences,
              details,
              detectionDate: new Date(),
              acknowledged: false
          });
          await pattern.save();
      }
  }

  async getPatterns(employeeId: string): Promise<LeavePattern[]> {
      return this.leavePatternModel.find({ 
          employeeId: new Types.ObjectId(employeeId) 
      }).sort({ detectionDate: -1 }).exec();
  }

  async acknowledgePattern(patternId: string, managerId: string): Promise<LeavePattern> {
      const pattern = await this.leavePatternModel.findById(patternId);
      if (!pattern) {
          throw new Error('Pattern not found'); // Should use NotFoundException but need to import it
      }
      pattern.acknowledged = true;
      pattern.acknowledgedBy = new Types.ObjectId(managerId);
      pattern.acknowledgedAt = new Date();
      return pattern.save();
  }
}
