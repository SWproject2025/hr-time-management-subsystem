import { Injectable, BadRequestException, ForbiddenException } from '@nestjs/common';
import * as bcrypt from 'bcrypt';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { EmployeeProfile, EmployeeProfileDocument } from './models/employee-profile.schema';
import { EmployeeProfileChangeRequest } from './models/ep-change-request.schema';
import { Candidate } from './models/candidate.schema';
import { EmployeeSystemRole } from './models/employee-system-role.schema';
import { EmployeeQualification } from './models/qualification.schema';
import { ProfileChangeStatus } from './enums/employee-profile.enums';
import { UpdateContactDto } from './dto/update-contact.dto';
import { NotFoundException } from '@nestjs/common';
import mongoose from 'mongoose';

@Injectable()
export class EmployeeProfileService {
  constructor(
    @InjectModel(EmployeeProfile.name) private employeeProfileModel: Model<EmployeeProfileDocument>,
    @InjectModel(EmployeeProfileChangeRequest.name) private changeRequestModel: Model<EmployeeProfileChangeRequest>,
    @InjectModel(Candidate.name) private candidateModel: Model<Candidate>,
    @InjectModel(EmployeeSystemRole.name) private systemRoleModel: Model<EmployeeSystemRole>,
    @InjectModel(EmployeeQualification.name) private qualificationModel: Model<EmployeeQualification>,
  ) {}

  // --- 1. View Personal Profile (Strict Employee) ---
  async getProfile(employeeId: string): Promise<EmployeeProfile> {
    const profile = await this.employeeProfileModel.findById(employeeId).exec();
    if (!profile) throw new NotFoundException(`Employee profile with ID ${employeeId} not found`);
    return profile;
  }

  // --- 2. Update Self-Service Data (Hybrid: Employee OR Candidate) ---
  async updateContactInfo(userId: string, updateDto: UpdateContactDto): Promise<any> {
    if (Object.keys(updateDto).length === 0) {
      throw new BadRequestException('No valid contact information provided for update.');
    }

    // FIX: Typed as 'any' to allow both Employee and Candidate documents
    let updated: any = await this.employeeProfileModel
      .findByIdAndUpdate(userId, { $set: updateDto }, { new: true })
      .exec();
      
    // If not found in Employee, try Candidate
    if (!updated) {
       updated = await this.candidateModel
        .findByIdAndUpdate(userId, { $set: updateDto }, { new: true })
        .exec();
    }

    if (!updated) throw new NotFoundException(`Profile with ID ${userId} not found`);
    return updated;
  }

  // --- 3. Submit Change Request (Employees Only) ---
  async submitChangeRequest(employeeId: string, changes: any, reason?: string): Promise<EmployeeProfileChangeRequest> {
    // SECURITY: Prevent users from requesting changes to restricted fields
    const restrictedFields = ['_id', 'employeeNumber', 'status', 'payGradeId', 'supervisorPositionId', 'roles'];
    const requestKeys = Object.keys(changes);
    
    const hasRestricted = requestKeys.some(key => restrictedFields.includes(key));
    if (hasRestricted) {
      throw new BadRequestException(`Cannot request changes to restricted fields: ${restrictedFields.join(', ')}`);
    }

    const newRequest = new this.changeRequestModel({
      requestId: new Types.ObjectId().toString(),
      employeeProfileId: new Types.ObjectId(employeeId),
      requestDescription: JSON.stringify(changes),
      reason: reason,
      status: ProfileChangeStatus.PENDING,
      submittedAt: new Date(),
    });
    return newRequest.save();
  }

  // --- 4. Manager View Team ---
  async getTeamProfiles(managerEmployeeId: string): Promise<EmployeeProfile[]> {
    const managerProfile = await this.employeeProfileModel.findById(managerEmployeeId).exec();
    if (!managerProfile?.primaryPositionId) {
        throw new NotFoundException('Manager profile or position not found');
    }
    
    return this.employeeProfileModel.find({ 
        supervisorPositionId: managerProfile.primaryPositionId 
    })
    .select('firstName lastName positionId departmentId dateOfHire status profilePictureUrl workEmail')
    .exec();
  }

  // --- 5. Approve Change Request ---
  async approveChangeRequest(requestId: string): Promise<EmployeeProfile> {
    const request = await this.changeRequestModel.findById(requestId);
    if (!request) throw new NotFoundException('Change request not found');
    if (request.status !== ProfileChangeStatus.PENDING) throw new BadRequestException('Request is already processed');

    const requestedChanges = JSON.parse(request.requestDescription);

    const updatedProfile = await this.employeeProfileModel.findByIdAndUpdate(
      request.employeeProfileId,
      { $set: requestedChanges },
      { new: true }
    ).exec();

    if (!updatedProfile) throw new NotFoundException(`Employee profile not found`);

    request.status = ProfileChangeStatus.APPROVED;
    request.processedAt = new Date();
    await request.save();

    return updatedProfile;
  }

