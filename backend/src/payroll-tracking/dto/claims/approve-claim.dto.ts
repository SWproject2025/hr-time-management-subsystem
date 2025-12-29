import { IsNumber, IsNotEmpty, Min, IsString, IsOptional } from 'class-validator';
import { Type } from 'class-transformer';

export class ApproveClaimDto {
  @Type(() => Number)
  @IsNumber({}, { message: 'Approved amount must be a valid number' })
  @Min(0, { message: 'Approved amount must be greater than or equal to 0' })
  @IsNotEmpty({ message: 'Approved amount is required' })
  approvedAmount: number; // The amount approved (may be less than claimed amount)

  @IsOptional()
  @IsString()
  comment?: string; // Resolution comment when approving the claim
}

