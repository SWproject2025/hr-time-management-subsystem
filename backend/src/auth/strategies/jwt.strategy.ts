import { Injectable, UnauthorizedException } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { ExtractJwt, Strategy } from 'passport-jwt';
import { ConfigService } from '@nestjs/config';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { EmployeeSystemRole, EmployeeSystemRoleDocument } from '../../employee-profile/models/employee-system-role.schema';
import { EmployeeProfile, EmployeeProfileDocument } from '../../employee-profile/models/employee-profile.schema';

export interface JwtPayload {
  sub: string; // employeeProfileId
  nationalId: string;
  roles: string[];
}

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
  constructor(
    private configService: ConfigService,
    @InjectModel(EmployeeSystemRole.name)
    private employeeSystemRoleModel: Model<EmployeeSystemRoleDocument>,
    @InjectModel(EmployeeProfile.name)
    private employeeProfileModel: Model<EmployeeProfileDocument>,
  ) {
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      ignoreExpiration: false,
      secretOrKey: configService.get<string>('JWT_SECRET') || 'your-secret-key-change-in-production',
    });
  }

  async validate(payload: JwtPayload) {
    const employeeProfile = await this.employeeProfileModel.findById(payload.sub);
    
    if (!employeeProfile) {
      throw new UnauthorizedException('Employee profile not found');
    }

    const systemRole = await this.employeeSystemRoleModel.findOne({
      employeeProfileId: payload.sub,
      isActive: true,
    });

    return {
      employeeProfileId: payload.sub,
      nationalId: payload.nationalId,
      roles: systemRole?.roles || [],
      permissions: systemRole?.permissions || [],
      employeeProfile,
    };
  }
}

