import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose'; // <--- REQUIRED for database access
import { ConfigModule, ConfigService } from '@nestjs/config';
import { JwtModule } from '@nestjs/jwt';
import { PassportModule } from '@nestjs/passport';

import { AuthService } from './auth.service';
import { AuthController } from './auth.controller';
import { JwtStrategy } from './jwt.strategy';

// Import your Schemas so AuthModule knows what "EmployeeProfile" and "Candidate" are
import { EmployeeProfile, EmployeeProfileSchema } from '../employee-profile/models/employee-profile.schema';
import { Candidate, CandidateSchema } from '../employee-profile/models/candidate.schema';

@Module({
  imports: [
    ConfigModule, 
    PassportModule,

    // ✅ CRITICAL ADDITION: This allows AuthService to search these collections
    MongooseModule.forFeature([
      { name: EmployeeProfile.name, schema: EmployeeProfileSchema },
      { name: Candidate.name, schema: CandidateSchema },
    ]),

    JwtModule.registerAsync({
      imports: [ConfigModule], 
      useFactory: async (configService: ConfigService) => ({
        secret: configService.get<string>('JWT_SECRET'),
        signOptions: { expiresIn: '1h' },
      }),
      inject: [ConfigService],
    }),
  ],
  controllers: [AuthController],
  providers: [AuthService, JwtStrategy], 
  exports: [AuthService],
})
export class AuthModule {}