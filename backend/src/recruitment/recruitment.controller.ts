import {
  Body,
  Controller,
  Get,
  Param,
  Patch,
  Post,
  Delete,
  Query,
} from '@nestjs/common';

import { RecruitmentService } from './recruitment.service';

import { CreateJobTemplateDto } from './dto/create-job-template.dto';
import { UpdateJobTemplateDto } from './dto/update-job-template.dto';

import { CreateJobRequisitionDto } from './dto/create-job-requisition.dto';
import { UpdateJobRequisitionDto } from './dto/update-job-requisition.dto';

import { CreateApplicationDto } from './dto/create-application.dto';
import { UpdateApplicationStatusDto } from './dto/update-application-status.dto';
import { UpdateApplicationStageDto } from './dto/update-application-stage.dto';
import { RejectApplicationDto } from './dto/reject-application.dto';
import { WithdrawApplicationDto } from './dto/withdraw-application.dto';
import { HoldApplicationDto } from './dto/hold-application.dto';

import { CreateInterviewDto } from './dto/create-interview.dto';
import { UpdateInterviewDto } from './dto/update-interview.dto';
import { CancelInterviewDto } from './dto/cancel-interview.dto';

import { CreateAssessmentResultDto } from './dto/create-assessment-result.dto';
import { UpdateAssessmentResultDto } from './dto/update-assessment-result.dto';

import { CreateReferralDto } from './dto/create-referral.dto';
import { UpdateReferralDto } from './dto/update-referral.dto';

import { CreateOfferDto } from './dto/create-offer.dto';
import { UpdateOfferStatusDto } from './dto/update-offer-status.dto';
import { RespondOfferDto } from './dto/respond-offer.dto';

import { CreateContractDto } from './dto/create-contract.dto';
import { UpdateContractDto } from './dto/update-contract.dto';
import { SignContractDto } from './dto/sign-contract.dto';
import { FilterContractsDto } from './dto/filter-contracts.dto';

import { CreateDocumentDto } from './dto/create-document.dto';
import { UpdateDocumentDto } from './dto/update-document.dto';
import { FilterDocumentsDto } from './dto/filter-documents.dto';

import { CreateOnboardingDto } from './dto/create-onboarding.dto';
import { UpdateOnboardingDto } from './dto/update-onboarding.dto';
import { CreateOnboardingTaskDto } from './dto/create-onboarding-task.dto';
import { UpdateOnboardingTaskDto } from './dto/update-onboarding-task.dto';
import { CompleteOnboardingTaskDto } from './dto/complete-onboarding-task.dto';
import { FilterOnboardingsDto } from './dto/filter-onboardings.dto';

import { CreateTerminationRequestDto } from './dto/create-termination-request.dto';
import { UpdateTerminationRequestDto } from './dto/update-termination-request.dto';
import { ApproveTerminationDto } from './dto/approve-termination.dto';
import { RejectTerminationDto } from './dto/reject-termination.dto';
import { FilterTerminationRequestDto } from './dto/filter-termination-request.dto';

import { CreateClearanceChecklistDto } from './dto/create-clearance-checklist.dto';
import { UpdateClearanceChecklistDto } from './dto/update-clearance-checklist.dto';
import { UpdateClearanceItemDto } from './dto/update-clearance-item.dto';
import { ApproveClearanceItemDto } from './dto/approve-clearance-item.dto';

@Controller('recruitment')
export class RecruitmentController {
  constructor(private readonly recruitmentService: RecruitmentService) {}

  // Job Templates
  @Post('job-templates')
  createJobTemplate(@Body() dto: CreateJobTemplateDto) {
    return this.recruitmentService.createJobTemplate(dto);
  }

  @Get('job-templates')
  findAllJobTemplates() {
    return this.recruitmentService.findAllJobTemplates();
  }

  @Get('job-templates/:id')
  findOneJobTemplate(@Param('id') id: string) {
    return this.recruitmentService.findOneJobTemplate(id);
  }

  @Patch('job-templates/:id')
  updateJobTemplate(
    @Param('id') id: string,
    @Body() dto: UpdateJobTemplateDto,
  ) {
    return this.recruitmentService.updateJobTemplate(id, dto);
  }

  @Delete('job-templates/:id')
  removeJobTemplate(@Param('id') id: string) {
    return this.recruitmentService.removeJobTemplate(id);
  }

