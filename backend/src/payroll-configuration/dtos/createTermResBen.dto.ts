import { IsNotEmpty, IsNumber, IsOptional, IsString, Min } from "class-validator";


export class CreateTermResBenDto {

    @IsString()
    @IsNotEmpty()
    name: string; // termination/resignation name like:  End of Service Gratuity.

    @IsNumber()
    @Min(0)
    amount: number;

    @IsOptional()
    @IsString()
    terms?: string;

    @IsOptional()
    @IsString()
    createdBy?: string;

}