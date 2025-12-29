import { IsDateString, IsEnum, IsNotEmpty, IsNumber, IsOptional, IsString, Max, Min, MinLength, Validate, ValidateNested } from "class-validator";
import { Type } from "class-transformer";
import { Applicability, PolicyType } from "../enums/payroll-configuration-enums";

//not exported dto for internal use in CreatePayrollPolicyDto
class RuleDefinitionDto {

    @IsNumber()
    @Min(0)
    @Max(100)
    percentage: number;

    @IsNumber()
    @Min(0)
    fixedAmount: number;

    @IsNumber()
    @Min(1)
    thresholdAmount: number;


}

export class CreatePayrollPolicyDto {

    @IsString()
    @MinLength(1)
    policyName: string;

    @IsEnum(PolicyType)
    policyType: PolicyType;

    @IsString()
    @IsNotEmpty()
    description: string;

    @IsDateString()
    effectiveDate: Date;

    //nested validation for ruleDefinition
    @ValidateNested()
    @Type(() => RuleDefinitionDto)
    ruleDefinition: RuleDefinitionDto;

    @IsEnum(Applicability)
    applicability: Applicability;

    // status will be set to DRAFT by default in the schema, no need to include here

    @IsOptional()
    @IsString()
    @IsNotEmpty()
    createdBy?: string; 
}