  // Job Requisitions
  @Post('requisitions')
  createJobRequisition(@Body() dto: CreateJobRequisitionDto) {
    return this.recruitmentService.createJobRequisition(dto);
  }

  @Get('requisitions')
  findAllJobRequisitions() {
    return this.recruitmentService.findAllJobRequisitions();
  }

  @Get('requisitions/:id')
  findOneJobRequisition(@Param('id') id: string) {
    return this.recruitmentService.findOneJobRequisition(id);
  }

  @Patch('requisitions/:id')
  updateJobRequisition(
    @Param('id') id: string,
    @Body() dto: UpdateJobRequisitionDto,
  ) {
    return this.recruitmentService.updateJobRequisition(id, dto);
  }

  @Delete('requisitions/:id')
  removeJobRequisition(@Param('id') id: string) {
    return this.recruitmentService.removeJobRequisition(id);
  }

  // Applications
  @Post('applications')
  createApplication(@Body() dto: CreateApplicationDto) {
    return this.recruitmentService.createApplication(dto);
  }

  @Get('applications')
  findAllApplications() {
    return this.recruitmentService.findAllApplications();
  }

  @Get('applications/:id')
  findOneApplication(@Param('id') id: string) {
    return this.recruitmentService.findOneApplication(id);
  }

  @Get('applications/:id/history')
  getApplicationHistory(@Param('id') id: string) {
    return this.recruitmentService.getApplicationHistory(id);
  }

  @Patch('applications/:id/status')
  updateApplicationStatus(
    @Param('id') id: string,
    @Body() dto: UpdateApplicationStatusDto,
  ) {
    return this.recruitmentService.updateApplicationStatus(id, dto);
  }

  @Patch('applications/:id/stage')
  updateApplicationStage(
    @Param('id') id: string,
    @Body() dto: UpdateApplicationStageDto,
  ) {
    return this.recruitmentService.updateApplicationStage(id, dto);
  }

  @Patch('applications/:id/reject')
  rejectApplication(
    @Param('id') id: string,
    @Body() dto: RejectApplicationDto,
  ) {
    return this.recruitmentService.rejectApplication(id, dto);
  }

  @Patch('applications/:id/withdraw')
  withdrawApplication(
    @Param('id') id: string,
    @Body() dto: WithdrawApplicationDto,
  ) {
    return this.recruitmentService.withdrawApplication(id, dto);
  }

  @Patch('applications/:id/hold')
  holdApplication(
    @Param('id') id: string,
    @Body() dto: HoldApplicationDto,
  ) {
    return this.recruitmentService.holdApplication(id, dto);
  }

  // Interviews
  @Post('interviews')
  scheduleInterview(@Body() dto: CreateInterviewDto) {
    return this.recruitmentService.scheduleInterview(dto);
  }

  @Patch('interviews/:id')
  updateInterview(
    @Param('id') id: string,
    @Body() dto: UpdateInterviewDto,
  ) {
    return this.recruitmentService.updateInterview(id, dto);
  }

  @Patch('interviews/:id/cancel')
  cancelInterview(
    @Param('id') id: string,
    @Body() dto: CancelInterviewDto,
  ) {
    return this.recruitmentService.cancelInterview(id, dto);
  }

  @Get('applications/:id/interviews')
  getInterviewsForApplication(@Param('id') id: string) {
    return this.recruitmentService.getInterviewsForApplication(id);
  }

  // Assessments
  @Post('assessments')
  createAssessmentResult(@Body() dto: CreateAssessmentResultDto) {
    return this.recruitmentService.createAssessmentResult(dto);
  }

  @Patch('assessments/:id')
  updateAssessmentResult(
    @Param('id') id: string,
    @Body() dto: UpdateAssessmentResultDto,
  ) {
    return this.recruitmentService.updateAssessmentResult(id, dto);
  }

  @Get('applications/:id/assessments')
  getAssessmentsForApplication(@Param('id') id: string) {
    return this.recruitmentService.getAssessmentsForApplication(id);
  }

  @Get('interviews/:id/assessments')
  getAssessmentsForInterview(@Param('id') id: string) {
    return this.recruitmentService.getAssessmentsForInterview(id);
  }

  // Referrals
  @Post('referrals')
  createReferral(@Body() dto: CreateReferralDto) {
    return this.recruitmentService.createReferral(dto);
  }

