/* eslint-disable @typescript-eslint/no-unsafe-assignment */
import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { Department, DepartmentDocument } from './models/department.schema';
import { Position, PositionDocument } from './models/position.schema';
import {
  JobRequisition,
  JobRequisitionDocument,
} from './models/job-requisition.schema';
import {
  PositionAssignment,
  PositionAssignmentDocument,
} from './models/position-assignment.schema';
import { CreateDepartmentDto } from './dto/create-department.dto';
import { UpdateDepartmentDto } from './dto/update-department.dto';
import { CreatePositionDto } from './dto/create-position.dto';
import { UpdatePositionDto } from './dto/update-position.dto';
import { CreateJobRequisitionDto } from './dto/create-job-requisition.dto';
import { UpdateJobRequisitionDto } from './dto/update-job-requisition.dto';

@Injectable()
export class OrganizationStructureService {
  constructor(
    @InjectModel(Department.name)
    private readonly departmentModel: Model<DepartmentDocument>,
    @InjectModel(Position.name)
    private readonly positionModel: Model<PositionDocument>,
    @InjectModel(JobRequisition.name)
    private readonly jobReqModel: Model<JobRequisitionDocument>,
    @InjectModel(PositionAssignment.name)
    private readonly positionAssignmentModel: Model<any>,
  ) {}

  // Departments

  async createDepartment(dto: CreateDepartmentDto): Promise<DepartmentDocument> {
    const existing = await this.departmentModel
      .findOne({ code: dto.code })
      .lean()
      .exec();
    if (existing) {
      throw new BadRequestException(
        `Department with code "${dto.code}" already exists`,
      );
    }

    const now = new Date();
    const department = new this.departmentModel({
      code: dto.code,
      name: dto.name,
      description: dto.description,
      active: dto.active ?? true,
      startDate: dto.startDate ? new Date(dto.startDate) : now,
      endDate: dto.endDate ? new Date(dto.endDate) : null,
    });
    return department.save();
  }

  async updateDepartment(
    id: string,
    dto: UpdateDepartmentDto,
  ): Promise<DepartmentDocument> {
    const department = await this.departmentModel
      .findById(id)
      .exec();
    if (!department) {
      throw new NotFoundException('Department not found');
    }

    if (dto.code !== undefined) department.code = dto.code;
    if (dto.name !== undefined) department.name = dto.name;
    if (dto.description !== undefined)
      department.description = dto.description;
    if (dto.active !== undefined) department.active = dto.active;
    if (dto.startDate !== undefined)
      department.startDate = new Date(dto.startDate);
    if (dto.endDate !== undefined)
      department.endDate = dto.endDate ? new Date(dto.endDate) : null;

    return department.save();
  }

  async deactivateDepartment(id: string): Promise<DepartmentDocument> {
    const department = await this.departmentModel
      .findById(id)
      .exec();
    if (!department) {
      throw new NotFoundException('Department not found');
    }

    if (!department.active) {
      return department;
    }

    const endDate = new Date();
    department.active = false;
    department.endDate = endDate;
    await department.save();

    // Delimit all positions under this department
    const departmentObjectId = new Types.ObjectId(id);
    await this.positionModel.updateMany(
      { departmentId: departmentObjectId, active: true },
      { $set: { active: false, endDate } },
    );

    return department;
  }

  async listDepartments(): Promise<DepartmentDocument[]> {
    return this.departmentModel.find().exec();
  }

  async getDepartmentById(id: string): Promise<DepartmentDocument> {
    const department = await this.departmentModel
      .findById(id)
      .exec();
    if (!department) {
      throw new NotFoundException('Department not found');
    }
    return department;
  }

  // Positions

  private async ensureActiveDepartment(
    departmentId: string,
  ): Promise<Types.ObjectId> {
    const objectId = new Types.ObjectId(departmentId);
    const dept = await this.departmentModel
      .findOne({ _id: objectId, active: true })
      .exec();
    if (!dept) {
      throw new BadRequestException(
        'Department must exist and be active',
      );
    }
    return objectId;
  }

