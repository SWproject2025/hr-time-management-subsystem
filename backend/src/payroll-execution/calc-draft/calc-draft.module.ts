// calc-draft/calc-draft.module.ts
import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { CalcDraftService } from './calc-draft.service';
import { CalcDraftController } from './calc-draft.controller';

// Import all schemas that CalcDraftService uses
import { employeeSigningBonusSchema } from '../models/EmployeeSigningBonus.schema';
import { EmployeeTerminationResignationSchema } from '../models/EmployeeTerminationResignation.schema';
import { payrollRunsSchema } from '../models/payrollRuns.schema';
import { employeePayrollDetailsSchema } from '../models/employeePayrollDetails.schema';
import { employeePenaltiesSchema } from '../models/employeePenalties.schema';
import { paySlipSchema } from '../models/payslip.schema';
import { EmployeeProfileSchema } from '../../employee-profile/models/employee-profile.schema';
import { payGradeSchema } from '../../payroll-configuration/models/payGrades.schema'; // ✅ FIXED: use payGradeSchema

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: 'employeeSigningBonus', schema: employeeSigningBonusSchema },
      { name: 'EmployeeTerminationResignation', schema: EmployeeTerminationResignationSchema },
      { name: 'payrollRuns', schema: payrollRunsSchema },
      { name: 'employeePayrollDetails', schema: employeePayrollDetailsSchema },
      { name: 'employeePenalties', schema: employeePenaltiesSchema },
      { name: 'paySlip', schema: paySlipSchema },
      { name: 'EmployeeProfile', schema: EmployeeProfileSchema },
      { name: 'payGrade', schema: payGradeSchema }, // ✅ FIXED: lowercase to match schema class
    ]),
  ],
  controllers: [CalcDraftController],
  providers: [CalcDraftService],
  exports: [CalcDraftService], // ✅ Export if used by PayrollExecutionModule
})
export class CalcDraftModule {}