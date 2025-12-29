import { IsString, IsOptional } from 'class-validator';

export class ApproveDisputeDto {
  @IsOptional()
  @IsString()
  comment?: string; // Resolution comment when approving the dispute
}

