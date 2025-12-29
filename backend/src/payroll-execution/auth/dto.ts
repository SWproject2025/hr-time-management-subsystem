// src/payroll-execution/auth/dto.ts

export class CreateSigningBonusDto {
  employeeId: string;
  amount: number;
}

export class CreatePayrollRunDto {
  periodStart: Date;
  periodEnd: Date;
}

export class CreatePaySlipDto {
  employeeId: string;
  payrollRunId: string;
  grossPay: number;
  netPay: number;
}

export class CreateTerminationBenefitDto {
  employeeId: string;
  amount: number;
  type: string;
}

export class CreatePenaltyDto {
  employeeId: string;
  amount: number;
  reason: string;
}

export class CreateEmployeePayrollDetailsDto {
  employeeId: string;
  baseSalary: number;
}

export class UpdatePayrollRunStatusDto {
  status: string;
}

export class UpdatePaymentStatusDto {
  status: string;
}

export class UpdateSigningBonusStatusDto {
  status: string;
}

export class UpdateTerminationBenefitStatusDto {
  status: string;
}

export class AddPenaltyDto {
  amount: number;
  reason: string;
}

export class UpdateBankStatusDto {
  status: string;
}

export class UpdatePayslipPaymentStatusDto {
  paymentStatus: string;
}

export class UpdatePayslipDto {
  grossPay?: number;
  netPay?: number;
}

export class UpdateEmployeePayrollDetailsDto {
  baseSalary?: number;
}