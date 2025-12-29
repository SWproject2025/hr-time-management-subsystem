import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { FilterQuery, Model } from 'mongoose';

import {
  AppraisalTemplate,
  AppraisalTemplateDocument,
} from './models/appraisal-template.schema';

import {
  AppraisalCycle,
  AppraisalCycleDocument,
} from './models/appraisal-cycle.schema';

import {
  AppraisalAssignment,
  AppraisalAssignmentDocument,
} from './models/appraisal-assignment.schema';

import {
  AppraisalRecord,
  AppraisalRecordDocument,
} from './models/appraisal-record.schema';

import {
  AppraisalDispute,
  AppraisalDisputeDocument,
} from './models/appraisal-dispute.schema';

import { CreateAppraisalTemplateDto } from './dto/create-appraisal-template.dto';
import { UpdateAppraisalTemplateDto } from './dto/update-appraisal-template.dto';
import {
  CreateAppraisalCycleDto,
  SeedAssignmentDto,
} from './dto/create-appraisal-cycle.dto';
import { SubmitAppraisalDto } from './dto/submit-appraisal.dto';
import { SubmitDisputeDto } from './dto/SubmitDisputeDto';
import { ResolveDisputeDto } from './dto/ResolveDisputeDto';

import {
  AppraisalAssignmentStatus,
  AppraisalCycleStatus,
  AppraisalDisputeStatus,
  AppraisalRecordStatus,
} from './enums/performance.enums';

@Injectable()
export class PerformanceService {
  constructor(
    @InjectModel(AppraisalTemplate.name)
    private readonly templateModel: Model<AppraisalTemplateDocument>,

    @InjectModel(AppraisalCycle.name)
    private readonly cycleModel: Model<AppraisalCycleDocument>,

    @InjectModel(AppraisalAssignment.name)
    private readonly assignmentModel: Model<AppraisalAssignmentDocument>,

    @InjectModel(AppraisalRecord.name)
    private readonly recordModel: Model<AppraisalRecordDocument>,

    @InjectModel(AppraisalDispute.name)
    private readonly disputeModel: Model<AppraisalDisputeDocument>,
  ) {}

  // =======================
  // TEMPLATES
  // =======================

  async createTemplate(dto: CreateAppraisalTemplateDto) {
    const created = new this.templateModel({
      ...dto,
      isActive: dto.isActive ?? true,
    });

    return created.save();
  }

  async getAllTemplates() {
    return this.templateModel.find().exec();
  }

  async getTemplateById(id: string) {
    return this.templateModel.findById(id).exec();
  }

  async updateTemplate(id: string, dto: UpdateAppraisalTemplateDto) {
    return this.templateModel.findByIdAndUpdate(id, dto, { new: true }).exec();
  }

  // ✅ NEW: Delete template (with safety check)
  async removeTemplate(id: string) {
    const usedInAssignments = await this.assignmentModel
      .exists({ templateId: id as any })
      .exec();

    if (usedInAssignments) {
      throw new BadRequestException(
        'Cannot delete template: it is used in appraisal assignments.',
      );
    }

    const deleted = await this.templateModel.findByIdAndDelete(id).exec();

    if (!deleted) {
      throw new NotFoundException('Template not found');
    }

    return { message: 'Template deleted successfully', id };
  }

  // =======================
  // CYCLES + AUTO ASSIGNMENTS
  // =======================

  async createCycle(dto: CreateAppraisalCycleDto) {
    const cycle = await this.cycleModel.create({
      name: dto.name,
      description: dto.description,
      cycleType: dto.cycleType,
      startDate: dto.startDate,
      endDate: dto.endDate,
      managerDueDate: dto.managerDueDate,
      employeeAcknowledgementDueDate: dto.employeeAcknowledgementDueDate,
      templateAssignments: dto.templateAssignments ?? [],
      status: AppraisalCycleStatus.PLANNED,
    });

    if (dto.seedingAssignments && dto.seedingAssignments.length > 0) {
      await this.createAssignmentsForCycleFromSeed(
        cycle,
        dto.seedingAssignments,
      );
    }

    return cycle;
  }

  async getAllCycles() {
    return this.cycleModel.find().exec();
  }

  async getCycleById(id: string) {
    return this.cycleModel.findById(id).exec();
  }

