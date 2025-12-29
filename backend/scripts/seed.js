// scripts/clean-and-seed.js
// Run with: npm run clean-and-seed

import { MongoClient, ObjectId } from 'mongodb';

// Load from environment or use defaults
const MONGO_URI = process.env.MONGO_URI || 'mongodb://localhost:27017';
const DATABASE_NAME = process.env.DATABASE_NAME || 'hr-main';

// ============================================
// CLEANUP FUNCTION
// ============================================

async function cleanup(db) {
  console.log('🧹 STARTING COMPLETE DATABASE CLEANUP...\n');

  try {
    // Get all collections
    const collections = await db.listCollections().toArray();

    if (collections.length === 0) {
      console.log('✅ Database is already empty\n');
      return;
    }

    console.log(`📋 Found ${collections.length} collections to drop:`);
    collections.forEach((col) => console.log(`   • ${col.name}`));
    console.log('');

    // Drop each collection
    for (const collection of collections) {
      await db.collection(collection.name).drop();
      console.log(`✅ Dropped collection: ${collection.name}`);
    }

    console.log('\n✅ ALL COLLECTIONS DROPPED SUCCESSFULLY!\n');
    console.log('═══════════════════════════════════════════════════════\n');
  } catch (error) {
    console.error('❌ Error during cleanup:', error);
    throw error;
  }
}

// ============================================
// DATA GENERATORS
// ============================================

const randomDate = (start, end) => {
  return new Date(
    start.getTime() + Math.random() * (end.getTime() - start.getTime()),
  );
};

const randomNumber = (min, max) => {
  return Math.floor(Math.random() * (max - min + 1) + min);
};

const randomElement = (array) => {
  return array[Math.floor(Math.random() * array.length)];
};

// ============================================
// REFERENCE DATA
// ============================================

const EGYPTIAN_DATA = {
  cities: [
    'Cairo',
    'Alexandria',
    'Giza',
    'Port Said',
    'Suez',
    'Luxor',
    'Aswan',
    'Mansoura',
    'Tanta',
    'Asyut',
    'Ismailia',
    'Faiyum',
  ],

  streets: [
    'Tahrir Street',
    'Ramses Street',
    'Salah Salem Street',
    'El Nasr Road',
    'El Haram Street',
    'Corniche El Nile',
    'Maadi Ring Road',
    'Mohandessin Street',
    'Zamalek Avenue',
    'Heliopolis Road',
    'Nasr City Boulevard',
    'October 6th Street',
  ],

  banks: [
    'National Bank of Egypt',
    'Banque Misr',
    'Commercial International Bank',
    'Arab African International Bank',
    'Egyptian Gulf Bank',
    'Banque du Caire',
    'QNB Alahli',
    'HSBC Egypt',
    'Bank Audi',
    'Credit Agricole Egypt',
  ],

  firstNames: {
    male: [
      'Ahmed',
      'Mohamed',
      'Mahmoud',
      'Ali',
      'Hassan',
      'Youssef',
      'Khaled',
      'Omar',
      'Ibrahim',
      'Amr',
      'Tarek',
      'Karim',
      'Hossam',
      'Sherif',
    ],
    female: [
      'Fatima',
      'Nour',
      'Maryam',
      'Layla',
      'Yasmin',
      'Sara',
      'Hana',
      'Amira',
      'Nadia',
      'Dina',
      'Salma',
      'Mariam',
      'Aya',
      'Noha',
    ],
  },

  lastNames: [
    'Hassan',
    'Mohamed',
    'Ali',
    'Ibrahim',
    'Khalil',
    'Mahmoud',
    'Farouk',
    'Nasser',
    'Salem',
    'Kamal',
    'Abdel-Rahman',
    'El-Sayed',
    'Mostafa',
    'Youssef',
    'Rashid',
    'Gamal',
    'Fouad',
    'Zaki',
    'Amin',
    'Fathy',
    'Saber',
    'Hakim',
    'Shaker',
    'Nabil',
  ],
};

