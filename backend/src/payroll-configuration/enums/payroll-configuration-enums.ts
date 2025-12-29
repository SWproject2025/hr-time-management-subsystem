export enum ConfigStatus {
    DRAFT = 'draft',
    APPROVED = 'approved',
    REJECTED = 'rejected',
    PENDING = 'pending'
}

export enum PolicyType {
  DEDUCTION = 'Deduction',
    ALLOWANCE = "Allowance",
    BENEFIT = "Benefit",
    MISCONDUCT = "Misconduct",
    LEAVE = "Leave",
}


export enum Applicability {
    AllEmployees = "All Employees",
    FULL_TIME = "Full Time Employees",
    PART_TIME = "Part Time Employees",
    CONTRACTORS = "Contractors",
}

// export enum UserRole {
//     PAYROLL_SPECIALIST = "Payroll_Specialist",
//     HR_MANAGER = "HR_Manager",
//     PAYROLL_MANAGER = "Payroll_Manager",
//     SYS_ADMIN = "System_Admin",
//     POLICY_ADMIN = "Policy_Admin",
// } already defined in employee-profile.enums.ts
