import { Controller, Get, Post, Patch, Param, Body, UseGuards, Query } from '@nestjs/common';
import { PayrollExecutionService } from './payroll-execution.service';
import { EditSigningBonusDto } from './dto/editSigningBonusDto'; 
import { EditBenefitDto } from './dto/editBenefitDto';
import { ValidatePayrollPeriodDto } from './dto/validatePayrollPeriodDto';
import { ApprovePayrollPeriodDto } from './dto/approvePayrollPeriodDto';
import { RejectPayrollPeriodDto } from './dto/rejectPayrollPeriodDto';
import { EditPayrollPeriodDto } from './dto/editPayrollPeriodDto';
import { StartPayrollInitiationDto } from './dto/startPayrollInitiationDto';
import { JwtAuthGuard } from '../auth/jwt-auth.guard'; 
import { RolesGuard } from '../Common/Gaurds/roles.gaurd';
import { Roles } from '../Common/Decorators/roles.decorator';
import { SystemRole } from '../employee-profile/enums/employee-profile.enums'; 

@Controller('payroll-execution')
@UseGuards(JwtAuthGuard, RolesGuard) // Temporarily disabled for development
export class PayrollExecutionController {
  constructor(private readonly payrollExecutionService: PayrollExecutionService) {}

  @Get('signing-bonuses/pending')
  @Roles(SystemRole.PAYROLL_SPECIALIST)
  async getPendingSigningBonuses() {
    return await this.payrollExecutionService.getPendingSigningBonuses();
  }

  @Get('signing-bonuses/:id')
  @Roles(SystemRole.PAYROLL_SPECIALIST)
  async getSigningBonusById(@Param('id') id: string) {
    return await this.payrollExecutionService.getSigningBonusById(id);
  }

  @Patch('signing-bonuses/:id/approve')
  @Roles(SystemRole.PAYROLL_SPECIALIST)
  async approveSigningBonus(@Param('id') id: string) {
    return await this.payrollExecutionService.approveSigningBonus(id);
  }

  @Patch('signing-bonuses/:id/reject')
  @Roles(SystemRole.PAYROLL_SPECIALIST)
  async rejectSigningBonus(@Param('id') id: string) {
    return await this.payrollExecutionService.rejectSigningBonus(id);
  }

  @Patch('signing-bonuses/:id/edit')
  @Roles(SystemRole.PAYROLL_SPECIALIST)
  async editSigningBonus(
    @Param('id') id: string,
    @Body() editSigningBonusDto: EditSigningBonusDto,
  ) {
    return await this.payrollExecutionService.editSigningBonus(
      id,
      editSigningBonusDto.givenAmount,
      editSigningBonusDto.paymentDate,
    );
  }

  @Get('benefits/pending')
  @Roles(SystemRole.PAYROLL_SPECIALIST)
  async getPendingBenefits() {
    return await this.payrollExecutionService.getPendingBenefits();
  }

  @Get('benefits/:id')
  @Roles(SystemRole.PAYROLL_SPECIALIST)
  async getBenefitById(@Param('id') id: string) {
    return await this.payrollExecutionService.getBenefitById(id);
  }

  @Patch('benefits/:id/approve')
  @Roles(SystemRole.PAYROLL_SPECIALIST)
  async approveBenefit(@Param('id') id: string) {
    return await this.payrollExecutionService.approveBenefit(id);
  }

  @Patch('benefits/:id/reject')
  @Roles(SystemRole.PAYROLL_SPECIALIST)
  async rejectBenefit(@Param('id') id: string) {
    return await this.payrollExecutionService.rejectBenefit(id);
  }

  @Patch('benefits/:id/edit')
  @Roles(SystemRole.PAYROLL_SPECIALIST)
  async editBenefit(
    @Param('id') id: string,
    @Body() editBenefitDto: EditBenefitDto,
  ) {
    return await this.payrollExecutionService.editBenefit(id, editBenefitDto.givenAmount);
  }

  @Get('payroll-period/suggested')
  @Roles(SystemRole.PAYROLL_SPECIALIST)
  async getSuggestedPayrollPeriod() {
    return await this.payrollExecutionService.getSuggestedPayrollPeriod();
  }

  @Post('payroll-period/validate')
  @Roles(SystemRole.PAYROLL_SPECIALIST)
  async validatePayrollPeriod(@Body() validatePayrollPeriodDto: ValidatePayrollPeriodDto) {
    return await this.payrollExecutionService.validatePayrollPeriod(
      validatePayrollPeriodDto.payrollPeriod,
    );
  }