  async createPosition(dto: CreatePositionDto): Promise<PositionDocument> {
    const existing = await this.positionModel
      .findOne({ code: dto.code })
      .lean()
      .exec();
    if (existing) {
      throw new BadRequestException(
        `Position with code "${dto.code}" already exists`,
      );
    }

    const departmentObjectId = await this.ensureActiveDepartment(
      dto.departmentId,
    );

    const now = new Date();
    const position = new this.positionModel({
      code: dto.code,
      name: dto.name,
      description: dto.description,
      departmentId: departmentObjectId,
      reportingLine: dto.reportingLine
        ? new Types.ObjectId(dto.reportingLine)
        : undefined,
      payGrade: dto.payGrade,
      active: dto.active ?? true,
      startDate: dto.startDate ? new Date(dto.startDate) : now,
      endDate: dto.endDate ? new Date(dto.endDate) : null,
    });

    return position.save();
  }

  async updatePosition(
    id: string,
    dto: UpdatePositionDto,
  ): Promise<PositionDocument> {
    const position = await this.positionModel.findById(id).exec();
    if (!position) {
      throw new NotFoundException('Position not found');
    }

    if (dto.departmentId) {
      position.departmentId = await this.ensureActiveDepartment(
        dto.departmentId,
      );
    }

    if (dto.code !== undefined) position.code = dto.code;
    if (dto.name !== undefined) position.name = dto.name;
    if (dto.description !== undefined)
      position.description = dto.description;

    if (dto.reportingLine !== undefined) {
      position.reportingLine = dto.reportingLine
        ? new Types.ObjectId(dto.reportingLine)
        : undefined;
    }

    if (dto.payGrade !== undefined) position.payGrade = dto.payGrade;
    if (dto.active !== undefined) position.active = dto.active;
    if (dto.startDate !== undefined)
      position.startDate = new Date(dto.startDate);
    if (dto.endDate !== undefined)
      position.endDate = dto.endDate ? new Date(dto.endDate) : null;

    return position.save();
  }

  async deactivatePosition(id: string): Promise<PositionDocument> {
    const position = await this.positionModel.findById(id).exec();
    if (!position) {
      throw new NotFoundException('Position not found');
    }

    if (!position.active) {
      return position;
    }

    const endDate = new Date();
    position.active = false;
    position.endDate = endDate;

    return position.save();
  }

  async listPositions(): Promise<PositionDocument[]> {
    return this.positionModel
      .find()
      .populate('departmentId')
      .exec();
  }

  async getPositionById(id: string): Promise<PositionDocument> {
    const position = await this.positionModel
      .findById(id)
      .populate('departmentId')
      .exec();
    if (!position) {
      throw new NotFoundException('Position not found');
    }
    return position;
  }

  // Job Requisitions

  private async ensureActivePosition(
    positionId: string,
  ): Promise<PositionDocument> {
    const objectId = new Types.ObjectId(positionId);
    const position = await this.positionModel
      .findOne({ _id: objectId, active: true })
      .exec();
    if (!position) {
      throw new BadRequestException(
        'Position must exist and be active',
      );
    }
    return position;
  }

  async createJobRequisition(
    dto: CreateJobRequisitionDto,
  ): Promise<JobRequisitionDocument> {
    const departmentObjectId = await this.ensureActiveDepartment(
      dto.departmentId,
    );
    const position = await this.ensureActivePosition(dto.positionId);

    // Compare ObjectIds properly
    const positionDeptId = position.departmentId as Types.ObjectId;
    if (!positionDeptId.equals(departmentObjectId)) {
      throw new BadRequestException(
        'Position must belong to the specified department',
      );
    }

    if (dto.openings <= 0) {
      throw new BadRequestException(
        'Openings must be a positive number',
      );
    }

    const jobReq = new this.jobReqModel({
      jobTitle: dto.jobTitle,
      departmentId: departmentObjectId,
      positionId: new Types.ObjectId(position.id),
      location: dto.location,
      openings: dto.openings,
      qualifications: dto.qualifications ?? [],
      skills: dto.skills ?? [],
      status: dto.status ?? 'open',
    });

    return jobReq.save();
  }

