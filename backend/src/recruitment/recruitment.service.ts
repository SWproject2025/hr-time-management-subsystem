import {
  Injectable,
  NotFoundException,
  BadRequestException,
} from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';

import {
  JobTemplate,
  JobTemplateDocument,
} from './models/job-template.schema';
import {
  JobRequisition,
  JobRequisitionDocument,
} from './models/job-requisition.schema';
import {
  Application,
  ApplicationDocument,
} from './models/application.schema';
import {
  ApplicationStatusHistory,
  ApplicationStatusHistoryDocument,
} from './models/application-history.schema';
import {
  Interview,
  InterviewDocument,
} from './models/interview.schema';
import {
  AssessmentResult,
  AssessmentResultDocument,
} from './models/assessment-result.schema';
import {
  Referral,
  ReferralDocument,
} from './models/referral.schema';
import {
  Offer,
  OfferDocument,
} from './models/offer.schema';
import {
  Contract,
  ContractDocument,
} from './models/contract.schema';
import {
  Document,
  DocumentDocument,
} from './models/document.schema';
import {
  Onboarding,
  OnboardingDocument,
} from './models/onboarding.schema';
import {
  TerminationRequest,
  TerminationRequestDocument,
} from './models/termination-request.schema';
import {
  ClearanceChecklist,
  ClearanceChecklistDocument,
} from './models/clearance-checklist.schema';

import { CreateJobTemplateDto } from './dto/create-job-template.dto';
import { UpdateJobTemplateDto } from './dto/update-job-template.dto';

import { CreateJobRequisitionDto } from './dto/create-job-requisition.dto';
import { UpdateJobRequisitionDto } from './dto/update-job-requisition.dto';

import { CreateApplicationDto } from './dto/create-application.dto';
import { UpdateApplicationStageDto } from './dto/update-application-stage.dto';
import { UpdateApplicationStatusDto } from './dto/update-application-status.dto';
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

import { ApplicationStage } from './enums/application-stage.enum';
import { ApplicationStatus } from './enums/application-status.enum';
import { InterviewStatus } from './enums/interview-status.enum';
import { OfferResponseStatus } from './enums/offer-response-status.enum';
import { OfferFinalStatus } from './enums/offer-final-status.enum';
import { DocumentType } from './enums/document-type.enum';
import { OnboardingTaskStatus } from './enums/onboarding-task-status.enum';
import { TerminationStatus } from './enums/termination-status.enum';
import { ApprovalStatus } from './enums/approval-status.enum';

@Injectable()
export class RecruitmentService {
  constructor(
    @InjectModel(JobTemplate.name)
    private readonly jobTemplateModel: Model<JobTemplateDocument>,

    @InjectModel(JobRequisition.name)
    private readonly jobRequisitionModel: Model<JobRequisitionDocument>,

    @InjectModel(Application.name)
    private readonly applicationModel: Model<ApplicationDocument>,

    @InjectModel(ApplicationStatusHistory.name)
    private readonly historyModel: Model<ApplicationStatusHistoryDocument>,

    @InjectModel(Interview.name)
    private readonly interviewModel: Model<InterviewDocument>,

    @InjectModel(AssessmentResult.name)
    private readonly assessmentResultModel: Model<AssessmentResultDocument>,

    @InjectModel(Referral.name)
    private readonly referralModel: Model<ReferralDocument>,

    @InjectModel(Offer.name)
    private readonly offerModel: Model<OfferDocument>,

    @InjectModel(Contract.name)
    private readonly contractModel: Model<ContractDocument>,

    @InjectModel(Document.name)
    private readonly documentModel: Model<DocumentDocument>,

    @InjectModel(Onboarding.name)
    private readonly onboardingModel: Model<OnboardingDocument>,

    @InjectModel(TerminationRequest.name)
    private readonly terminationModel: Model<TerminationRequestDocument>,

    @InjectModel(ClearanceChecklist.name)
    private readonly clearanceModel: Model<ClearanceChecklistDocument>,
  ) {}

