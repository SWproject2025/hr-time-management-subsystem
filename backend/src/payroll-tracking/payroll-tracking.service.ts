/* eslint-disable prettier/prettier */
import { Injectable, NotFoundException, ForbiddenException, BadRequestException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { paySlip, PayslipDocument } from '../payroll-execution/models/payslip.schema';
import { employeePayrollDetails, employeePayrollDetailsDocument } from '../payroll-execution/models/employeePayrollDetails.schema';
import {
    payrollRuns,
    payrollRunsDocument,
} from '../payroll-execution/models/payrollRuns.schema';
import { EmployeeProfile, EmployeeProfileDocument } from '../employee-profile/models/employee-profile.schema';
import { PayslipQueryDto } from './dto/payslips/payslip-query.dto';
import { PayslipDownloadDto } from './dto/payslips/payslip-download.dto';
import { PDFGenerator } from './utils/pdf-generator';
import { disputes, disputesDocument } from './models/disputes.schema';
import { claims, claimsDocument } from './models/claims.schema';
import { refunds, refundsDocument } from './models/refunds.schema';
import { DisputeStatus, ClaimStatus, RefundStatus } from './enums/payroll-tracking-enum';
import { CreateDisputeDto } from './dto/disputes/create-dispute.dto';
import { ApproveDisputeDto } from './dto/disputes/approve-dispute.dto';
import { RejectDisputeDto } from './dto/disputes/reject-dispute.dto';
import { CreateClaimDto } from './dto/claims/create-claim.dto';
import { ApproveClaimDto } from './dto/claims/approve-claim.dto';
import { RejectClaimDto } from './dto/claims/reject-claim.dto';
import { CreateRefundDto } from './dto/refunds/create-refund.dto';
import { TaxReportDto } from './dto/reports/tax-report.dto';
import { DepartmentReportDto } from './dto/reports/department-report.dto';
import { PayrollReportDto } from './dto/reports/payroll-report.dto';
import { ApprovalHistoryEntry } from './models/common.schema';

@Injectable()
export class PayrollTrackingService {
    constructor(
        @InjectModel(paySlip.name)
        private payslipModel: Model<PayslipDocument>,
        @InjectModel(employeePayrollDetails.name)
        private employeePayrollDetailsModel: Model<employeePayrollDetailsDocument>,
        @InjectModel(payrollRuns.name)
        private payrollRunsModel: Model<payrollRunsDocument>,
        @InjectModel(EmployeeProfile.name)
        private employeeProfileModel: Model<EmployeeProfileDocument>,
        @InjectModel(disputes.name)
        private disputesModel: Model<disputesDocument>,
        @InjectModel(claims.name)
        private claimsModel: Model<claimsDocument>,
        @InjectModel(refunds.name)
        private refundsModel: Model<refundsDocument>,
    ) { }

    /**
     * Helper function to build date query with proper validation and end-of-day handling
     */
    private buildDateQuery(fromDate?: string, toDate?: string): { $gte?: Date; $lte?: Date } | null {
        // Validate date range if both dates are provided
        if (fromDate && toDate) {
            const from = new Date(fromDate);
            const to = new Date(toDate);
            if (from > to) {
                throw new BadRequestException('fromDate must be less than or equal to toDate');
            }
        }

        if (!fromDate && !toDate) {
            return null;
        }

        const dateQuery: { $gte?: Date; $lte?: Date } = {};

        if (fromDate) {
            // Set to start of day (00:00:00.000)
            const from = new Date(fromDate);
            from.setHours(0, 0, 0, 0);
            dateQuery.$gte = from;
        }

        if (toDate) {
            // Set to end of day (23:59:59.999) to include the entire day
            const to = new Date(toDate);
            to.setHours(23, 59, 59, 999);
            dateQuery.$lte = to;
        }

        return dateQuery;
    }

    /**
     * Get payslip details for an employee
     * REQ-PY-1, REQ-PY-2
     */
    async getPayslip(employeeId: string, payslipId: string) {
        // Debug logs
        console.log('=== getPayslip DEBUG ===');
        console.log('Request employeeId (from token):', employeeId);
        console.log('Request employeeId type:', typeof employeeId);
        console.log('PayslipId:', payslipId);

        // Use the same query approach as getPayslipHistory - filter by both payslipId and employeeId
        // This ensures MongoDB only returns payslips that belong to the employee
        const employeeIdObj = new Types.ObjectId(employeeId);
        const payslipIdObj = new Types.ObjectId(payslipId);

        console.log('Converted employeeId to ObjectId:', employeeIdObj.toString());
        console.log('Converted payslipId to ObjectId:', payslipIdObj.toString());

        const payslip = await this.payslipModel
            .findOne({
                _id: payslipIdObj,
                employeeId: employeeIdObj,
            })
            .populate('employeeId', 'employeeNumber firstName lastName')
            .populate('payrollRunId', 'runId payrollPeriod status')
            .lean();

        console.log('Query result (payslip):', payslip ? 'Found' : 'Not found');

        if (!payslip) {
            // Check if payslip exists to distinguish between 404 and 403
            const payslipCheck = await this.payslipModel
                .findById(payslipId)
                .select('_id employeeId')
                .lean();

            console.log('Payslip check (exists?):', payslipCheck ? 'Yes' : 'No');
            if (payslipCheck) {
                console.log('Payslip employeeId from DB:', payslipCheck.employeeId);
                console.log('Payslip employeeId type:', typeof payslipCheck.employeeId);
                console.log('Payslip employeeId toString():', String(payslipCheck.employeeId));
                console.log('Request employeeId toString():', String(employeeId));
                console.log('Are they equal (string)?', String(payslipCheck.employeeId) === String(employeeId));

                // Try ObjectId comparison
                const dbEmployeeIdObj = new Types.ObjectId(payslipCheck.employeeId);
                const reqEmployeeIdObj = new Types.ObjectId(employeeId);
                console.log('DB employeeId ObjectId:', dbEmployeeIdObj.toString());
                console.log('Req employeeId ObjectId:', reqEmployeeIdObj.toString());
                console.log('Are they equal (ObjectId)?', dbEmployeeIdObj.equals(reqEmployeeIdObj));

                // Payslip exists but doesn't belong to this employee
                throw new ForbiddenException('You can only access your own payslips');
            }
            // Payslip doesn't exist
            console.log('Payslip not found in database');
            throw new NotFoundException('Payslip not found');
        }

        console.log('=== getPayslip SUCCESS ===');
        return payslip;
    }

    /**
     * Download payslip as PDF
     * REQ-PY-1
     */
    async downloadPayslip(employeeId: string, payslipId: string, format: string = 'pdf'): Promise<Buffer> {
        const payslip = await this.getPayslip(employeeId, payslipId);

        // Generate PDF using PDF generator utility
        if (format === 'pdf') {
            return await PDFGenerator.generatePayslipPDF(payslip);
        }

        throw new BadRequestException(`Unsupported format: ${format}. Only PDF format is supported.`);
    }

    /**
     * Get payslip status and basic details
     * REQ-PY-2
     */
    async getPayslipStatus(employeeId: string, payslipId: string) {
        // Debug logs
        console.log('=== getPayslipStatus DEBUG ===');
        console.log('Request employeeId (from token):', employeeId);
        console.log('Request employeeId type:', typeof employeeId);
        console.log('PayslipId:', payslipId);

        // Use the same query approach as getPayslipHistory - filter by both payslipId and employeeId
        const employeeIdObj = new Types.ObjectId(employeeId);
        const payslipIdObj = new Types.ObjectId(payslipId);

        console.log('Converted employeeId to ObjectId:', employeeIdObj.toString());
        console.log('Converted payslipId to ObjectId:', payslipIdObj.toString());

        const payslip = await this.payslipModel
            .findOne({
                _id: payslipIdObj,
                employeeId: employeeIdObj,
            })
            .select('employeeId paymentStatus payrollRunId createdAt')
            .populate('payrollRunId', 'runId payrollPeriod status paymentStatus')
            .lean();

        console.log('Query result (payslip):', payslip ? 'Found' : 'Not found');

        if (!payslip) {
            // Check if payslip exists to distinguish between 404 and 403
            const payslipCheck = await this.payslipModel
                .findById(payslipId)
                .select('_id employeeId')
                .lean();

            console.log('Payslip check (exists?):', payslipCheck ? 'Yes' : 'No');
            if (payslipCheck) {
                console.log('Payslip employeeId from DB:', payslipCheck.employeeId);
                console.log('Payslip employeeId type:', typeof payslipCheck.employeeId);
                console.log('Payslip employeeId toString():', String(payslipCheck.employeeId));
                console.log('Request employeeId toString():', String(employeeId));
                console.log('Are they equal (string)?', String(payslipCheck.employeeId) === String(employeeId));

                // Try ObjectId comparison
                const dbEmployeeIdObj = new Types.ObjectId(payslipCheck.employeeId);
                const reqEmployeeIdObj = new Types.ObjectId(employeeId);
                console.log('DB employeeId ObjectId:', dbEmployeeIdObj.toString());
                console.log('Req employeeId ObjectId:', reqEmployeeIdObj.toString());
                console.log('Are they equal (ObjectId)?', dbEmployeeIdObj.equals(reqEmployeeIdObj));

                // Payslip exists but doesn't belong to this employee
                throw new ForbiddenException('You can only access your own payslips');
            }
            // Payslip doesn't exist
            console.log('Payslip not found in database');
            throw new NotFoundException('Payslip not found');
        }

        console.log('=== getPayslipStatus SUCCESS ===');
        return {
            payslipId,
            paymentStatus: payslip.paymentStatus,
            payrollRun: payslip.payrollRunId,
        };
    }

    /**
     * Get payslip history with filters
     * REQ-PY-13
     */
    async getPayslipHistory(employeeId: string, filters: PayslipQueryDto) {
        const {
            fromDate,
            toDate,
            payrollRunId,
            paymentStatus,
            page = 1,
            limit = 10,
            sortBy = 'createdAt',
            sortOrder = 'desc',
        } = filters;

        const query: any = {
            employeeId: new Types.ObjectId(employeeId),
        };

        // Apply date filters with validation
        const dateQuery = this.buildDateQuery(fromDate, toDate);
        if (dateQuery) {
            query.createdAt = dateQuery;
        }

        // Apply payroll run filter
        if (payrollRunId) {
            query.payrollRunId = new Types.ObjectId(payrollRunId);
        }

        // Apply payment status filter
        if (paymentStatus) {
            query.paymentStatus = paymentStatus;
        }

        const skip = (page - 1) * limit;
        const sort: any = {};
        sort[sortBy] = sortOrder === 'asc' ? 1 : -1;

        const [payslips, total] = await Promise.all([
            this.payslipModel
                .find(query)
                .populate('payrollRunId', 'runId payrollPeriod status')
                .sort(sort)
                .skip(skip)
                .limit(limit)
                .lean(),
            this.payslipModel.countDocuments(query),
        ]);

        return {
            payslips,
            pagination: {
                page,
                limit,
                total,
                totalPages: Math.ceil(total / limit),
            },
        };
    }

    /**
     * Get comprehensive employee salary details
     * REQ-PY-3, REQ-PY-5, REQ-PY-7, REQ-PY-8, REQ-PY-9, REQ-PY-10, REQ-PY-11, REQ-PY-14
     * Uses data from PayrollExecutionModule - extracts from already calculated values
     */
    async getEmployeeSalaryDetails(employeeId: string) {
        // Get the latest payroll details from PayrollExecutionModule (already calculated)
        const latestPayrollDetails = await this.employeePayrollDetailsModel
            .findOne({ employeeId: new Types.ObjectId(employeeId) })
            .sort({ createdAt: -1 })
            .populate('payrollRunId', 'runId payrollPeriod status')
            .lean();

        if (!latestPayrollDetails) {
            throw new NotFoundException('No payroll details found for this employee');
        }

        // Get the latest payslip for detailed breakdown from PayrollExecutionModule
        const latestPayslip = await this.payslipModel
            .findOne({ employeeId: new Types.ObjectId(employeeId) })
            .sort({ createdAt: -1 })
            .populate('payrollRunId', 'runId payrollPeriod status')
            .lean();

        // Use base salary from payslip if available, otherwise from payroll details
        const baseSalary = latestPayslip?.earningsDetails?.baseSalary || latestPayrollDetails.baseSalary;

        // Extract leave compensation from payslip allowances/benefits (already calculated amounts)
        let leaveCompensation = 0;
        if (latestPayslip?.earningsDetails?.allowances) {
            latestPayslip.earningsDetails.allowances.forEach((allowance) => {
                if (allowance.name?.toLowerCase().includes('leave')) {
                    leaveCompensation += allowance.amount || 0;
                }
            });
        }
        if (latestPayslip?.earningsDetails?.benefits) {
            latestPayslip.earningsDetails.benefits.forEach((benefit) => {
                if (benefit.name?.toLowerCase().includes('leave')) {
                    leaveCompensation += benefit.amount || 0;
                }
            });
        }

        // Extract transportation compensation from payslip allowances (already calculated amounts)
        let transportationCompensation = 0;
        if (latestPayslip?.earningsDetails?.allowances) {
            latestPayslip.earningsDetails.allowances.forEach((allowance) => {
                if (allowance.name?.toLowerCase().includes('transport')) {
                    transportationCompensation += allowance.amount || 0;
                }
            });
        }

        // Use total deductions from payroll details (already calculated by PayrollExecutionModule)
        // Note: Detailed breakdown of tax vs insurance is not stored as separate amounts
        // The breakdown should come from PayrollExecutionModule service when it's implemented
        const totalDeductions = latestPayrollDetails.deductions;

        // Tax and insurance deductions are part of total deductions
        // These should be provided by PayrollExecutionModule service
        const taxDeductions = 0; // Should come from PayrollExecutionModule service
        const insuranceDeductions = 0; // Should come from PayrollExecutionModule service
        const employerContributions = 0; // Should come from PayrollExecutionModule service

        // Extract penalties (misconduct/absenteeism) from payslip (already calculated amounts)
        let salaryDeductions = 0; // Misconduct/absenteeism
        let unpaidLeaveDeductions = 0;
        if (latestPayslip?.deductionsDetails?.penalties?.penalties) {
            latestPayslip.deductionsDetails.penalties.penalties.forEach((penalty) => {
                salaryDeductions += penalty.amount || 0;
                if (penalty.reason?.toLowerCase().includes('unpaid leave')) {
                    unpaidLeaveDeductions += penalty.amount || 0;
                }
            });
        }

        return {
            employeeId,
            baseSalary,
            leaveCompensation,
            transportationCompensation,
            taxDeductions,
            insuranceDeductions,
            salaryDeductions, // Misconduct/absenteeism
            unpaidLeaveDeductions,
            employerContributions,
            netSalary: latestPayrollDetails.netSalary,
            netPay: latestPayrollDetails.netPay,
            latestPayrollRun: latestPayrollDetails.payrollRunId,
        };
    }

    /**
     * Download tax documents for a specific year
     * REQ-PY-15
     */
    async downloadTaxDocuments(employeeId: string, year: number) {
        // Validate year
        const currentYear = new Date().getFullYear();
        if (year < 2000 || year > currentYear) {
            throw new BadRequestException(`Invalid year. Must be between 2000 and ${currentYear}`);
        }

        // Get all payslips for the specified year
        const startDate = new Date(year, 0, 1); // January 1st
        const endDate = new Date(year, 11, 31, 23, 59, 59); // December 31st

        const payslips = await this.payslipModel
            .find({
                employeeId: new Types.ObjectId(employeeId),
                createdAt: {
                    $gte: startDate,
                    $lte: endDate,
                },
            })
            .populate('payrollRunId', 'runId payrollPeriod')
            .sort({ createdAt: 1 })
            .lean();

        if (payslips.length === 0) {
            throw new NotFoundException(`No payslips found for year ${year}`);
        }

        // Calculate annual totals
        const annualTotals = {
            totalGrossSalary: 0,
            totalTaxDeductions: 0,
            totalNetPay: 0,
            payslipCount: payslips.length,
        };

        payslips.forEach((payslip) => {
            annualTotals.totalGrossSalary += payslip.totalGrossSalary || 0;
            annualTotals.totalNetPay += payslip.netPay || 0;

            if (payslip.deductionsDetails?.taxes) {
                payslip.deductionsDetails.taxes.forEach((tax) => {
                    // Calculate tax amount based on rate
                    const taxAmount = (payslip.totalGrossSalary * (tax.rate || 0)) / 100;
                    annualTotals.totalTaxDeductions += taxAmount;
                });
            }
        });

        // Get employee profile for tax document
        const employee = await this.employeeProfileModel
            .findById(employeeId)
            .select('employeeNumber firstName lastName nationalId workEmail')
            .lean();

        return {
            year,
            employee,
            payslips,
            annualTotals,
            documentType: 'tax_statement',
            generatedAt: new Date(),
            downloadUrl: `/payroll-tracking/employee/tax-documents/${year}/download`,
        };
    }

    /**
     * Download tax documents as PDF for a specific year
     * REQ-PY-15
     */
    async downloadTaxDocumentsPDF(employeeId: string, year: number): Promise<Buffer> {
        // Get tax document data
        const taxData = await this.downloadTaxDocuments(employeeId, year);

        // Generate PDF using PDF generator utility
        // Cast to any to handle type compatibility between Document and plain objects
        return await PDFGenerator.generateTaxDocumentPDF(taxData as any);
    }

    // ==================== HELPER METHODS ====================

    /**
     * Generate unique dispute ID (DISP-0001, DISP-0002, etc.)
     */
    private async generateDisputeId(): Promise<string> {
        const lastDispute = await this.disputesModel
            .findOne()
            .sort({ createdAt: -1 })
            .select('disputeId')
            .lean();

        if (!lastDispute || !lastDispute.disputeId) {
            return 'DISP-0001';
        }

        const lastNumber = parseInt(lastDispute.disputeId.split('-')[1] || '0', 10);
        const nextNumber = lastNumber + 1;
        return `DISP-${nextNumber.toString().padStart(4, '0')}`;
    }

    /**
     * Generate unique claim ID (CLAIM-0001, CLAIM-0002, etc.)
     */
    private async generateClaimId(): Promise<string> {
        const lastClaim = await this.claimsModel
            .findOne()
            .sort({ createdAt: -1 })
            .select('claimId')
            .lean();

        if (!lastClaim || !lastClaim.claimId) {
            return 'CLAIM-0001';
        }

        const lastNumber = parseInt(lastClaim.claimId.split('-')[1] || '0', 10);
        const nextNumber = lastNumber + 1;
        return `CLAIM-${nextNumber.toString().padStart(4, '0')}`;
    }

    /**
     * Add approval history entry
     */
    private createApprovalHistoryEntry(
        userId: string,
        action: string,
        role: string,
        previousStatus: string,
        newStatus: string,
        comment?: string,
    ): ApprovalHistoryEntry {
        return {
            userId: new Types.ObjectId(userId),
            action,
            role,
            timestamp: new Date(),
            comment,
            previousStatus,
            newStatus,
        };
    }

    // ==================== EMPLOYEE SERVICES ====================

    /**
     * Create a dispute for a payslip
     * REQ-PY-16
     */
    async createDispute(employeeId: string, createDisputeDto: CreateDisputeDto) {
        // Verify payslip exists and belongs to employee
        const payslip = await this.payslipModel.findById(createDisputeDto.payslipId);
        if (!payslip) {
            throw new NotFoundException('Payslip not found');
        }

        // Ensure employee can only dispute their own payslip
        const payslipEmployeeIdObj = new Types.ObjectId(payslip.employeeId);
        const requestEmployeeIdObj = new Types.ObjectId(employeeId);
        if (!payslipEmployeeIdObj.equals(requestEmployeeIdObj)) {
            throw new ForbiddenException('You can only dispute your own payslips');
        }

        // Generate unique dispute ID
        const disputeId = await this.generateDisputeId();

        // Create dispute
        const dispute = new this.disputesModel({
            disputeId,
            description: createDisputeDto.description,
            employeeId: new Types.ObjectId(employeeId),
            payslipId: new Types.ObjectId(createDisputeDto.payslipId),
            status: DisputeStatus.UNDER_REVIEW,
            submittedAt: new Date(),
            approvalHistory: [
                this.createApprovalHistoryEntry(
                    employeeId,
                    'submitted',
                    'employee',
                    '',
                    DisputeStatus.UNDER_REVIEW,
                    'Dispute submitted by employee',
                ),
            ],
        });

        const savedDispute = await dispute.save();
        return savedDispute.populate('employeeId', 'employeeNumber firstName lastName');
    }

    /**
     * Get disputes for an employee
     * REQ-PY-18
     */
    async getEmployeeDisputes(employeeId: string, filters?: { page?: number; limit?: number }) {
        const { page = 1, limit = 10 } = filters || {};
        const query = { employeeId: new Types.ObjectId(employeeId) };
        const skip = (page - 1) * limit;

        const [disputes, total] = await Promise.all([
            this.disputesModel
                .find(query)
                .populate('payrollSpecialistId', 'employeeNumber firstName lastName')
                .populate('payrollManagerId', 'employeeNumber firstName lastName')
                .populate('payslipId', 'payslipId payrollRunId')
                .sort({ createdAt: -1 })
                .skip(skip)
                .limit(limit)
                .lean(),
            this.disputesModel.countDocuments(query),
        ]);

        return {
            disputes,
            pagination: {
                page,
                limit,
                total,
                totalPages: Math.ceil(total / limit),
            },
        };
    }

    /**
     * Get dispute status for an employee
     * REQ-PY-18
     */
    async getDisputeStatus(employeeId: string, disputeId: string) {
        const dispute = await this.disputesModel
            .findOne({ disputeId })
            .populate('employeeId', 'employeeNumber firstName lastName')
            .populate('payrollSpecialistId', 'employeeNumber firstName lastName')
            .populate('payrollManagerId', 'employeeNumber firstName lastName')
            .populate('payslipId', 'payslipId payrollRunId')
            .lean();

        if (!dispute) {
            throw new NotFoundException('Dispute not found');
        }

        // Ensure employee can only view their own disputes
        // Handle both populated and unpopulated employeeId
        let disputeEmployeeIdValue: string | Types.ObjectId;
        if (dispute.employeeId && typeof dispute.employeeId === 'object' && '_id' in dispute.employeeId) {
            // Populated: extract _id from the populated object
            disputeEmployeeIdValue = (dispute.employeeId as any)._id;
        } else {
            // Not populated: use the ObjectId directly
            disputeEmployeeIdValue = dispute.employeeId as any;
        }

        // Convert both to ObjectId for reliable comparison
        const disputeEmployeeIdObj = new Types.ObjectId(disputeEmployeeIdValue);
        const requestEmployeeIdObj = new Types.ObjectId(employeeId);

        if (!disputeEmployeeIdObj.equals(requestEmployeeIdObj)) {
            throw new ForbiddenException('You can only view your own disputes');
        }

        return dispute;
    }

    /**
     * Create an expense claim
     * REQ-PY-17
     */
    async createClaim(employeeId: string, createClaimDto: CreateClaimDto) {
        // Generate unique claim ID
        const claimId = await this.generateClaimId();

        // Create claim
        const claim = new this.claimsModel({
            claimId,
            description: createClaimDto.description,
            claimType: createClaimDto.claimType,
            amount: createClaimDto.amount,
            employeeId: new Types.ObjectId(employeeId),
            status: ClaimStatus.UNDER_REVIEW,
            submittedAt: new Date(),
            approvalHistory: [
                this.createApprovalHistoryEntry(
                    employeeId,
                    'submitted',
                    'employee',
                    '',
                    ClaimStatus.UNDER_REVIEW,
                    'Claim submitted by employee',
                ),
            ],
        });

        const savedClaim = await claim.save();
        return savedClaim.populate('employeeId', 'employeeNumber firstName lastName');
    }

    /**
     * Get claims for an employee
     * REQ-PY-18
     */
    async getEmployeeClaims(employeeId: string, filters?: { page?: number; limit?: number }) {
        const { page = 1, limit = 10 } = filters || {};
        const query = { employeeId: new Types.ObjectId(employeeId) };
        const skip = (page - 1) * limit;

        const [claims, total] = await Promise.all([
            this.claimsModel
                .find(query)
                .populate('payrollSpecialistId', 'employeeNumber firstName lastName')
                .populate('payrollManagerId', 'employeeNumber firstName lastName')
                .sort({ createdAt: -1 })
                .skip(skip)
                .limit(limit)
                .lean(),
            this.claimsModel.countDocuments(query),
        ]);

        return {
            claims,
            pagination: {
                page,
                limit,
                total,
                totalPages: Math.ceil(total / limit),
            },
        };
    }

    /**
     * Get claim status for an employee
     * REQ-PY-18
     */
    async getClaimStatus(employeeId: string, claimId: string) {
        const claim = await this.claimsModel
            .findOne({ claimId })
            .populate('employeeId', 'employeeNumber firstName lastName')
            .populate('payrollSpecialistId', 'employeeNumber firstName lastName')
            .populate('payrollManagerId', 'employeeNumber firstName lastName')
            .lean();

        if (!claim) {
            throw new NotFoundException('Claim not found');
        }

        // Ensure employee can only view their own claims
        // Handle both populated and unpopulated employeeId
        let claimEmployeeIdValue: string | Types.ObjectId;
        if (claim.employeeId && typeof claim.employeeId === 'object' && '_id' in claim.employeeId) {
            // Populated: extract _id from the populated object
            claimEmployeeIdValue = (claim.employeeId as any)._id;
        } else {
            // Not populated: use the ObjectId directly
            claimEmployeeIdValue = claim.employeeId as any;
        }

        // Convert both to ObjectId for reliable comparison
        const claimEmployeeIdObj = new Types.ObjectId(claimEmployeeIdValue);
        const requestEmployeeIdObj = new Types.ObjectId(employeeId);

        if (!claimEmployeeIdObj.equals(requestEmployeeIdObj)) {
            throw new ForbiddenException('You can only view your own claims');
        }

        return claim;
    }

    // ==================== PAYROLL SPECIALIST SERVICES ====================

    /**
     * Get disputes pending review by payroll specialist
     * REQ-PY-39
     */
    async getDisputesForReview(filters?: { status?: DisputeStatus; page?: number; limit?: number }) {
        const { status = DisputeStatus.UNDER_REVIEW, page = 1, limit = 10 } = filters || {};

        const query: any = { status };
        const skip = (page - 1) * limit;

        const [disputes, total] = await Promise.all([
            this.disputesModel
                .find(query)
                .populate('employeeId', 'employeeNumber firstName lastName')
                .populate('payslipId', 'payslipId payrollRunId')
                .sort({ createdAt: -1 })
                .skip(skip)
                .limit(limit)
                .lean(),
            this.disputesModel.countDocuments(query),
        ]);

        return {
            disputes,
            pagination: {
                page,
                limit,
                total,
                totalPages: Math.ceil(total / limit),
            },
        };
    }

    /**
     * Approve dispute (moves to pending manager approval)
     * REQ-PY-39
     */
    async approveDispute(disputeId: string, specialistId: string, approveDisputeDto: ApproveDisputeDto) {
        const dispute = await this.disputesModel.findOne({ disputeId });
        if (!dispute) {
            throw new NotFoundException('Dispute not found');
        }

        if (dispute.status !== DisputeStatus.UNDER_REVIEW) {
            throw new BadRequestException(`Cannot approve dispute with status: ${dispute.status}`);
        }

        const previousStatus = dispute.status;
        dispute.status = DisputeStatus.PENDING_MANAGER_APPROVAL;
        dispute.payrollSpecialistId = new Types.ObjectId(specialistId);
        dispute.reviewedAt = new Date();
        if (approveDisputeDto.comment) {
            dispute.resolutionComment = approveDisputeDto.comment;
        }

        // Add approval history
        dispute.approvalHistory.push(
            this.createApprovalHistoryEntry(
                specialistId,
                'approved',
                'payroll_specialist',
                previousStatus,
                dispute.status,
                approveDisputeDto.comment,
            ),
        );

        const savedDispute = await dispute.save();
        return savedDispute.populate([
            { path: 'employeeId', select: 'employeeNumber firstName lastName' },
            { path: 'payrollSpecialistId', select: 'employeeNumber firstName lastName' },
            { path: 'payslipId', select: 'payslipId payrollRunId' },
        ]);
    }

    /**
     * Reject dispute
     * REQ-PY-39
     */
    async rejectDispute(disputeId: string, specialistId: string, rejectDisputeDto: RejectDisputeDto) {
        const dispute = await this.disputesModel.findOne({ disputeId });
        if (!dispute) {
            throw new NotFoundException('Dispute not found');
        }

        if (dispute.status !== DisputeStatus.UNDER_REVIEW) {
            throw new BadRequestException(`Cannot reject dispute with status: ${dispute.status}`);
        }

        const previousStatus = dispute.status;
        dispute.status = DisputeStatus.REJECTED;
        dispute.payrollSpecialistId = new Types.ObjectId(specialistId);
        dispute.rejectionReason = rejectDisputeDto.reason;
        dispute.reviewedAt = new Date();
        dispute.resolvedAt = new Date();

        // Add approval history
        dispute.approvalHistory.push(
            this.createApprovalHistoryEntry(
                specialistId,
                'rejected',
                'payroll_specialist',
                previousStatus,
                dispute.status,
                rejectDisputeDto.reason,
            ),
        );

        const savedDispute = await dispute.save();
        return savedDispute.populate([
            { path: 'employeeId', select: 'employeeNumber firstName lastName' },
            { path: 'payrollSpecialistId', select: 'employeeNumber firstName lastName' },
            { path: 'payslipId', select: 'payslipId payrollRunId' },
        ]);
    }

    /**
     * Get claims pending review by payroll specialist
     * REQ-PY-42
     */
    async getClaimsForReview(filters?: { status?: ClaimStatus; page?: number; limit?: number }) {
        const { status = ClaimStatus.UNDER_REVIEW, page = 1, limit = 10 } = filters || {};

        const query: any = { status };
        const skip = (page - 1) * limit;

        const [claims, total] = await Promise.all([
            this.claimsModel
                .find(query)
                .populate('employeeId', 'employeeNumber firstName lastName')
                .sort({ createdAt: -1 })
                .skip(skip)
                .limit(limit)
                .lean(),
            this.claimsModel.countDocuments(query),
        ]);

        return {
            claims,
            pagination: {
                page,
                limit,
                total,
                totalPages: Math.ceil(total / limit),
            },
        };
    }

    /**
     * Approve claim (moves to pending manager approval)
     * REQ-PY-42
     */
    async approveClaim(claimId: string, specialistId: string, approveClaimDto: ApproveClaimDto) {
        const claim = await this.claimsModel.findOne({ claimId });
        if (!claim) {
            throw new NotFoundException('Claim not found');
        }

        if (claim.status !== ClaimStatus.UNDER_REVIEW) {
            throw new BadRequestException(`Cannot approve claim with status: ${claim.status}`);
        }

        if (approveClaimDto.approvedAmount > claim.amount) {
            throw new BadRequestException('Approved amount cannot exceed claimed amount');
        }

        const previousStatus = claim.status;
        claim.status = ClaimStatus.PENDING_MANAGER_APPROVAL;
        claim.payrollSpecialistId = new Types.ObjectId(specialistId);
        claim.approvedAmount = approveClaimDto.approvedAmount;
        claim.reviewedAt = new Date();
        if (approveClaimDto.comment) {
            claim.resolutionComment = approveClaimDto.comment;
        }

        // Add approval history
        claim.approvalHistory.push(
            this.createApprovalHistoryEntry(
                specialistId,
                'approved',
                'payroll_specialist',
                previousStatus,
                claim.status,
                approveClaimDto.comment,
            ),
        );

        const savedClaim = await claim.save();
        return savedClaim.populate([
            { path: 'employeeId', select: 'employeeNumber firstName lastName' },
            { path: 'payrollSpecialistId', select: 'employeeNumber firstName lastName' },
        ]);
    }

    /**
     * Reject claim
     * REQ-PY-42
     */
    async rejectClaim(claimId: string, specialistId: string, rejectClaimDto: RejectClaimDto) {
        const claim = await this.claimsModel.findOne({ claimId });
        if (!claim) {
            throw new NotFoundException('Claim not found');
        }

        if (claim.status !== ClaimStatus.UNDER_REVIEW) {
            throw new BadRequestException(`Cannot reject claim with status: ${claim.status}`);
        }

        const previousStatus = claim.status;
        claim.status = ClaimStatus.REJECTED;
        claim.payrollSpecialistId = new Types.ObjectId(specialistId);
        claim.rejectionReason = rejectClaimDto.reason;
        claim.reviewedAt = new Date();
        claim.resolvedAt = new Date();

        // Add approval history
        claim.approvalHistory.push(
            this.createApprovalHistoryEntry(
                specialistId,
                'rejected',
                'payroll_specialist',
                previousStatus,
                claim.status,
                rejectClaimDto.reason,
            ),
        );

        const savedClaim = await claim.save();
        return savedClaim.populate([
            { path: 'employeeId', select: 'employeeNumber firstName lastName' },
            { path: 'payrollSpecialistId', select: 'employeeNumber firstName lastName' },
        ]);
    }

    // ==================== PAYROLL MANAGER SERVICES ====================

    /**
     * Get pending manager approvals (disputes and claims)
     * REQ-PY-40, REQ-PY-43
     */
    async getPendingManagerApprovals(filters?: { page?: number; limit?: number }) {
        const { page = 1, limit = 10 } = filters || {};
        const skip = (page - 1) * limit;

        const [disputes, claims, disputesTotal, claimsTotal] = await Promise.all([
            this.disputesModel
                .find({ status: DisputeStatus.PENDING_MANAGER_APPROVAL })
                .populate('employeeId', 'employeeNumber firstName lastName')
                .populate('payrollSpecialistId', 'employeeNumber firstName lastName')
                .populate('payslipId', 'payslipId payrollRunId')
                .sort({ createdAt: -1 })
                .skip(skip)
                .limit(limit)
                .lean(),
            this.claimsModel
                .find({ status: ClaimStatus.PENDING_MANAGER_APPROVAL })
                .populate('employeeId', 'employeeNumber firstName lastName')
                .populate('payrollSpecialistId', 'employeeNumber firstName lastName')
                .sort({ createdAt: -1 })
                .skip(skip)
                .limit(limit)
                .lean(),
            this.disputesModel.countDocuments({ status: DisputeStatus.PENDING_MANAGER_APPROVAL }),
            this.claimsModel.countDocuments({ status: ClaimStatus.PENDING_MANAGER_APPROVAL }),
        ]);

        return {
            disputes,
            claims,
            pagination: {
                page,
                limit,
                disputesTotal,
                claimsTotal,
                total: disputesTotal + claimsTotal,
                totalPages: Math.ceil((disputesTotal + claimsTotal) / limit),
            },
        };
    }

    /**
     * Confirm dispute approval (final approval by manager)
     * REQ-PY-40
     */
    async confirmDisputeApproval(disputeId: string, managerId: string) {
        const dispute = await this.disputesModel.findOne({ disputeId });
        if (!dispute) {
            throw new NotFoundException('Dispute not found');
        }

        if (dispute.status !== DisputeStatus.PENDING_MANAGER_APPROVAL) {
            throw new BadRequestException(`Cannot confirm approval for dispute with status: ${dispute.status}`);
        }

        const previousStatus = dispute.status;
        dispute.status = DisputeStatus.APPROVED;
        dispute.payrollManagerId = new Types.ObjectId(managerId);
        dispute.managerApprovedAt = new Date();
        dispute.resolvedAt = new Date();

        // Add approval history
        dispute.approvalHistory.push(
            this.createApprovalHistoryEntry(
                managerId,
                'confirmed',
                'payroll_manager',
                previousStatus,
                dispute.status,
                'Dispute approved by payroll manager',
            ),
        );

        const savedDispute = await dispute.save();
        return savedDispute.populate([
            { path: 'employeeId', select: 'employeeNumber firstName lastName' },
            { path: 'payrollSpecialistId', select: 'employeeNumber firstName lastName' },
            { path: 'payrollManagerId', select: 'employeeNumber firstName lastName' },
            { path: 'payslipId', select: 'payslipId payrollRunId' },
        ]);
    }

    /**
     * Confirm claim approval (final approval by manager)
     * REQ-PY-43
     */
    async confirmClaimApproval(claimId: string, managerId: string) {
        const claim = await this.claimsModel.findOne({ claimId });
        if (!claim) {
            throw new NotFoundException('Claim not found');
        }

        if (claim.status !== ClaimStatus.PENDING_MANAGER_APPROVAL) {
            throw new BadRequestException(`Cannot confirm approval for claim with status: ${claim.status}`);
        }

        const previousStatus = claim.status;
        claim.status = ClaimStatus.APPROVED;
        claim.payrollManagerId = new Types.ObjectId(managerId);
        claim.managerApprovedAt = new Date();
        claim.resolvedAt = new Date();

        // Add approval history
        claim.approvalHistory.push(
            this.createApprovalHistoryEntry(
                managerId,
                'confirmed',
                'payroll_manager',
                previousStatus,
                claim.status,
                'Claim approved by payroll manager',
            ),
        );

        const savedClaim = await claim.save();
        return savedClaim.populate([
            { path: 'employeeId', select: 'employeeNumber firstName lastName' },
            { path: 'payrollSpecialistId', select: 'employeeNumber firstName lastName' },
            { path: 'payrollManagerId', select: 'employeeNumber firstName lastName' },
        ]);
    }

    /**
     * Reject dispute by manager (rejects items pending manager approval)
     * REQ-PY-40
     */
    async rejectDisputeByManager(disputeId: string, managerId: string, reason: string) {
        const dispute = await this.disputesModel.findOne({ disputeId });
        if (!dispute) {
            throw new NotFoundException('Dispute not found');
        }

        if (dispute.status !== DisputeStatus.PENDING_MANAGER_APPROVAL) {
            throw new BadRequestException(`Cannot reject dispute with status: ${dispute.status}`);
        }

        const previousStatus = dispute.status;
        dispute.status = DisputeStatus.REJECTED;
        dispute.payrollManagerId = new Types.ObjectId(managerId);
        dispute.rejectionReason = reason;
        dispute.managerRejectedAt = new Date();
        dispute.resolvedAt = new Date();

        // Add approval history
        dispute.approvalHistory.push(
            this.createApprovalHistoryEntry(
                managerId,
                'rejected',
                'payroll_manager',
                previousStatus,
                dispute.status,
                reason,
            ),
        );

        const savedDispute = await dispute.save();
        return savedDispute.populate([
            { path: 'employeeId', select: 'employeeNumber firstName lastName' },
            { path: 'payrollSpecialistId', select: 'employeeNumber firstName lastName' },
            { path: 'payrollManagerId', select: 'employeeNumber firstName lastName' },
            { path: 'payslipId', select: 'payslipId payrollRunId' },
        ]);
    }

    /**
     * Reject claim by manager (rejects items pending manager approval)
     * REQ-PY-43
     */
    async rejectClaimByManager(claimId: string, managerId: string, reason: string) {
        const claim = await this.claimsModel.findOne({ claimId });
        if (!claim) {
            throw new NotFoundException('Claim not found');
        }

        if (claim.status !== ClaimStatus.PENDING_MANAGER_APPROVAL) {
            throw new BadRequestException(`Cannot reject claim with status: ${claim.status}`);
        }

        const previousStatus = claim.status;
        claim.status = ClaimStatus.REJECTED;
        claim.payrollManagerId = new Types.ObjectId(managerId);
        claim.rejectionReason = reason;
        claim.managerRejectedAt = new Date();
        claim.resolvedAt = new Date();

        // Add approval history
        claim.approvalHistory.push(
            this.createApprovalHistoryEntry(
                managerId,
                'rejected',
                'payroll_manager',
                previousStatus,
                claim.status,
                reason,
            ),
        );

        const savedClaim = await claim.save();
        return savedClaim.populate([
            { path: 'employeeId', select: 'employeeNumber firstName lastName' },
            { path: 'payrollSpecialistId', select: 'employeeNumber firstName lastName' },
            { path: 'payrollManagerId', select: 'employeeNumber firstName lastName' },
        ]);
    }

    // ==================== FINANCE STAFF SERVICES ====================

    /**
     * Get approved disputes for finance staff
     * REQ-PY-41
     */
    async getApprovedDisputes(filters?: { page?: number; limit?: number }) {
        const { page = 1, limit = 10 } = filters || {};
        const query = { status: DisputeStatus.APPROVED };
        const skip = (page - 1) * limit;

        const [disputes, total] = await Promise.all([
            this.disputesModel
                .find(query)
                .populate('employeeId', 'employeeNumber firstName lastName')
                .populate('payrollSpecialistId', 'employeeNumber firstName lastName')
                .populate('payrollManagerId', 'employeeNumber firstName lastName')
                .populate('payslipId', 'payslipId payrollRunId')
                .sort({ resolvedAt: -1 })
                .skip(skip)
                .limit(limit)
                .lean(),
            this.disputesModel.countDocuments(query),
        ]);

        return {
            disputes,
            pagination: {
                page,
                limit,
                total,
                totalPages: Math.ceil(total / limit),
            },
        };
    }

    /**
     * Get approved claims for finance staff
     * REQ-PY-44
     */
    async getApprovedClaims(filters?: { page?: number; limit?: number }) {
        const { page = 1, limit = 10 } = filters || {};
        const query = { status: ClaimStatus.APPROVED };
        const skip = (page - 1) * limit;

        const [claims, total] = await Promise.all([
            this.claimsModel
                .find(query)
                .populate('employeeId', 'employeeNumber firstName lastName')
                .populate('payrollSpecialistId', 'employeeNumber firstName lastName')
                .populate('payrollManagerId', 'employeeNumber firstName lastName')
                .sort({ resolvedAt: -1 })
                .skip(skip)
                .limit(limit)
                .lean(),
            this.claimsModel.countDocuments(query),
        ]);

        return {
            claims,
            pagination: {
                page,
                limit,
                total,
                totalPages: Math.ceil(total / limit),
            },
        };
    }

    /**
     * Generate refund for approved dispute
     * REQ-PY-45
     */
    async createRefundForDispute(disputeId: string, financeStaffId: string, createRefundDto?: CreateRefundDto) {
        const dispute = await this.disputesModel.findOne({ disputeId });
        if (!dispute) {
            throw new NotFoundException('Dispute not found');
        }

        if (dispute.status !== DisputeStatus.APPROVED) {
            throw new BadRequestException(`Cannot create refund for dispute with status: ${dispute.status}. Dispute must be approved.`);
        }

        // Check if refund already exists for this dispute
        const existingRefund = await this.refundsModel.findOne({ disputeId: dispute._id });
        if (existingRefund) {
            throw new BadRequestException('Refund already exists for this dispute');
        }

        // Get the payslip to determine refund amount (if needed)
        const payslip = await this.payslipModel.findById(dispute.payslipId);
        if (!payslip) {
            throw new NotFoundException('Payslip not found for this dispute');
        }

        // Calculate refund amount - use DTO amount if provided, otherwise throw error
        if (!createRefundDto || !createRefundDto.amount) {
            throw new BadRequestException('Refund amount is required');
        }
        const refundAmount = createRefundDto.amount;

        // Create refund record
        const refund = new this.refundsModel({
            disputeId: dispute._id,
            employeeId: dispute.employeeId,
            financeStaffId: new Types.ObjectId(financeStaffId),
            refundDetails: {
                description: createRefundDto?.description || `Refund for dispute ${dispute.disputeId}`,
                amount: refundAmount,
            },
            status: RefundStatus.PENDING,
        });

        const savedRefund = await refund.save();

        // Update dispute with finance staff ID
        await this.disputesModel.updateOne(
            { _id: dispute._id },
            { financeStaffId: new Types.ObjectId(financeStaffId) },
        );

        return savedRefund.populate([
            { path: 'employeeId', select: 'employeeNumber firstName lastName' },
            { path: 'financeStaffId', select: 'employeeNumber firstName lastName' },
            { path: 'disputeId', select: 'disputeId description status' },
        ]);
    }

    /**
     * Generate refund for approved claim
     * REQ-PY-46
     */
    async createRefundForClaim(claimId: string, financeStaffId: string, createRefundDto?: CreateRefundDto) {
        const claim = await this.claimsModel.findOne({ claimId });
        if (!claim) {
            throw new NotFoundException('Claim not found');
        }

        if (claim.status !== ClaimStatus.APPROVED) {
            throw new BadRequestException(`Cannot create refund for claim with status: ${claim.status}. Claim must be approved.`);
        }

        // Check if refund already exists for this claim
        const existingRefund = await this.refundsModel.findOne({ claimId: claim._id });
        if (existingRefund) {
            throw new BadRequestException('Refund already exists for this claim');
        }

        // Use approved amount if available, otherwise use original claim amount
        const refundAmount = claim.approvedAmount || claim.amount;

        // Create refund record
        const refund = new this.refundsModel({
            claimId: claim._id,
            employeeId: claim.employeeId,
            financeStaffId: new Types.ObjectId(financeStaffId),
            refundDetails: {
                description: createRefundDto?.description || `Refund for claim ${claim.claimId}`,
                amount: refundAmount,
            },
            status: RefundStatus.PENDING,
        });

        const savedRefund = await refund.save();

        // Update claim with finance staff ID
        await this.claimsModel.updateOne(
            { _id: claim._id },
            { financeStaffId: new Types.ObjectId(financeStaffId) },
        );

        return savedRefund.populate([
            { path: 'employeeId', select: 'employeeNumber firstName lastName' },
            { path: 'financeStaffId', select: 'employeeNumber firstName lastName' },
            { path: 'claimId', select: 'claimId description claimType amount approvedAmount status' },
        ]);
    }

    // ==================== REPORT GENERATION SERVICES ====================

    /**
     * Generate tax report
     * REQ-PY-25
     */
    async generateTaxReport(filters: TaxReportDto) {
        const { fromDate, toDate, year, departmentId } = filters;

        // Build query
        const query: any = {};
        const dateQuery: any = {};

        if (year) {
            const startDate = new Date(year, 0, 1);
            const endDate = new Date(year, 11, 31, 23, 59, 59, 999);
            dateQuery.$gte = startDate;
            dateQuery.$lte = endDate;
        } else if (fromDate || toDate) {
            const builtDateQuery = this.buildDateQuery(fromDate, toDate);
            if (builtDateQuery) {
                if (builtDateQuery.$gte) dateQuery.$gte = builtDateQuery.$gte;
                if (builtDateQuery.$lte) dateQuery.$lte = builtDateQuery.$lte;
            }
        }

        if (Object.keys(dateQuery).length > 0) {
            query.createdAt = dateQuery;
        }

        // If department filter, get employee IDs first
        if (departmentId) {
            const employees = await this.employeeProfileModel
                .find({ primaryDepartmentId: new Types.ObjectId(departmentId) })
                .select('_id')
                .lean();
            const employeeIds = employees.map(emp => emp._id);
            query.employeeId = { $in: employeeIds };
        }

        // Get payslips matching the query
        const payslips = await this.payslipModel
            .find(query)
            .populate('employeeId', 'employeeNumber firstName lastName primaryDepartmentId')
            .populate('payrollRunId', 'runId payrollPeriod status')
            .lean();

        // Aggregate tax data
        let totalTaxAmount = 0;
        const taxBreakdown: Record<string, { amount: number; count: number }> = {};
        const employeeTaxData: any[] = [];

        payslips.forEach((payslip: any) => {
            if (payslip.deductionsDetails?.taxes) {
                payslip.deductionsDetails.taxes.forEach((tax: any) => {
                    // Calculate tax amount based on rate and gross salary
                    const taxAmount = (payslip.totalGrossSalary * (tax.rate || 0)) / 100;
                    totalTaxAmount += taxAmount;

                    // Aggregate by tax type
                    const taxName = tax.name || 'Unknown Tax';
                    if (!taxBreakdown[taxName]) {
                        taxBreakdown[taxName] = { amount: 0, count: 0 };
                    }
                    taxBreakdown[taxName].amount += taxAmount;
                    taxBreakdown[taxName].count += 1;

                    // Store per-employee data
                    employeeTaxData.push({
                        employee: payslip.employeeId,
                        payrollRun: payslip.payrollRunId,
                        taxName,
                        taxRate: tax.rate,
                        grossSalary: payslip.totalGrossSalary,
                        taxAmount,
                        period: payslip.payrollRunId?.payrollPeriod || payslip.createdAt,
                    });
                });
            }
        });

        return {
            reportType: 'tax',
            period: year ? `${year}` : fromDate && toDate ? `${fromDate} to ${toDate}` : 'All time',
            departmentId: departmentId || null,
            summary: {
                totalTaxAmount,
                totalEmployees: new Set(employeeTaxData.map((d: any) => d.employee?._id?.toString())).size,
                totalPayrollRuns: new Set(employeeTaxData.map((d: any) => d.payrollRun?._id?.toString())).size,
            },
            taxBreakdown: Object.entries(taxBreakdown).map(([name, data]) => ({
                taxName: name,
                totalAmount: data.amount,
                transactionCount: data.count,
            })),
            detailedData: employeeTaxData,
            generatedAt: new Date(),
        };
    }

    /**
     * Generate insurance report
     * REQ-PY-25
     */
    async generateInsuranceReport(filters: PayrollReportDto) {
        const { fromDate, toDate, departmentId } = filters;

        // Build query
        const query: any = {};
        const dateQuery: any = {};

        if (fromDate || toDate) {
            const builtDateQuery = this.buildDateQuery(fromDate, toDate);
            if (builtDateQuery) {
                if (builtDateQuery.$gte) dateQuery.$gte = builtDateQuery.$gte;
                if (builtDateQuery.$lte) dateQuery.$lte = builtDateQuery.$lte;
            }
        }

        if (Object.keys(dateQuery).length > 0) {
            query.createdAt = dateQuery;
        }

        // If department filter, get employee IDs first
        if (departmentId) {
            const employees = await this.employeeProfileModel
                .find({ primaryDepartmentId: new Types.ObjectId(departmentId) })
                .select('_id')
                .lean();
            const employeeIds = employees.map(emp => emp._id);
            query.employeeId = { $in: employeeIds };
        }

        // Get payslips
        const payslips = await this.payslipModel
            .find(query)
            .populate('employeeId', 'employeeNumber firstName lastName primaryDepartmentId')
            .populate('payrollRunId', 'runId payrollPeriod status')
            .lean();

        // Aggregate insurance data
        let totalEmployeeContributions = 0;
        let totalEmployerContributions = 0;
        const insuranceBreakdown: Record<string, { employeeAmount: number; employerAmount: number; count: number }> = {};
        const employeeInsuranceData: any[] = [];

        payslips.forEach((payslip: any) => {
            if (payslip.deductionsDetails?.insurances) {
                payslip.deductionsDetails.insurances.forEach((insurance: any) => {
                    // Calculate contributions based on rates and gross salary
                    const employeeAmount = insurance.amount || 0;
                    const employerAmount = insurance.employerRate
                        ? (payslip.totalGrossSalary * (insurance.employerRate || 0)) / 100
                        : 0;

                    totalEmployeeContributions += employeeAmount;
                    totalEmployerContributions += employerAmount;

                    // Aggregate by insurance type
                    const insuranceName = insurance.name || 'Unknown Insurance';
                    if (!insuranceBreakdown[insuranceName]) {
                        insuranceBreakdown[insuranceName] = { employeeAmount: 0, employerAmount: 0, count: 0 };
                    }
                    insuranceBreakdown[insuranceName].employeeAmount += employeeAmount;
                    insuranceBreakdown[insuranceName].employerAmount += employerAmount;
                    insuranceBreakdown[insuranceName].count += 1;

                    // Store per-employee data
                    employeeInsuranceData.push({
                        employee: payslip.employeeId,
                        payrollRun: payslip.payrollRunId,
                        insuranceName,
                        employeeRate: insurance.employeeRate,
                        employerRate: insurance.employerRate,
                        grossSalary: payslip.totalGrossSalary,
                        employeeContribution: employeeAmount,
                        employerContribution: employerAmount,
                        period: payslip.payrollRunId?.payrollPeriod || payslip.createdAt,
                    });
                });
            }
        });

        return {
            reportType: 'insurance',
            period: fromDate && toDate ? `${fromDate} to ${toDate}` : 'All time',
            departmentId: departmentId || null,
            summary: {
                totalEmployeeContributions,
                totalEmployerContributions,
                totalContributions: totalEmployeeContributions + totalEmployerContributions,
                totalEmployees: new Set(employeeInsuranceData.map((d: any) => d.employee?._id?.toString())).size,
                totalPayrollRuns: new Set(employeeInsuranceData.map((d: any) => d.payrollRun?._id?.toString())).size,
            },
            insuranceBreakdown: Object.entries(insuranceBreakdown).map(([name, data]) => ({
                insuranceName: name,
                totalEmployeeContributions: data.employeeAmount,
                totalEmployerContributions: data.employerAmount,
                transactionCount: data.count,
            })),
            detailedData: employeeInsuranceData,
            generatedAt: new Date(),
        };
    }

    /**
     * Generate benefits report
     * REQ-PY-25
     */
    async generateBenefitsReport(filters: PayrollReportDto) {
        const { fromDate, toDate, departmentId } = filters;

        // Build query
        const query: any = {};
        const dateQuery: any = {};

        if (fromDate || toDate) {
            const builtDateQuery = this.buildDateQuery(fromDate, toDate);
            if (builtDateQuery) {
                if (builtDateQuery.$gte) dateQuery.$gte = builtDateQuery.$gte;
                if (builtDateQuery.$lte) dateQuery.$lte = builtDateQuery.$lte;
            }
        }

        if (Object.keys(dateQuery).length > 0) {
            query.createdAt = dateQuery;
        }

        // If department filter, get employee IDs first
        if (departmentId) {
            const employees = await this.employeeProfileModel
                .find({ primaryDepartmentId: new Types.ObjectId(departmentId) })
                .select('_id')
                .lean();
            const employeeIds = employees.map(emp => emp._id);
            query.employeeId = { $in: employeeIds };
        }

        // Get payslips
        const payslips = await this.payslipModel
            .find(query)
            .populate('employeeId', 'employeeNumber firstName lastName primaryDepartmentId')
            .populate('payrollRunId', 'runId payrollPeriod status')
            .lean();

        // Aggregate benefits data
        let totalBenefitsAmount = 0;
        const benefitsBreakdown: Record<string, { amount: number; count: number }> = {};
        const employeeBenefitsData: any[] = [];

        payslips.forEach((payslip: any) => {
            // Benefits are in earningsDetails
            if (payslip.earningsDetails?.benefits) {
                payslip.earningsDetails.benefits.forEach((benefit: any) => {
                    const benefitAmount = benefit.amount || 0;
                    totalBenefitsAmount += benefitAmount;

                    // Aggregate by benefit type
                    const benefitName = benefit.name || 'Unknown Benefit';
                    if (!benefitsBreakdown[benefitName]) {
                        benefitsBreakdown[benefitName] = { amount: 0, count: 0 };
                    }
                    benefitsBreakdown[benefitName].amount += benefitAmount;
                    benefitsBreakdown[benefitName].count += 1;

                    // Store per-employee data
                    employeeBenefitsData.push({
                        employee: payslip.employeeId,
                        payrollRun: payslip.payrollRunId,
                        benefitName,
                        benefitAmount,
                        period: payslip.payrollRunId?.payrollPeriod || payslip.createdAt,
                    });
                });
            }
        });

        return {
            reportType: 'benefits',
            period: fromDate && toDate ? `${fromDate} to ${toDate}` : 'All time',
            departmentId: departmentId || null,
            summary: {
                totalBenefitsAmount,
                totalEmployees: new Set(employeeBenefitsData.map((d: any) => d.employee?._id?.toString())).size,
                totalPayrollRuns: new Set(employeeBenefitsData.map((d: any) => d.payrollRun?._id?.toString())).size,
            },
            benefitsBreakdown: Object.entries(benefitsBreakdown).map(([name, data]) => ({
                benefitName: name,
                totalAmount: data.amount,
                transactionCount: data.count,
            })),
            detailedData: employeeBenefitsData,
            generatedAt: new Date(),
        };
    }

    /**
     * Generate month-end summary
     * REQ-PY-29
     */
    async generateMonthEndSummary(month: number, year: number) {
        if (month < 1 || month > 12) {
            throw new BadRequestException('Invalid month. Must be between 1 and 12');
        }

        const startDate = new Date(year, month - 1, 1);
        const endDate = new Date(year, month, 0, 23, 59, 59); // Last day of the month

        // Get all payroll runs for the month
        const payrollRuns = await this.payrollRunsModel
            .find({
                payrollPeriod: {
                    $gte: startDate,
                    $lte: endDate,
                },
            })
            .populate('payrollSpecialistId', 'employeeNumber firstName lastName')
            .populate('payrollManagerId', 'employeeNumber firstName lastName')
            .lean();

        // Get all payslips for the month
        const payslips = await this.payslipModel
            .find({
                createdAt: {
                    $gte: startDate,
                    $lte: endDate,
                },
            })
            .populate('employeeId', 'employeeNumber firstName lastName primaryDepartmentId')
            .populate('payrollRunId', 'runId payrollPeriod status')
            .lean();

        // Calculate totals
        let totalGrossSalary = 0;
        let totalDeductions = 0;
        let totalNetPay = 0;
        const departmentTotals: Record<string, { gross: number; deductions: number; net: number; employees: Set<string> }> = {};

        payslips.forEach((payslip: any) => {
            totalGrossSalary += payslip.totalGrossSalary || 0;
            totalDeductions += payslip.totaDeductions || 0;
            totalNetPay += payslip.netPay || 0;

            // Group by department
            const deptId = payslip.employeeId?.primaryDepartmentId?.toString() || 'Unknown';
            if (!departmentTotals[deptId]) {
                departmentTotals[deptId] = { gross: 0, deductions: 0, net: 0, employees: new Set() };
            }
            departmentTotals[deptId].gross += payslip.totalGrossSalary || 0;
            departmentTotals[deptId].deductions += payslip.totaDeductions || 0;
            departmentTotals[deptId].net += payslip.netPay || 0;
            departmentTotals[deptId].employees.add(payslip.employeeId?._id?.toString() || '');
        });

        return {
            reportType: 'month-end-summary',
            period: { month, year },
            summary: {
                totalPayrollRuns: payrollRuns.length,
                totalEmployees: new Set(payslips.map((p: any) => p.employeeId?._id?.toString())).size,
                totalGrossSalary,
                totalDeductions,
                totalNetPay,
            },
            payrollRuns: payrollRuns.map((run: any) => ({
                runId: run.runId,
                payrollPeriod: run.payrollPeriod,
                status: run.status,
                employees: run.employees,
                totalNetPay: run.totalnetpay,
                specialist: run.payrollSpecialistId,
                manager: run.payrollManagerId,
            })),
            departmentBreakdown: Object.entries(departmentTotals).map(([deptId, data]) => ({
                departmentId: deptId,
                employeeCount: data.employees.size,
                totalGrossSalary: data.gross,
                totalDeductions: data.deductions,
                totalNetPay: data.net,
            })),
            generatedAt: new Date(),
        };
    }

    /**
     * Generate year-end summary
     * REQ-PY-29
     */
    async generateYearEndSummary(year: number) {
        const startDate = new Date(year, 0, 1);
        const endDate = new Date(year, 11, 31, 23, 59, 59);

        // Get all payroll runs for the year
        const payrollRuns = await this.payrollRunsModel
            .find({
                payrollPeriod: {
                    $gte: startDate,
                    $lte: endDate,
                },
            })
            .lean();

        // Get all payslips for the year
        const payslips = await this.payslipModel
            .find({
                createdAt: {
                    $gte: startDate,
                    $lte: endDate,
                },
            })
            .populate('employeeId', 'employeeNumber firstName lastName primaryDepartmentId')
            .lean();

        // Calculate monthly breakdown
        const monthlyBreakdown: Record<number, { runs: number; employees: Set<string>; gross: number; deductions: number; net: number }> = {};
        for (let m = 1; m <= 12; m++) {
            monthlyBreakdown[m] = { runs: 0, employees: new Set(), gross: 0, deductions: 0, net: 0 };
        }

        let totalGrossSalary = 0;
        let totalDeductions = 0;
        let totalNetPay = 0;

        payslips.forEach((payslip: any) => {
            const month = new Date(payslip.createdAt).getMonth() + 1;
            totalGrossSalary += payslip.totalGrossSalary || 0;
            totalDeductions += payslip.totaDeductions || 0;
            totalNetPay += payslip.netPay || 0;

            monthlyBreakdown[month].gross += payslip.totalGrossSalary || 0;
            monthlyBreakdown[month].deductions += payslip.totaDeductions || 0;
            monthlyBreakdown[month].net += payslip.netPay || 0;
            monthlyBreakdown[month].employees.add(payslip.employeeId?._id?.toString() || '');
        });

        payrollRuns.forEach((run: any) => {
            const month = new Date(run.payrollPeriod).getMonth() + 1;
            monthlyBreakdown[month].runs += 1;
        });

        return {
            reportType: 'year-end-summary',
            year,
            summary: {
                totalPayrollRuns: payrollRuns.length,
                totalEmployees: new Set(payslips.map((p: any) => p.employeeId?._id?.toString())).size,
                totalGrossSalary,
                totalDeductions,
                totalNetPay,
            },
            monthlyBreakdown: Object.entries(monthlyBreakdown).map(([month, data]) => ({
                month: parseInt(month, 10),
                payrollRuns: data.runs,
                employeeCount: data.employees.size,
                totalGrossSalary: data.gross,
                totalDeductions: data.deductions,
                totalNetPay: data.net,
            })),
            generatedAt: new Date(),
        };
    }

    /**
     * Generate department payroll report
     * REQ-PY-38
     */
    async generateDepartmentPayrollReport(departmentId: string, filters: DepartmentReportDto) {
        // Get all employees in the department
        const employees = await this.employeeProfileModel
            .find({ primaryDepartmentId: new Types.ObjectId(departmentId) })
            .select('_id employeeNumber firstName lastName')
            .lean();

        if (employees.length === 0) {
            throw new NotFoundException('No employees found in this department');
        }

        const employeeIds = employees.map(emp => emp._id);

        // Build query
        const query: any = { employeeId: { $in: employeeIds } };
        const dateQuery: any = {};

        if (filters.fromDate || filters.toDate) {
            const builtDateQuery = this.buildDateQuery(filters.fromDate, filters.toDate);
            if (builtDateQuery) {
                if (builtDateQuery.$gte) dateQuery.$gte = builtDateQuery.$gte;
                if (builtDateQuery.$lte) dateQuery.$lte = builtDateQuery.$lte;
            }
            if (Object.keys(dateQuery).length > 0) {
                query.createdAt = dateQuery;
            }
        }

        if (filters.payrollRunId) {
            query.payrollRunId = new Types.ObjectId(filters.payrollRunId);
        }

        // Get payslips for department employees
        const payslips = await this.payslipModel
            .find(query)
            .populate('employeeId', 'employeeNumber firstName lastName primaryDepartmentId')
            .populate('payrollRunId', 'runId payrollPeriod status')
            .sort({ createdAt: -1 })
            .lean();

        // Calculate department totals
        let totalGrossSalary = 0;
        let totalDeductions = 0;
        let totalNetPay = 0;
        const employeeBreakdown: Record<string, { gross: number; deductions: number; net: number; payslipCount: number }> = {};

        payslips.forEach((payslip: any) => {
            const empId = payslip.employeeId?._id?.toString() || '';
            totalGrossSalary += payslip.totalGrossSalary || 0;
            totalDeductions += payslip.totaDeductions || 0;
            totalNetPay += payslip.netPay || 0;

            if (!employeeBreakdown[empId]) {
                employeeBreakdown[empId] = { gross: 0, deductions: 0, net: 0, payslipCount: 0 };
            }
            employeeBreakdown[empId].gross += payslip.totalGrossSalary || 0;
            employeeBreakdown[empId].deductions += payslip.totaDeductions || 0;
            employeeBreakdown[empId].net += payslip.netPay || 0;
            employeeBreakdown[empId].payslipCount += 1;
        });

        return {
            reportType: 'department-payroll',
            departmentId,
            period: filters.fromDate && filters.toDate ? `${filters.fromDate} to ${filters.toDate}` : 'All time',
            summary: {
                totalEmployees: employees.length,
                employeesWithPayslips: Object.keys(employeeBreakdown).length,
                totalPayslips: payslips.length,
                totalGrossSalary,
                totalDeductions,
                totalNetPay,
            },
            employeeBreakdown: Object.entries(employeeBreakdown).map(([empId, data]) => {
                const employee = employees.find(emp => emp._id.toString() === empId);
                return {
                    employee: employee ? {
                        employeeNumber: employee.employeeNumber,
                        firstName: employee.firstName,
                        lastName: employee.lastName,
                    } : null,
                    payslipCount: data.payslipCount,
                    totalGrossSalary: data.gross,
                    totalDeductions: data.deductions,
                    totalNetPay: data.net,
                };
            }),
            detailedPayslips: payslips.map((payslip: any) => ({
                payslipId: payslip._id,
                employee: payslip.employeeId,
                payrollRun: payslip.payrollRunId,
                grossSalary: payslip.totalGrossSalary,
                deductions: payslip.totaDeductions,
                netPay: payslip.netPay,
                paymentStatus: payslip.paymentStatus,
                period: payslip.payrollRunId?.payrollPeriod || payslip.createdAt,
            })),
            generatedAt: new Date(),
        };
    }
}
