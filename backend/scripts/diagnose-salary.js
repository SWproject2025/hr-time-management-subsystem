// MongoDB Shell Diagnostic Script
// Run with: mongosh mongodb://localhost:27017/hr-main diagnose-salary.js

print('========================================');
print('🔍 SALARY DATA DIAGNOSTIC SCRIPT');
print('========================================\n');

// Switch to your database
db = db.getSiblingDB('hr-main');

// 1. CHECK EMPLOYEE STRUCTURE
print('1️⃣ CHECKING EMPLOYEE DATA STRUCTURE\n');
print('─────────────────────────────────────────\n');

const sampleEmployee = db.employee_profiles.findOne();
if (sampleEmployee) {
  print('Sample Employee Document:');
  print('─────────────────────────────────────────');
  printjson({
    _id: sampleEmployee._id,
    employeeNumber: sampleEmployee.employeeNumber,
    firstName: sampleEmployee.firstName,
    lastName: sampleEmployee.lastName,
    status: sampleEmployee.status,
    payGradeId: sampleEmployee.payGradeId,
    baseSalary: sampleEmployee.baseSalary || '❌ MISSING',
    housingAllowance: sampleEmployee.housingAllowance || '❌ MISSING',
    transportationAllowance:
      sampleEmployee.transportationAllowance || '❌ MISSING',
    bankName: sampleEmployee.bankName || '❌ MISSING',
    bankAccountNumber: sampleEmployee.bankAccountNumber || '❌ MISSING',
    bankAccountDetails: sampleEmployee.bankAccountDetails || '❌ MISSING',
  });
  print('\n');
} else {
  print('❌ NO EMPLOYEES FOUND!\n');
}

// 2. CHECK HOW MANY EMPLOYEES HAVE baseSalary FIELD
print('2️⃣ CHECKING baseSalary FIELD EXISTENCE\n');
print('─────────────────────────────────────────\n');

const totalEmployees = db.employee_profiles.countDocuments({});
const employeesWithBaseSalary = db.employee_profiles.countDocuments({
  baseSalary: { $exists: true, $ne: null },
});
const employeesWithoutBaseSalary = totalEmployees - employeesWithBaseSalary;

print(`Total Employees: ${totalEmployees}`);
print(`✅ With baseSalary field: ${employeesWithBaseSalary}`);
print(`❌ Without baseSalary field: ${employeesWithoutBaseSalary}\n`);

// 3. CHECK ACTIVE vs INACTIVE
print('3️⃣ CHECKING EMPLOYEE STATUS\n');
print('─────────────────────────────────────────\n');

const activeCount = db.employee_profiles.countDocuments({ status: 'ACTIVE' });
const inactiveCount = db.employee_profiles.countDocuments({
  status: 'INACTIVE',
});

print(`✅ ACTIVE: ${activeCount}`);
print(`❌ INACTIVE: ${inactiveCount}\n`);

// 4. CHECK PAYGRADE RELATIONSHIP
print('4️⃣ CHECKING PAYGRADE RELATIONSHIP\n');
print('─────────────────────────────────────────\n');

const employeesWithPayGrade = db.employee_profiles.countDocuments({
  payGradeId: { $exists: true, $ne: null },
});
print(`Employees with payGradeId: ${employeesWithPayGrade}`);

// Sample PayGrade lookup
if (sampleEmployee && sampleEmployee.payGradeId) {
  print('\nSample PayGrade Lookup:');
  print('─────────────────────────────────────────');
  const payGrade = db.paygrade.findOne({ _id: sampleEmployee.payGradeId });
  if (payGrade) {
    printjson({
      _id: payGrade._id,
      grade: payGrade.grade,
      baseSalary: payGrade.baseSalary,
      grossSalary: payGrade.grossSalary,
    });
  } else {
    print('❌ PayGrade NOT FOUND for this employee!');
  }
}
print('\n');

