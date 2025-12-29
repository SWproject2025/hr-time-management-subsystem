import { Controller , Post , Patch, Get, Param, Body, UseGuards, Req } from '@nestjs/common';
import { PayrollConfigurationService } from '../../payroll-configuration.service';
import { Roles } from '../../../Common/Decorators/roles.decorator';
import { RolesGuard } from '../../../Common/Gaurds/roles.gaurd';
import { SystemRole } from '../../../employee-profile/enums/employee-profile.enums';
import { CreatePayGradeDto } from '../../dtos/createPayGrade.dto';
import { UpdatePayGradeDto } from '../../dtos/updatePayGrade.dto';


@Controller('pay-grade')
@UseGuards(RolesGuard)
export class PayGradeController {
    constructor(private payrollConfigurationService: PayrollConfigurationService) {}

  @Post()
  @Roles(SystemRole.PAYROLL_SPECIALIST)
  create(@Body() dto: CreatePayGradeDto, @Req() req) {
    return this.payrollConfigurationService.createPayGrade(dto, req.user._id);
  }

  @Patch(':id')
  @Roles(SystemRole.PAYROLL_SPECIALIST)
  update(@Param('id') id: string, @Body() dto: UpdatePayGradeDto, @Req() req) {
    return this.payrollConfigurationService.updatePayGrade(id, dto, req.user._id);
  }

  @Get()
  @Roles(SystemRole.PAYROLL_SPECIALIST, SystemRole.PAYROLL_MANAGER)
  getAll() {
    return this.payrollConfigurationService.findAllPayGrades();
  }

  @Get(':id')
  @Roles(SystemRole.PAYROLL_SPECIALIST, SystemRole.PAYROLL_MANAGER)
  getOne(@Param('id') id: string) {
    return this.payrollConfigurationService.findOnePayGrade(id);
  }
}