  async activateCycle(cycleId: string) {
    const cycle = await this.cycleModel.findById(cycleId).exec();
    if (!cycle) throw new NotFoundException('Cycle not found');

    if (cycle.status !== AppraisalCycleStatus.PLANNED) {
      throw new BadRequestException(
        `Only PLANNED cycles can be activated. Current: ${cycle.status}`,
      );
    }

    cycle.status = AppraisalCycleStatus.ACTIVE;
    await cycle.save();
    return cycle;
  }

  async publishCycle(cycleId: string) {
    const cycle = await this.cycleModel.findById(cycleId).exec();
    if (!cycle) throw new NotFoundException('Cycle not found');

    if (cycle.status !== AppraisalCycleStatus.ACTIVE) {
      throw new BadRequestException(
        `Only ACTIVE cycles can be published. Current: ${cycle.status}`,
      );
    }

    const submittedAssignments = await this.assignmentModel
      .find({
        cycleId: cycle._id,
        status: AppraisalAssignmentStatus.SUBMITTED,
      })
      .exec();

    for (const a of submittedAssignments) {
      await this.publishAppraisal(String(a._id));
    }

    cycle.status = AppraisalCycleStatus.PUBLISHED;
    // @ts-ignore
    cycle.publishedAt = new Date();
    await cycle.save();

    return { publishedCount: submittedAssignments.length };
  }

  async closeCycle(cycleId: string) {
    const cycle = await this.cycleModel.findById(cycleId).exec();
    if (!cycle) throw new NotFoundException('Cycle not found');

    if (cycle.status !== AppraisalCycleStatus.PUBLISHED) {
      throw new BadRequestException(
        `Only PUBLISHED cycles can be closed. Current: ${cycle.status}`,
      );
    }

    cycle.status = AppraisalCycleStatus.CLOSED;
    // @ts-ignore
    cycle.closedAt = new Date();
    await cycle.save();

    return cycle;
  }

  async archiveCycle(cycleId: string) {
    const cycle = await this.cycleModel.findById(cycleId).exec();
    if (!cycle) throw new NotFoundException('Cycle not found');

    if (cycle.status !== AppraisalCycleStatus.CLOSED) {
      throw new BadRequestException(
        `Only CLOSED cycles can be archived. Current: ${cycle.status}`,
      );
    }

    cycle.status = AppraisalCycleStatus.ARCHIVED;
    // @ts-ignore
    cycle.archivedAt = new Date();
    await cycle.save();

    await this.recordModel.updateMany(
      { cycleId: cycle._id },
      { $set: { status: AppraisalRecordStatus.ARCHIVED } },
    );

    return cycle;
  }

  private async createAssignmentsForCycleFromSeed(
    cycle: AppraisalCycleDocument,
    seeds: SeedAssignmentDto[],
  ) {
    if (!seeds || seeds.length === 0) return;

    for (const seed of seeds) {
      // @ts-ignore
      if (!seed.departmentId) {
        throw new BadRequestException(
          'seedingAssignments[].departmentId is required (AppraisalAssignment schema requires departmentId).',
        );
      }
    }

    const docs = seeds.map((seed) => ({
      cycleId: cycle._id,
      templateId: seed.templateId,
      employeeProfileId: seed.employeeProfileId,
      managerProfileId: seed.managerProfileId,

      // @ts-ignore
      departmentId: seed.departmentId,

      status: AppraisalAssignmentStatus.NOT_STARTED,
    }));

    await this.assignmentModel.insertMany(docs);
  }

  // =======================
  // MANAGER VIEW – ASSIGNMENTS
  // =======================

  async getAssignmentsForManager(managerProfileId: string, cycleId?: string) {
    const filter: FilterQuery<AppraisalAssignmentDocument> = {
      managerProfileId,
    };

    if (cycleId) {
      filter.cycleId = cycleId as any;
    }

    return this.assignmentModel
      .find(filter)
      .populate('employeeProfileId')
      .populate('cycleId')
      .populate('templateId')
      .exec();
  }

  async getAssignmentDetailsForManager(assignmentId: string) {
    const assignment = await this.assignmentModel
      .findById(assignmentId)
      .populate('employeeProfileId')
      .populate('managerProfileId')
      .populate('cycleId')
      .populate('templateId')
      .exec();

    if (!assignment) {
      throw new NotFoundException('Appraisal assignment not found');
    }

    return assignment;
  }

  // =======================
  // MANAGER SUBMISSION
  // =======================

