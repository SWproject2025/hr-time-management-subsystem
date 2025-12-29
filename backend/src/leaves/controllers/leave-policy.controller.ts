import {
  Controller,
  Get,
  Post,
  Put,
  Delete,
  Body,
  Param,
  UseGuards,
  HttpCode,
  HttpStatus,
} from '@nestjs/common';
import { JwtAuthGuard } from '../../auth/jwt-auth.guard';
import { RolesGuard } from '../../Common/Gaurds/roles.gaurd';
import { Roles } from '../../Common/Decorators/roles.decorator';
import { SystemRole } from '../../employee-profile/enums/employee-profile.enums';
import { LeavePolicyService } from '../services/leave-policy.service';

@Controller('leaves/admin')
@UseGuards(JwtAuthGuard, RolesGuard)
export class LeavePolicyController {
  constructor(private readonly policyService: LeavePolicyService) {}

  // ==================== LEAVE CATEGORIES ====================

  /**
   * Get all leave categories
   * REQ-006: View leave categories
   */
  @Get('categories')
  @Roles(SystemRole.HR_ADMIN, SystemRole.HR_MANAGER, SystemRole.SYSTEM_ADMIN)
  async getAllCategories() {
    return this.policyService.getAllCategories();
  }

  /**
   * Create leave category
   * REQ-006: Create leave category
   */
  @Post('categories')
  @Roles(SystemRole.HR_ADMIN, SystemRole.HR_MANAGER)
  @HttpCode(HttpStatus.CREATED)
  async createCategory(
    @Body('code') code: string,
    @Body('name') name: string,
    @Body('description') description?: string,
  ) {
    return this.policyService.createCategory({ code, name, description });
  }

  /**
   * Update leave category
   * REQ-006: Update leave category
   */
  @Put('categories/:id')
  @Roles(SystemRole.HR_ADMIN, SystemRole.HR_MANAGER)
  async updateCategory(
    @Param('id') id: string,
    @Body('code') code?: string,
    @Body('name') name?: string,
    @Body('description') description?: string,
  ) {
    return this.policyService.updateCategory(id, { code, name, description });
  }

  /**
   * Delete leave category
   * REQ-006: Delete leave category
   */
  @Delete('categories/:id')
  @Roles(SystemRole.HR_ADMIN, SystemRole.HR_MANAGER)
  async deleteCategory(@Param('id') id: string) {
    return this.policyService.deleteCategory(id);
  }

  // ==================== LEAVE POLICIES ====================

  /**
   * Get all leave policies
   * REQ-007: View leave policies
   */
  @Get('policies')
  @Roles(SystemRole.HR_ADMIN, SystemRole.HR_MANAGER, SystemRole.SYSTEM_ADMIN)
  async getAllPolicies() {
    return this.policyService.getAllPolicies();
  }

  /**
   * Get policy by leave type
   * REQ-007: View specific policy
   */
  @Get('policies/leave-type/:leaveTypeId')
  @Roles(SystemRole.HR_ADMIN, SystemRole.HR_MANAGER, SystemRole.SYSTEM_ADMIN)
  async getPolicyByLeaveType(@Param('leaveTypeId') leaveTypeId: string) {
    return this.policyService.getPolicyByLeaveType(leaveTypeId);
  }

  /**
   * Update leave policy
   * REQ-007: Update policy configuration
   */
  @Put('policies/:id')
  @Roles(SystemRole.HR_ADMIN, SystemRole.HR_MANAGER)
  async updatePolicy(
    @Param('id') id: string,
    @Body() updateData: any,
  ) {
    return this.policyService.updatePolicy(id, updateData);
  }

  // ==================== BLOCK PERIODS ====================

  /**
   * Get all block periods
   * REQ-010, BR 55: View block periods
   */
  @Get('block-periods')
  @Roles(SystemRole.HR_ADMIN, SystemRole.HR_MANAGER, SystemRole.SYSTEM_ADMIN)
  async getAllBlockPeriods() {
    return this.policyService.getAllBlockPeriods();
  }

  /**
   * Create block period
   * REQ-010, BR 55: Create block period
   */
  @Post('block-periods')
  @Roles(SystemRole.HR_ADMIN, SystemRole.HR_MANAGER)
  @HttpCode(HttpStatus.CREATED)
  async createBlockPeriod(
    @Body('name') name: string,
    @Body('startDate') startDate: string,
    @Body('endDate') endDate: string,
    @Body('reason') reason: string,
    @Body('exemptLeaveTypes') exemptLeaveTypes?: string[],
  ) {
    return this.policyService.createBlockPeriod({
      name,
      startDate: new Date(startDate),
      endDate: new Date(endDate),
      reason,
      exemptLeaveTypes,
    });
  }

  /**
   * Update block period
   * REQ-010: Update block period
   */
  @Put('block-periods/:id')
  @Roles(SystemRole.HR_ADMIN, SystemRole.HR_MANAGER)
  async updateBlockPeriod(
    @Param('id') id: string,
    @Body() updateData: any,
  ) {
    return this.policyService.updateBlockPeriod(id, updateData);
  }

  /**
   * Delete block period
   * REQ-010: Delete block period
   */
  @Delete('block-periods/:id')
  @Roles(SystemRole.HR_ADMIN, SystemRole.HR_MANAGER)
  async deleteBlockPeriod(@Param('id') id: string) {
    return this.policyService.deleteBlockPeriod(id);
  }

  // ==================== CALENDAR MANAGEMENT ====================

  /**
   * Get calendar for a year
   * REQ-010: View calendar
   */
  @Get('calendar/:year')
  @Roles(SystemRole.HR_ADMIN, SystemRole.HR_MANAGER, SystemRole.SYSTEM_ADMIN)
  async getCalendar(@Param('year') year: string) {
    return this.policyService.getCalendar(parseInt(year, 10));
  }

  /**
   * Create or update calendar
   * REQ-010: Configure calendar
   */
  @Post('calendar')
  @Roles(SystemRole.HR_ADMIN, SystemRole.HR_MANAGER)
  @HttpCode(HttpStatus.CREATED)
  async upsertCalendar(
    @Body('year') year: number,
    @Body('holidays') holidays?: Array<{ date: string; name: string; description?: string }>,
  ) {
    return this.policyService.upsertCalendar({
      year,
      holidays: holidays?.map(h => ({ ...h, date: new Date(h.date) })),
    });
  }

  /**
   * Add holidays to calendar (bulk upload)
   * REQ-010: Bulk upload holidays
   */
  @Post('calendar/:year/holidays')
  @Roles(SystemRole.HR_ADMIN, SystemRole.HR_MANAGER)
  async addHolidays(
    @Param('year') year: string,
    @Body('holidays') holidays: Array<{ date: string; name: string; description?: string }>,
  ) {
    return this.policyService.addHolidays(
      parseInt(year, 10),
      holidays.map(h => ({ ...h, date: new Date(h.date) })),
    );
  }

  /**
   * Remove holiday from calendar
   * REQ-010: Delete holiday
   */
  @Delete('calendar/:year/holidays')
  @Roles(SystemRole.HR_ADMIN, SystemRole.HR_MANAGER)
  async removeHoliday(
    @Param('year') year: string,
    @Body('date') date: string,
  ) {
    return this.policyService.removeHoliday(parseInt(year, 10), new Date(date));
  }
}
