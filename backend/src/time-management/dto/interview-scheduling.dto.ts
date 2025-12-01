import { IsNotEmpty, IsString, IsDateString, IsArray, IsOptional, IsEnum, ValidateNested } from 'class-validator';
import { Type } from 'class-transformer';
import { InterviewMethod } from '../../recruitment/enums/interview-method.enum';

/**
 * DTO for checking panel member availability (REC-021)
 * Used to coordinate interview panels and check availability
 */
export class CheckAvailabilityDto {
  @IsNotEmpty()
  @IsArray()
  @IsString({ each: true })
  panelMemberIds: string[];

  @IsNotEmpty()
  @IsDateString()
  startDate: Date;

  @IsNotEmpty()
  @IsDateString()
  endDate: Date;

  @IsOptional()
  @IsString()
  excludeInterviewId?: string; // Exclude a specific interview when rescheduling
}

/**
 * DTO for scheduling an interview (REC-010, REC-021)
 * Supports selecting time slots, panel members, and modes
 */
export class ScheduleInterviewDto {
  @IsNotEmpty()
  @IsString()
  applicationId: string;

  @IsNotEmpty()
  @IsDateString()
  scheduledDate: Date;

  @IsNotEmpty()
  @IsEnum(InterviewMethod)
  method: InterviewMethod;

  @IsNotEmpty()
  @IsArray()
  @IsString({ each: true })
  panelMemberIds: string[];

  @IsOptional()
  @IsString()
  videoLink?: string;

  @IsOptional()
  @IsString()
  location?: string;

  @IsOptional()
  @IsString()
  notes?: string;
}

/**
 * DTO for updating interview schedule
 */
export class UpdateInterviewScheduleDto {
  @IsOptional()
  @IsDateString()
  scheduledDate?: Date;

  @IsOptional()
  @IsEnum(InterviewMethod)
  method?: InterviewMethod;

  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  panelMemberIds?: string[];

  @IsOptional()
  @IsString()
  videoLink?: string;

  @IsOptional()
  @IsString()
  location?: string;

  @IsOptional()
  @IsString()
  notes?: string;
}

/**
 * DTO for time slot availability response
 */
export class TimeSlotAvailabilityDto {
  panelMemberId: string;
  availableSlots: {
    start: Date;
    end: Date;
  }[];
  conflicts: {
    start: Date;
    end: Date;
    reason: string;
  }[];
}

