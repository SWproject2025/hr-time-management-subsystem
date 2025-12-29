import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import mongoose from 'mongoose';  // ✅ ADD THIS LINE
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { TimeManagementModule } from './time-management/time-management.module';
import { RecruitmentModule } from './recruitment/recruitment.module';
import { LeavesModule } from './leaves/leaves.module';
import { AuthModule } from './auth/auth.module';
import { PayrollTrackingModule } from './payroll-tracking/payroll-tracking.module';
import { EmployeeProfileModule } from './employee-profile/employee-profile.module';
import { OrganizationStructureModule } from './organization-structure/organization-structure.module';
import { PerformanceModule } from './performance/performance.module';
import { PayrollConfigurationModule } from './payroll-configuration/payroll-configuration.module';
import { PayrollExecutionModule } from './payroll-execution/payroll-execution.module';
import { ConfigModule } from '@nestjs/config';

@Module({
  imports: [
    // Initialize ConfigModule globally so you don't have to import it everywhere
    ConfigModule.forRoot({
      isGlobal: true, 
    }),
    // ✅ REPLACE MongooseModule.forRoot with forRootAsync
    MongooseModule.forRootAsync({
      useFactory: () => {
        mongoose.pluralize(null);  // ✅ Disable auto-pluralization
        return {
          uri: process.env.MONGODB_URI || 'mongodb://localhost:27017/hr-main',
        };
      },
    }),
    TimeManagementModule,
    RecruitmentModule,
    LeavesModule,
    PayrollExecutionModule,
    PayrollConfigurationModule,
    PayrollTrackingModule,
    EmployeeProfileModule,
    OrganizationStructureModule,
    PerformanceModule,
    AuthModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}