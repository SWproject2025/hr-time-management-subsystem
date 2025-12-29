import { PartialType } from "@nestjs/mapped-types";
import { CreateInsureBracketDto } from "./createInsureBracket.dto";

export class UpdateInsureBracketDto extends PartialType(CreateInsureBracketDto) {}
