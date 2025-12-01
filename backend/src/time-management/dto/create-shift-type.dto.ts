import { IsNotEmpty, IsString, IsOptional, IsBoolean } from 'class-validator';

export class CreateShiftTypeDto {
  @IsNotEmpty()
  @IsString()
  name: string;

  @IsOptional()
  @IsBoolean()
  active?: boolean;
}

