// src/performance/performance.controller.ts

import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Patch,
  Post,
  Query,
} from '@nestjs/common';
import { PerformanceService } from './performance.service';

import { CreateAppraisalTemplateDto } from './dto/create-appraisal-template.dto';
import { UpdateAppraisalTemplateDto } from './dto/update-appraisal-template.dto';
import { CreateAppraisalCycleDto } from './dto/create-appraisal-cycle.dto';

import { SubmitAppraisalDto } from './dto/submit-appraisal.dto';
import { SubmitDisputeDto } from './dto/SubmitDisputeDto';
import { ResolveDisputeDto } from './dto/ResolveDisputeDto';

@Controller('performance')
export class PerformanceController {
  constructor(private readonly performanceService: PerformanceService) {}

  // ================
  // TEMPLATES
  // ================

  @Post('templates')
  createTemplate(@Body() dto: CreateAppraisalTemplateDto) {
    return this.performanceService.createTemplate(dto);
  }

  @Get('templates')
  getAllTemplates() {
    return this.performanceService.getAllTemplates();
  }

  @Get('templates/:id')
  getTemplateById(@Param('id') id: string) {
    return this.performanceService.getTemplateById(id);
  }

  @Patch('templates/:id')
  updateTemplate(@Param('id') id: string, @Body() dto: UpdateAppraisalTemplateDto) {
    return this.performanceService.updateTemplate(id, dto);
  }

  @Delete('templates/:id')
  deleteTemplate(@Param('id') id: string) {
    return this.performanceService.removeTemplate(id);
  }

  // ================
  // CYCLES
  // ================

  @Post('cycles')
  createCycle(@Body() dto: CreateAppraisalCycleDto) {
    return this.performanceService.createCycle(dto);
  }

  @Get('cycles')
  getAllCycles() {
    return this.performanceService.getAllCycles();
  }

  @Get('cycles/:id')
  getCycleById(@Param('id') id: string) {
    return this.performanceService.getCycleById(id);
  }

  @Post('cycles/:id/activate')
  activateCycle(@Param('id') id: string) {
    return this.performanceService.activateCycle(id);
  }

  @Post('cycles/:id/publish')
  publishCycle(@Param('id') id: string) {
    return this.performanceService.publishCycle(id);
  }

  @Post('cycles/:id/close')
  closeCycle(@Param('id') id: string) {
    return this.performanceService.closeCycle(id);
  }

  @Post('cycles/:id/archive')
  archiveCycle(@Param('id') id: string) {
    return this.performanceService.archiveCycle(id);
  }

  // ================
  // MANAGER
  // ================

  @Get('manager/:managerProfileId/assignments')
  getManagerAssignments(
    @Param('managerProfileId') managerProfileId: string,
    @Query('cycleId') cycleId?: string,
  ) {
    return this.performanceService.getAssignmentsForManager(managerProfileId, cycleId);
  }

  @Get('manager/assignments/:assignmentId')
  getManagerAssignmentDetails(@Param('assignmentId') assignmentId: string) {
    return this.performanceService.getAssignmentDetailsForManager(assignmentId);
  }

  @Post('manager/assignments/:assignmentId/submit')
  submitManagerAppraisal(
    @Param('assignmentId') assignmentId: string,
    @Body() dto: SubmitAppraisalDto,
  ) {
    return this.performanceService.submitManagerAppraisal(assignmentId, dto);
  }

  // ================
  // HR
  // ================

  @Post('hr/assignments/:assignmentId/publish')
  publishAppraisal(@Param('assignmentId') assignmentId: string) {
    return this.performanceService.publishAppraisal(assignmentId);
  }

  @Post('hr/disputes/:disputeId/resolve')
  resolveDispute(@Param('disputeId') disputeId: string, @Body() dto: ResolveDisputeDto) {
    return this.performanceService.resolveDispute(disputeId, dto);
  }

  // ================
  // EMPLOYEE
  // ================

  @Get('employee/:employeeProfileId/appraisals')
  getEmployeeAppraisals(
    @Param('employeeProfileId') employeeProfileId: string,
    @Query('cycleId') cycleId?: string,
  ) {
    return this.performanceService.getAppraisalsForEmployee(employeeProfileId, cycleId);
  }

  @Get('employee/appraisals/:assignmentId')
  getEmployeeAppraisal(@Param('assignmentId') assignmentId: string) {
    return this.performanceService.getEmployeeAppraisal(assignmentId);
  }

  @Post('employee/appraisals/:assignmentId/acknowledge')
  acknowledgeAppraisal(@Param('assignmentId') assignmentId: string) {
    return this.performanceService.acknowledgeAppraisal(assignmentId);
  }

  // ✅ FIXED: employeeProfileId is a param, DTO stays clean
  @Post('employee/:employeeProfileId/appraisals/:assignmentId/dispute')
  submitDispute(
    @Param('assignmentId') assignmentId: string,
    @Param('employeeProfileId') employeeProfileId: string,
    @Body() dto: SubmitDisputeDto,
  ) {
    return this.performanceService.submitDispute(assignmentId, employeeProfileId, dto);
  }
}
