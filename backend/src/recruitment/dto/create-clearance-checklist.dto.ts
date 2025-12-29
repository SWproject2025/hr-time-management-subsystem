export class CreateClearanceChecklistDto {
  terminationId: string;
  departments?: string[]; // IT, Finance, Facilities, HR, Admin
  equipmentList?: {
    name: string;
    equipmentId?: string;
  }[];
}
