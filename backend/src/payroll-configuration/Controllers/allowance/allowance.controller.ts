import { Controller , Post , Patch, Get, Param, Body, UseGuards, Req } from '@nestjs/common';
import { PayrollConfigurationService } from '../../payroll-configuration.service';
import { Roles } from '../../../Common/Decorators/roles.decorator';
import { RolesGuard } from '../../../Common/Gaurds/roles.gaurd';
import { SystemRole } from '../../../employee-profile/enums/employee-profile.enums';
import { CreateAllowanceDto } from '../../dtos/createAllowance.dto';
import { UpdateAllowanceDto } from '../../dtos/updateAllowance.dto';

@Controller('allowance')
@UseGuards(RolesGuard)
export class AllowanceController {
    constructor(private readonly payrollConfigurationService: PayrollConfigurationService){};

    @Post()
  @Roles(SystemRole.PAYROLL_SPECIALIST)
  create(@Body() dto: CreateAllowanceDto, @Req() req) {
    return this.payrollConfigurationService.createAllowance(dto, req.user._id);
  }

  @Patch(':id')
  @Roles(SystemRole.PAYROLL_SPECIALIST)
  update(
    @Param('id') id: string,
    @Body() dto: UpdateAllowanceDto,
    @Req() req,
  ) {
    return this.payrollConfigurationService.updateAllowance(dto, req.user._id, id);
  }

  @Get()
  @Roles(SystemRole.PAYROLL_SPECIALIST, SystemRole.PAYROLL_MANAGER)
  findAll() {
    return this.payrollConfigurationService.findAllAllowances();
  }

  @Get(':id')
  @Roles(SystemRole.PAYROLL_SPECIALIST, SystemRole.PAYROLL_MANAGER)
  findOne(@Param('id') id: string) {
    return this.payrollConfigurationService.findOneAllowance(id);
  }
}