  @Patch('referrals/:id')
  updateReferral(
    @Param('id') id: string,
    @Body() dto: UpdateReferralDto,
  ) {
    return this.recruitmentService.updateReferral(id, dto);
  }

  @Get('referrals/:id')
  getReferral(@Param('id') id: string) {
    return this.recruitmentService.getReferral(id);
  }

  @Get('referrals/candidate/:candidateId')
  getReferralsForCandidate(@Param('candidateId') candidateId: string) {
    return this.recruitmentService.getReferralsForCandidate(candidateId);
  }

  @Get('referrals/employee/:employeeId')
  getReferralsByEmployee(@Param('employeeId') employeeId: string) {
    return this.recruitmentService.getReferralsByEmployee(employeeId);
  }

  // Offers
  @Post('offers')
  createOffer(@Body() dto: CreateOfferDto) {
    return this.recruitmentService.createOffer(dto);
  }

  @Patch('offers/:id/status')
  updateOfferStatus(
    @Param('id') id: string,
    @Body() dto: UpdateOfferStatusDto,
  ) {
    return this.recruitmentService.updateOfferStatus(id, dto);
  }

  @Patch('offers/:id/accept')
  acceptOffer(
    @Param('id') id: string,
    @Body() dto: RespondOfferDto,
  ) {
    return this.recruitmentService.acceptOffer(id, dto);
  }

  @Patch('offers/:id/reject')
  rejectOffer(
    @Param('id') id: string,
    @Body() dto: RespondOfferDto,
  ) {
    return this.recruitmentService.rejectOffer(id, dto);
  }

  @Get('applications/:id/offer')
  getOfferForApplication(@Param('id') id: string) {
    return this.recruitmentService.getOfferForApplication(id);
  }

  // ==================== CONTRACTS ====================

  @Post('contracts')
  createContract(@Body() dto: CreateContractDto) {
    return this.recruitmentService.createContract(dto);
  }

  @Get('contracts/:id')
  getContract(@Param('id') id: string) {
    return this.recruitmentService.getContract(id);
  }

  @Patch('contracts/:id')
  updateContract(@Param('id') id: string, @Body() dto: UpdateContractDto) {
    return this.recruitmentService.updateContract(id, dto);
  }

  @Post('contracts/:id/sign')
  signContract(@Param('id') id: string, @Body() dto: SignContractDto) {
    return this.recruitmentService.signContract(id, dto);
  }

  @Get('offers/:offerId/contract')
  getContractByOffer(@Param('offerId') offerId: string) {
    return this.recruitmentService.getContractByOffer(offerId);
  }

  @Get('contracts')
  filterContracts(@Query() dto: FilterContractsDto) {
    return this.recruitmentService.filterContracts(dto);
  }

  // ==================== DOCUMENTS ====================

  @Post('documents')
  uploadDocument(@Body() dto: CreateDocumentDto) {
    return this.recruitmentService.uploadDocument(dto);
  }

  @Get('documents/:id')
  getDocument(@Param('id') id: string) {
    return this.recruitmentService.getDocument(id);
  }

  @Patch('documents/:id')
  updateDocument(@Param('id') id: string, @Body() dto: UpdateDocumentDto) {
    return this.recruitmentService.updateDocument(id, dto);
  }

  @Delete('documents/:id')
  deleteDocument(@Param('id') id: string) {
    return this.recruitmentService.deleteDocument(id);
  }

  @Get('users/:userId/documents')
  getDocumentsForUser(@Param('userId') userId: string) {
    return this.recruitmentService.getDocumentsForUser(userId);
  }

  @Get('documents')
  filterDocuments(@Query() dto: FilterDocumentsDto) {
    return this.recruitmentService.filterDocuments(dto);
  }

  // ==================== ONBOARDING ====================

  @Post('onboarding')
  createOnboarding(@Body() dto: CreateOnboardingDto) {
    return this.recruitmentService.createOnboarding(dto);
  }

  @Get('onboarding/:id')
  getOnboarding(@Param('id') id: string) {
    return this.recruitmentService.getOnboarding(id);
  }

  @Patch('onboarding/:id')
  updateOnboarding(@Param('id') id: string, @Body() dto: UpdateOnboardingDto) {
    return this.recruitmentService.updateOnboarding(id, dto);
  }

