import { TerminationStatus } from '../enums/termination-status.enum';

export class UpdateTerminationRequestDto {
  reason?: string;
  employeeComments?: string;
  hrComments?: string;
  status?: TerminationStatus;
  terminationDate?: Date;
}
