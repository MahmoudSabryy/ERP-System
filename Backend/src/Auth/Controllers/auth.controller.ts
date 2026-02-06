import { Controller, Post, Body, ValidationPipe } from '@nestjs/common';
import { LoginDto, RegisterDto } from '../DTO/auth.dto';
import { AuthService } from '../Services/auth.service';

@Controller('auth')
export class AuthController {
  constructor(private authService: AuthService) {}

  @Post('register')
  async register(
    @Body(new ValidationPipe({ whitelist: true, forbidNonWhitelisted: true }))
    dto: RegisterDto,
  ) {
    return this.authService.register(dto);
  }

  @Post('login')
  async login(
    @Body(new ValidationPipe({ whitelist: true, forbidNonWhitelisted: true }))
    dto: LoginDto,
  ) {
    return this.authService.login(dto);
  }
}
