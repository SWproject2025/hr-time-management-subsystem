import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { LeaveCategory, LeaveCategoryDocument } from '../models/leave-category.schema';
import { LeavePolicy, LeavePolicyDocument } from '../models/leave-policy.schema';
import { LeaveBlockPeriod } from '../models/leave-block-period.schema';
import { Calendar, CalendarDocument } from '../models/calendar.schema';

@Injectable()
export class LeavePolicyService {
  constructor(
    @InjectModel(LeaveCategory.name)
    private categoryModel: Model<LeaveCategoryDocument>,
    @InjectModel(LeavePolicy.name)
    private policyModel: Model<LeavePolicyDocument>,
    @InjectModel(LeaveBlockPeriod.name)
    private blockPeriodModel: Model<any>,
    @InjectModel(Calendar.name)
    private calendarModel: Model<CalendarDocument>,
  ) {}

  // ==================== LEAVE CATEGORIES ====================

  async getAllCategories() {
    return this.categoryModel.find().lean();
  }

  async createCategory(data: { code: string; name: string; description?: string }) {
    const existing = await this.categoryModel.findOne({ code: data.code });
    if (existing) {
      throw new BadRequestException(`Category with code "${data.code}" already exists`);
    }

    const category = new this.categoryModel(data);
    return category.save();
  }

  async updateCategory(id: string, data: { code?: string; name?: string; description?: string }) {
    const category = await this.categoryModel.findById(id);
    if (!category) {
      throw new NotFoundException('Category not found');
    }

    if (data.code && data.code !== category.code) {
      const existing = await this.categoryModel.findOne({ code: data.code });
      if (existing) {
        throw new BadRequestException(`Category with code "${data.code}" already exists`);
      }
    }

    Object.assign(category, data);
    return category.save();
  }

  async deleteCategory(id: string) {
    const category = await this.categoryModel.findById(id);
    if (!category) {
      throw new NotFoundException('Category not found');
    }

    // Note: In production, check if any leave types use this category before deletion
    await this.categoryModel.findByIdAndDelete(id);
    return { message: 'Category deleted successfully' };
  }

  // ==================== LEAVE POLICIES ====================

  async getAllPolicies() {
    return this.policyModel.find().populate('leaveTypeId', 'code name').lean();
  }

  async getPolicyByLeaveType(leaveTypeId: string) {
    const policy = await this.policyModel
      .findOne({ leaveTypeId: new Types.ObjectId(leaveTypeId) })
      .populate('leaveTypeId', 'code name')
      .lean();

    if (!policy) {
      throw new NotFoundException('Policy not found for this leave type');
    }

    return policy;
  }

  async updatePolicy(id: string, updateData: any) {
    const policy = await this.policyModel.findById(id);
    if (!policy) {
      throw new NotFoundException('Policy not found');
    }

    Object.assign(policy, updateData);
    return policy.save();
  }

  // ==================== BLOCK PERIODS ====================

  async getAllBlockPeriods() {
    return this.blockPeriodModel.find().lean();
  }

  async createBlockPeriod(data: {
    name: string;
    startDate: Date;
    endDate: Date;
    reason: string;
    exemptLeaveTypes?: string[];
  }) {
    if (data.startDate >= data.endDate) {
      throw new BadRequestException('Start date must be before end date');
    }

    const blockPeriod = new this.blockPeriodModel({
      ...data,
      isActive: true,
    });

    return blockPeriod.save();
  }

  async updateBlockPeriod(id: string, updateData: any) {
    const blockPeriod = await this.blockPeriodModel.findById(id);
    if (!blockPeriod) {
      throw new NotFoundException('Block period not found');
    }

    if (updateData.startDate && updateData.endDate) {
      if (new Date(updateData.startDate) >= new Date(updateData.endDate)) {
        throw new BadRequestException('Start date must be before end date');
      }
    }

    Object.assign(blockPeriod, updateData);
    return blockPeriod.save();
  }

  async deleteBlockPeriod(id: string) {
    const blockPeriod = await this.blockPeriodModel.findById(id);
    if (!blockPeriod) {
      throw new NotFoundException('Block period not found');
    }

    await this.blockPeriodModel.findByIdAndDelete(id);
    return { message: 'Block period deleted successfully' };
  }

  // ==================== CALENDAR MANAGEMENT ====================

  /**
   * Get calendar for a specific year
   * REQ-010: View calendar
   */
  async getCalendar(year: number) {
    const calendar = await this.calendarModel.findOne({ year }).lean();
    if (!calendar) {
      // Return empty calendar if not found
      return {
        year,
        holidays: [],
        blockedPeriods: [],
      };
    }
    return calendar;
  }

  /**
   * Create or update calendar for a year
   * REQ-010: Configure calendar with holidays
   */
  async upsertCalendar(data: {
    year: number;
    holidays?: Array<{ date: Date; name: string; description?: string }>;
  }) {
    let calendar = await this.calendarModel.findOne({ year: data.year });

    if (calendar) {
      // Update existing
      if (data.holidays) {
        calendar.holidays = data.holidays as any;
      }
      return calendar.save();
    } else {
      // Create new
      calendar = new this.calendarModel({
        year: data.year,
        holidays: data.holidays || [],
        blockedPeriods: [],
      });
      return calendar.save();
    }
  }

  /**
   * Add holidays to calendar
   * REQ-010: Bulk upload holidays
   */
  async addHolidays(year: number, holidays: Array<{ date: Date; name: string; description?: string }>) {
    let calendar = await this.calendarModel.findOne({ year });

    if (!calendar) {
      calendar = new this.calendarModel({
        year,
        holidays,
        blockedPeriods: [],
      });
    } else {
      // Append new holidays
      const existingHolidays = (calendar.holidays as any[]) || [];
      calendar.holidays = [...existingHolidays, ...holidays] as any;
    }

    return calendar.save();
  }

  /**
   * Remove holiday from calendar
   * REQ-010: Delete holiday
   */
  async removeHoliday(year: number, holidayDate: Date) {
    const calendar = await this.calendarModel.findOne({ year });
    if (!calendar) {
      throw new NotFoundException('Calendar not found for this year');
    }

    const holidays = (calendar.holidays as any[]) || [];
    calendar.holidays = holidays.filter(
      (h: any) => new Date(h.date).getTime() !== new Date(holidayDate).getTime(),
    ) as any;

    await calendar.save();
    return { message: 'Holiday removed successfully' };
  }
}
