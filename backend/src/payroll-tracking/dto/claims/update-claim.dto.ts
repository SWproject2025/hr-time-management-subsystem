import { IsString, IsOptional, IsNumber, Min } from 'class-validator';
import { Type } from 'class-transformer';

export class UpdateClaimDto {
  @IsOptional()
  @IsString()
  description?: string; // Updated description of the claim

  @IsOptional()
  @IsString()
  claimType?: string; // Updated claim type

  @IsOptional()
  @Type(() => Number)
  @IsNumber({}, { message: 'Amount must be a valid number' })
  @Min(0, { message: 'Amount must be greater than or equal to 0' })
  amount?: number; // Updated claimed amount
}

