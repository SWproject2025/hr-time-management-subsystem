import { IsNumber, Min } from 'class-validator';

export class EditBenefitDto {
  @IsNumber()
  @Min(0)
  givenAmount: number;
}