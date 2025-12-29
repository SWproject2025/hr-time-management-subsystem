import { Controller , Post , Patch, Get, Param, Body, UseGuards, Req } from '@nestjs/common';
import { PayrollConfigurationService } from '../../payroll-configuration.service';
import { Roles } from '../../../Common/Decorators/roles.decorator';
import { RolesGuard } from '../../../Common/Gaurds/roles.gaurd';
import { SystemRole } from '../../../employee-profile/enums/employee-profile.enums';
import { CreateSigningBonusDto } from '../../dtos/createSigningBonus.dto';
import { UpdateSigningBonusDto } from '../../dtos/updateSigningBonus.dto';

@Controller('signing-bonus')
@UseGuards(RolesGuard)
export class SigningBonusController {

    constructor(private service: PayrollConfigurationService) {}

    @Post()
  @Roles(SystemRole.PAYROLL_SPECIALIST)
  create(@Body() dto: CreateSigningBonusDto, @Req() req) {
    return this.service.createSigningBonus(dto, req.user._id);
  }

  @Patch(':id')
  @Roles(SystemRole.PAYROLL_SPECIALIST)
  update(
    @Param('id') id: string,
    @Body() dto: UpdateSigningBonusDto,
    @Req() req,
  ) {
    return this.service.updateSigningBonus(id, dto, req.user._id);
  }

  @Get()
  @Roles(SystemRole.PAYROLL_SPECIALIST, SystemRole.PAYROLL_MANAGER)
  getAll() {
    return this.service.findAllSigningBonuses();
  }

  @Get(':id')
  @Roles(SystemRole.PAYROLL_SPECIALIST, SystemRole.PAYROLL_MANAGER)
  getOne(@Param('id') id: string) {
    return this.service.findOneSigningBonus(id);
  }


}
