import { Controller , Post , Patch, Get, Param, Body, UseGuards, Req } from '@nestjs/common';
import { PayrollConfigurationService } from '../../payroll-configuration.service';
import { Roles } from '../../../Common/Decorators/roles.decorator';
import { RolesGuard } from '../../../Common/Gaurds/roles.gaurd';
import { SystemRole } from '../../../employee-profile/enums/employee-profile.enums';
import { CreateInsureBracketDto } from '../../dtos/createInsureBracket.dto';
import { UpdateInsureBracketDto } from '../../dtos/updateInsureBracket.dto';
@Controller('insurance-bracket')
@UseGuards(RolesGuard)
export class InsuranceBracketController {
    constructor(private readonly service: PayrollConfigurationService){} //why didnt I do that earlier

    @Post()
    @Roles(SystemRole.PAYROLL_SPECIALIST)
    create(@Body() dto: CreateInsureBracketDto, @Req() req) {
    return this.service.createInsuranceBracket(dto, req.user._id);
  }

  @Patch(':id')
  @Roles(SystemRole.PAYROLL_SPECIALIST, SystemRole.HR_MANAGER)
  update(@Param('id') id: string, @Body() dto: UpdateInsureBracketDto, @Req() req) {
    return this.service.updateInsuranceBracket(id, dto, req.user._id);
  }

  @Get()
  @Roles(SystemRole.PAYROLL_SPECIALIST, SystemRole.PAYROLL_MANAGER, SystemRole.HR_MANAGER)
  getAll() {
    return this.service.findAllInsuranceBrackets();
  }

  @Get(':id')
  @Roles(SystemRole.PAYROLL_SPECIALIST, SystemRole.PAYROLL_MANAGER, SystemRole.HR_MANAGER)
  getOne(@Param('id') id: string) {
    return this.service.findOneInsuranceBracket(id);
  }

  


}

