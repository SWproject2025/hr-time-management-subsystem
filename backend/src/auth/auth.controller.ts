import { Controller, Post, Body, UnauthorizedException } from '@nestjs/common';
import { AuthService } from './auth.service';

@Controller('auth')
export class AuthController {
  constructor(private authService: AuthService) {}

  @Post('login')
  async login(@Body() loginDto: any) {
    const user = await this.authService.validateUser(loginDto.email, loginDto.password);
    if (!user) {
      throw new UnauthorizedException('Invalid credentials');
    }
    return this.authService.login(user);
  }
  
  // Endpoint to create an initial user for testing
  @Post('register')
  async register(@Body() registerDto: any) {
  // 👇 Add this line
    console.log('HIT: Register endpoint reached!', registerDto); 
  
    return this.authService.register(registerDto);
  }
}