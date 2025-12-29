
import { CreatePayGradeDto } from "./createPayGrade.dto";
import { PartialType, OmitType } from "@nestjs/mapped-types";


export class UpdatePayGradeDto extends PartialType(
    OmitType(CreatePayGradeDto, ["createdBy"]) //Might leave open later
) {}




