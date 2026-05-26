import { Controller, Post, Body } from '@nestjs/common';
import { ApiTags, ApiOperation } from '@nestjs/swagger';
import { AuthService } from './auth.service';

@ApiTags('Auth')
@Controller('api/auth')
export class AuthController {
  constructor(private readonly auth: AuthService) {}

  @Post('login')
  @ApiOperation({ summary: 'User login' })
  login(@Body() dto: { username: string; password: string }) {
    return this.auth.login(dto.username, dto.password);
  }

  @Post('register')
  @ApiOperation({ summary: 'Register new user' })
  register(@Body() dto: { username: string; password: string; role?: string }) {
    return this.auth.register(dto.username, dto.password, dto.role);
  }
}