  // --- 6. Reject Change Request ---
  async rejectChangeRequest(requestId: string): Promise<EmployeeProfileChangeRequest> {
    const request = await this.changeRequestModel.findById(requestId);
    if (!request) throw new NotFoundException('Change request not found');
    
    request.status = ProfileChangeStatus.REJECTED;
    request.processedAt = new Date();
    
    return request.save();
  }

  // --- 7. Master Data Management (HR Admin Full Update) ---
  async adminUpdateProfile(employeeId: string, updateData: any): Promise<EmployeeProfile> {
    const updated = await this.employeeProfileModel
      .findByIdAndUpdate(employeeId, { $set: updateData }, { new: true })
      .exec();

    if (!updated) throw new NotFoundException(`Employee profile with ID ${employeeId} not found`);
    return updated;
  }

  // --- 8. Get Profile With Role (Hybrid with Debug Logs) ---
  async getProfileWithRole(userId: string) {
    console.log(`--- DEBUG: Service searching for ID: ${userId} ---`);

    // A. Try finding an Employee Profile first
    let profile = await this.employeeProfileModel.findById(userId).exec();
    
    // B. If not found, try finding a Candidate Profile
    if (!profile) {
       // @ts-ignore
       const candidate = await this.candidateModel.findById(userId).exec();

       if (candidate) {
         return {
           profile: candidate,
           // Assign a "Virtual" Role for Candidates so the UI doesn't break
           role: { roles: ['CANDIDATE'], permissions: [] } 
         };
       }
       console.log('❌ ERROR: No Employee or Candidate found for this ID.');
       throw new NotFoundException('Profile not found');
    }

    // C. If Employee found, get their system roles
    // Use Types.ObjectId to ensure compatibility with string IDs
    const role = await this.systemRoleModel.findOne({ 
      employeeProfileId: new Types.ObjectId(userId) 
    }).exec();

    return { 
      profile, 
      role: role || { roles: [], permissions: [] } // Return empty if no role doc exists
    };
  }

  // --- 9. Change Password (Hybrid: Employee OR Candidate) ---
  async changePassword(userId: string, oldPassword: string | undefined, newPassword: string): Promise<boolean> {
    // FIX: Explicitly type as 'any' to handle either schema
    let user: any = await this.employeeProfileModel.findById(userId).select('+password').exec();

    if (!user) {
      user = await this.candidateModel.findById(userId).select('+password').exec();
    }

    if (!user) throw new NotFoundException('User not found');

    // If oldPassword provided, verify it
    if (oldPassword) {
      if (!user.password || !(await bcrypt.compare(oldPassword, user.password))) {
        throw new ForbiddenException('Current password is incorrect');
      }
    }

    const hashed = await bcrypt.hash(newPassword, 10);
    user.password = hashed;
    await user.save();
    return true;
  }

  // --- 10. Update Profile Picture (Hybrid: Employee OR Candidate) ---
  async updateProfilePicture(userId: string, filePath: string): Promise<any> {
    // FIX: Typed as 'any' to allow swapping between Employee and Candidate result
    let updated: any = await this.employeeProfileModel
      .findByIdAndUpdate(
        userId, 
        { $set: { profilePictureUrl: filePath } }, 
        { new: true }
      )
      .exec();

    // If not found in Employee, try Candidate
    if (!updated) {
      updated = await this.candidateModel
        .findByIdAndUpdate(
          userId, 
          { $set: { profilePictureUrl: filePath } }, 
          { new: true }
        )
        .exec();
    }

    if (!updated) throw new NotFoundException(`Profile with ID ${userId} not found`);
    return updated;
  }

  // --- 11. Search (Strict Employee) ---
  async searchEmployees(query: string): Promise<EmployeeProfile[]> {
    if (!query) return [];
    
    const regex = new RegExp(query, 'i');
    
    return this.employeeProfileModel.find({
      $or: [
        { firstName: regex },
        { lastName: regex },
        { employeeNumber: regex },
        { nationalId: regex }
      ]
    })
    .select('firstName lastName employeeNumber primaryDepartmentId primaryPositionId status')
    .limit(20)
    .exec();
  }
  // --- 12. Get All Candidates (Admin View) ---
  async getAllCandidates(): Promise<Candidate[]> {
    return this.candidateModel.find()
      .select('firstName lastName candidateNumber personalEmail status applicationDate')
      .sort({ createdAt: -1 }) // Newest first
      .exec();
  }

