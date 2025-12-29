/**
 * Leaves Subsystem Seed Script
 *
 * Populates:
 * 1. Leave Categories
 * 2. Leave Types
 * 3. Leave Policies
 * 4. Calendar & Block Periods
 * 5. Leave Entitlements (for sample employees)
 * 6. Sample Leave Requests
 *
 * Usage:
 *   node scripts/leaves-seed.js
 */

const mongoose = require('mongoose');

// MongoDB connection
const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/hr-main';

// Schemas (simplified for seeding)
const leaveCategorySchema = new mongoose.Schema({
  code: { type: String, required: true, unique: true },
  name: { type: String, required: true },
  description: String,
  isActive: { type: Boolean, default: true },
});

const leaveTypeSchema = new mongoose.Schema({
  code: { type: String, required: true, unique: true },
  name: { type: String, required: true },
  categoryId: { type: mongoose.Schema.Types.ObjectId, ref: 'LeaveCategory' },
  description: String,
  paid: { type: Boolean, default: true },
  deductible: { type: Boolean, default: true },
  requiresJustification: { type: Boolean, default: false },
  requiresAttachment: { type: Boolean, default: false },
  genderEligibility: [String],
  minServiceDays: Number,
  noticePeriodDays: Number,
  allowHalfDay: { type: Boolean, default: true },
  isActive: { type: Boolean, default: true },
});

const leavePolicySchema = new mongoose.Schema({
  leaveTypeId: { type: mongoose.Schema.Types.ObjectId, ref: 'LeaveType', required: true },
  accrualMethod: { type: String, enum: ['MONTHLY', 'YEARLY', 'LUMP_SUM', 'NONE'], default: 'NONE' },
  monthlyRate: Number,
  yearlyRate: Number,
  carryForwardAllowed: { type: Boolean, default: false },
  maxCarryForward: Number,
  carryForwardExpiryMonths: Number,
  eligibility: {
    contractTypesAllowed: [String],
    positionsAllowed: [String],
  },
  roundingRule: { type: String, default: 'ROUND_UP' },
});

const leaveEntitlementSchema = new mongoose.Schema({
  employeeId: { type: mongoose.Schema.Types.ObjectId, ref: 'EmployeeProfile', required: true },
  leaveTypeId: { type: mongoose.Schema.Types.ObjectId, ref: 'LeaveType', required: true },
  periodYear: { type: Number, required: true },
  totalEntitlement: { type: Number, default: 0 },
  yearlyEntitlement: { type: Number, default: 0 },
  carryForward: { type: Number, default: 0 },
  accruedActual: { type: Number, default: 0 },
  accruedRounded: { type: Number, default: 0 },
  taken: { type: Number, default: 0 },
  pending: { type: Number, default: 0 },
  remaining: { type: Number, default: 0 },
  lastAccrualDate: Date,
});

const leaveRequestSchema = new mongoose.Schema({
  employeeId: { type: mongoose.Schema.Types.ObjectId, ref: 'EmployeeProfile', required: true },
  leaveTypeId: { type: mongoose.Schema.Types.ObjectId, ref: 'LeaveType', required: true },
  dates: {
    from: { type: Date, required: true },
    to: { type: Date, required: true },
  },
  durationDays: { type: Number, required: true },
  status: { type: String, default: 'PENDING' },
  justification: String,
  approvalFlow: [{
    role: String,
    status: String,
    updatedAt: Date,
    comments: String,
    actionBy: { type: mongoose.Schema.Types.ObjectId, ref: 'EmployeeProfile' },
  }],
}, { timestamps: true });

// Models
const LeaveCategory = mongoose.model('LeaveCategory', leaveCategorySchema);
const LeaveType = mongoose.model('LeaveType', leaveTypeSchema);
const LeavePolicy = mongoose.model('LeavePolicy', leavePolicySchema);
const LeaveEntitlement = mongoose.model('LeaveEntitlement', leaveEntitlementSchema);
const LeaveRequest = mongoose.model('LeaveRequest', leaveRequestSchema);
const EmployeeProfile = mongoose.model('EmployeeProfile', new mongoose.Schema({
    workEmail: String,
    firstName: String, 
    lastName: String
}, { collection: 'employee_profiles' })); // Helper to find users

