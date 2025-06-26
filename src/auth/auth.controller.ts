import { Controller, Post, Request, UseGuards, Body, HttpCode, HttpStatus } from '@nestjs/common';
import { AuthService } from './auth.service';
import { LocalAuthGuard } from './local-auth.guard';
import { CreateUserDto } from '../user/dto/create-user.dto';

@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Post('register')
  @HttpCode(HttpStatus.CREATED)
  async register(@Body() createUserDto: CreateUserDto) {
    try {
      const result = await this.authService.register(createUserDto);
      return {
        success: true,
        data: result
      };
    } catch (error: any) {
      return {
        success: false,
        message: error?.message || 'Erro ao registrar usuário'
      };
    }
  }

  @UseGuards(LocalAuthGuard)
  @Post('login')
  @HttpCode(HttpStatus.OK)
  async login(@Request() req) {
    try {
      const result = await this.authService.login(req.user);
      return {
        success: true,
        data: result
      };
    } catch (error: any) {
      return {
        success: false,
        message: error?.message || 'Erro ao fazer login'
      };
    }
  }
}
