import { Controller, Get, Post, Body, Patch, Param, Delete, Query, Put } from '@nestjs/common';
import { CalcDraftService } from './calc-draft.service';
import { CreateCalcDraftDto } from './dto/create-calc-draft.dto';
import { UpdateCalcDraftDto } from './dto/update-calc-draft.dto';
import { PayRollStatus } from '../enums/payroll-execution-enum';
import mongoose from 'mongoose';

@Controller('payroll')
export class CalcDraftController {
  constructor(private readonly calcDraftService: CalcDraftService) {}

  @Post('draft')
  createPayrollDraft(@Body() createCalcDraftDto: CreateCalcDraftDto) {
    return this.calcDraftService.createPayrollRun(createCalcDraftDto);
  }

  

  @Post('draft/:id/process')
  async processDraftGeneration(
    @Param('id') id: string,
    @Body() employeeData: any[]
  ) {
    const objectId = new mongoose.Types.ObjectId(id);
    return this.calcDraftService.processDraftGeneration(objectId, employeeData);
  }

  @Patch('draft/:id')
  updateDraft(
    @Param('id') id: string,
    @Body() updateCalcDraftDto: UpdateCalcDraftDto
  ) {
    const objectId = new mongoose.Types.ObjectId(id);
    const updateData: any = updateCalcDraftDto;
    return this.calcDraftService.updateRunStatus(objectId, PayRollStatus.DRAFT);
  }

  @Patch('draft/:id/status')
  updateDraftStatus(
    @Param('id') id: string,
    @Body() statusDto: { status: PayRollStatus }
  ) {
    const objectId = new mongoose.Types.ObjectId(id);
    return this.calcDraftService.updateRunStatus(objectId, statusDto.status);
  }

  @Post('employee/:employeeId/penalty')
  addPenalty(
    @Param('employeeId') employeeId: string,
    @Body() addPenaltyDto: any
  ) {
    return { message: 'Penalty added', employeeId, penalty: addPenaltyDto.penalty };
  }

  @Get('draft/:draftId/exceptions')
  getExceptionsByDraft(@Param('draftId') draftId: string) {
    const objectId = new mongoose.Types.ObjectId(draftId);
    return this.calcDraftService.getExceptionsByRun(objectId);
  }

  @Post('draft/:draftId/employee/:employeeId/recalculate')
  recalculateEmployeeSalary(
    @Param('draftId') draftId: string,
    @Param('employeeId') employeeId: string,
    @Body() employeeData: any
  ) {
    const draftObjectId = new mongoose.Types.ObjectId(draftId);
    const employeeObjectId = new mongoose.Types.ObjectId(employeeId);
    return this.calcDraftService.recalculateEmployeeSalary(draftObjectId, employeeObjectId, employeeData);
  }

  @Post('draft/:draftId/employee/:employeeId/payslip')
  generatePayslip(
    @Param('draftId') draftId: string,
    @Param('employeeId') employeeId: string
  ) {
    const draftObjectId = new mongoose.Types.ObjectId(draftId);
    const employeeObjectId = new mongoose.Types.ObjectId(employeeId);
    return this.calcDraftService.generatePayslip(draftObjectId, employeeObjectId);
  }

  @Get('employee/:employeeId/salary-breakdown')
  async getSalaryBreakdown(@Param('employeeId') employeeId: string) {
    return { 
      message: 'Salary breakdown endpoint',
      employeeId 
    };
  }

  @Post('calculate/gross')
  calculateGrossSalary(@Body() employeeData: any) {
    return this.calcDraftService.calculateGrossSalary(employeeData);
  }

  @Post('calculate/net')
  calculateNetSalary(@Body() employeeData: any) {
    return this.calcDraftService.calculateNetSalary(employeeData);
  }

  @Post('calculate/final')
  calculateFinalSalary(@Body() employeeData: any) {
    return this.calcDraftService.calculateFinalSalary(employeeData);
  }

  @Get('drafts')
  getAllPayrollDrafts(@Query('status') status?: string) {
    return { 
      message: 'Get all payroll drafts',
      filter: status ? { status } : 'all'
    };
  }

  @Delete('draft/:id')
  deletePayrollDraft(@Param('id') id: string) {
    return { 
      message: 'Payroll draft deleted',
      id 
    };
  }

  @Post('draft/:id/flag-anomalies')
  flagDraftAnomalies(@Param('id') id: string) {
    return { 
      message: 'Anomaly detection triggered',
      draftId: id 
    };
  }
}