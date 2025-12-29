import { IsOptional, IsNumber, Min, Max, ValidateNested } from "class-validator";
import { PartialType } from "@nestjs/mapped-types";
// import { Type } from "class-transformer";
import { CreatePayrollPolicyDto } from "./createPayrollPolicy.dto";

class UpdateRuleDefinitionDto {
    @IsOptional()
    @IsNumber()
        @Min(0)
        @Max(100)
        percentage?: number;

        @IsOptional()
        @IsNumber()
        @Min(0)
        fixedAmount?: number;

        @IsOptional()
        @IsNumber()
        @Min(1)
        thresholdAmount?: number;   
}

export class UpdatePayrollPolicyDto extends PartialType(CreatePayrollPolicyDto) {

}