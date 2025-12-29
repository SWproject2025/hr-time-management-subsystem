import { TerminationInitiation } from '../enums/termination-initiation.enum';

export class FilterTerminationRequestDto {
  employeeId?: string;
  status?: string;
  initiator?: TerminationInitiation;
}
