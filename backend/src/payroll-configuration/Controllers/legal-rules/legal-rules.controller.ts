import { Controller , Post , Patch, Get, Param, Body, UseGuards, Req, Delete } from '@nestjs/common';
import { PayrollConfigurationService } from '../../payroll-configuration.service';
import { Roles } from '../../../Common/Decorators/roles.decorator';
import { RolesGuard } from '../../../Common/Gaurds/roles.gaurd';
import { SystemRole } from '../../../employee-profile/enums/employee-profile.enums';
import { updateLegalDto } from '../../dtos/updateLegal.dto';
import { createLegalDto } from '../../dtos/createLegal.dto';
import { CreateTaxRuleDto } from '../../dtos/createTaxRules.dto';
import { UpdateTaxRuleDto } from '../../dtos/updateTaxRules.dto';

@Controller('legal-rules')
@UseGuards(RolesGuard)
export class LegalRulesController {
    constructor(private readonly service: PayrollConfigurationService) {}

    @Roles(SystemRole.LEGAL_POLICY_ADMIN)
  update(@Param('id') id: string, @Body() dto: updateLegalDto, @Req() req) {
    return this.service.updateLegalRule(id, dto, req.user._id);
  }

  @Get()
  @Roles(SystemRole.LEGAL_POLICY_ADMIN)
  getAll() {
    return this.service.findAllLegalRules();
  }

  @Get(':id')
  @Roles(SystemRole.LEGAL_POLICY_ADMIN)
  getOne(@Param('id') id: string) {
    return this.service.findOneLegalRule(id);
  }



  @Post()
  @Roles(SystemRole.LEGAL_POLICY_ADMIN)
  create(@Body() dto: createLegalDto, @Req() req) {
    return this.service.createLegalRule(dto, req.user._id);
  }

  @Delete(':id')
  @Roles(SystemRole.LEGAL_POLICY_ADMIN)
  delete(@Param('id') id: string) {
    return this.service.deleteLegalRule(id);
  }

  //tax rules
  @Post()
  @Roles(SystemRole.LEGAL_POLICY_ADMIN)
  createTaxRule(@Body() dto: CreateTaxRuleDto, @Req() req) {
      return this.service.createTaxRules(dto, req.user._id);
  }

  @Patch(':id')
  @Roles(SystemRole.LEGAL_POLICY_ADMIN)
  updateTaxRule(@Param('id') id: string, @Body() dto: UpdateTaxRuleDto, @Req() req) {
      return this.service.updateTaxRule(id, dto, req.user._id);
  }

  @Delete(':id')
  @Roles(SystemRole.LEGAL_POLICY_ADMIN)
  deleteTaxRule(@Param('id') id: string) {
      return this.service.deleteTaxRule(id);
  }
  

}

    


