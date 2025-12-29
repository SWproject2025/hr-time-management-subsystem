import { AppraisalDisputeStatus } from '../enums/performance.enums';

export class ResolveDisputeDto {
  status: AppraisalDisputeStatus;   // ADJUSTED or REJECTED usually
  hrDecisionNotes?: string;

  // Optional: if HR adjusts the appraisal outcome
  adjustedTotalScore?: number;
  adjustedOverallRatingLabel?: string;
}
