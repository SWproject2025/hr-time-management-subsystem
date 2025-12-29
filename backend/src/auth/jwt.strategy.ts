import { ExtractJwt, Strategy } from 'passport-jwt';
import { PassportStrategy } from '@nestjs/passport';
import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
  constructor(private configService: ConfigService) {
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      ignoreExpiration: false,
      secretOrKey: configService.get<string>('JWT_SECRET') || 'FALLBACK_SECRET_KEY', // Use env var in production
    });
  }

  async validate(payload: any) {
  // payload.sub is usually the userId from auth.service.ts login()
  return { userId: payload.sub, email: payload.email, role: payload.role };
  }
}