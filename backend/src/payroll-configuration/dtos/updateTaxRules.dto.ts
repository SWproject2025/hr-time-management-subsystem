import { PartialType } from "@nestjs/mapped-types";
import { CreateTaxRuleDto } from "./createTaxRules.dto";

export class UpdateTaxRuleDto extends PartialType(CreateTaxRuleDto) {}