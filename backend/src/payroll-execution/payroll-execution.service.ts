import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import mongoose, { Model } from 'mongoose';
import { employeeSigningBonus } from './models/EmployeeSigningBonus.schema';
import { EmployeeTerminationResignation } from './models/EmployeeTerminationResignation.schema';
import { payrollRuns } from './models/payrollRuns.schema';
// eslint-disable-next-line prettier/prettier
import { BonusStatus, BenefitStatus, PayRollStatus, PaySlipPaymentStatus } from './enums/payroll-execution-enum';
import { employeePayrollDetails } from './models/employeePayrollDetails.schema';
import { employeePenalties } from './models/employeePenalties.schema';
import { paySlip } from './models/payslip.schema';
import { EmployeeProfile } from '../employee-profile/models/employee-profile.schema';
import { EmployeeStatus } from '../employee-profile/enums/employee-profile.enums';
// Import CalcDraftService
import { CalcDraftService } from './calc-draft/calc-draft.service';

@Injectable()
export class PayrollExecutionService {
  constructor(
    @InjectModel(employeeSigningBonus.name)
    private employeeSigningBonusModel: Model<employeeSigningBonus>,
    @InjectModel(EmployeeTerminationResignation.name)
    private terminationAndResignationBenefitsModel: Model<EmployeeTerminationResignation>,
    @InjectModel(payrollRuns.name)
    private payrollRunsModel: Model<payrollRuns>,
    @InjectModel(employeePayrollDetails.name)
    private employeePayrollDetailsModel: Model<employeePayrollDetails>,
    @InjectModel(employeePenalties.name)
    private employeePenaltiesModel: Model<employeePenalties>,
    @InjectModel(paySlip.name)
    private payslipModel: Model<paySlip>,
    @InjectModel(EmployeeProfile.name)
    private employeeModel: Model<EmployeeProfile>,
    // ✅ Inject CalcDraftService
    private calcDraftService: CalcDraftService,
  ) {}

  async getPendingSigningBonuses() {
    console.log('🔍 Model name:', this.employeeSigningBonusModel.modelName);
    console.log(
      '🔍 Collection name:',
      this.employeeSigningBonusModel.collection.name,
    );
    console.log('🔍 Status enum value:', BonusStatus.PENDING);

    const allDocs = await this.employeeSigningBonusModel.find({}).exec();
    console.log('🔍 Total docs in collection:', allDocs.length);
    console.log('🔍 Sample doc:', allDocs[0]);

    const results = await this.employeeSigningBonusModel
      .find({ status: BonusStatus.PENDING })
      .populate('employeeId', 'firstName lastName email')
      .populate('signingBonusId')
      .sort({ createdAt: -1 })
      .exec();

    console.log('🔍 Results with PENDING status:', results.length);
    return results;
  }
  async getSigningBonusById(id: string) {
    const signingBonus = await this.employeeSigningBonusModel
      .findById(id)
      .populate('employeeId', 'firstName lastName email')
      .populate('signingBonusId')
      .exec();

    if (!signingBonus) {
      throw new NotFoundException(`Signing bonus with ID ${id} not found`);
    }
    return signingBonus;
  }

  async approveSigningBonus(id: string) {
    const signingBonus = await this.employeeSigningBonusModel.findById(id);
    if (!signingBonus) {
      throw new NotFoundException(`Signing bonus with ID ${id} not found`);
    }
    if (signingBonus.status !== BonusStatus.PENDING) {
      throw new BadRequestException(
        `Signing bonus is already ${signingBonus.status}. Cannot approve.`,
      );
    }
    signingBonus.status = BonusStatus.APPROVED;
    return await signingBonus.save();
  }
  // Add to PayrollExecutionService
  async getAllPayrollRuns(filters?: any) {
    const query: any = {};

    if (filters?.status) query.status = filters.status;
    if (filters?.entity) query.entity = filters.entity;
    if (filters?.startDate || filters?.endDate) {
      query.payrollPeriod = {};
      if (filters.startDate)
        query.payrollPeriod.$gte = new Date(filters.startDate);
      if (filters.endDate) query.payrollPeriod.$lte = new Date(filters.endDate);
    }

    return await this.payrollRunsModel
      .find(query)
      .populate('payrollSpecialistId', 'firstName lastName email')
      .populate('payrollManagerId', 'firstName lastName email')
      .populate('financeStaffId', 'firstName lastName email')
      .sort({ createdAt: -1 })
      .exec();
  }

  async rejectSigningBonus(id: string) {
    const signingBonus = await this.employeeSigningBonusModel.findById(id);
    if (!signingBonus) {
      throw new NotFoundException(`Signing bonus with ID ${id} not found`);
    }
    if (signingBonus.status !== BonusStatus.PENDING) {
      throw new BadRequestException(
        `Signing bonus is already ${signingBonus.status}. Cannot reject.`,
      );
    }
    signingBonus.status = BonusStatus.REJECTED;
    return await signingBonus.save();
  }

