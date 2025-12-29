import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { PayrollExecutionService } from './payroll-execution.service';
import { PayrollExecutionController } from './payroll-execution.controller';
import { CalcDraftService } from './calc-draft/calc-draft.service';
import { employeeSigningBonus, employeeSigningBonusSchema } from './models/EmployeeSigningBonus.schema';
import { EmployeeTerminationResignation, EmployeeTerminationResignationSchema } from './models/EmployeeTerminationResignation.schema';
import { payrollRuns, payrollRunsSchema } from './models/payrollRuns.schema';
import { employeePayrollDetails, employeePayrollDetailsSchema } from './models/employeePayrollDetails.schema';
import { employeePenalties, employeePenaltiesSchema } from './models/employeePenalties.schema';
import { paySlip, paySlipSchema } from './models/payslip.schema';
import { EmployeeProfile, EmployeeProfileSchema } from '../employee-profile/models/employee-profile.schema';
import { payGrade, payGradeSchema } from '../payroll-configuration/models/payGrades.schema'; // ✅ ADD THIS IMPORT

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: employeeSigningBonus.name, schema: employeeSigningBonusSchema },
      { name: EmployeeTerminationResignation.name, schema: EmployeeTerminationResignationSchema },
      { name: payrollRuns.name, schema: payrollRunsSchema },
      { name: employeePayrollDetails.name, schema: employeePayrollDetailsSchema },
      { name: employeePenalties.name, schema: employeePenaltiesSchema },
      { name: paySlip.name, schema: paySlipSchema },
      { name: EmployeeProfile.name, schema: EmployeeProfileSchema },
      { name: payGrade.name, schema: payGradeSchema }, // ✅ ADD THIS LINE
    ]),
  ],
  controllers: [PayrollExecutionController],
  providers: [
    PayrollExecutionService,
    CalcDraftService, // ✅ MUST BE HERE
  ],
  exports: [PayrollExecutionService, CalcDraftService],
})
export class PayrollExecutionModule {}