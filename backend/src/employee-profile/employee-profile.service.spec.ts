import { Test, TestingModule } from '@nestjs/testing';
import { getModelToken } from '@nestjs/mongoose';
import { EmployeeProfileService } from './employee-profile.service';
import { EmployeeProfile } from './models/employee-profile.schema';
import { EmployeeProfileChangeRequest } from './models/ep-change-request.schema';
import { Candidate } from './models/candidate.schema';
import { EmployeeSystemRole } from './models/employee-system-role.schema';
import { EmployeeQualification } from './models/qualification.schema';

// 1. Generic Mock Factory
const mockModel = () => ({
  constructor: jest.fn(),
  find: jest.fn(),
  findById: jest.fn(),
  findByIdAndUpdate: jest.fn(),
  save: jest.fn(),
  exec: jest.fn(),
});

describe('EmployeeProfileService', () => {
  let service: EmployeeProfileService;
  let employeeModel: any;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        EmployeeProfileService,
        // Provide Mocks for all injected Models
        { provide: getModelToken(EmployeeProfile.name), useFactory: mockModel },
        { provide: getModelToken(EmployeeProfileChangeRequest.name), useFactory: mockModel },
        // AuditLog mock removed
        { provide: getModelToken(Candidate.name), useFactory: mockModel },
        { provide: getModelToken(EmployeeSystemRole.name), useFactory: mockModel },
        { provide: getModelToken(EmployeeQualification.name), useFactory: mockModel },
      ],
    }).compile();

    service = module.get<EmployeeProfileService>(EmployeeProfileService);
    employeeModel = module.get(getModelToken(EmployeeProfile.name));
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

it('should update contact info', async () => {
    const empId = '64f1b2b8e3b9c8a1b2c3d4e5'; 
    // FIX: Change 'phoneNumber' to 'mobilePhone' to match your DTO
    const updateDto = { mobilePhone: '555-0199' }; 
    
    // Mock the Profile Update to succeed
    employeeModel.findByIdAndUpdate.mockReturnValue({
      exec: jest.fn().mockResolvedValue({ _id: empId, ...updateDto }),
    });

    // Call the method
    await service.updateContactInfo(empId, updateDto);

    // Assert: Profile was updated
    expect(employeeModel.findByIdAndUpdate).toHaveBeenCalledWith(
      empId, 
      { $set: updateDto }, 
      { new: true }
    );
  });
})