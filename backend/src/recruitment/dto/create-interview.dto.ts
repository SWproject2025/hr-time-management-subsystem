import { ApplicationStage } from '../enums/application-stage.enum';
import { InterviewMethod } from '../enums/interview-method.enum';

export class CreateInterviewDto {
  applicationId: string;
  stage: ApplicationStage;
  scheduledDate: Date;
  method: InterviewMethod;
  panel: string[];
  videoLink?: string;
  calendarEventId?: string;
  changedBy: string;
}