const DEPARTMENTS = [
  { name: 'Engineering', code: 'ENG' },
  { name: 'Human Resources', code: 'HR' },
  { name: 'Finance', code: 'FIN' },
  { name: 'Marketing', code: 'MKT' },
  { name: 'Sales', code: 'SAL' },
  { name: 'Operations', code: 'OPS' },
];

const POSITIONS = [
  {
    name: 'Junior Software Engineer',
    code: 'JSE',
    level: 'Junior',
    department: 'Engineering',
  },
  {
    name: 'Software Engineer',
    code: 'SE',
    level: 'Mid',
    department: 'Engineering',
  },
  {
    name: 'Senior Software Engineer',
    code: 'SSE',
    level: 'Senior',
    department: 'Engineering',
  },
  {
    name: 'Lead Engineer',
    code: 'LE',
    level: 'Lead',
    department: 'Engineering',
  },
  {
    name: 'HR Specialist',
    code: 'HRS',
    level: 'Mid',
    department: 'Human Resources',
  },
  {
    name: 'HR Manager',
    code: 'HRM',
    level: 'Senior',
    department: 'Human Resources',
  },
  {
    name: 'Financial Analyst',
    code: 'FA',
    level: 'Mid',
    department: 'Finance',
  },
  {
    name: 'Finance Manager',
    code: 'FM',
    level: 'Senior',
    department: 'Finance',
  },
  {
    name: 'Marketing Coordinator',
    code: 'MC',
    level: 'Junior',
    department: 'Marketing',
  },
  {
    name: 'Marketing Manager',
    code: 'MM',
    level: 'Senior',
    department: 'Marketing',
  },
  {
    name: 'Sales Representative',
    code: 'SR',
    level: 'Junior',
    department: 'Sales',
  },
  {
    name: 'Operations Manager',
    code: 'OM',
    level: 'Senior',
    department: 'Operations',
  },
];

// ============================================
// EMPLOYEE GENERATOR
// ============================================

function generateEmployee(index, options = {}) {
  const {
    payGradeIds = [],
    departmentIds = [],
    positionIds = [],
    hasBankDetails = true,
  } = options;

  const isMale = index % 2 === 0;
  const firstName = randomElement(
    isMale ? EGYPTIAN_DATA.firstNames.male : EGYPTIAN_DATA.firstNames.female,
  );
  const lastName = randomElement(EGYPTIAN_DATA.lastNames);
  const fullName = `${firstName} ${lastName}`;

  const birthYear = randomNumber(85, 99);
  const nationalId = `2${birthYear}${String(randomNumber(1, 12)).padStart(2, '0')}${String(randomNumber(1, 35)).padStart(2, '0')}${String(randomNumber(10000, 99999))}${randomNumber(0, 9)}`;

  const city = randomElement(EGYPTIAN_DATA.cities);
  const streetAddress = `${randomNumber(1, 999)} ${randomElement(EGYPTIAN_DATA.streets)}`;

  const employee = {
    employeeNumber: `EMP-${String(index + 1).padStart(4, '0')}`,
    nationalId,
    firstName,
    lastName,
    fullName,
    personalEmail: `${firstName.toLowerCase()}.${lastName.toLowerCase()}@email.com`,
    workEmail: `${firstName.toLowerCase()}.${lastName.toLowerCase()}@company.com`,
    mobilePhone: `+2010${randomNumber(10000000, 99999999)}`,
    homePhone: `+202${randomNumber(20000000, 29999999)}`,
    address: {
      city,
      streetAddress,
      country: 'Egypt',
    },
    dateOfBirth: new Date(1985 + (index % 15), index % 12, (index % 28) + 1),
    gender: isMale ? 'MALE' : 'FEMALE',
    maritalStatus: randomElement(['SINGLE', 'MARRIED', 'DIVORCED']),
    dateOfHire: randomDate(new Date('2018-01-01'), new Date('2023-12-31')),
    contractStartDate: randomDate(
      new Date('2018-01-01'),
      new Date('2023-12-31'),
    ),
    contractEndDate: null,
    contractType: randomElement(['FULL_TIME_CONTRACT', 'PART_TIME_CONTRACT']),
    workType: randomElement(['FULL_TIME', 'PART_TIME']),
    status: index >= 18 ? 'INACTIVE' : 'ACTIVE',
    statusEffectiveFrom: new Date(),
    ...(hasBankDetails
      ? {
          bankName: randomElement(EGYPTIAN_DATA.banks),
          bankAccountNumber: String(randomNumber(1000000000000, 9999999999999)),
        }
      : {
          bankName: null,
          bankAccountNumber: null,
        }),
    payGradeId: payGradeIds.length > 0 ? randomElement(payGradeIds) : null,
    primaryDepartmentId:
      departmentIds.length > 0 ? randomElement(departmentIds) : null,
    primaryPositionId:
      positionIds.length > 0 ? randomElement(positionIds) : null,
    biography: `${fullName} is a dedicated professional with expertise in their field. Joined the company in ${new Date().getFullYear() - randomNumber(1, 5)}.`,
    profilePictureUrl: `https://i.pravatar.cc/150?u=${nationalId}`,
    createdAt: new Date(),
    updatedAt: new Date(),
  };

  return employee;
}

