/**
 * Role constants for frontend role-based access control
 * Uses UPPERCASE naming convention matching the backend SystemRole enum
 */

// Role string values - must match backend SystemRole enum exactly
export const ROLES = {
  DEPARTMENT_EMPLOYEE: 'DEPARTMENT_EMPLOYEE',
  DEPARTMENT_HEAD: 'DEPARTMENT_HEAD',
  HR_ADMIN: 'HR_ADMIN',
  HR_MANAGER: 'HR_MANAGER',
  PAYROLL_SPECIALIST: 'PAYROLL_SPECIALIST',
  PAYROLL_MANAGER: 'PAYROLL_MANAGER',
  FINANCE_STAFF: 'FINANCE_STAFF',
  SYSTEM_ADMIN: 'SYSTEM_ADMIN',
} as const;

// Role groups for Leaves subsystem
export const LEAVES_ROLES = {
  EMPLOYEE: [ROLES.DEPARTMENT_EMPLOYEE],
  MANAGER: [ROLES.DEPARTMENT_HEAD],
  HR: [ROLES.HR_ADMIN, ROLES.HR_MANAGER],
  ALL: [ROLES.DEPARTMENT_EMPLOYEE, ROLES.DEPARTMENT_HEAD, ROLES.HR_ADMIN, ROLES.HR_MANAGER],
};

// Helper functions
export function isEmployee(roles: string[]): boolean {
  return roles.some(r => LEAVES_ROLES.ALL.includes(r as any));
}

export function isManager(roles: string[]): boolean {
  return roles.some(r => LEAVES_ROLES.MANAGER.includes(r as any));
}

export function isHRAdmin(roles: string[]): boolean {
  return roles.some(r => LEAVES_ROLES.HR.includes(r as any));
}

export function hasAnyRole(userRoles: string[], allowedRoles: string[]): boolean {
  return userRoles.some(role => allowedRoles.includes(role));
}
