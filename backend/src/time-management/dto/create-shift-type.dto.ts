import { IsNotEmpty, IsString, IsOptional, IsBoolean, IsNumber, IsEnum } from 'class-validator';

export class CreateShiftTypeDto {
  @IsNotEmpty()
  @IsString()
  name: string;

  @IsOptional()
  @IsEnum(['NORMAL', 'SPLIT', 'OVERNIGHT', 'ROTATIONAL'])
  kind?: string;

  @IsOptional()
  @IsString()
  startTime?: string;

  @IsOptional()
  @IsString()
  endTime?: string;

  @IsOptional()
  @IsNumber()
  breakMinutes?: number;

  @IsOptional()
  @IsBoolean()
  active?: boolean;
}

