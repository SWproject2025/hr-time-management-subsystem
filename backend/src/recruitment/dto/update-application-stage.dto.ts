import { ApplicationStage } from '../enums/application-stage.enum';

export class UpdateApplicationStageDto {
  newStage: ApplicationStage;
  changedBy: string; // user id performing action
}
