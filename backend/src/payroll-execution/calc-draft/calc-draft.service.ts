// FINAL PRODUCTION VERSION - calc-draft.service.ts
// Copy this to replace your current service file

import { Injectable } from '@nestjs/common';
import { CreateCalcDraftDto } from './dto/create-calc-draft.dto';
import { UpdateCalcDraftDto } from './dto/update-calc-draft.dto';
import { payrollRuns, payrollRunsDocument } from '../models/payrollRuns.schema';
import { employeePayrollDetails, employeePayrollDetailsDocument } from '../models/employeePayrollDetails.schema';
import { employeePenalties, employeePenaltiesDocument } from '../models/employeePenalties.schema';
import { paySlip, PayslipDocument } from '../models/payslip.schema';
import { employeeSigningBonus, employeeSigningBonusDocument } from '../models/EmployeeSigningBonus.schema';
import { EmployeeTerminationResignation, EmployeeTerminationResignationDocument } from '../models/EmployeeTerminationResignation.schema';
import { InjectModel, InjectConnection } from '@nestjs/mongoose';
import mongoose, { Model, Connection } from 'mongoose';
import { PayRollStatus, PayRollPaymentStatus, BankStatus, BonusStatus, BenefitStatus, PaySlipPaymentStatus } from '../enums/payroll-execution-enum';

@Injectable()
export class CalcDraftService {
  constructor(
    @InjectModel(employeeSigningBonus.name) 
    private employeeSigningBonusModel: Model<employeeSigningBonus>,
    
    @InjectModel(payrollRuns.name) 
    private payrollRunsModel: Model<payrollRuns>,
    
    @InjectModel(employeePayrollDetails.name) 
    private employeePayrollDetailsModel: Model<employeePayrollDetails>,
    
    @InjectModel(employeePenalties.name) 
    private employeePenaltiesModel: Model<employeePenalties>,
    
    @InjectModel(paySlip.name) 
    private paySlipModel: Model<paySlip>,
    
    @InjectModel(EmployeeTerminationResignation.name) 
    private employeeTerminationResignationModel: Model<EmployeeTerminationResignation>,
    
    @InjectModel('payGrade')
    private payGradeModel: Model<any>,
    
    @InjectConnection() 
    private connection: Connection,
  ) {}

  async createPayrollRun(createCalcDraftDto: CreateCalcDraftDto): Promise<payrollRuns> {
    const runId = `PR-${new Date().getFullYear()}-${Math.floor(1000 + Math.random() * 9000)}`;
    
    const newPayrollRun = new this.payrollRunsModel({
      ...createCalcDraftDto,
      runId,
      status: PayRollStatus.DRAFT,
      employees: 0,
      exceptions: 0,
      totalnetpay: 0,
      paymentStatus: PayRollPaymentStatus.PENDING,
    });
    
    return await newPayrollRun.save();
  }

  async createPayrollDetails(payrollRunId: mongoose.Types.ObjectId, employeeData: any[]): Promise<employeePayrollDetails[]> {
    const payrollDetails: employeePayrollDetails[] = [];

    for(const employee of employeeData){
      const baseSalary = await this.getEmployeeBaseSalary(employee);
      
      const payrollDetail = await this.employeePayrollDetailsModel.create({
        payrollRunId,
        employeeId: employee._id,
        baseSalary: baseSalary,
        allowances: 0,
        deductions: 0,
        netSalary: 0,
        netPay: 0,
        bankStatus: BankStatus.VALID,
        bonus: 0,
        benefit: 0,
      });
      payrollDetails.push(payrollDetail);
    }
    return payrollDetails;
  }

  async getEmployeeBaseSalary(employee: any): Promise<number> {
    // Method 1: Check if employee has baseSalary directly
    if (employee.baseSalary && employee.baseSalary > 0) {
      return employee.baseSalary;
    }
    
    // Method 2: Check if payGrade is already populated
    if (employee.payGradeId && typeof employee.payGradeId === 'object' && employee.payGradeId.baseSalary) {
      return employee.payGradeId.baseSalary;
    }
    
    // Method 3: Fetch from payGrade using model
    if (employee.payGradeId && this.payGradeModel) {
      try {
        const payGrade = await this.payGradeModel.findById(employee.payGradeId);
        if (payGrade && payGrade.baseSalary) {
          return payGrade.baseSalary;
        }
      } catch (error) {
        // Continue to fallback
      }
    }
    
    // Method 4: Fallback to direct MongoDB query
    if (employee.payGradeId && this.connection) {
      try {
        const payGrade = await this.connection.collection('paygrade').findOne({ 
          _id: employee.payGradeId 
        });
        if (payGrade && payGrade.baseSalary) {
          return payGrade.baseSalary;
        }
      } catch (error) {
        console.error('Failed to fetch payGrade:', error);
      }
    }
    
    return 0;
  }