// ============================================
// EXCEPTION GENERATOR
// ============================================

function generateExceptions(employee, allEmployees) {
  const exceptions = [];

  if (!employee.bankName || !employee.bankAccountNumber) {
    exceptions.push({
      type: 'BANK_DETAILS_MISSING',
      severity: 'HIGH',
      description: `Missing bank account details for ${employee.fullName}. Cannot process payment without valid banking information.`,
      status: 'open',
      createdAt: new Date(),
    });
  }

  const empIndex = allEmployees.indexOf(employee);

  if (empIndex % 7 === 0) {
    exceptions.push({
      type: 'ATTENDANCE_INCOMPLETE',
      severity: 'MEDIUM',
      description: `Attendance records incomplete for the current payroll period. ${randomNumber(2, 5)} days missing.`,
      status: 'open',
      createdAt: new Date(),
    });
  }

  if (empIndex % 11 === 0) {
    exceptions.push({
      type: 'SALARY_MISMATCH',
      severity: 'CRITICAL',
      description: `Salary calculation mismatch detected. Expected: ${randomNumber(8000, 15000)} EGP, Calculated: ${randomNumber(7000, 14000)} EGP. Manual review required.`,
      status: 'open',
      createdAt: new Date(),
    });
  }

  if (empIndex === 15) {
    exceptions.push({
      type: 'DUPLICATE_PAYMENT',
      severity: 'CRITICAL',
      description: `Possible duplicate payment detected. Previous payment from last month not reconciled.`,
      status: 'open',
      createdAt: new Date(),
    });
  }

  if (empIndex === 5) {
    exceptions.push({
      type: 'TAX_CALCULATION_ERROR',
      severity: 'HIGH',
      description: `Tax calculation error. Tax bracket information missing or incorrect. Unable to calculate accurate deductions.`,
      status: 'open',
      createdAt: new Date(),
    });
  }

  if (empIndex % 13 === 0 && employee.status === 'INACTIVE') {
    exceptions.push({
      type: 'INACTIVE_EMPLOYEE',
      severity: 'LOW',
      description: `Employee status is INACTIVE. Verify if they should be included in this payroll run.`,
      status: 'open',
      createdAt: new Date(),
    });
  }

  return exceptions;
}

// ============================================
// SEED FUNCTION
// ============================================

