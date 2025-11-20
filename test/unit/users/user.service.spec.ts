import { Test, TestingModule } from '@nestjs/testing';
import { getModelToken } from '@nestjs/mongoose';
import { ConflictException } from '@nestjs/common';
import * as bcrypt from 'bcryptjs';
import { Types } from 'mongoose';

import { UserService } from '../../../src/user/user.service';
import { User } from '../../../src/user/schemas/user.schema';

describe('👤 UserService - Testes Unitários', () => {
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

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        UserService,
        {
          provide: getModelToken(User.name),
          useValue: mockUserModel,
        },
      ],
    }).compile();

    userService = module.get<UserService>(UserService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('create()', () => {
    it('deve criar usuário com dados válidos', async () => {
      const username = 'testuser';
      const email = 'test@example.com';
      const password = 'password123';

      const mockUser = {
        _id: new Types.ObjectId(),
        username,
        email,
        password: 'hashedPassword',
        expenses: [],
        incomes: [],
        createdAt: new Date(),
        updatedAt: new Date(),
        save: jest.fn().mockResolvedValue(this),
      };

      mockUserModel.findOne.mockResolvedValue(null);
      mockUserModel.create.mockReturnValue(mockUser);
      jest.spyOn(bcrypt, 'hash').mockResolvedValue('hashedPassword' as any);

      const result = await userService.create(username, email, password);

      expect(mockUserModel.findOne).toHaveBeenCalled();
      expect(bcrypt.hash).toHaveBeenCalledWith(password, 10);
    });

    it('deve retornar erro para email duplicado', async () => {
      const existingUser = {
        _id: new Types.ObjectId(),
        username: 'otheruser',
        email: 'test@example.com',
      };

      mockUserModel.findOne.mockResolvedValue(existingUser);

      await expect(
        userService.create('testuser', 'test@example.com', 'password123'),
      ).rejects.toThrow(ConflictException);
    });
  });

  describe('findById()', () => {
    it('deve retornar usuário se encontrado', async () => {
      const userId = new Types.ObjectId().toString();
      const mockUser = {
        _id: new Types.ObjectId(userId),
        username: 'testuser',
        email: 'test@example.com',
      };

      mockUserModel.collection.findOne.mockResolvedValue(mockUser);
      mockUserModel.findById.mockResolvedValue(mockUser);

      const result = await userService.findById(userId);

      expect(result).toEqual(mockUser);
    });

    it('deve retornar null se não encontrado', async () => {
      mockUserModel.collection.findOne.mockResolvedValue(null);

      const result = await userService.findById('invalidId');

      expect(result).toBeNull();
    });
  });

  describe('update()', () => {
    it('deve atualizar usuário existente', async () => {
      const userId = new Types.ObjectId().toString();
      const updateData = { username: 'newusername' };

      const updatedUser = {
        _id: new Types.ObjectId(userId),
        username: 'newusername',
        email: 'test@example.com',
      };

      mockUserModel.findByIdAndUpdate.mockResolvedValue(updatedUser);

      const result = await userService.update(userId, updateData);

      expect(result).toEqual(updatedUser);
      expect(mockUserModel.findByIdAndUpdate).toHaveBeenCalledWith(
        userId,
        updateData,
        { new: true },
      );
    });

    it('deve criptografar nova senha se fornecida', async () => {
      const userId = new Types.ObjectId().toString();
      const updateData = { password: 'newpassword123' };

      jest.spyOn(bcrypt, 'hash').mockResolvedValue('hashedNewPassword' as any);
      mockUserModel.findByIdAndUpdate.mockResolvedValue({} as any);

      await userService.update(userId, updateData);

      expect(bcrypt.hash).toHaveBeenCalledWith('newpassword123', 10);
    });
  });

  describe('remove()', () => {
    it('deve deletar usuário existente', async () => {
      const userId = new Types.ObjectId().toString();
      const mockUser = {
        _id: new Types.ObjectId(userId),
        username: 'testuser',
      };

      mockUserModel.collection.findOneAndDelete.mockResolvedValue(mockUser);
      mockUserModel.findById.mockResolvedValue(mockUser);

      const result = await userService.remove(userId);

      expect(result).toEqual(mockUser);
    });
  });
});