  async getEmployeeAllowances(employee: any): Promise<{
    housingAllowance: number;
    transportationAllowance: number;
    otherAllowances: number;
  }> {
    if (employee.housingAllowance || employee.transportationAllowance || employee.otherAllowances) {
      return {
        housingAllowance: employee.housingAllowance || 0,
        transportationAllowance: employee.transportationAllowance || 0,
        otherAllowances: employee.otherAllowances || 0,
      };
    }
    
    if (employee.payGradeId) {
      let payGrade = employee.payGradeId;
      
      if (typeof payGrade === 'string' || payGrade instanceof mongoose.Types.ObjectId) {
        try {
          payGrade = await this.payGradeModel.findById(payGrade).populate('allowances');
        } catch (error) {
          payGrade = await this.connection.collection('paygrade').findOne({ _id: payGrade });
        }
      }
      
      if (payGrade && payGrade.allowances) {
        const allowances = Array.isArray(payGrade.allowances) ? payGrade.allowances : [];
        
        let housingAllowance = 0;
        let transportationAllowance = 0;
        let otherAllowances = 0;
        
        for (const allowance of allowances) {
          let allowanceData = allowance;
          
          if (typeof allowance === 'string' || allowance instanceof mongoose.Types.ObjectId) {
            const allowanceId = typeof allowance === 'string' 
              ? new mongoose.Types.ObjectId(allowance) 
              : allowance;
            allowanceData = await this.connection.collection('allowance').findOne({ _id: allowanceId });
          }
          
          if (allowanceData) {
            if (allowanceData.name?.toLowerCase().includes('housing')) {
              housingAllowance = allowanceData.amount || 0;
            } else if (allowanceData.name?.toLowerCase().includes('transport')) {
              transportationAllowance = allowanceData.amount || 0;
            } else {
              otherAllowances += allowanceData.amount || 0;
            }
          }
        }
        
        return { housingAllowance, transportationAllowance, otherAllowances };
      }
    }
    
    return { housingAllowance: 0, transportationAllowance: 0, otherAllowances: 0 };
  }

  async calculateGrossSalary(employee: any): Promise<number> {
    const baseSalary = await this.getEmployeeBaseSalary(employee);
    const allowances = await this.getEmployeeAllowances(employee);
    const housingAllowance = allowances.housingAllowance;
    const transportationAllowance = allowances.transportationAllowance;
    const otherAllowances = allowances.otherAllowances;
    
    const pendingBonuses = await this.employeeSigningBonusModel.find({
      employeeId: employee._id,
      status: BonusStatus.APPROVED
    });
    const signingBonus = pendingBonuses.reduce((sum, bonus) => sum + bonus.givenAmount, 0);
    
    const pendingBenefits = await this.employeeTerminationResignationModel.find({
      employeeId: employee._id,
      status: BenefitStatus.APPROVED
    });
    const terminationBenefit = pendingBenefits.reduce((sum, benefit) => sum + benefit.givenAmount, 0);
    
    const leaveCompensation = employee.leaveCompensation || 0;
    
    const grossSalary = baseSalary +
                        housingAllowance +
                        transportationAllowance +
                        otherAllowances +
                        signingBonus +
                        terminationBenefit +
                        leaveCompensation;
    
    const employeeName = `${employee.firstName || ''} ${employee.lastName || ''}`.trim() || 'Unknown';
    const employeeCode = employee.code || employee.employeeNumber || employee._id.toString();
    
    if (grossSalary < 0) {
      throw new Error(`Invalid gross salary calculation for employee ${employeeName}: ${employeeCode}`);
    }
    return grossSalary;
  }

