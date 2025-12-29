// Enums matching backend
export enum EmployeeStatus {
  ACTIVE = 'ACTIVE',
  INACTIVE = 'INACTIVE',
  ON_LEAVE = 'ON_LEAVE',
  SUSPENDED = 'SUSPENDED',
  TERMINATED = 'TERMINATED',
}

export enum Gender {
  MALE = 'MALE',
  FEMALE = 'FEMALE',
}

export enum MaritalStatus {
  SINGLE = 'SINGLE',
  MARRIED = 'MARRIED',
  DIVORCED = 'DIVORCED',
  WIDOWED = 'WIDOWED',
}

// Interfaces
export interface Address {
  city?: string;
  streetAddress?: string;
  country?: string;
}

export interface EmployeeProfile {
  _id: string;
  employeeNumber: string;
  firstName: string;
  lastName: string;
  fullName?: string;
  nationalId: string;
  workEmail?: string;
  personalEmail?: string;
  mobilePhone?: string;
  homePhone?: string;
  address?: Address;
  profilePictureUrl?: string;
  dateOfHire: string;
  status: EmployeeStatus;
  primaryPositionId?: string;
  primaryDepartmentId?: string;
  supervisorPositionId?: string;
  biography?: string;
  gender?: Gender;
  maritalStatus?: MaritalStatus;
  dateOfBirth?: string;
}

export interface EmployeeRole {
  roles: string[];
  permissions: string[];
}

export interface MeResponse {
  profile: EmployeeProfile;
  role: EmployeeRole | null;
}

// DTOs for Forms
export interface UpdateContactDto {
  mobilePhone?: string;
  homePhone?: string;
  personalEmail?: string;
  address?: Address;
}

export interface ChangeRequestDto {
  changes: Record<string, any>;
  reason?: string;
}