  @Get('onboarding/employee/:employeeId')
  getOnboardingForEmployee(@Param('employeeId') employeeId: string) {
    return this.recruitmentService.getOnboardingForEmployee(employeeId);
  }

  @Get('onboarding')
  filterOnboardings(@Query() dto: FilterOnboardingsDto) {
    return this.recruitmentService.filterOnboardings(dto);
  }

  @Post('onboarding/:id/tasks')
  addOnboardingTask(
    @Param('id') id: string,
    @Body() dto: CreateOnboardingTaskDto,
  ) {
    return this.recruitmentService.addOnboardingTask(id, dto);
  }

  @Patch('onboarding/:id/tasks/:taskId')
  updateOnboardingTask(
    @Param('id') id: string,
    @Param('taskId') taskId: string,
    @Body() dto: UpdateOnboardingTaskDto,
  ) {
    return this.recruitmentService.updateOnboardingTask(id, taskId, dto);
  }

  @Post('onboarding/:id/tasks/:taskId/complete')
  completeOnboardingTask(
    @Param('id') id: string,
    @Param('taskId') taskId: string,
    @Body() dto: CompleteOnboardingTaskDto,
  ) {
    return this.recruitmentService.completeOnboardingTask(id, taskId, dto);
  }

  @Post('onboarding/:id/complete')
  completeOnboarding(@Param('id') id: string) {
    return this.recruitmentService.completeOnboarding(id);
  }

  @Get('onboarding/:id/progress')
  getOnboardingProgress(@Param('id') id: string) {
    return this.recruitmentService.getOnboardingProgress(id);
  }

  // ==================== TERMINATION/OFFBOARDING ====================

  @Post('termination')
  createTerminationRequest(@Body() dto: CreateTerminationRequestDto) {
    return this.recruitmentService.createTerminationRequest(dto);
  }

  @Get('termination/:id')
  getTerminationRequest(@Param('id') id: string) {
    return this.recruitmentService.getTerminationRequest(id);
  }

  @Patch('termination/:id')
  updateTerminationRequest(
    @Param('id') id: string,
    @Body() dto: UpdateTerminationRequestDto,
  ) {
    return this.recruitmentService.updateTerminationRequest(id, dto);
  }

  @Get('termination/employee/:employeeId')
  getTerminationForEmployee(@Param('employeeId') employeeId: string) {
    return this.recruitmentService.getTerminationForEmployee(employeeId);
  }

  @Get('termination')
  filterTerminationRequests(@Query() dto: FilterTerminationRequestDto) {
    return this.recruitmentService.filterTerminationRequests(dto);
  }

  @Post('termination/:id/approve')
  approveTermination(
    @Param('id') id: string,
    @Body() dto: ApproveTerminationDto,
  ) {
    return this.recruitmentService.approveTermination(id, dto);
  }

  @Post('termination/:id/reject')
  rejectTermination(@Param('id') id: string, @Body() dto: RejectTerminationDto) {
    return this.recruitmentService.rejectTermination(id, dto);
  }

  @Post('termination/:id/clearance')
  createClearanceChecklist(
    @Param('id') id: string,
    @Body() dto: CreateClearanceChecklistDto,
  ) {
    return this.recruitmentService.createClearanceChecklist(dto);
  }

  @Get('termination/:id/clearance')
  getClearanceChecklist(@Param('id') id: string) {
    return this.recruitmentService.getClearanceChecklist(id);
  }

  @Patch('clearance/:id')
  updateClearanceChecklist(
    @Param('id') id: string,
    @Body() dto: UpdateClearanceChecklistDto,
  ) {
    return this.recruitmentService.updateClearanceChecklist(id, dto);
  }

  @Patch('clearance/:id/items/:itemId')
  updateClearanceItem(
    @Param('id') id: string,
    @Param('itemId') itemId: string,
    @Body() dto: UpdateClearanceItemDto,
  ) {
    return this.recruitmentService.updateClearanceItem(id, itemId, dto);
  }

  @Post('clearance/:id/items/:itemId/approve')
  approveClearanceItem(
    @Param('id') id: string,
    @Param('itemId') itemId: string,
    @Body() dto: ApproveClearanceItemDto,
  ) {
    return this.recruitmentService.approveClearanceItem(id, itemId, dto);
  }

  @Get('clearance/:id/progress')
  getClearanceProgress(@Param('id') id: string) {
    return this.recruitmentService.getClearanceProgress(id);
  }
}
