import { Test, TestingModule } from '@nestjs/testing';
import { getModelToken } from '@nestjs/mongoose';
import { BadRequestException, NotFoundException } from '@nestjs/common';
import { Types } from 'mongoose';

import { ExpenseService } from '../../../src/expense/expense.service';
import { Expense } from '../../../src/expense/schemas/expense.schema';
import { CreateExpenseDto } from '../../../src/expense/dto/create-expense.dto';
import { UpdateExpenseDto } from '../../../src/expense/dto/update-expense.dto';

describe('💰 ExpenseService - Testes Unitários', () => {
  let expenseService: ExpenseService;

  const mockExpenseModel = {
    create: jest.fn(),
    find: jest.fn(),
    findById: jest.fn(),
    findByIdAndUpdate: jest.fn(),
    findByIdAndDelete: jest.fn(),
    aggregate: jest.fn(),
    save: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        ExpenseService,
        {
          provide: getModelToken(Expense.name),
          useValue: mockExpenseModel,
        },
      ],
    }).compile();

    expenseService = module.get<ExpenseService>(ExpenseService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('create()', () => {
    it('deve criar despesa com dados válidos', async () => {
      const createExpenseDto: CreateExpenseDto = {
        description: 'Test expense',
        amount: 100,
        date: new Date(),
        userId: new Types.ObjectId().toString(),
        category: 'Food',
      };

      const mockExpense = {
        _id: new Types.ObjectId(),
        ...createExpenseDto,
        save: jest.fn().mockResolvedValue(this),
      };

      mockExpenseModel.create.mockReturnValue(mockExpense);
      mockExpenseModel.save = jest.fn().mockResolvedValue(mockExpense);

      const result = await expenseService.create(createExpenseDto);

      expect(result).toBeDefined();
      expect(mockExpenseModel.create).toHaveBeenCalled();
    });

    it('deve validar valor mínimo (>= 0)', async () => {
      const createExpenseDto: CreateExpenseDto = {
        description: 'Test expense',
        amount: -10,
        date: new Date(),
        userId: new Types.ObjectId().toString(),
      };

      await expect(expenseService.create(createExpenseDto)).rejects.toThrow();
    });

    it('deve validar data inválida', async () => {
      const createExpenseDto: CreateExpenseDto = {
        description: 'Test expense',
        amount: 100,
        date: new Date('invalid-date'),
        userId: new Types.ObjectId().toString(),
      };

      await expect(expenseService.create(createExpenseDto)).rejects.toThrow(
        BadRequestException,
      );
    });
  });

  describe('findAll()', () => {
    it('deve retornar despesas do usuário', async () => {
      const userId = new Types.ObjectId().toString();
      const mockExpenses = [
        {
          _id: new Types.ObjectId(),
          description: 'Expense 1',
          amount: 100,
          userId,
        },
        {
          _id: new Types.ObjectId(),
          description: 'Expense 2',
          amount: 200,
          userId,
        },
      ];

      mockExpenseModel.find.mockReturnValue({
        exec: jest.fn().mockResolvedValue(mockExpenses),
      });

      const result = await expenseService.findAll(userId);

      expect(result).toEqual(mockExpenses);
      expect(mockExpenseModel.find).toHaveBeenCalledWith({ userId });
    });
  });

  describe('findById()', () => {
    it('deve retornar despesa se encontrada', async () => {
      const expenseId = new Types.ObjectId().toString();
      const mockExpense = {
        _id: new Types.ObjectId(expenseId),
        description: 'Test expense',
        amount: 100,
      };

      mockExpenseModel.findById.mockReturnValue({
        exec: jest.fn().mockResolvedValue(mockExpense),
      });

      const result = await expenseService.findById(expenseId);

      expect(result).toEqual(mockExpense);
    });

    it('deve retornar erro se não encontrada', async () => {
      mockExpenseModel.findById.mockReturnValue({
        exec: jest.fn().mockResolvedValue(null),
      });

      await expect(expenseService.findById('invalidId')).rejects.toThrow(
        NotFoundException,
      );
    });

    it('deve validar formato do ID', async () => {
      await expect(expenseService.findById('invalidId')).rejects.toThrow(
        BadRequestException,
      );
    });
  });

  describe('update()', () => {
    it('deve atualizar despesa existente', async () => {
      const expenseId = new Types.ObjectId().toString();
      const updateExpenseDto: UpdateExpenseDto = {
        description: 'Updated expense',
        amount: 150,
      };

      const updatedExpense = {
        _id: new Types.ObjectId(expenseId),
        ...updateExpenseDto,
      };

      mockExpenseModel.findByIdAndUpdate.mockReturnValue({
        exec: jest.fn().mockResolvedValue(updatedExpense),
      });

      const result = await expenseService.update(expenseId, updateExpenseDto);

      expect(result).toEqual(updatedExpense);
    });

    it('deve retornar erro para despesa inexistente', async () => {
      mockExpenseModel.findByIdAndUpdate.mockReturnValue({
        exec: jest.fn().mockResolvedValue(null),
      });

      await expect(
        expenseService.update('invalidId', { description: 'test' }),
      ).rejects.toThrow(NotFoundException);
    });
  });

  describe('remove()', () => {
    it('deve deletar despesa existente', async () => {
      const expenseId = new Types.ObjectId().toString();

      mockExpenseModel.findByIdAndDelete.mockReturnValue({
        exec: jest.fn().mockResolvedValue({ _id: expenseId }),
      });

      await expenseService.remove(expenseId);

      expect(mockExpenseModel.findByIdAndDelete).toHaveBeenCalledWith(expenseId);
    });

    it('deve retornar erro para despesa inexistente', async () => {
      mockExpenseModel.findByIdAndDelete.mockReturnValue({
        exec: jest.fn().mockResolvedValue(null),
      });

      await expect(expenseService.remove('invalidId')).rejects.toThrow(
        NotFoundException,
      );
    });
  });

  describe('getByDateRange()', () => {
    it('deve retornar despesas no período', async () => {
      const userId = new Types.ObjectId().toString();
      const startDate = new Date('2024-01-01');
      const endDate = new Date('2024-01-31');

      const mockExpenses = [
        {
          _id: new Types.ObjectId(),
          description: 'Expense 1',
          amount: 100,
          date: new Date('2024-01-15'),
        },
      ];

      mockExpenseModel.find.mockReturnValue({
        exec: jest.fn().mockResolvedValue(mockExpenses),
      });

      const result = await expenseService.getByDateRange(userId, startDate, endDate);

      expect(result).toEqual(mockExpenses);
    });
  });
});

