import { OnboardingTaskStatus } from '../enums/onboarding-task-status.enum';

export class UpdateOnboardingTaskDto {
  name?: string;
  department?: string;
  deadline?: Date;
  notes?: string;
  status?: OnboardingTaskStatus;
}