  async submitManagerAppraisal(assignmentId: string, dto: SubmitAppraisalDto) {
    const assignment = await this.assignmentModel.findById(assignmentId).exec();

    if (!assignment) {
      throw new NotFoundException('Appraisal assignment not found');
    }

    const cycle = await this.cycleModel.findById(assignment.cycleId).exec();
    if (!cycle) throw new NotFoundException('Cycle not found');

    if (cycle.status !== AppraisalCycleStatus.ACTIVE) {
      throw new BadRequestException(
        `Cannot submit appraisal: cycle is not ACTIVE. Current: ${cycle.status}`,
      );
    }

    if (cycle.managerDueDate) {
      const now = new Date();
      if (now > new Date(cycle.managerDueDate)) {
        throw new BadRequestException(
          `Manager due date has passed: ${new Date(
            cycle.managerDueDate,
          ).toISOString()}`,
        );
      }
    }

    if (
      ![
        AppraisalAssignmentStatus.NOT_STARTED,
        AppraisalAssignmentStatus.IN_PROGRESS,
        AppraisalAssignmentStatus.SUBMITTED,
      ].includes(assignment.status)
    ) {
      throw new BadRequestException(
        `Cannot submit appraisal in status: ${assignment.status}`,
      );
    }

    const record = await this.recordModel.create({
      assignmentId: assignment._id,
      cycleId: assignment.cycleId,
      templateId: assignment.templateId,
      employeeProfileId: assignment.employeeProfileId,
      managerProfileId: assignment.managerProfileId,

      ratings: dto.ratings,
      totalScore: dto.totalScore,
      overallRatingLabel: dto.overallRatingLabel,
      managerSummary: dto.managerSummary,
      strengths: dto.strengths,
      improvementAreas: dto.improvementAreas,

      status: AppraisalRecordStatus.MANAGER_SUBMITTED,
      managerSubmittedAt: new Date(),
    });

    assignment.status = AppraisalAssignmentStatus.SUBMITTED;
    assignment.submittedAt = new Date();
    assignment.latestAppraisalId = record._id;
    await assignment.save();

    return record;
  }

  // =======================
  // HR – PUBLISH APPRAISAL
  // =======================

  private async getLatestRecordForAssignment(
    assignment: AppraisalAssignmentDocument,
  ): Promise<AppraisalRecordDocument> {
    let record: AppraisalRecordDocument | null = null;

    if (assignment.latestAppraisalId) {
      record = await this.recordModel
        .findById(assignment.latestAppraisalId)
        .exec();
    } else {
      record = await this.recordModel
        .findOne({ assignmentId: assignment._id })
        .sort({ managerSubmittedAt: -1 })
        .exec();
    }

    if (!record) {
      throw new NotFoundException(
        'No appraisal record found for this assignment',
      );
    }

    return record;
  }

  async publishAppraisal(assignmentId: string) {
    const assignment = await this.assignmentModel.findById(assignmentId).exec();

    if (!assignment) {
      throw new NotFoundException('Appraisal assignment not found');
    }

    if (assignment.status !== AppraisalAssignmentStatus.SUBMITTED) {
      throw new BadRequestException(
        `Only SUBMITTED appraisals can be published. Current status: ${assignment.status}`,
      );
    }

    const record = await this.getLatestRecordForAssignment(assignment);

    record.status = AppraisalRecordStatus.HR_PUBLISHED;
    // @ts-ignore
    record.hrPublishedAt = new Date();
    await record.save();

    assignment.status = AppraisalAssignmentStatus.PUBLISHED;
    // @ts-ignore
    assignment.publishedAt = new Date();
    await assignment.save();

    return { assignment, record };
  }

  // =======================
  // EMPLOYEE VIEW – APPRAISALS
  // =======================

  async getAppraisalsForEmployee(employeeProfileId: string, cycleId?: string) {
    const filter: FilterQuery<AppraisalAssignmentDocument> = {
      employeeProfileId,
    };

    if (cycleId) {
      filter.cycleId = cycleId as any;
    }

    return this.assignmentModel
      .find(filter)
      .populate('managerProfileId')
      .populate('cycleId')
      .populate('templateId')
      .exec();
  }

  async getEmployeeAppraisal(assignmentId: string) {
    const assignment = await this.assignmentModel
      .findById(assignmentId)
      .populate('employeeProfileId')
      .populate('managerProfileId')
      .populate('cycleId')
      .populate('templateId')
      .exec();

    if (!assignment) {
      throw new NotFoundException('Appraisal assignment not found');
    }

    const record = await this.getLatestRecordForAssignment(assignment);

    return {
      assignment,
      appraisalRecord: record,
    };
  }

