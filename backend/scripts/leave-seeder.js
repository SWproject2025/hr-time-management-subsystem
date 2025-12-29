const mongoose = require('mongoose');
const { MongoClient } = require('mongodb');

// MongoDB connection string
const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/hr-main';

/**
 * Leave Seeder Script
 * Initializes the Leaves module with default data:
 * - Leave categories
 * - Leave types
 * - Default policies
 * - Sample calendar
 */

async function seedLeaveData() {
  try {
    console.log('🔄 Connecting to MongoDB...');
    await mongoose.connect(MONGODB_URI);
    const db = mongoose.connection.db;

    console.log('✅ Connected to database\n');

    // ==================== LEAVE CATEGORIES ====================
    console.log('📂 Seeding Leave Categories...');
    
    const categories = [
      {
        code: 'PAID',
        name: 'Paid Leave',
        description: 'Leave types that are paid and deductible from annual balance',
      },
      {
        code: 'UNPAID',
        name: 'Unpaid Leave',
        description: 'Leave types without salary payment',
      },
      {
        code: 'SPECIAL',
        name: 'Special Leave',
        description: 'Special circumstances leave (maternity, paternity, etc.)',
      },
    ];

    const categoriesCollection = db.collection('leave_categories');
    await categoriesCollection.deleteMany({});
    const insertedCategories = await categoriesCollection.insertMany(categories);
    const categoryIds = Object.values(insertedCategories.insertedIds);

    console.log(`   ✓ Inserted ${categoryIds.length} categories\n`);

    // ==================== LEAVE TYPES ====================
    console.log('📋 Seeding Leave Types...');

    const leaveTypes = [
      {
        code: 'AL',
        name: 'Annual Leave',
        categoryId: categoryIds[0], // PAID
        description: 'Regular annual vacation leave',
        paid: true,
        deductible: true,
        requiresAttachment: false,
        isActive: true,
      },
      {
        code: 'SL',
        name: 'Sick Leave',
        categoryId: categoryIds[0], // PAID
        description: 'Medical/sick leave',
        paid: true,
        deductible: false,
        requiresAttachment: true,
        attachmentType: 'MEDICAL_CERTIFICATE',
        maxDurationDays: 15, // Max per request
        isActive: true,
      },
      {
        code: 'ML',
        name: 'Maternity Leave',
        categoryId: categoryIds[2], // SPECIAL
        description: 'Maternity leave for female employees',
        paid: true,
        deductible: false,
        requiresAttachment: true,
        attachmentType: 'MEDICAL_CERTIFICATE',
        isActive: true,
      },
      {
        code: 'PL',
        name: 'Paternity Leave',
        categoryId: categoryIds[2], // SPECIAL
        description: 'Paternity leave for male employees',
        paid: true,
        deductible: false,
        requiresAttachment: false,
        isActive: true,
      },
      {
        code: 'UL',
        name: 'Unpaid Leave',
        categoryId: categoryIds[1], // UNPAID
        description: 'Leave without pay',
        paid: false,
        deductible: true,
        requiresAttachment: false,
        isActive: true,
      },
      {
        code: 'EL',
        name: 'Emergency Leave',
        categoryId: categoryIds[0], // PAID
        description: 'Emergency personal leave',
        paid: true,
        deductible: true,
        requiresAttachment: false,
        maxDurationDays: 3,
        isActive: true,
      },
      {
        code: 'MSL',
        name: 'Mission Leave',
        categoryId: categoryIds[0], // PAID
        description: 'Official business mission',
        paid: true,
        deductible: false,
        requiresAttachment: false,
        isActive: true,
      },
      {
        code: 'MAR',
        name: 'Marriage Leave',
        categoryId: categoryIds[2], // SPECIAL
        description: 'Leave for marriage',
        paid: true,
        deductible: false,
        requiresAttachment: true,
        attachmentType: 'OTHER',
        maxDurationDays: 7,
        isActive: true,
      },
    ];

    const leaveTypesCollection = db.collection('leave_types');
    await leaveTypesCollection.deleteMany({});
    const insertedTypes = await leaveTypesCollection.insertMany(leaveTypes);
    const typeIds = Object.values(insertedTypes.insertedIds);

    console.log(`   ✓ Inserted ${typeIds.length} leave types\n`);

    // ==================== LEAVE POLICIES ====================
    console.log('⚙️  Seeding Leave Policies...');

    const policies = [
      {
        leaveTypeId: typeIds[0], // Annual Leave
        accrualMethod: 'MONTHLY',
        monthlyRate: 2.5, // 30 days per year
        yearlyRate: 30,
        carryForwardAllowed: true,
        maxCarryForward: 45, // Max cumulative balance
        roundingRule: 'ROUND_DOWN',
        minNoticeDays: 3,
        maxConsecutiveDays: 30,
        eligibility: {
          minTenureMonths: 0,
          positionsAllowed: [],
          contractTypesAllowed: ['FULL_TIME', 'PART_TIME'],
        },
      },
      {
        leaveTypeId: typeIds[1], // Sick Leave
        accrualMethod: 'YEARLY',
        monthlyRate: 0,
        yearlyRate: 15, // 15 days per year
        carryForwardAllowed: false,
        maxCarryForward: 0,
        roundingRule: 'NONE',
        minNoticeDays: 0, // Can be retroactive
        eligibility: {
          minTenureMonths: 0,
          positionsAllowed: [],
          contractTypesAllowed: ['FULL_TIME', 'PART_TIME'],
        },
      },
{
        leaveTypeId: typeIds[2], // Maternity Leave
        accrualMethod: 'ON_DEMAND',
        monthlyRate: 0,
        yearlyRate: 90, // 90 days
        carryForwardAllowed: false,
        maxCarryForward: 0,
        roundingRule: 'NONE',
        minNoticeDays: 7,
        eligibility: {
          minTenureMonths: 6, // 6 months tenure required
          positionsAllowed: [],
          contractTypesAllowed: ['FULL_TIME'],
        },
      },
      {
        leaveTypeId: typeIds[3], // Paternity Leave
        accrualMethod: 'ON_DEMAND',
        monthlyRate: 0,
        yearlyRate: 3, // 3 days
        carryForwardAllowed: false,
        maxCarryForward: 0,
        roundingRule: 'NONE',
        minNoticeDays: 3,
        eligibility: {
          minTenureMonths: 6,
          positionsAllowed: [],
          contractTypesAllowed: ['FULL_TIME'],
        },
      },
      {
        leaveTypeId: typeIds[4], // Unpaid Leave
        accrualMethod: 'ON_DEMAND',
        monthlyRate: 0,
        yearlyRate: 999, // Unlimited (enforced by approval)
        carryForwardAllowed: false,
        maxCarryForward: 0,
        roundingRule: 'NONE',
        minNoticeDays: 7,
        eligibility: {
          minTenureMonths: 3,
          positionsAllowed: [],
          contractTypesAllowed: ['FULL_TIME', 'PART_TIME'],
        },
      },
      {
        leaveTypeId: typeIds[5], // Emergency Leave
        accrualMethod: 'YEARLY',
        monthlyRate: 0,
        yearlyRate: 5, // 5 days per year
        carryForwardAllowed: false,
        maxCarryForward: 0,
        roundingRule: 'NONE',
        minNoticeDays: 0, // Emergency
        eligibility: {
          minTenureMonths: 0,
          positionsAllowed: [],
          contractTypesAllowed: ['FULL_TIME', 'PART_TIME'],
        },
      },
      {
        leaveTypeId: typeIds[6], // Mission Leave
        accrualMethod: 'ON_DEMAND',
        monthlyRate: 0,
        yearlyRate: 999, // Unlimited (workrelated)
        carryForwardAllowed: false,
        maxCarryForward: 0,
        roundingRule: 'NONE',
        minNoticeDays: 3,
        eligibility: {
          minTenureMonths: 0,
          positionsAllowed: [],
          contractTypesAllowed: ['FULL_TIME'],
        },
      },
      {
        leaveTypeId: typeIds[7], // Marriage Leave
        accrualMethod: 'ON_DEMAND',
        monthlyRate: 0,
        yearlyRate: 7, // 7 days
        carryForwardAllowed: false,
        maxCarryForward: 0,
        roundingRule: 'NONE',
        minNoticeDays: 14,
        eligibility: {
          minTenureMonths: 6,
          positionsAllowed: [],
          contractTypesAllowed: ['FULL_TIME', 'PART_TIME'],
        },
      },
    ];

    const policiesCollection = db.collection('leave_policies');
    await policiesCollection.deleteMany({});
    await policiesCollection.insertMany(policies);

    console.log(`   ✓ Inserted ${policies.length} policies\n`);

    // ==================== CALENDAR ====================
    console.log('📅 Seeding Calendar...');

    const currentYear = new Date().getFullYear();
    const nextYear = currentYear + 1;

    const calendars = [
      {
        year: currentYear,
        holidays: [
          { date: new Date(currentYear, 0, 1), name: "New Year's Day" },
          { date: new Date(currentYear, 4, 1), name: 'Labor Day' },
          { date: new Date(currentYear, 6, 23), name: 'Revolution Day' },
          { date: new Date(currentYear, 9, 6), name: 'Armed Forces Day' },
        ],
        blockedPeriods: [],
      },
      {
        year: nextYear,
        holidays: [
          { date: new Date(nextYear, 0, 1), name: "New Year's Day" },
          { date: new Date(nextYear, 4, 1), name: 'Labor Day' },
          { date: new Date(nextYear, 6, 23), name: 'Revolution Day' },
          { date: new Date(nextYear, 9, 6), name: 'Armed Forces Day' },
        ],
        blockedPeriods: [],
      },
    ];

    const calendarsCollection = db.collection('calendars');
    await calendarsCollection.deleteMany({});
    await calendarsCollection.insertMany(calendars);

    console.log(`   ✓ Inserted ${calendars.length} calendar years\n`);

    console.log('✨ Leave data seeding completed successfully!\n');
    console.log('Summary:');
    console.log(`  - ${categories.length} Leave Categories`);
    console.log(`  - ${leaveTypes.length} Leave Types`);
    console.log(`  - ${policies.length} Leave Policies`);
    console.log(`  - ${calendars.length} Calendar Years`);

  } catch (error) {
    console.error('❌ Error seeding leave data:', error);
    process.exit(1);
  } finally {
    await mongoose.connection.close();
    console.log('\n🔌 Database connection closed');
  }
}

// Run seeder
seedLeaveData();
