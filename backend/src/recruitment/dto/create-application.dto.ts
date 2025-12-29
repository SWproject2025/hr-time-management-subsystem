export class CreateApplicationDto {
  candidateId: string;       // Candidate ObjectId as string
  requisitionId: string;     // JobRequisition ObjectId as string
  assignedHr?: string;       // HR user ObjectId as string
}