  // Fixed getAllPayslips method for PayrollExecutionService
  // Based on actual schema structure

  async getAllPayslips(
    runId?: string,
    employeeName?: string,
    department?: string,
  ) {
    const query: any = {};

    if (runId) {
      const runObjectId = await this._resolveRunObjectId(runId);
      query.payrollRunId = runObjectId;
    }

    let payslips = await this.payslipModel
      .find(query)
      .populate('employeeId', 'firstName lastName email code department')
      .populate('payrollRunId')
      .exec();

    // Filter by employee name
    if (employeeName) {
      payslips = payslips.filter((p) => {
        const emp = p.employeeId as any;
        if (!emp) return false;
        const fullName =
          `${emp.firstName || ''} ${emp.lastName || ''}`.toLowerCase();
        return fullName.includes(employeeName.toLowerCase());
      });
    }

    // Filter by department
    if (department) {
      payslips = payslips.filter((p) => {
        const emp = p.employeeId as any;
        return emp && emp.department === department;
      });
    }

    // Map to frontend format
    return payslips.map((payslip) => {
      const emp = payslip.employeeId as any;
      const run = payslip.payrollRunId as any;

      // Calculate allowances - allowance schema likely has 'amount' property
      const allowancesTotal = Array.isArray(payslip.earningsDetails?.allowances)
        ? payslip.earningsDetails.allowances.reduce(
            (sum, a: any) => sum + (a.amount || 0),
            0,
          )
        : 0;

      // Calculate bonuses - signingBonus schema uses 'givenAmount' property
      const bonusesTotal = Array.isArray(payslip.earningsDetails?.bonuses)
        ? payslip.earningsDetails.bonuses.reduce(
            (sum, b: any) => sum + (b.givenAmount || 0),
            0,
          )
        : 0;

      // Calculate benefits - terminationAndResignationBenefits schema uses 'givenAmount' property
      const benefitsTotal = Array.isArray(payslip.earningsDetails?.benefits)
        ? payslip.earningsDetails.benefits.reduce(
            (sum, b: any) => sum + (b.givenAmount || 0),
            0,
          )
        : 0;

      // Calculate refunds if present
      const refundsTotal = Array.isArray(payslip.earningsDetails?.refunds)
        ? payslip.earningsDetails.refunds.reduce(
            (sum, r: any) => sum + (r.amount || 0),
            0,
          )
        : 0;

      // Calculate taxes - taxRules schema likely has 'amount' property
      const taxesTotal = Array.isArray(payslip.deductionsDetails?.taxes)
        ? payslip.deductionsDetails.taxes.reduce(
            (sum, t: any) => sum + (t.amount || 0),
            0,
          )
        : 0;

      // Calculate insurance - insuranceBrackets schema likely has 'amount' property
      const insuranceTotal = Array.isArray(
        payslip.deductionsDetails?.insurances,
      )
        ? payslip.deductionsDetails.insurances.reduce(
            (sum, i: any) => sum + (i.amount || 0),
            0,
          )
        : 0;

      // Calculate penalties - employeePenalties has nested structure
      let penaltiesTotal = 0;
      if (payslip.deductionsDetails?.penalties) {
        const penalties = payslip.deductionsDetails.penalties as any;
        // employeePenalties schema has a 'penalties' array property
        if (Array.isArray(penalties.penalties)) {
          penaltiesTotal = penalties.penalties.reduce(
            (sum: number, p: any) => sum + (p.amount || 0),
            0,
          );
        }
      }

      return {
        _id: payslip._id,
        employeeId: emp?._id,
        employeeName: emp
          ? `${emp.firstName || ''} ${emp.lastName || ''}`.trim()
          : 'Unknown',
        employeeCode: emp?.code || emp?._id || 'N/A',
        department: emp?.department || 'N/A',
        runPeriod: run?.payrollPeriod || new Date(),
        grossSalary: payslip.totalGrossSalary || 0,
        deductions: payslip.totaDeductions || 0,
        netPay: payslip.netPay || 0,
        status: payslip.paymentStatus || 'pending',
        earnings: {
          baseSalary: payslip.earningsDetails?.baseSalary || 0,
          allowances: allowancesTotal,
          bonuses: bonusesTotal,
          benefits: benefitsTotal,
          refunds: refundsTotal,
        },
        deductionsBreakdown: {
          taxes: taxesTotal,
          insurance: insuranceTotal,
          penalties: penaltiesTotal,
        },
      };
    });
  }

  async getPayslipById(id: string) {
    const payslip = await this.payslipModel
      .findById(id)
      .populate('employeeId')
      .populate('payrollRunId')
      .exec();

    if (!payslip) {
      throw new NotFoundException('Payslip not found');
    }

    return payslip;
  }