  // HISTORY LOGGER
  private async logHistory(
    applicationId: Types.ObjectId,
    oldStage: ApplicationStage,
    newStage: ApplicationStage,
    oldStatus: ApplicationStatus,
    newStatus: ApplicationStatus,
    changedBy: string,
  ) {
    await this.historyModel.create({
      applicationId,
      oldStage,
      newStage,
      oldStatus,
      newStatus,
      changedBy,
    });
  }

  // BUSINESS RULES
  private validateStageOrder(
    oldStage: ApplicationStage,
    newStage: ApplicationStage,
  ) {
    const order = [
      ApplicationStage.SCREENING,
      ApplicationStage.DEPARTMENT_INTERVIEW,
      ApplicationStage.HR_INTERVIEW,
      ApplicationStage.OFFER,
    ];

    const oldIndex = order.indexOf(oldStage);
    const newIndex = order.indexOf(newStage);

    if (newIndex < oldIndex) {
      throw new BadRequestException('Cannot move backwards in stages');
    }

    if (newIndex > oldIndex + 1) {
      throw new BadRequestException('Cannot skip stages');
    }
  }

  private validateMoveToInterview(
    stage: ApplicationStage,
    requisition: JobRequisitionDocument,
  ) {
    if (
      stage === ApplicationStage.DEPARTMENT_INTERVIEW ||
      stage === ApplicationStage.HR_INTERVIEW
    ) {
      if (requisition.publishStatus === 'closed') {
        throw new BadRequestException(
          'Cannot move to interview stage because requisition is closed',
        );
      }
    }
  }

  // JOB TEMPLATES
  async createJobTemplate(dto: CreateJobTemplateDto) {
    return new this.jobTemplateModel(dto).save();
  }

  async findAllJobTemplates() {
    return this.jobTemplateModel.find().exec();
  }

  async findOneJobTemplate(id: string) {
    const template = await this.jobTemplateModel.findById(id).exec();
    if (!template) throw new NotFoundException('Job template not found');
    return template;
  }

  async updateJobTemplate(id: string, dto: UpdateJobTemplateDto) {
    const update = await this.jobTemplateModel
      .findByIdAndUpdate(id, dto, { new: true })
      .exec();
    if (!update) throw new NotFoundException('Job template not found');
    return update;
  }

  async removeJobTemplate(id: string) {
    const result = await this.jobTemplateModel.findByIdAndDelete(id).exec();
    if (!result) throw new NotFoundException('Job template not found');
    return { deleted: true };
  }

  // JOB REQUISITIONS
  async createJobRequisition(dto: CreateJobRequisitionDto) {
    return new this.jobRequisitionModel(dto).save();
  }

  async findAllJobRequisitions() {
    return this.jobRequisitionModel.find().populate('templateId').exec();
  }

  async findOneJobRequisition(id: string) {
    const requisition = await this.jobRequisitionModel
      .findById(id)
      .populate('templateId')
      .exec();
    if (!requisition) throw new NotFoundException('Job requisition not found');
    return requisition;
  }

  async updateJobRequisition(id: string, dto: UpdateJobRequisitionDto) {
    const updated = await this.jobRequisitionModel
      .findByIdAndUpdate(id, dto, { new: true })
      .exec();
    if (!updated) throw new NotFoundException('Job requisition not found');
    return updated;
  }

  async removeJobRequisition(id: string) {
    const result = await this.jobRequisitionModel.findByIdAndDelete(id).exec();
    if (!result) throw new NotFoundException('Job requisition not found');
    return { deleted: true };
  }

  // APPLICATIONS
  async createApplication(dto: CreateApplicationDto) {
    const requisition = await this.findOneJobRequisition(dto.requisitionId);

    if (requisition.publishStatus === 'closed') {
      throw new BadRequestException('Cannot apply to closed requisition');
    }

    return new this.applicationModel({
      candidateId: dto.candidateId,
      requisitionId: dto.requisitionId,
      assignedHr: dto.assignedHr,
      currentStage: ApplicationStage.SCREENING,
      status: ApplicationStatus.SUBMITTED,
    }).save();
  }

  async findAllApplications() {
    return this.applicationModel.find().populate('requisitionId').exec();
  }

  async findOneApplication(id: string) {
    const app = await this.applicationModel
      .findById(id)
      .populate('requisitionId')
      .exec();
    if (!app) throw new NotFoundException('Application not found');
    return app;
  }