  // --- 13. Update Status (Hybrid: Employee OR Candidate) ---
 async updateStatus(id: string, status: string) {
    console.log(`--- DEBUG: Updating Status for ID: ${id} ---`);

    // 1. Try updating Candidate
    let updated: any = await this.candidateModel.findByIdAndUpdate(
      id, 
      { status: status }, 
      { new: true }
    ).exec();

    // 2. If not found, try Employee
    if (!updated) {
       updated = await this.employeeProfileModel.findByIdAndUpdate(
         id,
         { status: status },
         { new: true }
       ).exec();
    }

    if (!updated) {
      throw new NotFoundException('Candidate/Profile not found');
    }

    return updated; // 👈 THIS WAS LIKELY MISSING
  }

async promoteToEmployee(candidateId: string): Promise<EmployeeProfile> {
    // 1. Find Candidate
    const candidate = await this.candidateModel.findById(candidateId);
    if (!candidate) throw new NotFoundException('Candidate not found');

    if (candidate.status !== 'HIRED') {
      throw new BadRequestException('Only HIRED candidates can be onboarded.');
    }

    // 2. Check for duplicates
    const existingEmp = await this.employeeProfileModel.findOne({ personalEmail: candidate.personalEmail });
    if (existingEmp) {
      throw new BadRequestException('This candidate is already an employee.');
    }

    // 3. Create Employee Profile
    const newEmployee = new this.employeeProfileModel({
      userId: new Types.ObjectId(),
      firstName: candidate.firstName,
      lastName: candidate.lastName,
      personalEmail: candidate.personalEmail,
      workEmail: candidate.personalEmail,
      nationalId: `NID-${Math.floor(1000000000 + Math.random() * 9000000000)}`,
      employeeNumber: `EMP-${Math.floor(1000 + Math.random() * 9000)}`,
      status: 'ACTIVE',
      dateOfHire: new Date(),
      password: await bcrypt.hash('Password123!', 10),
      
      // ✅ FIX 1: Change 'EMPLOYEE' to 'department employee' (Allowed Value)
      role: { roles: ['department employee'], permissions: ['SUBMIT_REQUEST'] } 
    });

    const savedEmployee = await newEmployee.save();

    // 4. Create System Role
    try {
      if (this.systemRoleModel) {
        const newSystemRole = new this.systemRoleModel({
          employeeProfileId: savedEmployee._id,
          
          // ✅ FIX 2: Change 'EMPLOYEE' to 'department employee' here too
          roles: ['department employee'], 
          
          permissions: ['VIEW_PROFILE', 'SUBMIT_REQUEST'], 
          isActive: true
        });
        await newSystemRole.save();
        console.log(`✅ System Role created for ${savedEmployee.firstName}`);
      }
    } catch (error) {
      console.error('❌ FAILED TO CREATE SYSTEM ROLE:', error.message);
    }

    // 5. Delete the Candidate
    await this.candidateModel.findByIdAndDelete(candidateId);

    return savedEmployee;
  }
  
  // --- 14. Get All Pending Requests (Admin View) ---
  async getAllPendingRequests(): Promise<EmployeeProfileChangeRequest[]> {
    return this.changeRequestModel.find({ status: 'PENDING' })
      .populate('employeeProfileId', 'firstName lastName employeeNumber') // Join with user details
      .sort({ submittedAt: -1 })
      .exec();
  }

  // --- 16. Get My Requests (For Employee) ---
  async getMyRequests(userId: string): Promise<EmployeeProfileChangeRequest[]> {
    // We assume userId matches employeeProfileId in the request schema
    return this.changeRequestModel.find({ employeeProfileId: new Types.ObjectId(userId) })
      .sort({ submittedAt: -1 })
      .exec();
  }
  
  async updateRequestStatus(requestId: string, status: 'APPROVED' | 'REJECTED') {
    return this.changeRequestModel.findByIdAndUpdate(
      requestId,
      { status: status, resolvedAt: new Date() },
      { new: true }
    ).exec();
  }
  async updateEmployeeRole(employeeId: string, newRole: string) {
    // We use 'upsert: true' so if the user has no role doc, one is created.
    return this.systemRoleModel.findOneAndUpdate(
      { employeeProfileId: new Types.ObjectId(employeeId) },
      { 
        roles: [newRole], // We replace the array with the new role
        permissions: ['VIEW_PROFILE', 'SUBMIT_REQUEST'] // Reset default permissions
      },
      { new: true, upsert: true, setDefaultsOnInsert: true }
    ).exec();
  }
}

  
