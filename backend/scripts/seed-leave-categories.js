/**
 * Seed script for Leave Categories
 * Run: node backend/scripts/seed-leave-categories.js
 */

const mongoose = require('mongoose');
require('dotenv').config({ path: __dirname + '/../.env' });

const leaveCategorySchema = new mongoose.Schema({
  name: { type: String, required: true, unique: true },
  description: String,
}, { timestamps: true });

const LeaveCategory = mongoose.model('LeaveCategory', leaveCategorySchema, 'leave_categories');

const categories = [
  {
    name: 'Paid Annual Leave',
    description: 'Annual vacation leave with full pay, deductible from annual balance',
  },
  {
    name: 'Sick/Medical Leave',
    description: 'Medical leave with or without pay depending on duration',
  },
  {
    name: 'Special Leave',
    description: 'Marriage, compassionate, mission leave - varies by policy',
  },
  {
    name: 'Unpaid Leave',
    description: 'Leave without pay, not deducted from annual balance',
  },
  {
    name: 'Maternity/Paternity Leave',
    description: 'Leave for new parents',
  },
];

async function seedLeaveCategories() {
  try {
    const dbUri = process.env.MONGO_URI || 'mongodb://localhost:27017/hr-system';
    console.log('Connecting to MongoDB...');
    await mongoose.connect(dbUri);
    console.log('Connected to MongoDB');

    // Clear existing categories
    await LeaveCategory.deleteMany({});
    console.log('Cleared existing leave categories');

    // Insert new categories
    const inserted = await LeaveCategory.insertMany(categories);
    console.log(`✅ Successfully seeded ${inserted.length} leave categories`);
    
    inserted.forEach(cat => {
      console.log(`   - ${cat.name} (ID: ${cat._id})`);
    });

    await mongoose.connection.close();
    console.log('Database connection closed');
  } catch (error) {
    console.error('❌ Error seeding leave categories:', error);
    process.exit(1);
  }
}

seedLeaveCategories();