  async editSigningBonus(id: string, givenAmount: number, paymentDate?: Date) {
    const signingBonus = await this.employeeSigningBonusModel.findById(id);
    if (!signingBonus) {
      throw new NotFoundException(`Signing bonus with ID ${id} not found`);
    }
    if (signingBonus.status === BonusStatus.PAID) {
      throw new BadRequestException('Cannot edit a paid signing bonus');
    }

    signingBonus.givenAmount = givenAmount;
    if (paymentDate) {
      signingBonus.paymentDate = paymentDate;
    }

    return await signingBonus.save();
  }

  async getPendingBenefits() {
    return await this.terminationAndResignationBenefitsModel
      .find({ status: BenefitStatus.PENDING })
      .populate('employeeId', 'firstName lastName email')
      .populate('benefitId')
      .populate('terminationId')
      .sort({ createdAt: -1 })
      .exec();
  }

  async getBenefitById(id: string) {
    const benefit = await this.terminationAndResignationBenefitsModel
      .findById(id)
      .populate('employeeId', 'firstName lastName email')
      .populate('benefitId')
      .populate('terminationId')
      .exec();

    if (!benefit) {
      throw new NotFoundException(`Benefit with ID ${id} not found`);
    }
    return benefit;
  }

  async approveBenefit(id: string) {
    const benefit =
      await this.terminationAndResignationBenefitsModel.findById(id);
    if (!benefit) {
      throw new NotFoundException(`Benefit with ID ${id} not found`);
    }
    if (benefit.status !== BenefitStatus.PENDING) {
      throw new BadRequestException(
        `Benefit is already ${benefit.status}. Cannot approve.`,
      );
    }
    benefit.status = BenefitStatus.APPROVED;
    return await benefit.save();
  }

  async rejectBenefit(id: string) {
    const benefit =
      await this.terminationAndResignationBenefitsModel.findById(id);
    if (!benefit) {
      throw new NotFoundException(`Benefit with ID ${id} not found`);
    }
    if (benefit.status !== BenefitStatus.PENDING) {
      throw new BadRequestException(
        `Benefit is already ${benefit.status}. Cannot reject.`,
      );
    }
    benefit.status = BenefitStatus.REJECTED;
    return await benefit.save();
  }

  async editBenefit(id: string, givenAmount: number) {
    const benefit =
      await this.terminationAndResignationBenefitsModel.findById(id);
    if (!benefit) {
      throw new NotFoundException(`Benefit with ID ${id} not found`);
    }
    if (benefit.status === BenefitStatus.PAID) {
      throw new BadRequestException('Cannot edit a paid benefit');
    }

    benefit.givenAmount = givenAmount;
    return await benefit.save();
  }

  async getSuggestedPayrollPeriod() {
    const now = new Date();
    const year = now.getFullYear();
    const month = now.getMonth();

    const endOfMonth = new Date(year, month + 1, 0);

    return {
      payrollPeriod: endOfMonth.toISOString(),
    };
  }

  async validatePayrollPeriod(payrollPeriod: Date) {
    const errors: string[] = [];
    const warnings: string[] = [];

    const periodDate = new Date(payrollPeriod);
    const now = new Date();

    if (periodDate < now) {
      warnings.push('Payroll period is in the past');
    }

    const overlappingRun = await this.payrollRunsModel.findOne({
      payrollPeriod: periodDate,
      status: { $nin: [PayRollStatus.REJECTED] },
    });

    if (overlappingRun) {
      errors.push('A payroll run already exists for this period');
    }

    return {
      isValid: errors.length === 0,
      errors: errors.length > 0 ? errors : undefined,
      warnings: warnings.length > 0 ? warnings : undefined,
    };
  }

  async getPayrollRunById(id: string) {
    const payrollRun = await this.payrollRunsModel
      .findById(id)
      .populate('payrollSpecialistId', 'firstName lastName email')
      .populate('payrollManagerId', 'firstName lastName email')
      .populate('financeStaffId', 'firstName lastName email')
      .exec();

    if (!payrollRun) {
      throw new NotFoundException(`Payroll run with ID ${id} not found`);
    }
    return payrollRun;
  }

  async approvePayrollPeriod(id: string, payrollManagerId: string) {
    const payrollRun = await this.payrollRunsModel.findById(id).exec();
    if (!payrollRun) {
      throw new NotFoundException(`Payroll run with ID ${id} not found`);
    }

    const validation = await this.validatePayrollPeriod(
      payrollRun.payrollPeriod,
    );

    if (!validation.isValid) {
      throw new BadRequestException({
        message: 'Invalid payroll period',
        errors: validation.errors,
      });
    }

    const preRunCheck = await this.checkPreRunApprovalsComplete();
    if (!preRunCheck.allApprovalsComplete) {
      throw new BadRequestException({
        message: 'Cannot approve payroll. Pending pre-run approvals.',
        details: preRunCheck,
      });
    }

    payrollRun.payrollManagerId = payrollManagerId as any;
    payrollRun.managerApprovalDate = new Date();

    await payrollRun.save();

    return payrollRun;
  }

