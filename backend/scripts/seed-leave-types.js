/**
 * Seed Script for Leave Types and Categories
 * Creates initial leave types for testing the leaves management system
 */

const mongoose = require('mongoose');

const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/hr-main';

// Leave Category Schema
const leaveCategorySchema = new mongoose.Schema({
  code: { type: String, required: true, unique: true },
  name: { type: String, required: true },
  description: String,
}, { timestamps: true });

// Leave Type Schema  
const leaveTypeSchema = new mongoose.Schema({
  code: { type: String, required: true, unique: true },
  name: { type: String, required: true },
  categoryId: { type: mongoose.Schema.Types.ObjectId, ref: 'LeaveCategory', required: true },
  description: String,
  paid: { type: Boolean, default: true },
  deductible: { type: Boolean, default: true },
  requiresAttachment: { type: Boolean, default: false },
  attachmentType: String,
  minTenureMonths: { type: Number, default: null },
  maxDurationDays: { type: Number, default: null },
  isActive: { type: Boolean, default: true },
}, { collection: 'leave_types', timestamps: true });

const LeaveCategory = mongoose.model('LeaveCategory', leaveCategorySchema, 'leave_categories');
const LeaveType = mongoose.model('LeaveType', leaveTypeSchema, 'leave_types');

async function seedLeaveTypes() {
  try {
    console.log('🌱 Starting leave types seed process...\n');

    await mongoose.connect(MONGODB_URI);
    console.log('✅ Connected to MongoDB\n');

    // Clear existing data
    console.log('🗑️  Clearing existing leave data...');
    await LeaveCategory.deleteMany({});
    await LeaveType.deleteMany({});
    console.log('✅ Cleared old data\n');

    // Create categories
    console.log('📋 Creating leave categories...');
    const categories = await LeaveCategory.insertMany([
      { code: 'ANNUAL', name: 'Annual Leave', description: 'Regular annual vacation leave' },
      { code: 'SICK', name: 'Sick Leave', description: 'Medical and health-related leave' },
      { code: 'PERSONAL', name: 'Personal Leave', description: 'Personal matters and family events' },
      { code: 'EMERGENCY', name: 'Emergency Leave', description: 'Urgent and unforeseen situations' },
    ]);
    console.log(`✅ Created ${categories.length} categories\n`);

    // Create leave types
    console.log('📝 Creating leave types...');
    const leaveTypes = await LeaveType.insertMany([
      {
        code: 'AL',
        name: 'Annual Leave',
        categoryId: categories[0]._id,
        description: 'Standard annual vacation leave',
        paid: true,
        deductible: true,
        requiresAttachment: false,
        maxDurationDays: 30,
        isActive: true,
      },
      {
        code: 'SL',
        name: 'Sick Leave',
        categoryId: categories[1]._id,
        description: 'Leave for illness or medical appointments',
        paid: true,
        deductible: true,
        requiresAttachment: true,
        maxDurationDays: 15,
        isActive: true,
      },
      {
        code: 'ML',
        name: 'Maternity Leave',
        categoryId: categories[2]._id,
        description: 'Maternity leave for new mothers',
        paid: true,
        deductible: false,
        requiresAttachment: true,
        minTenureMonths: 6,
        maxDurationDays: 90,
        isActive: true,
      },
      {
        code: 'PL',
        name: 'Paternity Leave',
        categoryId: categories[2]._id,
        description: 'Paternity leave for new fathers',
        paid: true,
        deductible: false,
        requiresAttachment: true,
        maxDurationDays: 5,
        isActive: true,
      },
      {
        code: 'UL',
        name: 'Unpaid Leave',
        categoryId: categories[2]._id,
        description: 'Unpaid personal leave',
        paid: false,
        deductible: false,
        requiresAttachment: false,
        maxDurationDays: 30,
        isActive: true,
      },
      {
        code: 'EL',
        name: 'Emergency Leave',
        categoryId: categories[3]._id,
        description: 'Emergency situations requiring immediate attention',
        paid: true,
        deductible: true,
        requiresAttachment: false,
        maxDurationDays: 3,
        isActive: true,
      },
    ]);
    console.log(`✅ Created ${leaveTypes.length} leave types\n`);

    console.log('✨ Seed completed successfully!\n');
    console.log('📊 Summary:');
    console.log(`  - Categories: ${categories.length}`);
    console.log(`  - Leave Types: ${leaveTypes.length}`);

    console.log('\n🔍 Created Leave Types:');
    leaveTypes.forEach(type => {
      console.log(`  - ${type.code}: ${type.name} (${type.paid ? 'Paid' : 'Unpaid'})`);
    });

  } catch (error) {
    console.error('❌ Error during seed:', error);
    throw error;
  } finally {
    await mongoose.disconnect();
    console.log('\n👋 Disconnected from MongoDB');
  }
}

seedLeaveTypes();
