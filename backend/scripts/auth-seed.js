/**
 * Simplified Seed Script for Auth Only
 *
 * Creates 4 users with their roles:
 * 1. Payroll Specialist
 * 2. Payroll Manager
 * 3. Finance Staff
 * 4. Department Employee
 *
 * All users have the same password: 123456
 *
 * Usage:
 *   node scripts/auth-seed.js
 *
 * WARNING: This script will DELETE all existing data in:
 *   - employee_profiles
 *   - employee_system_roles
 */

const mongoose = require('mongoose');
const bcrypt = require('bcrypt');

// MongoDB connection
const MONGODB_URI =
  process.env.MONGODB_URI || 'mongodb://localhost:27017/hr-main';

// Employee Profile Schema (matching UserProfileBase + EmployeeProfile)
const employeeProfileSchema = new mongoose.Schema(
  {
    // From UserProfileBase
    firstName: { type: String, required: true },
    middleName: { type: String },
    lastName: { type: String, required: true },
    fullName: { type: String },
    nationalId: { type: String, required: true, unique: true },
    password: { type: String },
    gender: { type: String },
    maritalStatus: { type: String },
    dateOfBirth: { type: Date },
    personalEmail: { type: String },
    mobilePhone: { type: String },
    homePhone: { type: String },
    address: {
      city: { type: String },
      streetAddress: { type: String },
      country: { type: String },
    },
    profilePictureUrl: { type: String },
    accessProfileId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'EmployeeSystemRole',
    },

    // From EmployeeProfile
    employeeNumber: { type: String, required: true, unique: true },
    dateOfHire: { type: Date, required: true }, // ✅ REQUIRED FIELD
    workEmail: { type: String },
    biography: { type: String },
    contractStartDate: { type: Date },
    contractEndDate: { type: Date },
    bankName: { type: String },
    bankAccountNumber: { type: String },
    contractType: { type: String },
    workType: { type: String },
    status: { type: String, default: 'ACTIVE' },
    statusEffectiveFrom: { type: Date, default: () => new Date() },
    primaryPositionId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Position',
    },
    primaryDepartmentId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Department',
    },
    supervisorPositionId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Position',
    },
    payGradeId: { type: mongoose.Schema.Types.ObjectId },
    lastAppraisalRecordId: { type: mongoose.Schema.Types.ObjectId },
    lastAppraisalCycleId: { type: mongoose.Schema.Types.ObjectId },
    lastAppraisalTemplateId: { type: mongoose.Schema.Types.ObjectId },
    lastAppraisalDate: { type: Date },
    lastAppraisalScore: { type: Number },
    lastAppraisalRatingLabel: { type: String },
    lastAppraisalScaleType: { type: String },
    lastDevelopmentPlanSummary: { type: String },
  },
  { timestamps: true },
);

// Employee System Role Schema
const employeeSystemRoleSchema = new mongoose.Schema(
  {
    employeeProfileId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'EmployeeProfile',
      required: true,
    },
    roles: [{ type: String }],
    permissions: [{ type: String }],
    isActive: { type: Boolean, default: true },
  },
  { timestamps: true },
);

const EmployeeProfile = mongoose.model(
  'EmployeeProfile',
  employeeProfileSchema,
  'employee_profiles',
);
const EmployeeSystemRole = mongoose.model(
  'EmployeeSystemRole',
  employeeSystemRoleSchema,
  'employee_system_roles',
);

// Helper function to generate employee number
function generateEmployeeNumber() {
  const timestamp = Date.now().toString().slice(-8);
  const random = Math.floor(Math.random() * 1000)
    .toString()
    .padStart(3, '0');
  return `EMP${timestamp}${random}`;
}

// Helper function to hash password
async function hashPassword(password) {
  const salt = await bcrypt.genSalt(10);
  return bcrypt.hash(password, salt);
}