  async updateApplicationStatus(id: string, dto: UpdateApplicationStatusDto) {
    const app = await this.findOneApplication(id);

    const oldStatus = app.status;
    const newStatus = dto.newStatus;

    if (newStatus === ApplicationStatus.HIRED) {
      const acceptedOffer = await this.offerModel
        .findOne({
          applicationId: app._id,
          responseStatus: OfferResponseStatus.ACCEPTED,
        })
        .exec();

      if (!acceptedOffer) {
        throw new BadRequestException(
          'Cannot mark hired unless there is an accepted offer',
        );
      }

      if (app.currentStage !== ApplicationStage.OFFER) {
        throw new BadRequestException(
          'Cannot mark hired unless current stage is OFFER',
        );
      }
    }

    app.status = newStatus;
    await app.save();

    await this.logHistory(
      app._id,
      app.currentStage,
      app.currentStage,
      oldStatus,
      newStatus,
      dto.changedBy,
    );

    return app;
  }

  async updateApplicationStage(id: string, dto: UpdateApplicationStageDto) {
    const app = await this.findOneApplication(id);
    const requisition = await this.findOneJobRequisition(
      app.requisitionId.toString(),
    );

    const oldStage = app.currentStage;
    const newStage = dto.newStage;

    this.validateStageOrder(oldStage, newStage);
    this.validateMoveToInterview(newStage, requisition);

    app.currentStage = newStage;
    app.status = ApplicationStatus.IN_PROCESS;

    await app.save();

    await this.logHistory(
      app._id,
      oldStage,
      newStage,
      ApplicationStatus.IN_PROCESS,
      ApplicationStatus.IN_PROCESS,
      dto.changedBy,
    );

    return app;
  }

  async rejectApplication(id: string, dto: RejectApplicationDto) {
    const app = await this.findOneApplication(id);
    const oldStatus = app.status;

    app.status = ApplicationStatus.REJECTED;
    await app.save();

    await this.logHistory(
      app._id,
      app.currentStage,
      app.currentStage,
      oldStatus,
      ApplicationStatus.REJECTED,
      dto.changedBy,
    );

    return app;
  }

  async withdrawApplication(id: string, dto: WithdrawApplicationDto) {
    const app = await this.findOneApplication(id);
    const oldStatus = app.status;

    app.status = ApplicationStatus.REJECTED;
    await app.save();

    await this.logHistory(
      app._id,
      app.currentStage,
      app.currentStage,
      oldStatus,
      ApplicationStatus.REJECTED,
      dto.changedBy,
    );

    return app;
  }

  async holdApplication(id: string, dto: HoldApplicationDto) {
    const app = await this.findOneApplication(id);
    const oldStatus = app.status;

    app.status = ApplicationStatus.IN_PROCESS;
    await app.save();

    await this.logHistory(
      app._id,
      app.currentStage,
      app.currentStage,
      oldStatus,
      ApplicationStatus.IN_PROCESS,
      dto.changedBy,
    );

    return app;
  }

  async getApplicationHistory(applicationId: string) {
    return this.historyModel
      .find({
        applicationId: new Types.ObjectId(applicationId),
      })
      .sort({ createdAt: 1 })
      .exec();
  }

  // INTERVIEWS
  async scheduleInterview(dto: CreateInterviewDto) {
    const app = await this.findOneApplication(dto.applicationId);

    if (app.status === ApplicationStatus.REJECTED) {
      throw new BadRequestException(
        'Cannot schedule interview for a rejected application',
      );
    }

    if (app.currentStage === ApplicationStage.OFFER) {
      throw new BadRequestException(
        'Cannot schedule interview after offer stage',
      );
    }

    const interview = await this.interviewModel.create({
      applicationId: new Types.ObjectId(dto.applicationId),
      stage: dto.stage,
      scheduledDate: dto.scheduledDate,
      method: dto.method,
      panel: dto.panel.map((id) => new Types.ObjectId(id)),
      videoLink: dto.videoLink || '',
      calendarEventId: dto.calendarEventId || '',
      status: InterviewStatus.SCHEDULED,
    });

    await this.logHistory(
      app._id,
      app.currentStage,
      app.currentStage,
      app.status,
      app.status,
      dto.changedBy,
    );

    return interview;
  }

