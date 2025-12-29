import { IsNotEmpty, IsNumber, IsOptional, IsString, Min } from "class-validator";


export class CreateSigningBonusDto {

    @IsNotEmpty()
    @IsString()
    positionName: string; // only onboarding bonus based on position like:  Junior TA, Mid TA, Senior TA

    @IsNumber()
    @Min(0)
    amount: number;

    @IsOptional()
    @IsString()
    createdBy?: string;
}