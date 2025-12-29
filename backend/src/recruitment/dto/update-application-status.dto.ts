import { ApplicationStatus } from '../enums/application-status.enum';

export class UpdateApplicationStatusDto {
  newStatus: ApplicationStatus;
  changedBy: string; // user id performing action
}
