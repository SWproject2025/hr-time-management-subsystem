import { Test } from '@nestjs/testing';
import { EmployeeProfileController } from './employee-profile.controller';
import { EmployeeProfileService } from './employee-profile.service';
import { 
  Controller, Put, Param, Post, UseInterceptors, UploadedFile, 
  ParseFilePipe, MaxFileSizeValidator, FileTypeValidator, Req 
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';

describe('EmployeeProfileController', () => {
  let controller: EmployeeProfileController;
  let service: EmployeeProfileService;

  // Mock the entire Service
  const mockEmployeeService = {
    getProfile: jest.fn(),
    updateContactInfo: jest.fn(),
    submitChangeRequest: jest.fn(),
    getTeamProfiles: jest.fn(),
    approveChangeRequest: jest.fn(),
    rejectChangeRequest: jest.fn(),
    adminUpdateProfile: jest.fn(),
  };

  beforeEach(async () => {
    const module = await Test.createTestingModule({
      controllers: [EmployeeProfileController],
      providers: [
        {
          provide: EmployeeProfileService,
          useValue: mockEmployeeService,
        },
      ],
    }).compile();

    controller = module.get<EmployeeProfileController>(EmployeeProfileController);
    service = module.get<EmployeeProfileService>(EmployeeProfileService);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  describe('getProfile', () => {
    it('should call service.getProfile', async () => {
      mockEmployeeService.getProfile.mockResolvedValue({ name: 'John' });
      await controller.getProfile('123');
      expect(service.getProfile).toHaveBeenCalledWith('123');
    });
  });

 describe('updateContactInfo', () => {
  it('should call service.updateContactInfo', async () => {
    // FIX: Change 'phoneNumber' to 'mobilePhone'
    const dto = { mobilePhone: '123456' }; 
    const req = { user: { userId: '123' } };
    
    await controller.updateContactInfo('123', dto, );
    expect(service.updateContactInfo).toHaveBeenCalledWith('123', dto);
  });
});

  describe('approveRequest', () => {
    it('should call service.approveChangeRequest', async () => {
      await controller.approveRequest('reqId');
      expect(service.approveChangeRequest).toHaveBeenCalledWith('reqId');
    });
  });

  describe('getTeam', () => {
    it('should call service.getTeamProfiles', async () => {
      await controller.getTeam('managerId');
      expect(service.getTeamProfiles).toHaveBeenCalledWith('managerId');
    });
  });

  describe('adminUpdate', () => {
    it('should call service.adminUpdateProfile with admin ID', async () => {
      const id = 'emp-1';
      const dto = { department: 'IT' };
      const req = { user: { userId: 'admin-user' } };

      mockEmployeeService.adminUpdateProfile.mockResolvedValue('updated-profile');

      await controller.adminUpdate(id, dto);

      expect(service.adminUpdateProfile).toHaveBeenCalledWith(id, dto);
    });
  });
  
});