async function bootstrap() {
  try {
    console.log('🌱 Starting Leaves Subsystem seed process...\n');

    // Connect to MongoDB
    await mongoose.connect(MONGODB_URI);
    console.log('✅ Connected to MongoDB');

    // Clear existing leaves data
    await Promise.all([
      LeaveCategory.deleteMany({}),
      LeaveType.deleteMany({}),
      LeavePolicy.deleteMany({}),
      LeaveEntitlement.deleteMany({}),
      LeaveRequest.deleteMany({}),
    ]);
    console.log('🗑️  Cleared existing leaves data\n');

    // 1. Create Categories
    const categories = await LeaveCategory.insertMany([
      { code: 'PAID', name: 'Paid Leave', description: 'Fully paid leave types' },
      { code: 'UNPAID', name: 'Unpaid Leave', description: 'Unpaid time off' },
      { code: 'SICK', name: 'Sick Leave', description: 'Health related leave' },
    ]);
    const catPaid = categories.find(c => c.code === 'PAID');
    const catUnpaid = categories.find(c => c.code === 'UNPAID');
    const catSick = categories.find(c => c.code === 'SICK');
    console.log('✅ Created Leave Categories');

    // 2. Create Leave Types
    const Types = await LeaveType.insertMany([
      { 
        code: 'ANNUAL', 
        name: 'Annual Leave', 
        categoryId: catPaid._id, 
        paid: true,
        allowHalfDay: true,
        description: 'Standard paid annual leave'
      },
      { 
        code: 'SICK', 
        name: 'Sick Leave', 
        categoryId: catSick._id, 
        paid: true,
        requiresJustification: true,
        requiresAttachment: true,
        description: 'Paid sick leave (medical certificate required)'
      },
      { 
        code: 'EMERGENCY', 
        name: 'Emergency Leave', 
        categoryId: catPaid._id, 
        paid: true,
        deductible: true,
        description: 'Paid leave for emergencies'
      },
      { 
        code: 'UNPAID', 
        name: 'Unpaid Leave', 
        categoryId: catUnpaid._id, 
        paid: false,
        deductible: false,
        description: 'Authorized unpaid time off'
      },
    ]);
    const typeAnnual = Types.find(t => t.code === 'ANNUAL');
    const typeSick = Types.find(t => t.code === 'SICK');
    console.log('✅ Created Leave Types');

    // 3. Create Policies
    await LeavePolicy.insertMany([
      { 
        leaveTypeId: typeAnnual._id,
        accrualMethod: 'MONTHLY',
        monthlyRate: 2.5, // 30 days/year
        yearlyRate: 30,
        carryForwardAllowed: true,
        maxCarryForward: 10
      },
      { 
        leaveTypeId: typeSick._id,
        accrualMethod: 'YEARLY',
        yearlyRate: 15,
        monthlyRate: 0,
        carryForwardAllowed: false
      }
    ]);
    console.log('✅ Created Leave Policies');

    // 4. Find Users (from auth-seed)
    const john = await EmployeeProfile.findOne({ workEmail: 'john.doe@company.com' }); // Employee
    const david = await EmployeeProfile.findOne({ workEmail: 'david.manager@company.com' }); // Manager
    const sarah = await EmployeeProfile.findOne({ workEmail: 'sarah.smith@company.com' }); // Payroll Specialist
    
    if (!john || !david) {
      console.warn('⚠️ Users not found! Please run auth-seed.js first.');
    } else {

      // 5. Create Entitlements
      const currentYear = new Date().getFullYear();
      
      // Give John Annual leave balance
      await LeaveEntitlement.create({
        employeeId: john._id,
        leaveTypeId: typeAnnual._id,
        periodYear: currentYear,
        yearlyEntitlement: 30,
        openingBalance: 0,
        accruedActual: 15,    // Assume 6 months accrued
        accruedRounded: 15,
        taken: 5,
        pending: 2,
        remaining: 8,         // 15 accrued - 5 taken - 2 pending
        lastAccrualDate: new Date()
      });

      // Give John Sick leave balance
      await LeaveEntitlement.create({
        employeeId: john._id,
        leaveTypeId: typeSick._id,
        periodYear: currentYear,
        yearlyEntitlement: 15,
        accruedActual: 15,    // Front-loaded for year
        accruedRounded: 15,
        remaining: 15
      });
      
      // Give Manager David balance
      await LeaveEntitlement.create({
        employeeId: david._id,
        leaveTypeId: typeAnnual._id,
        periodYear: currentYear,
        yearlyEntitlement: 30,
        accruedActual: 15,
        accruedRounded: 15,
        remaining: 15
      });

      console.log('✅ Created Leave Entitlements for John and David');

      // 6. Create Test Requests
      // Request 1: PENDING (John -> David approver)
      const nextWeek = new Date();
      nextWeek.setDate(nextWeek.getDate() + 7);
      const nextWeekEnd = new Date(nextWeek);
      nextWeekEnd.setDate(nextWeekEnd.getDate() + 2);

      await LeaveRequest.create({
        employeeId: john._id,
        leaveTypeId: typeAnnual._id,
        dates: { from: nextWeek, to: nextWeekEnd },
        durationDays: 3,
        status: 'PENDING',
        justification: 'Short vacation trip',
        approvalFlow: [
          { role: 'line_manager', status: 'PENDING', comments: null }
        ]
      });

      // Request 2: APPROVED (John, past leave)
      const lastMonth = new Date();
      lastMonth.setMonth(lastMonth.getMonth() - 1);
      const lastMonthEnd = new Date(lastMonth);
      lastMonthEnd.setDate(lastMonthEnd.getDate() + 4);

      await LeaveRequest.create({
        employeeId: john._id,
        leaveTypeId: typeAnnual._id,
        dates: { from: lastMonth, to: lastMonthEnd },
        durationDays: 5,
        status: 'APPROVED',
        justification: 'Family visit',
        approvalFlow: [
          { role: 'line_manager', status: 'APPROVED', updatedAt: new Date(), actionBy: david._id },
          { role: 'hr_admin', status: 'APPROVED', updatedAt: new Date() }
        ]
      });

       // Request 3: PENDING Manager Request (David)
       await LeaveRequest.create({
        employeeId: david._id,
        leaveTypeId: typeSick._id,
        dates: { from: new Date(), to: new Date() }, // Today
        durationDays: 1,
        status: 'PENDING',
        justification: 'Not feeling well',
        approvalFlow: [
          { role: 'line_manager', status: 'PENDING' } // Would go to his boss
        ]
      });

      console.log('✅ Created Sample Leave Requests');
    }

    console.log('\n✨ Leaves seed completed successfully!');
    
  } catch (error) {
    console.error('❌ Error during leaves seed:', error);
  } finally {
    await mongoose.disconnect();
    console.log('👋 Disconnected from MongoDB');
  }
}

bootstrap();
