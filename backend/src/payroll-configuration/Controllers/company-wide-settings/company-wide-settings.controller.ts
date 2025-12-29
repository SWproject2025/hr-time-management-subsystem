import { Controller , Post , Patch, Get, Param, Body, UseGuards, Req } from '@nestjs/common';
import { PayrollConfigurationService } from '../../payroll-configuration.service';
import { Roles } from '../../../Common/Decorators/roles.decorator';
import { RolesGuard } from '../../../Common/Gaurds/roles.gaurd';
import { SystemRole } from '../../../employee-profile/enums/employee-profile.enums';
import { CreateCompanyWideSettingDto } from '../../dtos/createCompanyWideSetting.dto';
import { UpdateCompanyWideSettingDto } from '../../dtos/updateCompanyWideSetting.dto';
@Controller('company-wide-settings')
@UseGuards(RolesGuard)
export class CompanyWideSettingsController {
    constructor(private service: PayrollConfigurationService) {}

    @Patch(':id')
  @Roles(SystemRole.SYSTEM_ADMIN)
  update(@Param('id') id: string, @Body() updateCompanyWideSettingDto: UpdateCompanyWideSettingDto) {
    return this.service.updateCompanyWideSeting(id, updateCompanyWideSettingDto);
  }


  @Get()
  @Roles(
    SystemRole.SYSTEM_ADMIN,
  )
  get() {
    return this.service.findAllCompanyWideSettings();
  }

  @Get(':id')
  @Roles(
    SystemRole.SYSTEM_ADMIN,
  )
  getOne(@Param('id') id: string) {
    return this.service.findOneCompanyWideSetting(id);
  }

  @Post()
  @Roles(
    SystemRole.SYSTEM_ADMIN,
  )
  create(@Body() createCompanyWideSettingDto: CreateCompanyWideSettingDto, @Param('id') id: string) {
    return this.service.createCompanyWideSeting(createCompanyWideSettingDto, id);
  }

}
