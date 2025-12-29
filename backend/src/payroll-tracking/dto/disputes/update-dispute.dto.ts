import { IsString, IsOptional } from 'class-validator';

export class UpdateDisputeDto {
  @IsOptional()
  @IsString()
  description?: string; // Updated description of the dispute
}

