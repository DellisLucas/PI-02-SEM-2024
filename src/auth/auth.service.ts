import { Injectable, UnauthorizedException, BadRequestException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcryptjs';
import { UserService } from '../user/user.service';
import { CreateUserDto } from '../user/dto/create-user.dto';

@Injectable()
export class AuthService {
  constructor(
    private readonly userService: UserService,
    private readonly jwtService: JwtService,
  ) {}

  async validateUser(email: string, password: string): Promise<any> {
    try {
      const user = await this.userService.findByEmail(email);
      if (!user) {
        throw new UnauthorizedException('Email não encontrado');
      }

      const isPasswordValid = await bcrypt.compare(password, user.password);
      if (!isPasswordValid) {
        throw new UnauthorizedException('Senha inválida');
      }

      const { password: _, ...result } = user.toObject();
      return result;
    } catch (error) {
      throw new UnauthorizedException('Credenciais inválidas');
    }
  }
  
  async register(createUserDto: CreateUserDto) {
    try {
      const existingUser = await this.userService.findByUsername(createUserDto.username);
      if (existingUser) {
        throw new BadRequestException('Nome de usuário já existe');
      }

      const existingEmail = await this.userService.findByEmail(createUserDto.email);
      if (existingEmail) {
        throw new BadRequestException('Email já está em uso');
      }

      const hashedPassword = await bcrypt.hash(createUserDto.password, 10);
      const user = await this.userService.create(
        createUserDto.username,
        createUserDto.email,
        hashedPassword
      );
      return this.login(user);
    } catch (error: any) {
      throw new BadRequestException(error?.message || 'Erro ao registrar usuário');
    }
  }

  async login(user: any) {
    const payload = { 
      username: user.username,
      email: user.email,
      sub: user._id,
      iat: Math.floor(Date.now() / 1000)
    };
    
    return {
      access_token: this.jwtService.sign(payload, { expiresIn: '24h' }),
      user: {
        id: user._id,
        username: user.username,
        email: user.email,
        createdAt: user.createdAt,
      }
    };
  }
}