  async rejectPayrollPeriod(id: string, rejectionReason: string) {
    const payrollRun = await this.payrollRunsModel.findById(id).exec();
    if (!payrollRun) {
      throw new NotFoundException(`Payroll run with ID ${id} not found`);
    }

    payrollRun.status = PayRollStatus.REJECTED;
    payrollRun.rejectionReason = rejectionReason;

    await payrollRun.save();

    return {
      message: 'Payroll period rejected. Please edit the period and restart.',
      payrollRun,
    };
  }

  async editPayrollPeriod(id: string, newPayrollPeriod: Date) {
    const payrollRun = await this.payrollRunsModel.findById(id).exec();
    if (!payrollRun) {
      throw new NotFoundException(`Payroll run with ID ${id} not found`);
    }

    if (payrollRun.status === PayRollStatus.LOCKED) {
      throw new BadRequestException('Cannot edit a locked payroll run');
    }

    const validation = await this.validatePayrollPeriod(newPayrollPeriod);

    if (!validation.isValid) {
      throw new BadRequestException({
        message: 'Invalid payroll period',
        errors: validation.errors,
      });
    }

    payrollRun.payrollPeriod = newPayrollPeriod;
    payrollRun.status = PayRollStatus.DRAFT;

    return await payrollRun.save();
  }
  async startPayrollInitiation(
    runId: string,
    payrollPeriod: Date,
    payrollSpecialistId: string,
    entity: string,
  ) {
    try {
      console.log('🚀 Starting payroll initiation...', { runId, payrollPeriod, entity });
  
      // Check pre-run approvals
      const preRunCheck = await this.checkPreRunApprovalsComplete();
      console.log('✅ Pre-run check:', preRunCheck);
      
      if (!preRunCheck.allApprovalsComplete) {
        throw new BadRequestException({
          message: 'Cannot start payroll. Pending pre-run approvals.',
          details: preRunCheck,
        });
      }
  
      // Validate payroll period
      const validation = await this.validatePayrollPeriod(payrollPeriod);
      console.log('✅ Period validation:', validation);
      
      if (!validation.isValid) {
        throw new BadRequestException({
          message: 'Invalid payroll period',
          errors: validation.errors,
        });
      }
  
      // Create payroll run
      console.log('📝 Creating payroll run...');
      const payrollRun = new this.payrollRunsModel({
        runId,
        payrollPeriod,
        status: PayRollStatus.DRAFT,
        entity,
        employees: 0,
        exceptions: 0,
        totalnetpay: 0,
        payrollSpecialistId,
        paymentStatus: PaySlipPaymentStatus.PENDING,
      });
  
      await payrollRun.save();
      console.log('✅ Payroll run created:', payrollRun._id);
  
      // Fetch active employees
      console.log('👥 Fetching active employees...');
      const employees = await this.employeeModel
        .find({ status: EmployeeStatus.ACTIVE })
        .lean()
        .exec();
  
      console.log(`✅ Found ${employees.length} active employees`);
  
      if (!employees || employees.length === 0) {
        throw new BadRequestException('No active employees found');
      }
  
      // Process draft generation
      console.log('⚙️ Processing draft generation...');
      const runObjectId = new mongoose.Types.ObjectId(payrollRun._id);
      
      const result = await this.calcDraftService.processDraftGeneration(
        runObjectId, 
        employees
      );
      
      console.log('✅ Draft generation complete:', {
        employees: result.run.employees,
        exceptions: result.exceptionsCount,
        totalNetPay: result.run.totalnetpay
      });
  
      // Return updated run
      return await this.payrollRunsModel.findById(payrollRun._id).exec();
      
    } catch (error) {
      console.error('❌ Error in startPayrollInitiation:', error);
      
      // Provide detailed error message
      if (error instanceof BadRequestException) {
        throw error;
      }
      
      throw new BadRequestException({
        message: 'Failed to create payroll run',
        error: error.message,
        stack: process.env.NODE_ENV === 'development' ? error.stack : undefined
      });
    }
  }