  @Get('payroll-runs/:id')
  @Roles(SystemRole.PAYROLL_SPECIALIST, SystemRole.PAYROLL_MANAGER)
  async getPayrollRunById(@Param('id') id: string) {
    return await this.payrollExecutionService.getPayrollRunById(id);
  }

  @Patch('payroll-runs/:id/approve')
  @Roles(SystemRole.PAYROLL_MANAGER)
  async approvePayrollPeriod(
    @Param('id') id: string,
    @Body() approvePayrollPeriodDto: ApprovePayrollPeriodDto,
  ) {
    return await this.payrollExecutionService.approvePayrollPeriod(
      id,
      approvePayrollPeriodDto.payrollManagerId,
    );
  }

  @Patch('payroll-runs/:id/reject')
  @Roles(SystemRole.PAYROLL_MANAGER)
  async rejectPayrollPeriod(
    @Param('id') id: string,
    @Body() rejectPayrollPeriodDto: RejectPayrollPeriodDto,
  ) {
    return await this.payrollExecutionService.rejectPayrollPeriod(
      id,
      rejectPayrollPeriodDto.rejectionReason,
    );
  }

  @Patch('payroll-runs/:id/edit')
  @Roles(SystemRole.PAYROLL_SPECIALIST)
  async editPayrollPeriod(
    @Param('id') id: string,
    @Body() editPayrollPeriodDto: EditPayrollPeriodDto,
  ) {
    return await this.payrollExecutionService.editPayrollPeriod(
      id,
      editPayrollPeriodDto.payrollPeriod,
    );
  }

  @Post('payroll-runs/start')
  @Roles(SystemRole.PAYROLL_SPECIALIST)
  async startPayrollInitiation(@Body() startPayrollInitiationDto: StartPayrollInitiationDto) {
    return await this.payrollExecutionService.startPayrollInitiation(
      startPayrollInitiationDto.runId,
      startPayrollInitiationDto.payrollPeriod,
      startPayrollInitiationDto.payrollSpecialistId,
      startPayrollInitiationDto.entity,
    );
  }

  @Get('pre-run-check')
  @Roles(SystemRole.PAYROLL_SPECIALIST)
  async checkPreRunApprovalsComplete() {
    return await this.payrollExecutionService.checkPreRunApprovalsComplete();
  }

  @Patch('payroll-runs/:runId/publish')
  @Roles(SystemRole.PAYROLL_SPECIALIST)
  async publishDraftForApproval(@Param('runId') runId: string) {
    return await this.payrollExecutionService.publishDraftForApproval(runId);
  }


  @Patch('payroll-runs/:runId/manager-approve')
  @Roles(SystemRole.PAYROLL_MANAGER)
  async approveByPayrollManager(
    @Param('runId') runId: string,
    @Body() body: { approverId?: string },
  ) {
    return await this.payrollExecutionService.approveByPayrollManager(runId, body.approverId);
  }

  @Patch('payroll-runs/:runId/manager-reject')
  @Roles(SystemRole.PAYROLL_MANAGER)
  async rejectByPayrollManager(
    @Param('runId') runId: string,
    @Body() body: { reason: string; approverId?: string },
  ) {
    return await this.payrollExecutionService.rejectByPayrollManager(runId, body.reason, body.approverId);
  }

  @Patch('payroll-runs/:runId/finance-approve')
  @Roles(SystemRole.FINANCE_STAFF)
  async approveByFinanceStaff(
    @Param('runId') runId: string,
    @Body() body: { approverId?: string },
  ) {
    return await this.payrollExecutionService.approveByFinanceStaff(runId, body.approverId);
  }

  @Patch('payroll-runs/:runId/finance-reject')
  @Roles(SystemRole.FINANCE_STAFF)
  async rejectByFinanceStaff(
    @Param('runId') runId: string,
    @Body() body: { reason: string; approverId?: string },
  ) {
    return await this.payrollExecutionService.rejectByFinanceStaff(runId, body.reason, body.approverId);
  }

  @Get('payroll-runs')
  @Roles(SystemRole.PAYROLL_SPECIALIST, SystemRole.PAYROLL_MANAGER)
  async getAllPayrollRuns(
    @Query('status') status?: string,
    @Query('entity') entity?: string,
    @Query('startDate') startDate?: string,
    @Query('endDate') endDate?: string,
  ) {
    const filters = { status, entity, startDate, endDate };
    return await this.payrollExecutionService.getAllPayrollRuns(filters);
  }

  @Patch('payroll-runs/:runId/freeze')
  @Roles(SystemRole.PAYROLL_MANAGER, SystemRole.FINANCE_STAFF)
  async freezePayroll(
    @Param('runId') runId: string,
    @Body() body: { reason?: string },
  ) {
    return await this.payrollExecutionService.freezePayroll(runId, body.reason);
  }

