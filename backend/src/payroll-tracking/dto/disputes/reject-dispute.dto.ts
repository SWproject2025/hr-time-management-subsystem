import { IsString, IsNotEmpty } from 'class-validator';

export class RejectDisputeDto {
  @IsString()
  @IsNotEmpty({ message: 'Rejection reason is required' })
  reason: string; // Reason for rejecting the dispute
}

