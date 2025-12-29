import { IsString, IsDateString, IsNotEmpty } from 'class-validator';

export class StartPayrollInitiationDto {
  @IsString()
  @IsNotEmpty()
  runId: string;

  @IsDateString()
  @IsNotEmpty()
  payrollPeriod: Date;

  @IsString()
  @IsNotEmpty()
  payrollSpecialistId: string;

  @IsString()
  @IsNotEmpty()
  entity: string;
}