import { IsBoolean, IsDateString, IsNotEmpty, IsOptional, IsString } from "class-validator";

export class createLegalDto {

    
    @IsString()
    @IsNotEmpty()
    name: string;

    @IsDateString()
    effectiveDate: Date;

    @IsString()
    @IsNotEmpty()
    description: string;

    
    @IsBoolean()
    isActive: boolean;


}