  async applyTaxDeductions(employee: any, grossSalary: number): Promise<number> {
    const taxBrackets = [
      { min: 0, max: 1250, rate: 0 },
      { min: 1251, max: 2500, rate: 0.025 },
      { min: 2501, max: 3750, rate: 0.1 },
      { min: 3751, max: 5000, rate: 0.15 },
      { min: 5001, max: 16667, rate: 0.2 },
      { min: 16668, max: 33333, rate: 0.225 },
      { min: 33334, max: Infinity, rate: 0.25 }
    ];

    const monthlySalary = grossSalary;
    let remainingIncome = monthlySalary;
    let tax = 0;

    if (monthlySalary <= 1250) return 0;

    for (const bracket of taxBrackets) {
      if (remainingIncome <= 0) break;

      const taxableAmountInBracket = Math.min(
        remainingIncome,
        Math.max(0, bracket.max - bracket.min + 1)
      );

      if (taxableAmountInBracket > 0) {
        tax += taxableAmountInBracket * bracket.rate;
        remainingIncome -= taxableAmountInBracket;
      }
    }
    return Number(tax.toFixed(2));
  }

  async applyInsuranceDeduction(employee: any): Promise<number> {
    const baseSalary = await this.getEmployeeBaseSalary(employee);
    const maxInsuranceCap = 14700;
    const insuranceAmount = Math.min(baseSalary, maxInsuranceCap);
    const employeeInsurance = insuranceAmount * 0.115;
    return Number(employeeInsurance.toFixed(2));
  }

  async applyPenalties(employee: any): Promise<{totalPenalties: number, penalties: any[]}> {
    const employeePenaltiesRecord = await this.employeePenaltiesModel.findOne({
      employeeId: employee._id
    });
    
    if (!employeePenaltiesRecord || !employeePenaltiesRecord.penalties) {
      return { totalPenalties: 0, penalties: [] };
    }
    
    const totalPenalties = employeePenaltiesRecord.penalties.reduce(
      (sum, penalty) => sum + penalty.amount, 0
    );
    
    return {
      totalPenalties: Number(totalPenalties.toFixed(2)),
      penalties: employeePenaltiesRecord.penalties
    };
  }

  async calculateNetSalary(employee: any): Promise<{
    grossSalary: number;
    taxDeduction: number;
    insuranceDeduction: number;
    penalties: number;
    netSalary: number;
    allowances: number;
    bonus: number;
    benefit: number;
  }> {
    try {
      const grossSalary = await this.calculateGrossSalary(employee);
      const taxDeduction = await this.applyTaxDeductions(employee, grossSalary);
      const insuranceDeduction = await this.applyInsuranceDeduction(employee);
      const penaltiesData = await this.applyPenalties(employee);
      
      const allowancesData = await this.getEmployeeAllowances(employee);
      const allowances = allowancesData.housingAllowance + allowancesData.transportationAllowance + allowancesData.otherAllowances;
      
      const pendingBonuses = await this.employeeSigningBonusModel.find({
        employeeId: employee._id,
        status: BonusStatus.APPROVED
      });
      const bonus = pendingBonuses.reduce((sum, bonus) => sum + bonus.givenAmount, 0);
      
      const pendingBenefits = await this.employeeTerminationResignationModel.find({
        employeeId: employee._id,
        status: BenefitStatus.APPROVED
      });
      const benefit = pendingBenefits.reduce((sum, benefit) => sum + benefit.givenAmount, 0);
      
      const netSalary = grossSalary - taxDeduction - insuranceDeduction - penaltiesData.totalPenalties;
      
      const employeeName = `${employee.firstName || ''} ${employee.lastName || ''}`.trim() || 'Unknown';
      
      if (netSalary < 0) {
        throw new Error(`Net salary cannot be negative for employee ${employeeName}`);
      }
      
      return {
        grossSalary: Number(grossSalary.toFixed(2)),
        taxDeduction,
        insuranceDeduction,
        penalties: penaltiesData.totalPenalties,
        netSalary: Number(netSalary.toFixed(2)),
        allowances,
        bonus,
        benefit
      };
    } catch (error) {
      const employeeName = `${employee.firstName || ''} ${employee.lastName || ''}`.trim() || 'Unknown';
      throw new Error(`Error calculating net salary for employee ${employeeName}: ${error.message}`);
    }
  }

