import {
  IsArray,
  IsIn,
  IsInt,
  IsMongoId,
  IsOptional,
  IsString,
  Min,
  MinLength,
} from 'class-validator';

export class CreateJobRequisitionDto {
  @IsString()
  @MinLength(1)
  jobTitle: string;

  @IsMongoId()
  departmentId: string;

  @IsMongoId()
  positionId: string;

  @IsOptional()
  @IsString()
  location?: string;

  @IsInt()
  @Min(1)
  openings: number;

  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  qualifications?: string[];

  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  skills?: string[];

  @IsOptional()
  @IsIn(['open', 'closed'])
  status?: 'open' | 'closed';
}