  async checkPreRunApprovalsComplete() {
    const pendingBonuses = await this.employeeSigningBonusModel.countDocuments({
      status: BonusStatus.PENDING,
    });

    const pendingBenefits =
      await this.terminationAndResignationBenefitsModel.countDocuments({
        status: BenefitStatus.PENDING,
      });

    const blockers: string[] = [];

    if (pendingBonuses > 0) {
      blockers.push(`${pendingBonuses} signing bonus(es) pending approval`);
    }

    if (pendingBenefits > 0) {
      blockers.push(
        `${pendingBenefits} termination/resignation benefit(s) pending approval`,
      );
    }

    return {
      allApprovalsComplete: blockers.length === 0,
      pendingSigningBonuses: pendingBonuses,
      pendingBenefits: pendingBenefits,
      blockers: blockers.length > 0 ? blockers : undefined,
    };
  }

  async publishDraftForApproval(runId: string) {
    const runObjectId = await this._resolveRunObjectId(runId);
    const run = await this.payrollRunsModel.findById(runObjectId);
    if (!run) throw new NotFoundException('Payroll run not found');

    // Fixed: Complete the condition
    if (run.status === PayRollStatus.APPROVED) {
      throw new BadRequestException(
        'Cannot publish a run that is already approved',
      );
    }

    run.status = PayRollStatus.UNDER_REVIEW;
    if (run) {
      await run.save();
    } else {
      throw new NotFoundException('Payroll run not found');
    }
    return run;
  }

  async approveByPayrollManager(runId: string, approverId?: string) {
    const runObjectId = await this._resolveRunObjectId(runId);
    const run = await this.payrollRunsModel.findById(runObjectId);
    if (!run) throw new NotFoundException('Payroll run not found');

    if (run.status === PayRollStatus.REJECTED) {
      throw new BadRequestException('Cannot approve a rejected payroll run');
    }

    run.managerApprovalDate = new Date();
    run.status = PayRollStatus.PENDING_FINANCE_APPROVAL; // Fixed: Use enum value
    if (approverId) run.payrollManagerId = approverId as any;
    await run.save();
    return {
      message: 'Payroll manager approved',
      runId: run.runId,
      managerApprovalDate: run.managerApprovalDate,
    };
  }

  async rejectByPayrollManager(
    runId: string,
    reason: string,
    approverId?: string,
  ) {
    if (!reason) throw new BadRequestException('Rejection reason is required');
    const runObjectId = await this._resolveRunObjectId(runId);
    const run = await this.payrollRunsModel.findById(runObjectId);
    if (!run) throw new NotFoundException('Payroll run not found');

    run.rejectionReason = `Manager: ${reason}`;
    run.managerApprovalDate = undefined;
    run.status = PayRollStatus.REJECTED;
    if (approverId) run.payrollManagerId = approverId as any;
    await run.save();
    return { message: 'Payroll manager rejected', runId: run.runId, reason };
  }

  async approveByFinanceStaff(runId: string, approverId?: string) {
    const runObjectId = await this._resolveRunObjectId(runId);
    const run = await this.payrollRunsModel.findById(runObjectId);
    if (!run) throw new NotFoundException('Payroll run not found');

    if (!run.managerApprovalDate) {
      throw new BadRequestException(
        'Cannot approve before Payroll Manager approval',
      );
    }

    run.financeApprovalDate = new Date();
    run.status = PayRollStatus.APPROVED; // Fixed: Use enum value
    if (approverId) run.financeStaffId = approverId as any;
    run.paymentStatus = PaySlipPaymentStatus.PENDING as any;
    await run.save();

    return {
      message: 'Finance approved',
      runId: run.runId,
      financeApprovalDate: run.financeApprovalDate,
    };
  }

  async rejectByFinanceStaff(
    runId: string,
    reason: string,
    approverId?: string,
  ) {
    if (!reason) throw new BadRequestException('Rejection reason is required');
    const runObjectId = await this._resolveRunObjectId(runId);
    const run = await this.payrollRunsModel.findById(runObjectId);
    if (!run) throw new NotFoundException('Payroll run not found');

    run.rejectionReason = `Finance: ${reason}`;
    run.financeApprovalDate = undefined;
    run.status = PayRollStatus.REJECTED;
    if (approverId) run.financeStaffId = approverId as any;
    await run.save();
    return { message: 'Payroll rejected by finance', runId: run.runId, reason };
  }

