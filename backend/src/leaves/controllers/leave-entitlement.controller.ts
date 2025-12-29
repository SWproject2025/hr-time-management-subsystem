import {
  Controller,
  Get,
  Post,
  Put,
  Delete,
  Body,
  Param,
  Query,
  UseGuards,
  HttpCode,
  HttpStatus,
} from '@nestjs/common';
import { JwtAuthGuard } from '../../auth/jwt-auth.guard';
import { RolesGuard } from '../../Common/Gaurds/roles.gaurd';
import { Roles } from '../../Common/Decorators/roles.decorator';
import { SystemRole } from '../../employee-profile/enums/employee-profile.enums';
import { LeaveEntitlementService } from '../services/leave-entitlement.service';

@Controller('leaves/admin/entitlements')
@UseGuards(JwtAuthGuard, RolesGuard)
export class LeaveEntitlementController {
  constructor(
    private readonly entitlementService: LeaveEntitlementService,
  ) {}

  /**
   * Get all entitlements with filters
   * REQ-007: View entitlements
   */
  @Get()
  @Roles(SystemRole.HR_ADMIN, SystemRole.HR_MANAGER, SystemRole.SYSTEM_ADMIN)
  async getAllEntitlements(
    @Query('employeeId') employeeId?: string,
    @Query('leaveTypeId') leaveTypeId?: string,
    @Query('page') page?: string,
    @Query('limit') limit?: string,
  ) {
    return this.entitlementService.getAllEntitlements({
      employeeId,
      leaveTypeId,
      page: page ? parseInt(page, 10) : 1,
      limit: limit ? parseInt(limit, 10) : 50,
    });
  }

  /**
   * Get entitlements for specific employee
   * REQ-007: View employee entitlements
   */
  @Get('employee/:employeeId')
  @Roles(SystemRole.HR_ADMIN, SystemRole.HR_MANAGER, SystemRole.SYSTEM_ADMIN)
  async getEmployeeEntitlements(@Param('employeeId') employeeId: string) {
    return this.entitlementService.getEmployeeEntitlements(employeeId);
  }

  /**
   * Create personalized entitlement
   * REQ-007: Create custom entitlement
   * BR 7: Assign vacation package
   */
  @Post()
  @Roles(SystemRole.HR_ADMIN, SystemRole.HR_MANAGER)
  @HttpCode(HttpStatus.CREATED)
  async createEntitlement(
    @Body('employeeId') employeeId: string,
    @Body('leaveTypeId') leaveTypeId: string,
    @Body('yearlyEntitlement') yearlyEntitlement: number,
    @Body('carryForward') carryForward?: number,
  ) {
    return this.entitlementService.createEntitlement({
      employeeId,
      leaveTypeId,
      yearlyEntitlement,
      carryForward,
    });
  }

  /**
   * Update entitlement
   * REQ-007: Update entitlement
   */
  @Put(':id')
  @Roles(SystemRole.HR_ADMIN, SystemRole.HR_MANAGER)
  async updateEntitlement(
    @Param('id') id: string,
    @Body('yearlyEntitlement') yearlyEntitlement?: number,
    @Body('carryForward') carryForward?: number,
  ) {
    return this.entitlementService.updateEntitlement(id, {
      yearlyEntitlement,
      carryForward,
    });
  }

  /**
   * Delete entitlement
   * REQ-007: Delete entitlement
   */
  @Delete(':id')
  @Roles(SystemRole.HR_ADMIN, SystemRole.HR_MANAGER)
  async deleteEntitlement(@Param('id') id: string) {
    return this.entitlementService.deleteEntitlement(id);
  }

  /**
   * Initialize entitlements for new employee
   * REQ-007: Auto-assign entitlements
   */
  @Post('initialize')
  @Roles(SystemRole.HR_ADMIN, SystemRole.HR_MANAGER)
  @HttpCode(HttpStatus.CREATED)
  async initializeEmployeeEntitlements(
    @Body('employeeId') employeeId: string,
    @Body('employmentType') employmentType: string,
    @Body('tenure') tenure?: number,
  ) {
    const entitlements = await this.entitlementService.initializeEmployeeEntitlements(
      employeeId,
      employmentType,
      tenure,
    );
    return {
      message: 'Entitlements initialized successfully',
      count: entitlements.length,
      entitlements,
    };
  }

  /**
   * Bulk update entitlements
   * REQ-007: Bulk entitlement update
   */
  @Post('bulk-update')
  @Roles(SystemRole.HR_ADMIN, SystemRole.HR_MANAGER)
  async bulkUpdateEntitlements(
    @Body('updates')
    updates: Array<{
      employeeId: string;
      leaveTypeId: string;
      yearlyEntitlement: number;
    }>,
  ) {
    const results = await this.entitlementService.bulkUpdateEntitlements(updates);
    const successCount = results.filter(r => r.success).length;
    
    return {
      message: `Bulk update completed: ${successCount}/${results.length} successful`,
      results,
    };
  }
}
