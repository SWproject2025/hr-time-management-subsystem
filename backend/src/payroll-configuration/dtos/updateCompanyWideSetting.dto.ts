import { PartialType } from "@nestjs/mapped-types";
import { CreateCompanyWideSettingDto } from "./createCompanyWideSetting.dto";

export class UpdateCompanyWideSettingDto extends PartialType(CreateCompanyWideSettingDto) {}