// 5. CHECK BANK DETAILS STRUCTURE
print('5️⃣ CHECKING BANK DETAILS STRUCTURE\n');
print('─────────────────────────────────────────\n');

const employeesWithBankName = db.employee_profiles.countDocuments({
  bankName: { $exists: true, $ne: null },
});
const employeesWithBankDetails = db.employee_profiles.countDocuments({
  'bankAccountDetails.accountNumber': { $exists: true, $ne: null },
});

print(`Employees with 'bankName' field: ${employeesWithBankName}`);
print(
  `Employees with 'bankAccountDetails.accountNumber': ${employeesWithBankDetails}`,
);

if (employeesWithBankName > 0) {
  print(
    '\n⚠️  Bank data is stored as: bankName + bankAccountNumber (flat structure)',
  );
}
if (employeesWithBankDetails > 0) {
  print(
    '\n⚠️  Bank data is stored as: bankAccountDetails.bankName + bankAccountDetails.accountNumber (nested structure)',
  );
}
print('\n');

// 6. SHOW AGGREGATION PIPELINE EXAMPLE
print('6️⃣ SUGGESTED AGGREGATION PIPELINE\n');
print('─────────────────────────────────────────\n');
print('To properly join employee with payGrade, use:\n');

const aggregationExample = [
  {
    $match: { status: 'ACTIVE' },
  },
  {
    $lookup: {
      from: 'paygrade',
      localField: 'payGradeId',
      foreignField: '_id',
      as: 'payGrade',
    },
  },
  {
    $unwind: {
      path: '$payGrade',
      preserveNullAndEmptyArrays: true,
    },
  },
  {
    $addFields: {
      baseSalary: { $ifNull: ['$baseSalary', '$payGrade.baseSalary'] },
    },
  },
  {
    $project: {
      _id: 1,
      employeeNumber: 1,
      firstName: 1,
      lastName: 1,
      baseSalary: 1,
      'payGrade.grade': 1,
      bankName: 1,
      bankAccountNumber: 1,
    },
  },
  { $limit: 3 },
];

print('db.employee_profiles.aggregate(');
printjson(aggregationExample);
print(')\n');

print('Running this aggregation on first 3 employees:\n');
print('─────────────────────────────────────────\n');

const results = db.employee_profiles.aggregate(aggregationExample).toArray();
results.forEach((emp, idx) => {
  print(`Employee ${idx + 1}:`);
  printjson(emp);
  print('');
});

// 7. SUMMARY & RECOMMENDATIONS
print('\n========================================');
print('📋 SUMMARY & RECOMMENDATIONS');
print('========================================\n');

if (employeesWithoutBaseSalary > 0 && employeesWithPayGrade > 0) {
  print('⚠️  ISSUE DETECTED:');
  print(
    `   ${employeesWithoutBaseSalary} employees don't have 'baseSalary' field`,
  );
  print('   but they have payGradeId references.\n');
  print('✅ SOLUTION:');
  print('   Option A: Use aggregation with $lookup to join payGrade');
  print('   Option B: Update seed script to add baseSalary to employees');
  print('   Option C: Fetch payGrade in service when baseSalary is missing\n');
}

if (employeesWithBankName > 0 && employeesWithBankDetails === 0) {
  print('⚠️  BANK DETAILS MISMATCH:');
  print('   Code expects: employee.bankAccountDetails.accountNumber');
  print('   Database has: employee.bankAccountNumber (flat structure)\n');
  print('✅ FIX:');
  print('   Update flagAnomalies() to check: employee.bankAccountNumber');
  print('   instead of: employee.bankAccountDetails.accountNumber\n');
}

if (inactiveCount > 0) {
  print(`⚠️  STATUS FILTER:`);
  print(`   ${inactiveCount} employees are INACTIVE`);
  print("   Make sure your query filters by status: 'ACTIVE'\n");
}

print('========================================');
print('✅ DIAGNOSTIC COMPLETE!');
print('========================================\n');