  async calculateFinalSalary(employee: any): Promise<{
    grossSalary: number;
    taxDeduction: number;
    insuranceDeduction: number;
    penalties: number;
    netSalary: number;
    allowances: number;
    bonus: number;
    benefit: number;
  }> {
    return await this.calculateNetSalary(employee);
  }

  async flagAnomalies(payrollRunId: mongoose.Types.ObjectId, employee: any): Promise<string[]> {
    const exceptions: string[] = [];
    
    if (!employee.bankName || !employee.bankAccountNumber) {
      exceptions.push('Missing bank details');
    }
    
    try {
      const salaryData = await this.calculateNetSalary(employee);
      if (salaryData.netSalary < 0) {
        exceptions.push('Negative net pay');
      }
      
      const baseSalary = await this.getEmployeeBaseSalary(employee);
      if (!baseSalary || baseSalary <= 0) {
        exceptions.push('Zero base salary');
      }
      
      if (salaryData.grossSalary > 0 && salaryData.penalties > salaryData.grossSalary * 0.5) {
        exceptions.push('Excessive penalties');
      }
    } catch (error) {
      exceptions.push(`Calculation error: ${error.message}`);
    }
    
    return exceptions;
  }

  async getExceptionsByRun(payrollRunId: mongoose.Types.ObjectId): Promise<employeePayrollDetails[]> {
    return await this.employeePayrollDetailsModel.find({
      payrollRunId,
      exceptions: { $exists: true, $ne: null }
    }).exec();
  }

  async updateRunStatus(payrollRunId: mongoose.Types.ObjectId, status: PayRollStatus): Promise<payrollRuns> {
    const updatedRun = await this.payrollRunsModel.findByIdAndUpdate(
      payrollRunId,
      {
        status,
        updatedAt: new Date(),
        ...(status === PayRollStatus.APPROVED && { completedAt: new Date() })
      },
      { new: true }
    );
    
    if (!updatedRun) {
      throw new Error(`Payroll run with ID ${payrollRunId} not found`);
    }
    
    return updatedRun;
  }

  async processDraftGeneration(
    payrollRunId: mongoose.Types.ObjectId, 
    employeeData: any[]
  ): Promise<{
    run: payrollRuns;
    payrollDetails: employeePayrollDetails[];
    exceptionsCount: number;
  }> {
    try {
      const payrollDetails = await this.createPayrollDetails(payrollRunId, employeeData);
      
      let totalNetPay = 0;
      let exceptionsCount = 0;
      
      for (const employee of employeeData) {
        const payrollDetail = payrollDetails.find(
          item => item.employeeId.toString() === employee._id.toString()
        );
        
        if (!payrollDetail) {
          throw new Error(`No payroll detail found for employee ${employee._id}`);
        }
        
        const salaryData = await this.calculateNetSalary(employee);
        const anomalies = await this.flagAnomalies(payrollRunId, employee);
        
        const baseSalary = await this.getEmployeeBaseSalary(employee);
        
        // ✅ CRITICAL: Update ALL fields before saving
        payrollDetail.baseSalary = baseSalary;
        payrollDetail.allowances = salaryData.allowances;
        payrollDetail.deductions = salaryData.taxDeduction + salaryData.insuranceDeduction + salaryData.penalties;
        payrollDetail.netSalary = salaryData.netSalary;
        payrollDetail.netPay = salaryData.netSalary;
        payrollDetail.bonus = salaryData.bonus;
        payrollDetail.benefit = salaryData.benefit;
        
        if (anomalies.length > 0) {
          payrollDetail.bankStatus = BankStatus.MISSING;
          payrollDetail.exceptions = anomalies.join(' | ');
          exceptionsCount++;
        } else {
          payrollDetail.bankStatus = BankStatus.VALID;
        }
        
        // ✅ IMPORTANT: Save and verify
        const savedDetail = await payrollDetail.save();
        console.log(`✅ Saved employee ${employee.firstName} ${employee.lastName}: baseSalary=${savedDetail.baseSalary}`);
        
        totalNetPay += salaryData.netSalary;
      }
      
      const updatedRun = await this.payrollRunsModel.findByIdAndUpdate(
        payrollRunId,
        {
          employees: employeeData.length,
          exceptions: exceptionsCount,
          totalnetpay: Number(totalNetPay.toFixed(2)),
          status: PayRollStatus.DRAFT, 
          updatedAt: new Date(),
        },
        { new: true }
      );
      
      if (!updatedRun) {
        throw new Error(`Failed to update payroll run ${payrollRunId}`);
      }
      
      console.log(`✅ Draft generation complete: ${exceptionsCount} exceptions, totalNetPay=${totalNetPay}`);
      
      return {
        run: updatedRun,
        payrollDetails,
        exceptionsCount
      };
    } catch (error) {
      await this.payrollRunsModel.findByIdAndUpdate(
        payrollRunId,
        {
          status: PayRollStatus.REJECTED,
          rejectionReason: error.message,
          updatedAt: new Date(),
        }
      );
      throw new Error(`Failed to process draft generation: ${error.message}`);
    }
  }

