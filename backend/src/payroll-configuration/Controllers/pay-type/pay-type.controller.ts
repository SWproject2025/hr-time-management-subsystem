import { Controller , Post , Patch, Get, Param, Body, UseGuards, Req } from '@nestjs/common';
import { PayrollConfigurationService } from '../../payroll-configuration.service';
import { Roles } from '../../../Common/Decorators/roles.decorator';
import { RolesGuard } from '../../../Common/Gaurds/roles.gaurd';
import { SystemRole } from '../../../employee-profile/enums/employee-profile.enums';
import { CreatePayTypeDto } from '../../dtos/createPayType.dto';
import { UpdatePayTypeDto } from '../../dtos/updatePayType.dto';
@Controller('pay-type')
@UseGuards(RolesGuard)
export class PayTypeController {
    constructor(private readonly service: PayrollConfigurationService){}

    @Post()
  @Roles(SystemRole.PAYROLL_SPECIALIST)
  create(@Body() dto: CreatePayTypeDto, @Req() req) {
    return this.service.createPayType(dto, req.user._id);
  }

  @Patch(':id')
  @Roles(SystemRole.PAYROLL_SPECIALIST)
  update(@Param('id') id: string, @Body() dto: UpdatePayTypeDto, @Req() req) {
    return this.service.updatePayType(id, dto, req.user._id);
  }

  @Get()
  @Roles(SystemRole.PAYROLL_SPECIALIST, SystemRole.PAYROLL_MANAGER)
  getAll() {
    return this.service.findAllPayTypes();
  }

  @Get(':id')
  @Roles(SystemRole.PAYROLL_SPECIALIST, SystemRole.PAYROLL_MANAGER)
  getOne(@Param('id') id: string) {
    return this.service.findOnePayType(id);
  }

}
