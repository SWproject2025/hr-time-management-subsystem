import { IsOptional, IsString, IsEmail, ValidateNested } from 'class-validator';
import { Type } from 'class-transformer';

class AddressDto {
  @IsOptional()
  @IsString()
  city?: string;

  @IsOptional()
  @IsString()
  streetAddress?: string;

  @IsOptional()
  @IsString()
  country?: string;
}

export class UpdateContactDto {
  @IsOptional()
  @IsString()
  mobilePhone?: string; // Matched to Schema 'mobilePhone'

  @IsOptional()
  @IsString()
  homePhone?: string;   // Matched to Schema 'homePhone'

  @IsOptional()
  @IsEmail()
  personalEmail?: string; // Matched to Schema 'personalEmail'

  @IsOptional()
  @ValidateNested()
  @Type(() => AddressDto) // Helper to validate the nested object
  address?: AddressDto;

  // Note: 'emergencyContact' is in your DTO but NOT in your provided UserProfileBase schema.
  // You must add it to the Schema if you want this to save.
  @IsOptional()
  @IsString()
  emergencyContact?: string; 
}