  async recalculateEmployeeSalary(payrollRunId: mongoose.Types.ObjectId, employeeId: mongoose.Types.ObjectId, employeeData: any): Promise<{
    payrollDetail: employeePayrollDetails;
    salaryData: any;
    exceptions: string[];
  }> {
    const payrollDetail = await this.employeePayrollDetailsModel.findOne({
      payrollRunId,
      employeeId
    });
    
    if (!payrollDetail) {
      throw new Error(`No payroll detail found for employee ${employeeId} in run ${payrollRunId}`);
    }
    
    const salaryData = await this.calculateNetSalary(employeeData);
    const exceptions = await this.flagAnomalies(payrollRunId, employeeData);
    
    const baseSalary = await this.getEmployeeBaseSalary(employeeData);
    
    payrollDetail.baseSalary = baseSalary;
    payrollDetail.allowances = salaryData.allowances;
    payrollDetail.deductions = salaryData.taxDeduction + salaryData.insuranceDeduction + salaryData.penalties;
    payrollDetail.netSalary = salaryData.netSalary;
    payrollDetail.netPay = salaryData.netSalary;
    payrollDetail.bonus = salaryData.bonus;
    payrollDetail.benefit = salaryData.benefit;
    
    if (exceptions.length > 0) {
      payrollDetail.bankStatus = BankStatus.MISSING;
      payrollDetail.exceptions = exceptions.join(' | ');
    } else {
      payrollDetail.bankStatus = BankStatus.VALID;
      payrollDetail.exceptions = undefined;
    }
    
    await payrollDetail.save();
    await this.recalculateRunTotals(payrollRunId);
    
    return {
      payrollDetail,
      salaryData,
      exceptions
    };
  }

  private async recalculateRunTotals(payrollRunId: mongoose.Types.ObjectId): Promise<void> {
    const payrollDetails = await this.employeePayrollDetailsModel.find({ payrollRunId });
    
    const totalNetPay = payrollDetails.reduce((sum, item) => sum + (item.netPay || 0), 0);
    const exceptionsCount = payrollDetails.filter(item => item.exceptions).length;
    
    await this.payrollRunsModel.findByIdAndUpdate(
      payrollRunId,
      {
        totalnetpay: Number(totalNetPay.toFixed(2)),
        exceptions: exceptionsCount,
        updatedAt: new Date(),
      }
    );
  }

  async generatePayslip(payrollRunId: mongoose.Types.ObjectId, employeeId: mongoose.Types.ObjectId): Promise<paySlip> {
    const payrollDetail = await this.employeePayrollDetailsModel.findOne({
      payrollRunId,
      employeeId
    });
    
    if (!payrollDetail) {
      throw new Error(`No payroll detail found for employee ${employeeId} in run ${payrollRunId}`);
    }
    
    const earningsDetails = {
      baseSalary: payrollDetail.baseSalary,
      allowances: [],
      bonuses: [],
      benefits: [],
      refunds: []
    };
    
    const deductionsDetails = {
      taxes: [],
      insurances: [],
      penalties: null
    };
    
    const payslip = await this.paySlipModel.create({
      employeeId,
      payrollRunId,
      earningsDetails,
      deductionsDetails,
      totalGrossSalary: payrollDetail.baseSalary + payrollDetail.allowances,
      totaDeductions: payrollDetail.deductions,
      netPay: payrollDetail.netPay,
      paymentStatus: PaySlipPaymentStatus.PENDING
    });
    
    return payslip;
  }
}