  @Patch('payroll-runs/:runId/unfreeze')
  @Roles(SystemRole.PAYROLL_MANAGER, SystemRole.FINANCE_STAFF)
  async unfreezePayroll(
    @Param('runId') runId: string,
    @Body() body: { unlockReason?: string },
  ) {
    return await this.payrollExecutionService.unfreezePayroll(runId, body.unlockReason);
  }

  @Get('payroll-runs/:runId/approvals')
  @Roles(SystemRole.PAYROLL_SPECIALIST, SystemRole.PAYROLL_MANAGER, SystemRole.FINANCE_STAFF)
  async getApprovalsByRunId(@Param('runId') runId: string) {
    return await this.payrollExecutionService.getApprovalsByRunId(runId);
  }

  @Post('payroll-runs/:runId/adjustments')
  @Roles(SystemRole.PAYROLL_SPECIALIST)
  async createPayrollAdjustment(
    @Param('runId') runId: string,
    @Body() body: { employeeId: string; type: 'bonus' | 'deduction' | 'benefit'; amount: number; reason?: string },
  ) {
    return await this.payrollExecutionService.createPayrollAdjustment(
      runId,
      body.employeeId,
      body.type,
      body.amount,
      body.reason,
    );
  }

  @Patch('payroll-runs/:runId/exceptions/:employeeId/resolve')
  @Roles(SystemRole.PAYROLL_SPECIALIST)
  async resolveException(
    @Param('runId') runId: string,
    @Param('employeeId') employeeId: string,
    @Body() body: { resolutionNote?: string },
  ) {
    return await this.payrollExecutionService.resolveException(runId, employeeId, body.resolutionNote);
  }

  @Post('payroll-runs/:runId/payslips/generate')
  @Roles(SystemRole.PAYROLL_SPECIALIST)
  async generatePayslips(@Param('runId') runId: string) {
    return await this.payrollExecutionService.generatePayslips(runId);
  }

  @Patch('payroll-runs/:runId/payslips/distribute')
  @Roles(SystemRole.PAYROLL_SPECIALIST)
  async distributePayslips(@Param('runId') runId: string) {
    return await this.payrollExecutionService.distributePayslips(runId);
  }

  @Patch('payroll-runs/:runId/mark-paid')
  @Roles(SystemRole.FINANCE_STAFF)
  async markPayrollAsPaid(@Param('runId') runId: string) {
    return await this.payrollExecutionService.markPayrollAsPaid(runId);
  }

  @Post('payroll-runs/:runId/exceptions/flag')
  @Roles(SystemRole.PAYROLL_SPECIALIST)
  async flagPayrollExceptions(@Param('runId') runId: string) {
    return await this.payrollExecutionService.flagPayrollExceptions(runId);
  }

  @Get('payroll-runs/:runId/exceptions')
  @Roles(SystemRole.PAYROLL_SPECIALIST, SystemRole.PAYROLL_MANAGER)
  async getPayrollRunExceptions(@Param('runId') runId: string) {
    return await this.payrollExecutionService.getPayrollRunExceptions(runId);
  }

  @Get('payroll-runs/:runId/review/draft')
  @Roles(SystemRole.PAYROLL_SPECIALIST)
  async reviewPayrollDraft(@Param('runId') runId: string) {
    return await this.payrollExecutionService.reviewPayrollDraft(runId);
  }

  @Get('payroll-runs/:runId/review/manager')
  @Roles(SystemRole.PAYROLL_MANAGER)
  async getPayrollForManagerReview(@Param('runId') runId: string) {
    return await this.payrollExecutionService.getPayrollForManagerReview(runId);
  }

  @Get('payroll-runs/:runId/review/finance')
  @Roles(SystemRole.FINANCE_STAFF)
  async getPayrollForFinanceReview(@Param('runId') runId: string) {
    return await this.payrollExecutionService.getPayrollForFinanceReview(runId);
  }

  @Get('payslips')
  @Roles(SystemRole.PAYROLL_SPECIALIST, SystemRole.PAYROLL_MANAGER, SystemRole.FINANCE_STAFF)
  async getAllPayslips(
    @Query('runId') runId?: string,
    @Query('employeeName') employeeName?: string,
    @Query('department') department?: string,
  ) {
    return await this.payrollExecutionService.getAllPayslips(
      runId,
      employeeName,
      department,
    );
  }

  @Get('payslips/:id')
  @Roles(SystemRole.PAYROLL_SPECIALIST, SystemRole.PAYROLL_MANAGER, SystemRole.FINANCE_STAFF)
  async getPayslipById(@Param('id') id: string) {
    return await this.payrollExecutionService.getPayslipById(id);
  }
}