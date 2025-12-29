import { IsNumber, IsDateString, IsOptional, Min } from 'class-validator';

export class EditSigningBonusDto {
  @IsNumber()
  @Min(0)
  givenAmount: number;

  @IsOptional()
  @IsDateString()
  paymentDate?: Date;
}