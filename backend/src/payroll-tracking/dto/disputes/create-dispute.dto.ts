import { IsString, IsNotEmpty, IsMongoId } from 'class-validator';

export class CreateDisputeDto {
  @IsString()
  @IsNotEmpty({ message: 'Description is required' })
  description: string; // Description of the dispute

  @IsMongoId({ message: 'Valid payslip ID is required' })
  @IsNotEmpty({ message: 'Payslip ID is required' })
  payslipId: string; // Reference to the payslip being disputed
}

