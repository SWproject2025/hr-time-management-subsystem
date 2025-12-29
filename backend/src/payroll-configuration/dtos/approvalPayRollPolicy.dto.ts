import { ConfigStatus } from "../enums/payroll-configuration-enums";
import { IsEnum } from "class-validator";

export class ApprovalPayrollPolicyDto {

    @IsEnum(ConfigStatus)
    status: ConfigStatus; // approved/rejected/approved
}