  async updateInterview(id: string, dto: UpdateInterviewDto) {
    const interview = await this.interviewModel.findById(id).exec();
    if (!interview) throw new NotFoundException('Interview not found');

    if (dto.scheduledDate) interview.scheduledDate = dto.scheduledDate;
    if (dto.method) interview.method = dto.method;
    if (dto.panel) {
      interview.panel = dto.panel.map((id) => new Types.ObjectId(id));
    }
    if (dto.status) interview.status = dto.status;
    if (dto.videoLink) interview.videoLink = dto.videoLink;
    if (dto.calendarEventId) {
      interview.calendarEventId = dto.calendarEventId;
    }
    if (dto.candidateFeedback) {
      interview.candidateFeedback = dto.candidateFeedback;
    }

    await interview.save();
    return interview;
  }

  async cancelInterview(id: string, dto: CancelInterviewDto) {
    const interview = await this.interviewModel.findById(id).exec();
    if (!interview) throw new NotFoundException('Interview not found');

    interview.status = InterviewStatus.CANCELLED;
    interview.candidateFeedback = dto.reason;

    await interview.save();
    return interview;
  }

  async getInterviewsForApplication(applicationId: string) {
    return this.interviewModel
      .find({ applicationId: new Types.ObjectId(applicationId) })
      .exec();
  }

  // ASSESSMENTS
  async createAssessmentResult(dto: CreateAssessmentResultDto) {
    const interview = await this.interviewModel
      .findById(dto.interviewId)
      .exec();
    if (!interview) throw new NotFoundException('Interview not found');

    const app = await this.findOneApplication(
      interview.applicationId.toString(),
    );

    if (app.status === ApplicationStatus.REJECTED) {
      throw new BadRequestException(
        'Cannot add assessment for a rejected application',
      );
    }

    if (app.currentStage === ApplicationStage.OFFER) {
      throw new BadRequestException(
        'Cannot add assessment after offer stage',
      );
    }

    const assessment = await this.assessmentResultModel.create({
      interviewId: interview._id,
      interviewerId: new Types.ObjectId(dto.interviewerId),
      score: dto.score,
      comments: dto.comments || '',
    });

    interview.feedbackId = assessment._id;
    await interview.save();

    return assessment;
  }

  async updateAssessmentResult(
    id: string,
    dto: UpdateAssessmentResultDto,
  ) {
    const assessment = await this.assessmentResultModel.findById(id).exec();
    if (!assessment) {
      throw new NotFoundException('Assessment result not found');
    }

    if (dto.score !== undefined) {
      assessment.score = dto.score;
    }
    if (dto.comments !== undefined) {
      assessment.comments = dto.comments;
    }

    await assessment.save();
    return assessment;
  }

  async getAssessmentsForApplication(applicationId: string) {
    const interviews = await this.interviewModel
      .find({ applicationId: new Types.ObjectId(applicationId) })
      .select('_id')
      .exec();

    if (!interviews.length) return [];

    const interviewIds = interviews.map((i) => i._id);
    return this.assessmentResultModel
      .find({ interviewId: { $in: interviewIds } })
      .exec();
  }

  async getAssessmentsForInterview(interviewId: string) {
    return this.assessmentResultModel
      .find({ interviewId: new Types.ObjectId(interviewId) })
      .exec();
  }

  // REFERRALS
  async createReferral(dto: CreateReferralDto) {
    const referral = await this.referralModel.create({
      referringEmployeeId: new Types.ObjectId(dto.referringEmployeeId),
      candidateId: new Types.ObjectId(dto.candidateId),
      role: dto.role,
      level: dto.level,
    });

    return referral;
  }

  async updateReferral(id: string, dto: UpdateReferralDto) {
    const referral = await this.referralModel.findById(id).exec();
    if (!referral) throw new NotFoundException('Referral not found');

    if (dto.role) referral.role = dto.role;
    if (dto.level) referral.level = dto.level;

    await referral.save();
    return referral;
  }

  async getReferral(id: string) {
    const referral = await this.referralModel.findById(id).exec();
    if (!referral) throw new NotFoundException('Referral not found');
    return referral;
  }

