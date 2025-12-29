import { forwardRef, Module } from '@nestjs/common';
import { PayrollTrackingController } from './payroll-tracking.controller';
import { PayrollTrackingService } from './payroll-tracking.service';
import { MongooseModule } from '@nestjs/mongoose';
import { refunds, refundsSchema } from './models/refunds.schema';
import { claims, claimsSchema } from './models/claims.schema';
import { disputes, disputesSchema } from './models/disputes.schema';
import { PayrollConfigurationModule } from '../payroll-configuration/payroll-configuration.module';
import { PayrollExecutionModule } from '../payroll-execution/payroll-execution.module';
import { paySlip, paySlipSchema } from '../payroll-execution/models/payslip.schema';
import { employeePayrollDetails, employeePayrollDetailsSchema } from '../payroll-execution/models/employeePayrollDetails.schema';
import { payrollRuns, payrollRunsSchema } from '../payroll-execution/models/payrollRuns.schema';
import { EmployeeProfile, EmployeeProfileSchema } from '../employee-profile/models/employee-profile.schema';

@Module({

  imports: [
    PayrollConfigurationModule, forwardRef(() => PayrollExecutionModule),
    MongooseModule.forFeature([
      { name: refunds.name, schema: refundsSchema },
      { name: claims.name, schema: claimsSchema },
      { name: disputes.name, schema: disputesSchema },
      { name: paySlip.name, schema: paySlipSchema },
      { name: employeePayrollDetails.name, schema: employeePayrollDetailsSchema },
      { name: payrollRuns.name, schema: payrollRunsSchema },
      { name: EmployeeProfile.name, schema: EmployeeProfileSchema },
    ])],
  controllers: [PayrollTrackingController],
  providers: [PayrollTrackingService],
  exports: [PayrollTrackingService]
})
export class PayrollTrackingModule { }
