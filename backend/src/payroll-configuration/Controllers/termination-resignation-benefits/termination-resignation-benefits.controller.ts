import { Controller , Post , Patch, Get, Param, Body, UseGuards, Req } from '@nestjs/common';
import { PayrollConfigurationService } from '../../payroll-configuration.service';
import { Roles } from '../../../Common/Decorators/roles.decorator';
import { RolesGuard } from '../../../Common/Gaurds/roles.gaurd';
import { SystemRole } from '../../../employee-profile/enums/employee-profile.enums';
import { CreateTermResBenDto } from '../../dtos/createTermResBen.dto';
import { UpdateTermResBenDto } from '../../dtos/updateTermResBen.dto';

@Controller('termination-resignation-benefits')
@UseGuards(RolesGuard) 
export class TerminationResignationBenefitsController {
    constructor(private readonly service: PayrollConfigurationService) {}

    @Post()
  @Roles(SystemRole.PAYROLL_SPECIALIST)
  create(@Body() dto: CreateTermResBenDto, @Req() req) {
    return this.service.createTerminationAndResignationBenefits(dto, req.user._id);
  }

  @Patch(':id')
  @Roles(SystemRole.PAYROLL_SPECIALIST)
  update(
    @Param('id') id: string,
    @Body() dto: UpdateTermResBenDto,
    @Req() req,
  ) {
    return this.service.updateTerminationAndResignationBenefits(
      id,
      dto,
      req.user._id,
    );
  }

  @Get()
  @Roles(SystemRole.PAYROLL_SPECIALIST, SystemRole.PAYROLL_MANAGER)
  getAll() {
    return this.service.findAllTerminationAndResignationBenefits();
  }

  @Get(':id')
  @Roles(SystemRole.PAYROLL_SPECIALIST, SystemRole.PAYROLL_MANAGER)
  getOne(@Param('id') id: string) {
    return this.service.findOneTerminationAndResignationBenefit(id);
  }
}