  async getReferralsForCandidate(candidateId: string) {
    return this.referralModel
      .find({ candidateId: new Types.ObjectId(candidateId) })
      .exec();
  }

  async getReferralsByEmployee(employeeId: string) {
    return this.referralModel
      .find({ referringEmployeeId: new Types.ObjectId(employeeId) })
      .exec();
  }

  // OFFERS
  async createOffer(dto: CreateOfferDto) {
    const app = await this.findOneApplication(dto.applicationId);

    if (app.currentStage !== ApplicationStage.OFFER) {
      throw new BadRequestException(
        'Cannot generate offer unless application is in OFFER stage',
      );
    }

    const offer = await this.offerModel.create({
      applicationId: new Types.ObjectId(dto.applicationId),
      candidateId: new Types.ObjectId(dto.candidateId),
    });

    await this.logHistory(
      app._id,
      app.currentStage,
      app.currentStage,
      app.status,
      app.status,
      dto.changedBy,
    );

    return offer;
  }

  async updateOfferStatus(id: string, dto: UpdateOfferStatusDto) {
    const offer = await this.offerModel.findById(id).exec();
    if (!offer) throw new NotFoundException('Offer not found');

    if (dto.responseStatus !== undefined) {
      (offer as any).responseStatus = dto.responseStatus;
    }
    if (dto.finalStatus !== undefined) {
      (offer as any).finalStatus = dto.finalStatus;
    }

    await offer.save();
    return offer;
  }

  async acceptOffer(id: string, dto: RespondOfferDto) {
    const offer = await this.offerModel.findById(id).exec();
    if (!offer) throw new NotFoundException('Offer not found');

    (offer as any).responseStatus = OfferResponseStatus.ACCEPTED;
    (offer as any).finalStatus = OfferFinalStatus.APPROVED;
    offer.candidateSignedAt = new Date();

    await offer.save();

    const app = await this.findOneApplication(offer.applicationId.toString());
    const oldStatus = app.status;

    app.status = ApplicationStatus.HIRED;
    await app.save();

    await this.logHistory(
      app._id,
      app.currentStage,
      app.currentStage,
      oldStatus,
      ApplicationStatus.HIRED,
      dto.changedBy,
    );

    // Create onboarding for new hire
    await this.createOnboarding({
      employeeId: app.candidateId.toString(),
    });

    return offer;
  }

  async rejectOffer(id: string, dto: RespondOfferDto) {
    const offer = await this.offerModel.findById(id).exec();
    if (!offer) throw new NotFoundException('Offer not found');

    (offer as any).responseStatus = OfferResponseStatus.REJECTED;
    (offer as any).finalStatus = OfferFinalStatus.REJECTED;

    await offer.save();

    const app = await this.findOneApplication(offer.applicationId.toString());
    const oldStatus = app.status;

    app.status = ApplicationStatus.REJECTED;
    await app.save();

    await this.logHistory(
      app._id,
      app.currentStage,
      app.currentStage,
      oldStatus,
      ApplicationStatus.REJECTED,
      dto.changedBy,
    );

    return offer;
  }

  async getOfferForApplication(applicationId: string) {
    return this.offerModel
      .findOne({ applicationId: new Types.ObjectId(applicationId) })
      .exec();
  }

  // ==================== CONTRACTS METHODS ====================

  async createContract(dto: CreateContractDto) {
    const contract = await this.contractModel.create(dto);
    return contract;
  }

  async updateContract(id: string, dto: UpdateContractDto) {
    const contract = await this.contractModel
      .findByIdAndUpdate(id, dto, { new: true })
      .exec();
    if (!contract) throw new NotFoundException('Contract not found');
    return contract;
  }

  async getContract(id: string) {
    const contract = await this.contractModel.findById(id).exec();
    if (!contract) throw new NotFoundException('Contract not found');
    return contract;
  }

  async getContractByOffer(offerId: string) {
    return this.contractModel
      .findOne({ offerId: new Types.ObjectId(offerId) })
      .exec();
  }