  async freezePayroll(runId: string, reason?: string) {
    try {
      console.log('🔒 Starting freeze for runId:', runId);
      
      const runObjectId = await this._resolveRunObjectId(runId);
      console.log('✅ Resolved ObjectId:', runObjectId);
      
      const run = await this.payrollRunsModel.findById(runObjectId);
      if (!run) throw new NotFoundException('Payroll run not found');
      
      console.log('✅ Run found, status:', run.status);
      
      // Check if run is in correct status
      if (run.status !== PayRollStatus.APPROVED) {
        throw new BadRequestException(
          `Cannot freeze payroll. Current status: ${run.status}. Must be APPROVED.`
        );
      }
      
      // Check if payslips already exist
      const existingPayslips = await this.payslipModel.countDocuments({
        payrollRunId: runObjectId
      });
      
      console.log('📄 Existing payslips:', existingPayslips);
      
      let payslipsGenerated;
      
      if (existingPayslips === 0) {
        console.log('📝 Generating payslips...');
        payslipsGenerated = await this.generatePayslips(runId); // ✅ USE runId VARIABLE
        console.log('✅ Payslips generated:', payslipsGenerated.count);
        
        if (!payslipsGenerated || payslipsGenerated.count === 0) {
          throw new BadRequestException('No payslips could be generated');
        }
      } else {
        console.log('ℹ️ Payslips already exist, skipping generation');
      }
      
      run.status = PayRollStatus.LOCKED;
      if (reason) run.rejectionReason = `Locked: ${reason}`;
      await run.save();
      
      console.log('✅ Payroll frozen successfully');
      
      return { 
        message: 'Payroll run locked', 
        runId: run.runId,
        payslipsCount: existingPayslips || payslipsGenerated?.count
      };
      
    } catch (error) {
      console.error('❌ Error in freezePayroll:', error);
      throw error;
    }
  }
  async unfreezePayroll(runId: string, unlockReason?: string) {
    const runObjectId = await this._resolveRunObjectId(runId);
    const run = await this.payrollRunsModel.findById(runObjectId);
    if (!run) throw new NotFoundException('Payroll run not found');

    run.status = PayRollStatus.UNLOCKED; // Fixed: Use UNLOCKED instead of DRAFT
    if (unlockReason) run.unlockReason = unlockReason;
    await run.save();
    return { message: 'Payroll run unlocked', runId: run.runId };
  }

  async getApprovalsByRunId(runId: string) {
    const runObjectId = await this._resolveRunObjectId(runId);
    const run = await this.payrollRunsModel.findById(runObjectId).exec();
    if (!run) throw new NotFoundException('Payroll run not found');

    return {
      runId: run.runId,
      status: run.status,
      managerApprovalDate: run.managerApprovalDate,
      financeApprovalDate: run.financeApprovalDate,
      rejectionReason: run.rejectionReason,
      unlockReason: run.unlockReason,
      payrollManagerId: run.payrollManagerId,
      financeStaffId: run.financeStaffId,
    };
  }

  async createPayrollAdjustment(
    runId: string,
    employeeId: string,
    type: 'bonus' | 'deduction' | 'benefit',
    amount: number,
    reason?: string,
  ) {
    if (!amount || isNaN(amount))
      throw new BadRequestException('Amount must be a valid number');

    const runObjectId = await this._resolveRunObjectId(runId);
    const details = await this.employeePayrollDetailsModel.findOne({
      payrollRunId: runObjectId,
      employeeId: new mongoose.Types.ObjectId(employeeId),
    });
    if (!details)
      throw new NotFoundException(
        'Employee payroll details not found for this run',
      );

    switch (type) {
      case 'bonus':
        details.bonus = (details.bonus ?? 0) + amount;
        details.netPay = (details.netPay ?? 0) + amount;
        break;
      case 'benefit':
        details.benefit = (details.benefit ?? 0) + amount;
        details.netPay = (details.netPay ?? 0) + amount;
        break;
      case 'deduction':
        details.deductions = (details.deductions ?? 0) + amount;
        details.netPay = (details.netPay ?? 0) - amount;
        break;
      default:
        throw new BadRequestException('Unsupported adjustment type');
    }

    if (reason) {
      details.exceptions = details.exceptions
        ? `${details.exceptions}; ${reason}`
        : reason;
    }

    await details.save();
    return details;
  }

  async resolveException(
    runId: string,
    employeeId: string,
    resolutionNote?: string,
  ) {
    const runObjectId = await this._resolveRunObjectId(runId);
    const details = await this.employeePayrollDetailsModel.findOne({
      payrollRunId: runObjectId,
      employeeId: new mongoose.Types.ObjectId(employeeId),
    });
    if (!details)
      throw new NotFoundException(
        'Employee payroll details not found for this run',
      );

    if (!details.exceptions) {
      return { message: 'No exception to resolve' };
    }

    details.exceptions = resolutionNote
      ? `${details.exceptions} -- RESOLVED: ${resolutionNote}`
      : undefined;
    await details.save();
    return { message: 'Exception resolved', employeeId, runId };
  }

