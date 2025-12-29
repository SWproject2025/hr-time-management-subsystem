export class CreateJobRequisitionDto {
  requisitionId: string;       // for example "REQ-2025-001"
  templateId?: string;         // ObjectId as string
  openings: number;
  location?: string;
  hiringManagerId: string;     // ObjectId as string
  publishStatus?: string;      // draft, published, closed
  postingDate?: Date;
  expiryDate?: Date;
}
