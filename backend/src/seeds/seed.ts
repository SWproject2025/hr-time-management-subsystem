import { NestFactory } from '@nestjs/core';
import { AppModule } from '../app.module';
import { OrganizationStructureService } from '../organization-structure/organization-structure.service';

async function seedOrganizationStructure() {
  try {
    console.log('🌱 Starting organization structure seed...');

    const app = await NestFactory.createApplicationContext(AppModule);
    const orgService = app.get(OrganizationStructureService);

    // Seed departments
    console.log('📁 Creating departments...');
    const engineering = await orgService.createDepartment({
      code: 'ENG',
      name: 'Engineering',
      description: 'Software development and technical operations',
      active: true
    });
    console.log(`✓ Created department: ${engineering.name}`);

    const hr = await orgService.createDepartment({
      code: 'HR',
      name: 'Human Resources',
      description: 'Employee relations and organizational development',
      active: true
    });
    console.log(`✓ Created department: ${hr.name}`);

    const sales = await orgService.createDepartment({
      code: 'SALES',
      name: 'Sales',
      description: 'Business development and client relations',
      active: true
    });
    console.log(`✓ Created department: ${sales.name}`);

    // Seed positions
    console.log('👥 Creating positions...');

    // Engineering positions
    await orgService.createPosition({
      code: 'ENG-SWE',
      name: 'Software Engineer',
      description: 'Full-stack software development',
      departmentId: engineering._id.toString(),
      active: true
    });
    console.log('✓ Created position: Software Engineer');

    await orgService.createPosition({
      code: 'ENG-SWE-SR',
      name: 'Senior Software Engineer',
      description: 'Senior full-stack software development',
      departmentId: engineering._id.toString(),
      active: true
    });
    console.log('✓ Created position: Senior Software Engineer');

    await orgService.createPosition({
      code: 'ENG-QA',
      name: 'QA Engineer',
      description: 'Quality assurance and testing',
      departmentId: engineering._id.toString(),
      active: true
    });
    console.log('✓ Created position: QA Engineer');

    // HR positions
    await orgService.createPosition({
      code: 'HR-MGR',
      name: 'HR Manager',
      description: 'Human resources management',
      departmentId: hr._id.toString(),
      active: true
    });
    console.log('✓ Created position: HR Manager');

    await orgService.createPosition({
      code: 'HR-SPEC',
      name: 'HR Specialist',
      description: 'Human resources operations',
      departmentId: hr._id.toString(),
      active: true
    });
    console.log('✓ Created position: HR Specialist');

    // Sales positions
    await orgService.createPosition({
      code: 'SALES-REP',
      name: 'Sales Representative',
      description: 'Client sales and business development',
      departmentId: sales._id.toString(),
      active: true
    });
    console.log('✓ Created position: Sales Representative');

    await orgService.createPosition({
      code: 'SALES-MGR',
      name: 'Sales Manager',
      description: 'Sales team management',
      departmentId: sales._id.toString(),
      active: true
    });
    console.log('✓ Created position: Sales Manager');

    console.log('🎉 Organization structure seeding completed successfully!');
    console.log('📊 Created: 3 departments, 7 positions');

    await app.close();

  } catch (error) {
    console.error('❌ Error seeding organization structure:', error);
    process.exit(1);
  }
}

// Run the seed if this file is executed directly
if (require.main === module) {
  seedOrganizationStructure();
}

export { seedOrganizationStructure };
