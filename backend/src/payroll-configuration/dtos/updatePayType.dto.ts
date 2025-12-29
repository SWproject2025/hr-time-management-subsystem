
import { PartialType } from "@nestjs/mapped-types";
import { CreatePayTypeDto } from "./createPayType.dto";

export class UpdatePayTypeDto extends PartialType( CreatePayTypeDto ) {}