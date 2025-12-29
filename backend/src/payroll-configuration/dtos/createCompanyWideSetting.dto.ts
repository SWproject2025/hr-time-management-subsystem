import { IsDate, IsDateString, IsNotEmpty, IsString } from "class-validator";

export class CreateCompanyWideSettingDto {

    @IsDateString()
    payDate: Date;

    @IsString()
    @IsNotEmpty()
    timeZone: string;

    @IsString()
    @IsNotEmpty()
    currency: string; //if it only allows egp, why not set it directly in the model? Possibly for future extensibility? check later.
    //for now, Egp will be inforced in the sarvice layer...likely


}