  async generatePayslips(runId: string) {
    try {
      console.log('📝 Starting payslip generation for runId:', runId);
      
      const runObjectId = await this._resolveRunObjectId(runId);
      const run = await this.payrollRunsModel.findById(runObjectId);
      if (!run) throw new NotFoundException('Payroll run not found');
  
      const detailsList = await this.employeePayrollDetailsModel.find({
        payrollRunId: runObjectId,
      });
      
      console.log('📊 Found employee details:', detailsList.length);
      
      if (!detailsList || detailsList.length === 0) {
        throw new BadRequestException(
          'No employee payroll details found for this run',
        );
      }
  
      const created: any[] = [];
  
      for (const d of detailsList) {
        try {
          console.log('👤 Processing employee:', d.employeeId);
          
          const penaltiesDoc = await this.employeePenaltiesModel.findOne({
            employeeId: d.employeeId,
          }).exec();
  
          console.log('📌 Penalties found:', !!penaltiesDoc);
  
          const payslipDoc: Partial<paySlip> = {
            employeeId: d.employeeId,
            payrollRunId: runObjectId,
            earningsDetails: {
              baseSalary: d.baseSalary ?? 0,
              allowances: [],
              // ✅ FIX: Use 'amount' instead of 'givenAmount' and add positionName
              bonuses: d.bonus ? [{
                amount: d.bonus,           // Use 'amount' not 'givenAmount'
                positionName: 'Bonus',     // Add required positionName
                givenAmount: d.bonus       // Keep givenAmount if your schema has it
              }] : [],
              benefits: d.benefit ? [{
                amount: d.benefit,         // Use 'amount' not 'givenAmount'
                positionName: 'Benefit',   // Add required positionName
                givenAmount: d.benefit     // Keep givenAmount if your schema has it
              }] : [],
              refunds: [],
            } as any,
            deductionsDetails: {
              taxes: [],
              insurances: [],
              penalties: penaltiesDoc
                ? {
                    employeeId: penaltiesDoc.employeeId,
                    penalties: penaltiesDoc.penalties,
                  }
                : undefined,
            } as any,
            totalGrossSalary:
              (d.baseSalary ?? 0) +
              (d.allowances ?? 0) +
              (d.bonus ?? 0) +
              (d.benefit ?? 0),
            totaDeductions: d.deductions ?? 0,
            netPay: d.netPay ?? 0,
            paymentStatus: PaySlipPaymentStatus.PENDING as any,
          };
  
          const createdPayslip = await this.payslipModel.create(payslipDoc);
          created.push(createdPayslip);
          
          console.log('✅ Created payslip:', createdPayslip._id);
          
        } catch (error) {
          console.error('❌ Error creating payslip for employee:', d.employeeId);
          console.error('❌ Error details:', error.message);
          throw new BadRequestException(
            `Failed to create payslip for employee ${d.employeeId}: ${error.message}`
          );
        }
      }
  
      run.employees = detailsList.length;
      run.exceptions = detailsList.filter((x) => !!x.exceptions).length;
      run.totalnetpay = detailsList.reduce((s, x) => s + (x.netPay ?? 0), 0);
      await run.save();
  
      console.log('✅ All payslips generated successfully:', created.length);
  
      return {
        count: created.length,
        payslips: created.map((p) => ({ id: p._id, employeeId: p.employeeId })),
      };
    } catch (error) {
      console.error('❌ Error in generatePayslips:', error);
      throw error;
    }
  }

  async distributePayslips(runId: string) {
    const runObjectId = await this._resolveRunObjectId(runId);
    // Note: You might want to add a DISTRIBUTED status to your enum if needed
    const res = await this.payslipModel.updateMany(
      { payrollRunId: runObjectId },
      { paymentStatus: PaySlipPaymentStatus.PENDING as any },
    );
    return {
      modifiedCount: (res as any).modifiedCount ?? (res as any).nModified ?? 0,
    };
  }

  async markPayrollAsPaid(runId: string) {
    const runObjectId = await this._resolveRunObjectId(runId);
    const run = await this.payrollRunsModel.findById(runObjectId);
    if (!run) throw new NotFoundException('Payroll run not found');

    const res = await this.payslipModel.updateMany(
      { payrollRunId: runObjectId },
      { paymentStatus: PaySlipPaymentStatus.PAID as any },
    );
    run.paymentStatus = PaySlipPaymentStatus.PAID as any;
    await run.save();

    return {
      modifiedCount: (res as any).modifiedCount ?? (res as any).nModified ?? 0,
      runPaymentStatus: run.paymentStatus,
    };
  }

  async flagPayrollExceptions(payrollRunId: string) {
    const runObjectId = await this._resolveRunObjectId(payrollRunId);

    const details = await this.employeePayrollDetailsModel.find({
      payrollRunId: runObjectId,
      exceptions: { $exists: true, $ne: '' },
    });

    if (!details.length) {
      return { message: 'No exceptions found', exceptions: [] };
    }

    const run = await this.payrollRunsModel.findById(runObjectId);
    if (run) {
      run.exceptions = details.length;
      await run.save();
    } else {
      throw new NotFoundException('Payroll run not found');
    }
    await run.save();

    return {
      message: 'Exceptions flagged',
      totalEmployeesWithExceptions: details.length,
      exceptions: details.map((x) => ({
        employeeId: x.employeeId,
        exception: x.exceptions,
      })),
    };
  }

