import { IsNotEmpty, IsString, IsOptional } from 'class-validator';

export class CreateNotificationLogDto {
  @IsNotEmpty()
  @IsString()
  to: string;

  @IsNotEmpty()
  @IsString()
  type: string;

  @IsOptional()
  @IsString()
  message?: string;
}

