import { PartialType } from "@nestjs/mapped-types";
import { CreateAllowanceDto } from "./createAllowance.dto";

export class UpdateAllowanceDto extends PartialType(CreateAllowanceDto) {}