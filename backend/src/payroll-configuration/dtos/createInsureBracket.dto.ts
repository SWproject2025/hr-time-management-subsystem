import { IsNotEmpty, IsNumber, IsOptional, IsString, Max, Min } from "class-validator";

export class CreateInsureBracketDto {

    @IsString()
    @IsNotEmpty()
    name: string;

    @IsNumber()
    @Min(0)
    amount: number;
    
    @IsOptional()
    @IsString()
    createdBy?: string;

    @IsNumber()
    @Min(0)
    minSalary: number;

    @IsNumber()
    @Min(0)
    maxSalary: number;

    @IsNumber()
    @Min(0)
    @Max(100)
    employeeRate: number;

    @IsNumber()
    @Min(0)
    @Max(100)
    employerRate: number;

}