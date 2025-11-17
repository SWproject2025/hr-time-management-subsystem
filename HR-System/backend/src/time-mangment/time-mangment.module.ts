import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { TimeMangmentController } from './time-mangment.controller';
import { TimeMangmentService } from './time-mangment.service';
import {
  Attendance,
  AttendanceCorrection,
  AttendanceCorrectionSchema,
  AttendanceSchema,
  EmployeeShiftAssignment,
  EmployeeShiftAssignmentSchema,
  HolidayCalendar,
  HolidayCalendarSchema,
  Overtime,
  OvertimeSchema,
  RestDay,
  RestDaySchema,
  Shift,
  ShiftSchema,
} from './model';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: Attendance.name, schema: AttendanceSchema },
      { name: AttendanceCorrection.name, schema: AttendanceCorrectionSchema },
      { name: EmployeeShiftAssignment.name, schema: EmployeeShiftAssignmentSchema },
      { name: HolidayCalendar.name, schema: HolidayCalendarSchema },
      { name: Overtime.name, schema: OvertimeSchema },
      { name: RestDay.name, schema: RestDaySchema },
      { name: Shift.name, schema: ShiftSchema },
    ]),
  ],
  controllers: [TimeMangmentController],
  providers: [TimeMangmentService],
  exports: [TimeMangmentService],
})
export class TimeMangmentModule {}

