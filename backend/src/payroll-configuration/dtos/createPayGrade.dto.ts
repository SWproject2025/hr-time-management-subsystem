
 	
//Pay grades(Position ,Gross Salary= base Pay+ allowances) configuration : (Create , Edit ,View)  status :draft

import { IsArray, IsMongoId, IsNotEmpty, IsNumber, IsOptional, IsString, Min } from "class-validator";
import { ObjectId } from "mongoose";


export class CreatePayGradeDto {


    @IsString()
    @IsNotEmpty()
    grade: string;

    @IsNumber()
    @Min(6000)
    baseSalary: number;

    //gross salary = base pay + allowances, Auto calculatedd
    // @IsNumber()
    // @Min(6000)
    // grossSalary: number;

    //status draft default

    @IsArray()
    @IsMongoId({ each: true })
    allowance: ObjectId[];

    @IsOptional()
    @IsNotEmpty()
    @IsString()
    createdBy?: string;


}