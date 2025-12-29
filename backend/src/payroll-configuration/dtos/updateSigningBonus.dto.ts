
import { PartialType } from "@nestjs/mapped-types";
import { CreateSigningBonusDto } from "./createSigningBonus.dto";

export class UpdateSigningBonusDto extends PartialType( CreateSigningBonusDto ) {}