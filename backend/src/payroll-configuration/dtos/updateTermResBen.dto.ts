import { PartialType } from "@nestjs/mapped-types";
import { CreateTermResBenDto } from "./createTermResBen.dto";
export class UpdateTermResBenDto extends PartialType(CreateTermResBenDto) {}