  async getPayrollRunExceptions(payrollRunId: string) {
    const runObjectId = await this._resolveRunObjectId(payrollRunId);

    const details = await this.employeePayrollDetailsModel
      .find({
        payrollRunId: runObjectId,
        exceptions: { $exists: true, $ne: '' },
      })
      .populate('employeeId', 'firstName lastName email');

    return {
      runId: payrollRunId,
      count: details.length,
      exceptions: details.map((d) => ({
        employee: d.employeeId,
        exception: d.exceptions,
      })),
    };
  }

  async reviewPayrollDraft(payrollRunId: string) {
    const runObjectId = await this._resolveRunObjectId(payrollRunId);
  
    const run = await this.payrollRunsModel
      .findById(runObjectId)
      .populate('payrollSpecialistId', 'firstName lastName email');
  
    if (!run) throw new NotFoundException('Payroll run not found');
  
    // DEBUG: Log the model info
    console.log('🔍 EmployeeProfile model name:', this.employeeModel.modelName);
    console.log('🔍 EmployeeProfile collection:', this.employeeModel.collection.name);
    
    // Check if we can find an employee directly
    const testEmployee = await this.employeeModel.findOne({});
    console.log('🔍 Test employee lookup:', testEmployee ? 'FOUND' : 'NOT FOUND');
    if (testEmployee) {
      console.log('🔍 Test employee name:', testEmployee.firstName, testEmployee.lastName);
    }
  
    const details = await this.employeePayrollDetailsModel
      .find({ payrollRunId: runObjectId })
      .populate('employeeId', 'firstName lastName email code department bankName bankAccountNumber')
      .exec();
  
    // DEBUG: Log first detail
    console.log('🔍 First detail employeeId:', details[0]?.employeeId);
  
    return {
      run,
      summary: {
        employees: run.employees,
        exceptions: run.exceptions,
        totalNetPay: run.totalnetpay,
      },
      employees: details,
    };
  }

  async getPayrollForManagerReview(payrollRunId: string) {
    const runObjectId = await this._resolveRunObjectId(payrollRunId);
  
    const run = await this.payrollRunsModel
      .findById(runObjectId)
      .populate('payrollSpecialistId', 'firstName lastName email')
      .populate('payrollManagerId', 'firstName lastName email');
  
    if (!run) throw new NotFoundException('Payroll run not found');
  
    // ✅ ADD .populate() HERE
    const details = await this.employeePayrollDetailsModel
      .find({ payrollRunId: runObjectId })
      .populate('employeeId', 'firstName lastName email code department bankAccountDetails')
      .exec();
  
    return {
      runId: run.runId,
      reviewerRole: 'PAYROLL_MANAGER',
      managerApprovalDate: run.managerApprovalDate,
      financeApprovalDate: run.financeApprovalDate,
      status: run.status,
      rejectionReason: run.rejectionReason,
      summary: {
        employees: run.employees,
        exceptions: run.exceptions,
        totalNetPay: run.totalnetpay,
      },
      employees: details,
    };
  }
  

  async getPayrollForFinanceReview(payrollRunId: string) {
    const runObjectId = await this._resolveRunObjectId(payrollRunId);

    const run = await this.payrollRunsModel
      .findById(runObjectId)
      .populate('payrollSpecialistId', 'firstName lastName email')
      .populate('financeStaffId', 'firstName lastName email')
      .populate('payrollManagerId', 'firstName lastName email');

    if (!run) throw new NotFoundException('Payroll run not found');

    if (!run.managerApprovalDate) {
      throw new BadRequestException(
        'Payroll cannot be reviewed by finance before manager approval',
      );
    }

    const details = await this.employeePayrollDetailsModel.find({
      payrollRunId: runObjectId,
    });

    return {
      runId: run.runId,
      reviewerRole: 'FINANCE_STAFF',
      managerApprovalDate: run.managerApprovalDate,
      financeApprovalDate: run.financeApprovalDate,
      status: run.status,
      rejectionReason: run.rejectionReason,
      summary: {
        employees: run.employees,
        exceptions: run.exceptions,
        totalNetPay: run.totalnetpay,
      },
      employees: details,
    };
  }

  private async _resolveRunObjectId(
    runIdOrId: string,
  ): Promise<mongoose.Types.ObjectId> {
    if (mongoose.Types.ObjectId.isValid(runIdOrId)) {
      return new mongoose.Types.ObjectId(runIdOrId);
    }

    const run = await this.payrollRunsModel.findOne({ runId: runIdOrId });
    if (!run) throw new NotFoundException('Payroll run not found');
    return run._id;
  }

}