import { Test, TestingModule } from '@nestjs/testing';
import { getModelToken } from '@nestjs/mongoose';
import { JwtService } from '@nestjs/jwt';
import { UnauthorizedException, BadRequestException } from '@nestjs/common';
import * as bcrypt from 'bcryptjs';
import { Types } from 'mongoose';

import { AuthService } from '../../../src/auth/auth.service';
import { UserService } from '../../../src/user/user.service';
import { User } from '../../../src/user/schemas/user.schema';
import { CreateUserDto } from '../../../src/user/dto/create-user.dto';

describe('🔐 AuthService - Testes Unitários', () => {
  let authService: AuthService;
  let userService: UserService;

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

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AuthService,
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

    authService = module.get<AuthService>(AuthService);
    userService = module.get<UserService>(UserService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('register()', () => {
    it('deve criar usuário com dados válidos', async () => {
      const createUserDto: CreateUserDto = {
        username: 'testuser',
        email: 'test@example.com',
        password: 'password123',
      };

      const mockUser = {
        _id: new Types.ObjectId(),
        username: 'testuser',
        email: 'test@example.com',
        password: 'hashedPassword',
        createdAt: new Date(),
        toObject: () => ({ ...mockUser }),
      };

      jest.spyOn(userService, 'findByUsername').mockResolvedValue(null);
      jest.spyOn(userService, 'findByEmail').mockResolvedValue(null);
      jest.spyOn(userService, 'create').mockResolvedValue(mockUser as any);
      jest.spyOn(authService, 'login').mockResolvedValue({
        access_token: 'mockToken',
        user: { id: mockUser._id, username: 'testuser', email: 'test@example.com' },
      });

      const result = await authService.register(createUserDto);

      expect(result).toHaveProperty('access_token');
      expect(result).toHaveProperty('user');
      expect(userService.findByUsername).toHaveBeenCalledWith('testuser');
      expect(userService.findByEmail).toHaveBeenCalledWith('test@example.com');
    });

    it('deve retornar erro se email já existe', async () => {
      const createUserDto: CreateUserDto = {
        username: 'testuser',
        email: 'existing@example.com',
        password: 'password123',
      };

      const existingUser = {
        _id: new Types.ObjectId(),
        email: 'existing@example.com',
      };

      jest.spyOn(userService, 'findByEmail').mockResolvedValue(existingUser as any);

      await expect(authService.register(createUserDto)).rejects.toThrow(BadRequestException);
    });

    it('deve retornar erro se username já existe', async () => {
      const createUserDto: CreateUserDto = {
        username: 'existinguser',
        email: 'test@example.com',
        password: 'password123',
      };

      const existingUser = {
        _id: new Types.ObjectId(),
        username: 'existinguser',
      };

      jest.spyOn(userService, 'findByUsername').mockResolvedValue(existingUser as any);

      await expect(authService.register(createUserDto)).rejects.toThrow(BadRequestException);
    });

    it('deve criptografar senha com bcrypt', async () => {
      const createUserDto: CreateUserDto = {
        username: 'testuser',
        email: 'test@example.com',
        password: 'password123',
      };

      const hashSpy = jest.spyOn(bcrypt, 'hash');
      hashSpy.mockResolvedValue('hashedPassword' as any);

      jest.spyOn(userService, 'findByUsername').mockResolvedValue(null);
      jest.spyOn(userService, 'findByEmail').mockResolvedValue(null);
      jest.spyOn(userService, 'create').mockResolvedValue({} as any);
      jest.spyOn(authService, 'login').mockResolvedValue({
        access_token: 'token',
        user: {} as any,
      });

      await authService.register(createUserDto);

      expect(hashSpy).toHaveBeenCalledWith('password123', 10);
    });
  });

  describe('login()', () => {
    it('deve retornar JWT token válido', async () => {
      const mockUser = {
        _id: new Types.ObjectId(),
        username: 'testuser',
        email: 'test@example.com',
        createdAt: new Date(),
      };

      mockJwtService.sign.mockReturnValue('mockJwtToken');

      const result = await authService.login(mockUser as any);

      expect(result).toHaveProperty('access_token', 'mockJwtToken');
      expect(result).toHaveProperty('user');
      expect(mockJwtService.sign).toHaveBeenCalled();
    });

    it('deve incluir dados do usuário no payload', async () => {
      const mockUser = {
        _id: new Types.ObjectId('507f1f77bcf86cd799439011'),
        username: 'testuser',
        email: 'test@example.com',
        createdAt: new Date(),
      };

      mockJwtService.sign.mockReturnValue('token');

      await authService.login(mockUser as any);

      expect(mockJwtService.sign).toHaveBeenCalledWith(
        expect.objectContaining({
          username: 'testuser',
          email: 'test@example.com',
          sub: mockUser._id,
        }),
        { expiresIn: '24h' },
      );
    });
  });

  describe('validateUser()', () => {
    it('deve retornar usuário se credenciais válidas', async () => {
      const mockUser = {
        _id: new Types.ObjectId(),
        email: 'test@example.com',
        password: 'hashedPassword',
        toObject: () => ({ _id: mockUser._id, email: mockUser.email }),
      };

      jest.spyOn(userService, 'findByEmail').mockResolvedValue(mockUser as any);
      jest.spyOn(bcrypt, 'compare').mockResolvedValue(true as any);

      const result = await authService.validateUser('test@example.com', 'password123');

      expect(result).not.toHaveProperty('password');
      expect(userService.findByEmail).toHaveBeenCalledWith('test@example.com');
    });

    it('deve retornar erro para credenciais inválidas', async () => {
      jest.spyOn(userService, 'findByEmail').mockResolvedValue(null);

      await expect(
        authService.validateUser('test@example.com', 'wrongpassword'),
      ).rejects.toThrow(UnauthorizedException);
    });

    it('deve retornar erro para senha incorreta', async () => {
      const mockUser = {
        _id: new Types.ObjectId(),
        email: 'test@example.com',
        password: 'hashedPassword',
      };

      jest.spyOn(userService, 'findByEmail').mockResolvedValue(mockUser as any);
      jest.spyOn(bcrypt, 'compare').mockResolvedValue(false as any);

      await expect(
        authService.validateUser('test@example.com', 'wrongpassword'),
      ).rejects.toThrow(UnauthorizedException);
    });
  });
});

