import { Test, TestingModule } from '@nestjs/testing';
import { getModelToken } from '@nestjs/mongoose';
import { JwtService } from '@nestjs/jwt';
import { BadRequestException } from '@nestjs/common';
import { Types } from 'mongoose';

import { AuthController } from '../../../src/auth/auth.controller';
import { AuthService } from '../../../src/auth/auth.service';
import { UserService } from '../../../src/user/user.service';
import { User } from '../../../src/user/schemas/user.schema';
import { CreateUserDto } from '../../../src/user/dto/create-user.dto';

describe('🔐 AuthController - Testes Unitários', () => {
  let authController: AuthController;
  let authService: AuthService;

  const mockUserModel = {
    create: jest.fn(),
    findOne: jest.fn(),
    findById: jest.fn(),
    findByIdAndUpdate: jest.fn(),
    findByIdAndDelete: jest.fn(),
    find: jest.fn(),
    collection: {
      findOne: jest.fn(),
      findOneAndDelete: jest.fn(),
      findOneAndUpdate: jest.fn(),
      find: jest.fn(),
      aggregate: jest.fn(),
    },
  };

  const mockJwtService = {
    sign: jest.fn(),
  };

  const mockUserService = {
    findByEmail: jest.fn(),
    findByUsername: jest.fn(),
    create: jest.fn(),
  };

  const mockAuthService = {
    register: jest.fn(),
    login: jest.fn(),
    validateUser: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [AuthController],
      providers: [
        {
          provide: AuthService,
          useValue: mockAuthService,
        },
        {
          provide: UserService,
          useValue: mockUserService,
        },
        {
          provide: getModelToken(User.name),
          useValue: mockUserModel,
        },
        {
          provide: JwtService,
          useValue: mockJwtService,
        },
      ],
    }).compile();

    authController = module.get<AuthController>(AuthController);
    authService = module.get<AuthService>(AuthService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('POST /auth/register', () => {
    it('deve retornar 201 para registro bem-sucedido', async () => {
      const createUserDto: CreateUserDto = {
        username: 'testuser',
        email: 'test@example.com',
        password: 'password123',
      };

      const mockResult = {
        access_token: 'token',
        user: { id: '123', username: 'testuser', email: 'test@example.com' },
      };

      jest.spyOn(authService, 'register').mockResolvedValue(mockResult);

      const result = await authController.register(createUserDto);

      expect(result.success).toBe(true);
      expect(result.data).toEqual(mockResult);
    });

    it('deve retornar erro 400 para dados inválidos', async () => {
      const createUserDto: CreateUserDto = {
        username: '',
        email: 'invalid-email',
        password: '123',
      };

      jest.spyOn(authService, 'register').mockRejectedValue(
        new BadRequestException('Dados inválidos'),
      );

      const result = await authController.register(createUserDto);

      expect(result.success).toBe(false);
      expect(result.message).toContain('Erro ao registrar usuário');
    });
  });

  describe('POST /auth/login', () => {
    it('deve retornar 200 para login bem-sucedido', async () => {
      const mockUser = {
        _id: new Types.ObjectId(),
        username: 'testuser',
        email: 'test@example.com',
      };

      const mockResult = {
        access_token: 'token',
        user: mockUser,
      };

      jest.spyOn(authService, 'login').mockResolvedValue(mockResult);

      const result = await authController.login({ user: mockUser } as any);

      expect(result.success).toBe(true);
      expect(result.data).toEqual(mockResult);
    });
  });
});

