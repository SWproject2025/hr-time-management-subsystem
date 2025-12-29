import { IsString, IsNotEmpty, IsNumber, Min, IsOptional } from 'class-validator';
import { Type } from 'class-transformer';

export class CreateRefundDto {
  @IsString()
  @IsNotEmpty({ message: 'Description is required' })
  description: string; // Description of the refund

  @Type(() => Number)
  @IsNumber({}, { message: 'Amount must be a valid number' })
  @Min(0, { message: 'Amount must be greater than or equal to 0' })
  @IsNotEmpty({ message: 'Amount is required' })
  amount: number; // Refund amount
}
