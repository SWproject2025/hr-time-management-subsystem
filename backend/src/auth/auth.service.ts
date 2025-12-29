import { Injectable, BadRequestException, ConflictException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import * as bcrypt from 'bcrypt';

import { EmployeeProfile } from '../employee-profile/models/employee-profile.schema';
import { Candidate } from '../employee-profile/models/candidate.schema';

@Injectable()
export class AuthService {
  constructor(
    @InjectModel(EmployeeProfile.name) private employeeModel: Model<EmployeeProfile>,
    @InjectModel(Candidate.name) private candidateModel: Model<Candidate>,
    private jwtService: JwtService,
  ) {}

  // --- 1. Register (Create New Candidate) ---
  async register(registerDto: any) {
    // 🔍 DEBUG: Log what comes from the frontend
    console.log('⬇️ RECEIVED REGISTRATION DATA:', registerDto);

    // 1. EXTRACT DATA CORRECTLY
    // The frontend sends 'personalEmail', so we must explicitly grab it.
    const { personalEmail, email, password, firstName, lastName, nationalId, mobilePhone } = registerDto;

    // 2. NORMALIZE EMAIL
    // Use personalEmail if it exists, otherwise fallback to email
    const emailToUse = personalEmail || email;

    console.log('📧 EMAIL TO SAVE:', emailToUse); // Should print the email, not undefined

    if (!emailToUse) {
        throw new BadRequestException('Personal Email is required');
    }

    // 3. CHECK FOR DUPLICATES (Email)
    const existingEmployee = await this.employeeModel.findOne({ 
      $or: [{ workEmail: emailToUse }, { personalEmail: emailToUse }] 
    });
    if (existingEmployee) throw new ConflictException('Email already exists (Employee)');

    const existingCandidate = await this.candidateModel.findOne({ personalEmail: emailToUse });
    if (existingCandidate) throw new ConflictException('Email already exists (Candidate)');

    // 4. CHECK FOR DUPLICATES (National ID)
    if (nationalId) {
      const nidInEmp = await this.employeeModel.findOne({ nationalId });
      if (nidInEmp) throw new ConflictException('National ID already exists (Employee)');

      const nidInCand = await this.candidateModel.findOne({ nationalId });
      if (nidInCand) throw new ConflictException('National ID already exists (Candidate)');
    }
    
    // 5. CREATE CANDIDATE
    const hashedPassword = await bcrypt.hash(password, 10);
    const candidateNumber = `CAN-${Date.now().toString().slice(-6)}-${Math.floor(1000 + Math.random() * 9000)}`;

    const newCandidate = new this.candidateModel({
      firstName,
      lastName,
      // 👇 THIS IS THE CRITICAL LINE. WE MUST SAVE 'emailToUse' INTO 'personalEmail'
      personalEmail: emailToUse, 
      password: hashedPassword,
      nationalId: nationalId, 
      candidateNumber: candidateNumber, 
      mobilePhone: mobilePhone || '',
      status: 'APPLIED',
      applicationDate: new Date()
    });

    try {
      await newCandidate.save();
      console.log('✅ CANDIDATE SAVED SUCCESSFULLY');
    } catch (error: any) {
      console.error('❌ SAVE ERROR:', error);
      if (error.code === 11000) {
        const field = Object.keys(error.keyPattern)[0];
        throw new ConflictException(`${field} already exists`);
      }
      throw error;
    }

    return { message: 'Registration successful. You can now login.' };
  }

  // --- 2. Validate User ---
  async validateUser(email: string, pass: string): Promise<any> {
    let user: any = null;
    let userType = '';

    // Check Employee
    user = await this.employeeModel.findOne({
      $or: [{ workEmail: email }, { personalEmail: email }]
    }).select('+password'); 

    if (user) {
      userType = 'EMPLOYEE';
    } else {
      // Check Candidate
      user = await this.candidateModel.findOne({ personalEmail: email }).select('+password');
      if (user) userType = 'CANDIDATE';
    }

    if (!user) return null;

    const isMatch = await bcrypt.compare(pass, user.password);
    if (isMatch) {
      const { password, ...result } = user.toObject();
      return { ...result, userType };
    }

    return null;
  }

  // --- 3. Login ---
  async login(user: any) {
    const payload = { 
      email: user.personalEmail || user.workEmail, 
      sub: user._id,
      type: user.userType 
    };

    return {
      access_token: this.jwtService.sign(payload),
      user: {
        id: user._id,
        firstName: user.firstName,
        lastName: user.lastName,
        email: user.workEmail || user.personalEmail,
        type: user.userType
      }
    };
  }
}