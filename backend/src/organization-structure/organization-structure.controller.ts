import { Body, Controller, Get, Param, Patch, Post } from '@nestjs/common';
import { OrganizationStructureService } from './organization-structure.service';
import { CreateDepartmentDto } from './dto/create-department.dto';
import { UpdateDepartmentDto } from './dto/update-department.dto';
import { CreatePositionDto } from './dto/create-position.dto';
import { UpdatePositionDto } from './dto/update-position.dto';
import { CreateJobRequisitionDto } from './dto/create-job-requisition.dto';
import { UpdateJobRequisitionDto } from './dto/update-job-requisition.dto';

@Controller('organization-structure')
export class OrganizationStructureController {
  constructor(
    private readonly organizationStructureService: OrganizationStructureService,
  ) {}

  // Departments

  @Post('departments')
  createDepartment(@Body() dto: CreateDepartmentDto) {
    return this.organizationStructureService.createDepartment(dto);
  }

  @Get('departments')
  listDepartments() {
    return this.organizationStructureService.listDepartments();
  }

  @Get('departments/:id')
  getDepartment(@Param('id') id: string) {
    return this.organizationStructureService.getDepartmentById(id);
  }

  @Patch('departments/:id')
  updateDepartment(
    @Param('id') id: string,
    @Body() dto: UpdateDepartmentDto,
  ) {
    return this.organizationStructureService.updateDepartment(id, dto);
  }

  @Post('departments/:id/deactivate')
  deactivateDepartment(@Param('id') id: string) {
    return this.organizationStructureService.deactivateDepartment(id);
  }

  // Positions

  @Post('positions')
  createPosition(@Body() dto: CreatePositionDto) {
    return this.organizationStructureService.createPosition(dto);
  }

  @Get('positions')
  listPositions() {
    return this.organizationStructureService.listPositions();
  }

  @Get('positions/:id')
  getPosition(@Param('id') id: string) {
    return this.organizationStructureService.getPositionById(id);
  }

  @Patch('positions/:id')
  updatePosition(
    @Param('id') id: string,
    @Body() dto: UpdatePositionDto,
  ) {
    return this.organizationStructureService.updatePosition(id, dto);
  }

  @Post('positions/:id/deactivate')
  deactivatePosition(@Param('id') id: string) {
    return this.organizationStructureService.deactivatePosition(id);
  }

  // Job Requisitions

  @Post('job-requisitions')
  createJobRequisition(@Body() dto: CreateJobRequisitionDto) {
    return this.organizationStructureService.createJobRequisition(dto);
  }

  @Get('job-requisitions')
  listJobRequisitions() {
    return this.organizationStructureService.listJobRequisitions();
  }

  @Get('job-requisitions/:id')
  getJobRequisition(@Param('id') id: string) {
    return this.organizationStructureService.getJobRequisitionById(id);
  }

  @Patch('job-requisitions/:id')
  updateJobRequisition(
    @Param('id') id: string,
    @Body() dto: UpdateJobRequisitionDto,
  ) {
    return this.organizationStructureService.updateJobRequisition(id, dto);
  }

  @Post('job-requisitions/:id/close')
  closeJobRequisition(@Param('id') id: string) {
    return this.organizationStructureService.closeJobRequisition(id);
  }
}
