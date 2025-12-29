export class CreateAssessmentResultDto {
  interviewId: string;
  interviewerId: string;
  score: number;
  comments?: string;
  changedBy: string;
}
