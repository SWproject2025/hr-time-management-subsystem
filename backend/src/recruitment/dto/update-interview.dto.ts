import { InterviewMethod } from '../enums/interview-method.enum';
import { InterviewStatus } from '../enums/interview-status.enum';

export class UpdateInterviewDto {
  scheduledDate?: Date;
  method?: InterviewMethod;
  panel?: string[];
  status?: InterviewStatus;
  videoLink?: string;
  calendarEventId?: string;
  candidateFeedback?: string;
  changedBy: string;
}