  async signContract(id: string, dto: SignContractDto) {
    const contract = await this.contractModel.findById(id).exec();
    if (!contract) throw new NotFoundException('Contract not found');

    if (dto.signerRole === 'employee') {
      contract.employeeSignatureUrl = dto.signatureUrl;
      contract.employeeSignedAt = new Date();
    } else {
      contract.employerSignatureUrl = dto.signatureUrl;
      contract.employerSignedAt = new Date();
    }

    await contract.save();
    return contract;
  }

  async filterContracts(dto: FilterContractsDto) {
    const filter: any = {};
    if (dto.offerId) filter.offerId = new Types.ObjectId(dto.offerId);

    return this.contractModel.find(filter).exec();
  }

  // ==================== DOCUMENTS METHODS ====================

  async uploadDocument(dto: CreateDocumentDto) {
    const document = await this.documentModel.create({
      ...dto,
      uploadedAt: new Date(),
    });
    return document;
  }

  async updateDocument(id: string, dto: UpdateDocumentDto) {
    const document = await this.documentModel
      .findByIdAndUpdate(id, dto, { new: true })
      .exec();
    if (!document) throw new NotFoundException('Document not found');
    return document;
  }

  async deleteDocument(id: string) {
    const document = await this.documentModel.findByIdAndDelete(id).exec();
    if (!document) throw new NotFoundException('Document not found');
    return document;
  }

  async getDocument(id: string) {
    const document = await this.documentModel.findById(id).exec();
    if (!document) throw new NotFoundException('Document not found');
    return document;
  }

  async getDocumentsForUser(userId: string) {
    return this.documentModel
      .find({ ownerId: new Types.ObjectId(userId) })
      .exec();
  }

  async getDocumentsByType(type: DocumentType) {
    return this.documentModel.find({ type }).exec();
  }

  async filterDocuments(dto: FilterDocumentsDto) {
    const filter: any = {};
    if (dto.ownerId) filter.ownerId = new Types.ObjectId(dto.ownerId);
    if (dto.type) filter.type = dto.type;

    return this.documentModel.find(filter).exec();
  }

  // ==================== ONBOARDING METHODS ====================

