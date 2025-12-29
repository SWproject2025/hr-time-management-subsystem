import { IsString, IsNotEmpty, IsNumber, Min } from 'class-validator';
import { Type } from 'class-transformer';

export class CreateClaimDto {
  @IsString()
  @IsNotEmpty({ message: 'Description is required' })
  description: string; // Description of the expense claim

  @IsString()
  @IsNotEmpty({ message: 'Claim type is required' })
  claimType: string; // Type of claim (e.g., medical, travel, etc.)

  @Type(() => Number)
  @IsNumber({}, { message: 'Amount must be a valid number' })
  @Min(0, { message: 'Amount must be greater than or equal to 0' })
  @IsNotEmpty({ message: 'Amount is required' })
  amount: number; // Claimed amount
}