  async updateJobRequisition(
    id: string,
    dto: UpdateJobRequisitionDto,
  ): Promise<JobRequisitionDocument> {
    const jobReq = await this.jobReqModel.findById(id).exec();
    if (!jobReq) {
      throw new NotFoundException('Job requisition not found');
    }

    if (dto.departmentId) {
      const deptId = await this.ensureActiveDepartment(dto.departmentId);
      jobReq.departmentId = deptId;
    }

    if (dto.positionId) {
      const position = await this.ensureActivePosition(dto.positionId);
      jobReq.positionId = new Types.ObjectId(position.id);

      if (dto.departmentId) {
        const deptId = jobReq.departmentId as Types.ObjectId;
        const positionDeptId = position.departmentId as Types.ObjectId;
        if (!positionDeptId.equals(deptId)) {
          throw new BadRequestException(
            'Position must belong to the specified department',
          );
        }
      }
    }

    if (dto.jobTitle !== undefined) jobReq.jobTitle = dto.jobTitle;
    if (dto.location !== undefined) jobReq.location = dto.location;
    if (dto.openings !== undefined) {
      if (dto.openings <= 0) {
        throw new BadRequestException(
          'Openings must be a positive number',
        );
      }
      jobReq.openings = dto.openings;
    }
    if (dto.qualifications !== undefined)
      jobReq.qualifications = dto.qualifications;
    if (dto.skills !== undefined) jobReq.skills = dto.skills;
    if (dto.status !== undefined) jobReq.status = dto.status;

    return jobReq.save();
  }

  async closeJobRequisition(id: string): Promise<JobRequisitionDocument> {
    const jobReq = await this.jobReqModel.findById(id).exec();
    if (!jobReq) {
      throw new NotFoundException('Job requisition not found');
    }

    jobReq.status = 'closed';
    return jobReq.save();
  }

  async listJobRequisitions(): Promise<JobRequisitionDocument[]> {
    return this.jobReqModel
      .find()
      .populate('departmentId')
      .populate('positionId')
      .exec();
  }

  async getJobRequisitionById(id: string): Promise<JobRequisitionDocument> {
    const jobReq = await this.jobReqModel
      .findById(id)
      .populate('departmentId')
      .populate('positionId')
      .exec();
    if (!jobReq) {
      throw new NotFoundException('Job requisition not found');
    }
    return jobReq;
  }

  /**
   * Get the employee currently holding a specific position
   * Used by Leaves module to find manager
   */
  async getEmployeeHoldingPosition(positionId: string): Promise<string | null> {
    const assignment = await this.positionAssignmentModel.findOne({
      positionId: new Types.ObjectId(positionId),
      endDate: null, // Active assignment
    }).sort({ startDate: -1 }).exec();

    return assignment ? assignment.employeeProfileId.toString() : null;
  }

  /**
   * Get direct reports for a manager (employeeId)
   * REQ-020: Used for routing requests to Line Manager
   */
  async getDirectReports(managerId: string): Promise<string[]> {
      // 1. Find Manager's Active Position
      const managerAssignment = await this.positionAssignmentModel.findOne({
          employeeProfileId: new Types.ObjectId(managerId),
          endDate: null
      }).exec();

      if (!managerAssignment) return []; // Manager has no active position

      const managerPositionId = managerAssignment.positionId;

      // 2. Find Positions that report to this Position which are ACTIVE
      // We need to query PositionModel
      const reportingPositions = await this.positionModel.find({
          reportingLine: managerPositionId,
          active: true
      }).select('_id').exec();

      if (reportingPositions.length === 0) return [];

      const positionIds = reportingPositions.map(p => p._id);

      // 3. Find Employees assigned to those positions (Active)
      const reportAssignments = await this.positionAssignmentModel.find({
          positionId: { $in: positionIds },
          endDate: null
      }).select('employeeProfileId').exec();

      return reportAssignments.map(a => a.employeeProfileId.toString());
  }
}