  async createOnboarding(dto: CreateOnboardingDto) {
    const defaultTasks = dto.tasks || [
      { name: 'Upload ID Documents', department: 'HR', deadline: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000) },
      { name: 'Email and System Setup', department: 'IT', deadline: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000) },
      { name: 'Office Access Card', department: 'Admin', deadline: new Date(Date.now() + 5 * 24 * 60 * 60 * 1000) },
      { name: 'Benefits Enrollment', department: 'HR', deadline: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000) },
      { name: 'Orientation Training', department: 'HR', deadline: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000) },
    ];

    const onboarding = await this.onboardingModel.create({
      employeeId: new Types.ObjectId(dto.employeeId),
      tasks: defaultTasks.map(task => ({
        ...task,
        status: OnboardingTaskStatus.PENDING,
      })),
      completed: false,
    });

    return onboarding;
  }

  async updateOnboarding(id: string, dto: UpdateOnboardingDto) {
    const onboarding = await this.onboardingModel
      .findByIdAndUpdate(id, dto, { new: true })
      .exec();
    if (!onboarding) throw new NotFoundException('Onboarding not found');
    return onboarding;
  }

  async getOnboarding(id: string) {
    const onboarding = await this.onboardingModel.findById(id).exec();
    if (!onboarding) throw new NotFoundException('Onboarding not found');
    return onboarding;
  }

  async getOnboardingForEmployee(employeeId: string) {
    return this.onboardingModel
      .findOne({ employeeId: new Types.ObjectId(employeeId) })
      .exec();
  }

  async filterOnboardings(dto: FilterOnboardingsDto) {
    const filter: any = {};
    if (dto.employeeId) filter.employeeId = new Types.ObjectId(dto.employeeId);
    if (dto.completed !== undefined) filter.completed = dto.completed;

    return this.onboardingModel.find(filter).exec();
  }

  async addOnboardingTask(onboardingId: string, dto: CreateOnboardingTaskDto) {
    const onboarding = await this.onboardingModel.findById(onboardingId).exec();
    if (!onboarding) throw new NotFoundException('Onboarding not found');

    onboarding.tasks.push({
      ...dto,
      status: OnboardingTaskStatus.PENDING,
    });

    await onboarding.save();
    return onboarding;
  }

  async updateOnboardingTask(
    onboardingId: string,
    taskId: string,
    dto: UpdateOnboardingTaskDto,
  ) {
    const onboarding = await this.onboardingModel.findById(onboardingId).exec();
    if (!onboarding) throw new NotFoundException('Onboarding not found');

    const task = (onboarding.tasks as any).id(taskId);
    if (!task) throw new NotFoundException('Task not found');

    Object.assign(task, dto);
    await onboarding.save();
    return onboarding;
  }

  async completeOnboardingTask(
    onboardingId: string,
    taskId: string,
    dto: CompleteOnboardingTaskDto,
  ) {
    const onboarding = await this.onboardingModel.findById(onboardingId).exec();
    if (!onboarding) throw new NotFoundException('Onboarding not found');

    const task = (onboarding.tasks as any).id(taskId);
    if (!task) throw new NotFoundException('Task not found');

    task.status = OnboardingTaskStatus.COMPLETED;
    task.completedAt = new Date();
    if (dto.documentId) {
      task.documentId = new Types.ObjectId(dto.documentId);
    }
    if (dto.notes) {
      task.notes = dto.notes;
    }

    await onboarding.save();
    return onboarding;
  }

  async completeOnboarding(id: string) {
    const onboarding = await this.onboardingModel.findById(id).exec();
    if (!onboarding) throw new NotFoundException('Onboarding not found');

    const allCompleted = onboarding.tasks.every(
      (task) => task.status === OnboardingTaskStatus.COMPLETED,
    );

    if (!allCompleted) {
      throw new BadRequestException('Not all tasks are completed');
    }

    onboarding.completed = true;
    onboarding.completedAt = new Date();
    await onboarding.save();

    return onboarding;
  }

  async getOnboardingProgress(id: string) {
    const onboarding = await this.onboardingModel.findById(id).exec();
    if (!onboarding) throw new NotFoundException('Onboarding not found');

    const totalTasks = onboarding.tasks.length;
    const completedTasks = onboarding.tasks.filter(
      (task) => task.status === OnboardingTaskStatus.COMPLETED,
    ).length;

    const progress = totalTasks > 0 ? (completedTasks / totalTasks) * 100 : 0;

    return {
      totalTasks,
      completedTasks,
      progress: Math.round(progress),
      onboarding,
    };
  }

  // ==================== TERMINATION/OFFBOARDING METHODS ====================

  async createTerminationRequest(dto: CreateTerminationRequestDto) {
    const termination = await this.terminationModel.create({
      ...dto,
      employeeId: new Types.ObjectId(dto.employeeId),
      contractId: new Types.ObjectId(dto.contractId),
      status: TerminationStatus.PENDING,
    });
    return termination;
  }

  async updateTerminationRequest(id: string, dto: UpdateTerminationRequestDto) {
    const termination = await this.terminationModel
      .findByIdAndUpdate(id, dto, { new: true })
      .exec();
    if (!termination) throw new NotFoundException('Termination request not found');
    return termination;
  }

  async getTerminationRequest(id: string) {
    const termination = await this.terminationModel.findById(id).exec();
    if (!termination) throw new NotFoundException('Termination request not found');
    return termination;
  }

  async getTerminationForEmployee(employeeId: string) {
    return this.terminationModel
      .findOne({ employeeId: new Types.ObjectId(employeeId) })
      .sort({ createdAt: -1 })
      .exec();
  }

  async filterTerminationRequests(dto: FilterTerminationRequestDto) {
    const filter: any = {};
    if (dto.employeeId) filter.employeeId = new Types.ObjectId(dto.employeeId);
    if (dto.status) filter.status = dto.status;
    if (dto.initiator) filter.initiator = dto.initiator;

    return this.terminationModel.find(filter).exec();
  }

  async approveTermination(id: string, dto: ApproveTerminationDto) {
    const termination = await this.terminationModel.findById(id).exec();
    if (!termination) throw new NotFoundException('Termination request not found');

    termination.status = TerminationStatus.APPROVED;
    termination.hrComments = dto.hrComments;
    termination.terminationDate = dto.terminationDate;

    await termination.save();

    // Auto-create clearance checklist
    await this.createClearanceChecklist({
      terminationId: id,
      departments: ['IT', 'Finance', 'Facilities', 'HR', 'Admin'],
    });

    return termination;
  }

  async rejectTermination(id: string, dto: RejectTerminationDto) {
    const termination = await this.terminationModel.findById(id).exec();
    if (!termination) throw new NotFoundException('Termination request not found');

    termination.status = TerminationStatus.REJECTED;
    termination.hrComments = dto.hrComments;

    await termination.save();
    return termination;
  }

  async createClearanceChecklist(dto: CreateClearanceChecklistDto) {
    const departments = dto.departments || ['IT', 'Finance', 'Facilities', 'HR', 'Admin'];

    const items = departments.map(dept => ({
      department: dept,
      status: ApprovalStatus.PENDING,
    }));

    const equipmentList = dto.equipmentList?.map(eq => ({
      name: eq.name,
      equipmentId: eq.equipmentId ? new Types.ObjectId(eq.equipmentId) : undefined,
      returned: false,
    })) || [];

    const clearance = await this.clearanceModel.create({
      terminationId: new Types.ObjectId(dto.terminationId),
      items,
      equipmentList,
      cardReturned: false,
    });

    return clearance;
  }

  async updateClearanceChecklist(id: string, dto: UpdateClearanceChecklistDto) {
    const clearance = await this.clearanceModel
      .findByIdAndUpdate(id, dto, { new: true })
      .exec();
    if (!clearance) throw new NotFoundException('Clearance checklist not found');
    return clearance;
  }

  async getClearanceChecklist(terminationId: string) {
    return this.clearanceModel
      .findOne({ terminationId: new Types.ObjectId(terminationId) })
      .exec();
  }

  async updateClearanceItem(
    checklistId: string,
    itemId: string,
    dto: UpdateClearanceItemDto,
  ) {
    const clearance = await this.clearanceModel.findById(checklistId).exec();
    if (!clearance) throw new NotFoundException('Clearance checklist not found');

    const item = (clearance.items as any).id(itemId);
    if (!item) throw new NotFoundException('Clearance item not found');

    if (dto.status) item.status = dto.status;
    if (dto.comments) item.comments = dto.comments;
    item.updatedBy = new Types.ObjectId(dto.updatedBy);
    item.updatedAt = new Date();

    await clearance.save();
    return clearance;
  }

  async approveClearanceItem(
    checklistId: string,
    itemId: string,
    dto: ApproveClearanceItemDto,
  ) {
    const clearance = await this.clearanceModel.findById(checklistId).exec();
    if (!clearance) throw new NotFoundException('Clearance checklist not found');

    const item = (clearance.items as any).id(itemId);
    if (!item) throw new NotFoundException('Clearance item not found');

    item.status = ApprovalStatus.APPROVED;
    if (dto.comments) item.comments = dto.comments;
    item.updatedBy = new Types.ObjectId(dto.updatedBy);
    item.updatedAt = new Date();

    await clearance.save();
    return clearance;
  }

  async getClearanceProgress(checklistId: string) {
    const clearance = await this.clearanceModel.findById(checklistId).exec();
    if (!clearance) throw new NotFoundException('Clearance checklist not found');

    const totalItems = clearance.items.length;
    const approvedItems = clearance.items.filter(
      (item) => item.status === ApprovalStatus.APPROVED,
    ).length;

    const totalEquipment = clearance.equipmentList.length;
    const returnedEquipment = clearance.equipmentList.filter(
      (eq) => eq.returned === true,
    ).length;

    const allItemsApproved = totalItems > 0 ? approvedItems === totalItems : true;
    const allEquipmentReturned = totalEquipment > 0 ? returnedEquipment === totalEquipment : true;
    const cardReturned = clearance.cardReturned;

    const isComplete = allItemsApproved && allEquipmentReturned && cardReturned;

    return {
      totalItems,
      approvedItems,
      totalEquipment,
      returnedEquipment,
      cardReturned,
      isComplete,
      progress: {
        items: totalItems > 0 ? Math.round((approvedItems / totalItems) * 100) : 100,
        equipment: totalEquipment > 0 ? Math.round((returnedEquipment / totalEquipment) * 100) : 100,
      },
      clearance,
    };
  }
}
