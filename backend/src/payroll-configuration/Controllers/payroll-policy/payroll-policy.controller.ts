import { Controller , Post , Patch, Get, Param, Body, UseGuards, Req, Delete } from '@nestjs/common';
import { PayrollConfigurationService } from '../../payroll-configuration.service';
import { Roles } from '../../../Common/Decorators/roles.decorator';
import { RolesGuard } from '../../../Common/Gaurds/roles.gaurd';
import { SystemRole } from '../../../employee-profile/enums/employee-profile.enums';
import { CreatePayrollPolicyDto } from '../../dtos/createPayrollPolicy.dto';
import { UpdatePayrollPolicyDto } from '../../dtos/updatePayrollPolicy.dto';




@Controller('payroll-policy')
@UseGuards(RolesGuard)
export class PayrollPolicyController {

    constructor(private payrollConfigurationService: PayrollConfigurationService){}

    //create draft policy
    @Post()
    @Roles(SystemRole.PAYROLL_SPECIALIST)
    createPolicy(@Body() dto: CreatePayrollPolicyDto, @Req() req) {
    return this.payrollConfigurationService.createPayrollPolicy(dto, req.user._id);
  }

  //update draft policy
  @Patch(':id')
  @Roles(SystemRole.PAYROLL_SPECIALIST)
  updatePolicy(
    @Param('id') id: string,
    @Body() dto: UpdatePayrollPolicyDto,
    @Req() req,
  ) {
    return this.payrollConfigurationService.updatePayrollPolicy(dto, id, req.user._id);
  }

  //Get all
  @Get()
  @Roles(SystemRole.PAYROLL_SPECIALIST, SystemRole.PAYROLL_MANAGER)
  getAll() {
    return this.payrollConfigurationService.getAllPayrollPolicies();
  }

  //Get onne
  @Get(':id')
  @Roles(SystemRole.PAYROLL_SPECIALIST, SystemRole.PAYROLL_MANAGER)
  getOne(@Param('id') id: string) {
    return this.payrollConfigurationService.getOnePayrollPolicy(id);
  }

  @Patch(':id/approve')
  @Roles(SystemRole.PAYROLL_MANAGER)
  approvePolicy(@Param('id') policyId: string, @Req() req) {
    return this.payrollConfigurationService.approvePolicy(policyId, req.user);
  }

  @Patch(':id/reject')
  @Roles(SystemRole.PAYROLL_MANAGER)
  rejectPolicy(@Param('id') policyId: string, @Req() req) {
    return this.payrollConfigurationService.rejectPolicy(policyId, req.user);
  }

  @Post(':id/publish')
  @Roles(SystemRole.PAYROLL_SPECIALIST)
  submitPolicy(@Param('id') policyId: string, @Req() req) {
    return this.payrollConfigurationService.submaitForApproval(policyId, req.user);
  }

  @Delete(':id')
  @Roles(SystemRole.PAYROLL_MANAGER)
  delete(@Param('id') id: string) {
    return this.payrollConfigurationService.deletePolicy(id);
  }


}
