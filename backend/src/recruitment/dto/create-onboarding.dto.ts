export class CreateOnboardingDto {
  employeeId: string;
  tasks?: {
    name: string;
    department: string;
    deadline?: Date;
  }[];
}