async function bootstrap() {
  try {
    console.log('🌱 Starting simplified auth seed process...\n');

    // Connect to MongoDB
    console.log('📡 Connecting to MongoDB...');
    await mongoose.connect(MONGODB_URI);
    console.log('✅ Connected to MongoDB\n');

    // ==================== 1. Clear Existing Auth Data ====================
    console.log('🗑️  Clearing existing auth data...');

    const deleteResults = await Promise.all([
      EmployeeProfile.deleteMany({}),
      EmployeeSystemRole.deleteMany({}),
    ]);

    const totalDeleted = deleteResults.reduce(
      (sum, result) => sum + (result.deletedCount || 0),
      0,
    );
    console.log(`  ✅ Cleared ${totalDeleted} documents\n`);

    // ==================== 2. Create Employees ====================
    console.log('📝 Creating employees...');

    // Default hire date for all employees
    const defaultHireDate = new Date('2024-01-01');

    const employees = [
      {
        firstName: 'Sarah',
        lastName: 'Smith',
        nationalId: '2345678901234',
        workEmail: 'sarah.smith@company.com',
        personalEmail: 'sarah.smith.personal@gmail.com',
        password: '123456',
        status: 'ACTIVE',
        dateOfHire: defaultHireDate, // ✅ REQUIRED
      },
      {
        firstName: 'Michael',
        lastName: 'Johnson',
        nationalId: '3456789012345',
        workEmail: 'michael.johnson@company.com',
        personalEmail: 'michael.johnson.personal@gmail.com',
        password: '123456',
        status: 'ACTIVE',
        dateOfHire: defaultHireDate, // ✅ REQUIRED
      },
      {
        firstName: 'Emily',
        lastName: 'Williams',
        nationalId: '4567890123456',
        workEmail: 'emily.williams@company.com',
        personalEmail: 'emily.williams.personal@gmail.com',
        password: '123456',
        status: 'ACTIVE',
        dateOfHire: defaultHireDate, // ✅ REQUIRED
      },
      {
        firstName: 'John',
        lastName: 'Doe',
        nationalId: '1234567890123',
        workEmail: 'john.doe@company.com',
        personalEmail: 'john.doe.personal@gmail.com',
        password: '123456',
        status: 'ACTIVE',
        dateOfHire: defaultHireDate, // ✅ REQUIRED
      },
      // ==================== LEAVES SUBSYSTEM USERS ====================
      {
        firstName: 'David',
        lastName: 'Manager',
        nationalId: '5678901234567',
        workEmail: 'david.manager@company.com',
        personalEmail: 'david.manager.personal@gmail.com',
        password: '123456',
        status: 'ACTIVE',
        dateOfHire: defaultHireDate,
      },
      {
        firstName: 'Alice',
        lastName: 'HRAdmin',
        nationalId: '6789012345678',
        workEmail: 'alice.hradmin@company.com',
        personalEmail: 'alice.hradmin.personal@gmail.com',
        password: '123456',
        status: 'ACTIVE',
        dateOfHire: defaultHireDate,
      },
      {
        firstName: 'Bob',
        lastName: 'HRManager',
        nationalId: '7890123456789',
        workEmail: 'bob.hrmanager@company.com',
        personalEmail: 'bob.hrmanager.personal@gmail.com',
        password: '123456',
        status: 'ACTIVE',
        dateOfHire: defaultHireDate,
      },
    ];

    const createdEmployees = [];
    for (const empData of employees) {
      const hashedPassword = await hashPassword(empData.password);
      const employeeNumber = generateEmployeeNumber();

      const employee = await EmployeeProfile.create({
        ...empData,
        password: hashedPassword,
        employeeNumber,
      });

      console.log(
        `  ✅ Created employee: ${employee.workEmail} (${employee.employeeNumber})`,
      );
      createdEmployees.push(employee);
    }

    // ==================== 3. Create Employee System Roles ====================
    console.log('\n👤 Creating employee system roles...');

    const roles = [
      {
        employee: createdEmployees[0],
        roles: ['PAYROLL_SPECIALIST'],
        description: 'Payroll Specialist - Sarah Smith',
      },
      {
        employee: createdEmployees[1],
        roles: ['PAYROLL_MANAGER'],
        description: 'Payroll Manager - Michael Johnson',
      },
      {
        employee: createdEmployees[2],
        roles: ['FINANCE_STAFF'],
        description: 'Finance Staff - Emily Williams',
      },
      {
        employee: createdEmployees[3],
        roles: ['DEPARTMENT_EMPLOYEE'],
        description: 'Department Employee - John Doe',
      },
      // ==================== LEAVES SUBSYSTEM ROLES ====================
      {
        employee: createdEmployees[4],
        roles: ['DEPARTMENT_HEAD'],
        description: 'Department Head/Manager - David Manager',
      },
      {
        employee: createdEmployees[5],
        roles: ['HR_ADMIN'],
        description: 'HR Admin - Alice HRAdmin',
      },
      {
        employee: createdEmployees[6],
        roles: ['HR_MANAGER'],
        description: 'HR Manager - Bob HRManager',
      },
    ];

    for (const roleData of roles) {
      await EmployeeSystemRole.create({
        employeeProfileId: roleData.employee._id,
        roles: roleData.roles,
        permissions: [],
        isActive: true,
      });
      console.log(`  ✅ ${roleData.description}`);
    }

    // ==================== Summary ====================
    console.log('\n✨ Seed process completed successfully!');
    console.log('\n📋 Summary:');
    console.log(`  - Total employees created: ${createdEmployees.length}`);
    console.log(`  - Total roles assigned: ${roles.length}`);
    console.log(
      `  - All employees hired on: ${defaultHireDate.toLocaleDateString()}`,
    );

    console.log('\n🔑 Login Credentials (Password: 123456 for all):');
    console.log('\n  1. Payroll Specialist:');
    console.log('     Email: sarah.smith@company.com');
    console.log('     Password: 123456');
    console.log('     Role: PAYROLL_SPECIALIST');

    console.log('\n  2. Payroll Manager:');
    console.log('     Email: michael.johnson@company.com');
    console.log('     Password: 123456');
    console.log('     Role: PAYROLL_MANAGER');

    console.log('\n  3. Finance Staff:');
    console.log('     Email: emily.williams@company.com');
    console.log('     Password: 123456');
    console.log('     Role: FINANCE_STAFF');

    console.log('\n  4. Department Employee:');
    console.log('     Email: john.doe@company.com');
    console.log('     Password: 123456');
    console.log('     Role: DEPARTMENT_EMPLOYEE');

    console.log(
      '\n💡 You can now login with any of these accounts using password: 123456',
    );
  } catch (error) {
    console.error('❌ Error during seed process:', error);
    throw error;
  } finally {
    await mongoose.disconnect();
    console.log('\n👋 Disconnected from MongoDB');
  }
}

bootstrap();