async function seed(db) {
  console.log('🌱 STARTING FRESH SEED...\n');

  const now = new Date();

  // 1. DEPARTMENTS
  console.log('🏢 Creating departments...');
  const departmentDocs = DEPARTMENTS.map((dept) => ({
    name: dept.name,
    code: dept.code,
    description: `${dept.name} Department`,
    active: true,
    startDate: now,
    endDate: null,
    createdAt: new Date(),
    updatedAt: new Date(),
  }));
  const deptResult = await db
    .collection('departments')
    .insertMany(departmentDocs);
  const departmentIds = Object.values(deptResult.insertedIds);
  console.log(`✅ ${deptResult.insertedCount} departments created\n`);

  // 2. POSITIONS
  console.log('💼 Creating positions...');
  const positionDocs = POSITIONS.map((pos) => {
    const dept = DEPARTMENTS.find((d) => d.name === pos.department);
    const deptId = departmentIds[DEPARTMENTS.indexOf(dept)];

    return {
      name: pos.name,
      code: pos.code,
      description: `${pos.name} position in ${pos.department}`,
      departmentId: deptId,
      active: true,
      startDate: now,
      endDate: null,
      createdAt: new Date(),
      updatedAt: new Date(),
    };
  });
  const posResult = await db.collection('positions').insertMany(positionDocs);
  const positionIds = Object.values(posResult.insertedIds);
  console.log(`✅ ${posResult.insertedCount} positions created\n`);

  // 3. ALLOWANCES
  console.log('💰 Creating allowances...');
  const allowances = await db.collection('allowance').insertMany([
    {
      name: 'Housing Allowance',
      amount: 2000,
      status: 'approved',
      approvedAt: new Date(),
      createdAt: new Date(),
      updatedAt: new Date(),
    },
    {
      name: 'Transport Allowance',
      amount: 1000,
      status: 'approved',
      approvedAt: new Date(),
      createdAt: new Date(),
      updatedAt: new Date(),
    },
    {
      name: 'Food Allowance',
      amount: 800,
      status: 'approved',
      approvedAt: new Date(),
      createdAt: new Date(),
      updatedAt: new Date(),
    },
    {
      name: 'Communication Allowance',
      amount: 500,
      status: 'approved',
      approvedAt: new Date(),
      createdAt: new Date(),
      updatedAt: new Date(),
    },
  ]);
  const allowanceIds = Object.values(allowances.insertedIds);
  console.log(`✅ ${allowances.insertedCount} allowances created\n`);

  // 4. PAY GRADES
  console.log('💵 Creating pay grades...');
  const payGrades = await db.collection('paygrade').insertMany([
    {
      grade: 'Junior Level (L1)',
      baseSalary: 8000,
      grossSalary: 11800,
      status: 'approved',
      allowances: [allowanceIds[1], allowanceIds[2]],
      approvedAt: new Date(),
      createdAt: new Date(),
      updatedAt: new Date(),
    },
    {
      grade: 'Mid Level (L2)',
      baseSalary: 12000,
      grossSalary: 16300,
      status: 'approved',
      allowances: allowanceIds.slice(0, 3),
      approvedAt: new Date(),
      createdAt: new Date(),
      updatedAt: new Date(),
    },
    {
      grade: 'Senior Level (L3)',
      baseSalary: 18000,
      grossSalary: 23300,
      status: 'approved',
      allowances: allowanceIds,
      approvedAt: new Date(),
      createdAt: new Date(),
      updatedAt: new Date(),
    },
    {
      grade: 'Lead Level (L4)',
      baseSalary: 25000,
      grossSalary: 32300,
      status: 'approved',
      allowances: allowanceIds,
      approvedAt: new Date(),
      createdAt: new Date(),
      updatedAt: new Date(),
    },
    {
      grade: 'Manager Level (L5)',
      baseSalary: 35000,
      grossSalary: 42300,
      status: 'approved',
      allowances: allowanceIds,
      approvedAt: new Date(),
      createdAt: new Date(),
      updatedAt: new Date(),
    },
  ]);
  const payGradeIds = Object.values(payGrades.insertedIds);
  console.log(`✅ ${payGrades.insertedCount} pay grades created\n`);

  // 5. SIGNING BONUSES
  console.log('🎁 Creating signing bonuses...');
  const bonuses = await db.collection('signingbonus').insertMany([
    {
      positionName: 'Junior Software Engineer',
      amount: 5000,
      status: 'approved',
      approvedAt: new Date(),
      createdAt: new Date(),
      updatedAt: new Date(),
    },
    {
      positionName: 'Software Engineer',
      amount: 8000,
      status: 'approved',
      approvedAt: new Date(),
      createdAt: new Date(),
      updatedAt: new Date(),
    },
    {
      positionName: 'Senior Software Engineer',
      amount: 12000,
      status: 'approved',
      approvedAt: new Date(),
      createdAt: new Date(),
      updatedAt: new Date(),
    },
  ]);
  const bonusIds = Object.values(bonuses.insertedIds);
  console.log(`✅ ${bonuses.insertedCount} signing bonuses created\n`);

  // 6. EMPLOYEES
  console.log('👥 Creating employees...');
  const employees = [];
  for (let i = 0; i < 20; i++) {
    const hasBankDetails = i < 12;
    const employee = generateEmployee(i, {
      payGradeIds,
      departmentIds,
      positionIds,
      hasBankDetails,
    });
    employees.push(employee);
  }

  const empResult = await db
    .collection('employee_profiles')
    .insertMany(employees);
  const employeeIds = Object.values(empResult.insertedIds);
  console.log(`✅ ${empResult.insertedCount} employees created`);
  console.log(
    `   • ${employees.filter((e) => e.bankName).length} with valid bank details`,
  );
  console.log(
    `   • ${employees.filter((e) => !e.bankName).length} with missing bank details\n`,
  );

  // 7. EMPLOYEE SIGNING BONUSES
  console.log('🎯 Creating employee signing bonuses...');
  const empBonuses = [];
  for (let i = 0; i < 7; i++) {
    empBonuses.push({
      employeeId: employeeIds[i],
      signingBonusId: bonusIds[i % bonusIds.length],
      givenAmount: [5000, 8000, 12000][i % 3],
      status: i < 3 ? 'pending' : i < 5 ? 'approved' : 'paid',
      paymentDate: i >= 5 ? new Date() : null,
      createdAt: new Date(),
      updatedAt: new Date(),
    });
  }
  const empBonusResult = await db
    .collection('employeesigningbonus')
    .insertMany(empBonuses);
  console.log(
    `✅ ${empBonusResult.insertedCount} employee signing bonuses created\n`,
  );

  // 8. EMPLOYEE PENALTIES
  console.log('⚠️  Creating employee penalties...');
  const penalties = [];
  for (let i = 0; i < 5; i++) {
    penalties.push({
      employeeId: employeeIds[i * 4],
      penalties: [
        {
          reason: 'Late arrival',
          amount: randomNumber(100, 300),
        },
        {
          reason: 'Unauthorized absence',
          amount: randomNumber(200, 500),
        },
      ],
      createdAt: new Date(),
      updatedAt: new Date(),
    });
  }
  const penaltyResult = await db
    .collection('employeepenalties')
    .insertMany(penalties);
  console.log(`✅ ${penaltyResult.insertedCount} employee penalties created\n`);

  // 9. PAYROLL RUN
  console.log('📋 Creating payroll run...');
  const runId = `PR-2024-${randomNumber(1000, 9999)}`;
  const totalNetPay = employees.reduce((sum) => sum + 15000, 0);

  const employeeExceptions = employees
    .map((emp) => ({
      employee: emp,
      exceptions: generateExceptions(emp, employees),
    }))
    .filter((e) => e.exceptions.length > 0);

  const payrollRun = {
    runId,
    payrollPeriod: new Date(2024, 11, 31),
    status: 'draft',
    entity: 'Acme Corporation Egypt',
    employees: employees.length,
    exceptions: employeeExceptions.length,
    totalnetpay: totalNetPay,
    payrollSpecialistId: employeeIds[0],
    paymentStatus: 'pending',
    createdAt: new Date(),
    updatedAt: new Date(),
  };

  const payrollRunResult = await db
    .collection('payrollruns')
    .insertOne(payrollRun);
  const payrollRunId = payrollRunResult.insertedId;
  console.log(`✅ 1 payroll run created (${runId})\n`);

  // 10. EMPLOYEE PAYROLL DETAILS
  console.log('💼 Creating employee payroll details...');
  const payrollDetails = [];

  for (let i = 0; i < employees.length; i++) {
    const emp = employees[i];
    const baseSalary = randomNumber(8000, 25000);
    const allowances = randomNumber(2000, 5000);
    const deductions = randomNumber(500, 2000);
    const netSalary = baseSalary + allowances - deductions;
    const bonus = i < 7 ? randomNumber(1000, 5000) : 0;
    const netPay = netSalary + bonus;

    payrollDetails.push({
      employeeId: employeeIds[i],
      payrollRunId: payrollRunId,
      baseSalary,
      allowances,
      deductions,
      netSalary,
      netPay,
      bonus,
      bankStatus: emp.bankName ? 'valid' : 'missing',
      exceptions: !emp.bankName ? 'Missing bank details' : null,
      createdAt: new Date(),
      updatedAt: new Date(),
    });
  }

  await db.collection('employeepayrolldetails').insertMany(payrollDetails);
  console.log(`✅ ${payrollDetails.length} payroll details created\n`);

  // SUMMARY
  console.log('═══════════════════════════════════════════════════════');
  console.log('✅ ✅ ✅ SEEDING COMPLETE! ✅ ✅ ✅');
  console.log('═══════════════════════════════════════════════════════');
  console.log('\n📊 Summary:');
  console.log(`   • ${DEPARTMENTS.length} Departments`);
  console.log(`   • ${POSITIONS.length} Positions`);
  console.log(`   • ${allowances.insertedCount} Allowances`);
  console.log(`   • ${payGrades.insertedCount} Pay Grades`);
  console.log(`   • ${bonuses.insertedCount} Signing Bonuses`);
  console.log(`   • ${empResult.insertedCount} Employees`);
  console.log(
    `     - ${employees.filter((e) => e.bankName).length} with valid bank details`,
  );
  console.log(
    `     - ${employees.filter((e) => !e.bankName).length} with missing bank details`,
  );
  console.log(
    `     - ${employees.filter((e) => e.status === 'ACTIVE').length} active`,
  );
  console.log(
    `     - ${employees.filter((e) => e.status === 'INACTIVE').length} inactive`,
  );
  console.log(`   • ${empBonusResult.insertedCount} Employee Signing Bonuses`);
  console.log(`   • ${penaltyResult.insertedCount} Employee Penalties`);
  console.log(`   • 1 Payroll Run (${runId})`);
  console.log(`   • ${payrollDetails.length} Payroll Details Records`);

  console.log('\n🚀 Database is clean and ready to use!');
  console.log(`   • Payroll Run ID: ${runId}\n`);
}

// ============================================
// MAIN FUNCTION
// ============================================

async function main() {
  const client = new MongoClient(MONGO_URI);

  try {
    await client.connect();
    console.log('✅ Connected to MongoDB');
    console.log(`📦 Database: ${DATABASE_NAME}\n`);
    console.log('═══════════════════════════════════════════════════════\n');

    const db = client.db(DATABASE_NAME);

    // Step 1: Complete cleanup
    await cleanup(db);

    // Step 2: Fresh seed
    await seed(db);
  } catch (error) {
    console.error('❌ Error:', error);
    process.exit(1);
  } finally {
    await client.close();
    console.log('👋 Disconnected from MongoDB');
  }
}

main();