  async acknowledgeAppraisal(assignmentId: string) {
    const assignment = await this.assignmentModel.findById(assignmentId).exec();

    if (!assignment) {
      throw new NotFoundException('Appraisal assignment not found');
    }

    if (assignment.status !== AppraisalAssignmentStatus.PUBLISHED) {
      throw new BadRequestException(
        `Cannot acknowledge appraisal in status: ${assignment.status}`,
      );
    }

    const cycle = await this.cycleModel.findById(assignment.cycleId).exec();
    if (!cycle) throw new NotFoundException('Cycle not found');

    if (cycle.employeeAcknowledgementDueDate) {
      const now = new Date();
      if (now > new Date(cycle.employeeAcknowledgementDueDate)) {
        throw new BadRequestException(
          `Acknowledgement due date has passed: ${new Date(
            cycle.employeeAcknowledgementDueDate,
          ).toISOString()}`,
        );
      }
    }

    assignment.status = AppraisalAssignmentStatus.ACKNOWLEDGED;
    // @ts-ignore
    assignment.employeeAcknowledgedAt = new Date();
    await assignment.save();

    return assignment;
  }

  // =======================
  // EMPLOYEE – DISPUTE
  // =======================

  async submitDispute(
    assignmentId: string,
    employeeProfileId: string,
    dto: SubmitDisputeDto,
  ) {
    const assignment = await this.assignmentModel.findById(assignmentId).exec();

    if (!assignment) {
      throw new NotFoundException('Appraisal assignment not found');
    }

    if (
      ![
        AppraisalAssignmentStatus.PUBLISHED,
        AppraisalAssignmentStatus.ACKNOWLEDGED,
      ].includes(assignment.status)
    ) {
      throw new BadRequestException(
        `Cannot dispute appraisal in status: ${assignment.status}`,
      );
    }

    const cycle = await this.cycleModel.findById(assignment.cycleId).exec();
    if (!cycle) throw new NotFoundException('Cycle not found');

    if (cycle.status !== AppraisalCycleStatus.PUBLISHED) {
      throw new BadRequestException(
        `Disputes are only allowed when cycle is PUBLISHED. Current: ${cycle.status}`,
      );
    }

    const record = await this.getLatestRecordForAssignment(assignment);

    const dispute = await this.disputeModel.create({
      assignmentId: assignment._id,
      cycleId: assignment.cycleId,
      employeeProfileId: assignment.employeeProfileId,
      managerProfileId: assignment.managerProfileId,
      raisedByEmployeeProfileId: employeeProfileId,
      appraisalRecordId: record._id,

      reason: dto.reason,
      employeeComments: dto.employeeComments,
      status: AppraisalDisputeStatus.OPEN,

      createdAt: new Date(),
    });

    assignment.status = AppraisalAssignmentStatus.UNDER_DISPUTE;
    // @ts-ignore
    assignment.disputeId = dispute._id;
    await assignment.save();

    return dispute;
  }

  // =======================
  // HR – RESOLVE DISPUTE
  // =======================

  async resolveDispute(disputeId: string, dto: ResolveDisputeDto) {
    const dispute = await this.disputeModel.findById(disputeId).exec();

    if (!dispute) {
      throw new NotFoundException('Dispute not found');
    }

    const assignment = await this.assignmentModel
      .findOne({ _id: dispute.assignmentId })
      .exec();

    if (!assignment) {
      throw new NotFoundException('Related assignment not found');
    }

    const record = await this.recordModel
      .findById((dispute as any).appraisalRecordId)
      .exec();

    if (!record) {
      throw new NotFoundException('Related appraisal record not found');
    }

    dispute.status = dto.status;
    (dispute as any).hrDecisionNotes = dto.hrDecisionNotes;
    // @ts-ignore
    (dispute as any).resolvedAt = new Date();
    await dispute.save();

    if (dto.status === AppraisalDisputeStatus.ADJUSTED) {
      if (dto.adjustedTotalScore !== undefined) {
        record.totalScore = dto.adjustedTotalScore;
      }
      if (dto.adjustedOverallRatingLabel !== undefined) {
        record.overallRatingLabel = dto.adjustedOverallRatingLabel;
      }
      await record.save();
    }

    assignment.status = AppraisalAssignmentStatus.FINALIZED;
    await assignment.save();

    return { dispute, assignment, record };
  }
}
