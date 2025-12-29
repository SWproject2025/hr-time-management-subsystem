import { Module } from '@nestjs/common';
import { LeavesController } from './leaves.controller';
import { LeavesService } from './leaves.service';
import { MongooseModule } from '@nestjs/mongoose';
// Ensure the file exists or correct the import path
import { LeaveType, LeaveTypeSchema } from './models/leave-type.schema'; // Check if this file exists
import { LeaveRequest, LeaveRequestSchema } from './models/leave-request.schema';
import { LeavePolicy, LeavePolicySchema } from './models/leave-policy.schema';
import {
  LeaveEntitlement,
  LeaveEntitlementSchema,
} from './models/leave-entitlement.schema';
import {
  LeaveCategory,
  LeaveCategorySchema,
} from './models/leave-category.schema';
import {
  LeaveAdjustment,
  LeaveAdjustmentSchema,
} from './models/leave-adjustment.schema';
import { Calendar, CalendarSchema } from './models/calendar.schema';
import { Attachment, AttachmentSchema } from './models/attachment.schema';
import { LeaveAttachment, LeaveAttachmentSchema } from './models/leave-attachment.schema';
import { LeaveBlockPeriod, LeaveBlockPeriodSchema } from './models/leave-block-period.schema';
import { LeaveDelegation, LeaveDelegationSchema } from './models/leave-delegation.schema';
import { LeaveAttachmentsController } from './controllers/leave-attachments.controller';
import { LeavePolicyController } from './controllers/leave-policy.controller';
import { AttachmentsController } from './controllers/attachments.controller';
import { LeaveValidationService } from './services/leave-validation.service';
import { LeavesCronService } from './services/leaves-cron.service';
import { LeavePolicyService } from './services/leave-policy.service';
import { AttachmentsService } from './services/attachments.service';
import { IntegrationService } from './services/integration.service';
import { LeaveEntitlementService } from './services/leave-entitlement.service';
import { LeaveEntitlementController } from './controllers/leave-entitlement.controller';
import { MonthlyAccrualService } from './services/monthly-accrual.service';
import { EmployeeProfileModule } from '../employee-profile/employee-profile.module';


import { TimeManagementModule } from '../time-management/time-management.module';
import { PatternDetectionService } from './services/pattern-detection.service';
import { PayrollExecutionModule } from '../payroll-execution/payroll-execution.module';
import { EmailModule } from '../Common/email/email.module';
import { LeaveSettlementService } from './services/leave-settlement.service';
import { OrganizationStructureModule } from '../organization-structure/organization-structure.module';

import { LeavePattern, LeavePatternSchema } from './models/leave-pattern.schema';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: LeaveType.name, schema: LeaveTypeSchema },
      { name: LeaveRequest.name, schema: LeaveRequestSchema },
      { name: LeavePolicy.name, schema: LeavePolicySchema },
      { name: LeaveEntitlement.name, schema: LeaveEntitlementSchema },
      { name: LeaveCategory.name, schema: LeaveCategorySchema },
      { name: LeaveAdjustment.name, schema: LeaveAdjustmentSchema },
      { name: Calendar.name, schema: CalendarSchema },
      { name: Attachment.name, schema: AttachmentSchema },
      { name: LeaveAttachment.name, schema: LeaveAttachmentSchema },
      { name: LeaveBlockPeriod.name, schema: LeaveBlockPeriodSchema },
      { name: LeaveDelegation.name, schema: LeaveDelegationSchema },
      { name: LeavePattern.name, schema: LeavePatternSchema },
    ]),
    EmployeeProfileModule,
    TimeManagementModule,
    OrganizationStructureModule, // Added for manager lookup
    PayrollExecutionModule,      // Added for payroll sync
    EmailModule,
  ],
  controllers: [LeavesController, LeaveAttachmentsController, LeavePolicyController, AttachmentsController, LeaveEntitlementController],
  providers: [LeavesService, LeaveValidationService, LeavesCronService, LeaveSettlementService, LeavePolicyService, AttachmentsService, IntegrationService, LeaveEntitlementService, MonthlyAccrualService, PatternDetectionService],
  exports: [LeavesService, LeaveSettlementService, MonthlyAccrualService, PatternDetectionService],
})
export class LeavesModule {}



