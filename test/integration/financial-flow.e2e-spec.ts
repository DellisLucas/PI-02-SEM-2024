import { Test, TestingModule } from '@nestjs/testing';
import { MongooseModule } from '@nestjs/mongoose';
import { INestApplication } from '@nestjs/common';

import { UserModule } from '../../src/user/user.module';
import { AuthModule } from '../../src/auth/auth.module';
import { ExpenseModule } from '../../src/expense/expense.module';
import { IncomeModule } from '../../src/income/income.module';
import { ReportModule } from '../../src/report/report.module';

import { UserService } from '../../src/user/user.service';
import { AuthService } from '../../src/auth/auth.service';
import { ExpenseService } from '../../src/expense/expense.service';
import { IncomeService } from '../../src/income/income.service';
import { ReportsService } from '../../src/report/report.service';

import { CreateUserDto } from '../../src/user/dto/create-user.dto';
import { CreateExpenseDto } from '../../src/expense/dto/create-expense.dto';
import { CreateIncomeDto } from '../../src/income/dto/create-income.dto';

describe('💰 Integração Income + Expense + Reports (E2E)', () => {
  let app: INestApplication;
  let userService: UserService;
  let authService: AuthService;
  let expenseService: ExpenseService;
  let incomeService: IncomeService;
  let reportsService: ReportsService;

  let testUser: any;
  let userId: string;

  const mongoUri = process.env.MONGODB_URI || 'mongodb://localhost:27017/cashtab-test';

  beforeAll(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [
        MongooseModule.forRoot(mongoUri),
        UserModule,
        AuthModule,
        ExpenseModule,
        IncomeModule,
        ReportModule,
      ],
    }).compile();

    app = moduleFixture.createNestApplication();
    await app.init();

    userService = moduleFixture.get<UserService>(UserService);
    authService = moduleFixture.get<AuthService>(AuthService);
    expenseService = moduleFixture.get<ExpenseService>(ExpenseService);
    incomeService = moduleFixture.get<IncomeService>(IncomeService);
    reportsService = moduleFixture.get<ReportsService>(ReportsService);
  });

  beforeEach(async () => {
    const createUserDto: CreateUserDto = {
      username: `testuser_${Date.now()}`,
      email: `test_${Date.now()}@example.com`,
      password: 'password123',
    };

    const registerResult = await authService.register(createUserDto);
    testUser = registerResult.user;
    userId = testUser.id;
  });

  afterEach(async () => {
    try {
      if (userId) {
        const expenses = await expenseService.findAll(userId);
        for (const expense of expenses) {
          await expenseService.remove(expense._id.toString());
        }

        const incomes = await incomeService.findAll(userId);
        for (const income of incomes) {
          await incomeService.remove(income._id.toString());
        }

        await userService.remove(userId);
      }
    } catch (error) {
      // Ignorar erros de limpeza
    }
  });

  afterAll(async () => {
    await app.close();
  });

  describe('Integração Expense + User', () => {
    it('deve criar despesa e associar ao usuário', async () => {
      const createExpenseDto: CreateExpenseDto = {
        description: 'Test Expense Integration',
        amount: 150.50,
        date: new Date(),
        userId: userId,
        category: 'Food',
      };

      const expense = await expenseService.create(createExpenseDto);

      expect(expense).toBeDefined();
      expect(expense.description).toBe(createExpenseDto.description);
      expect(expense.amount).toBe(createExpenseDto.amount);
      expect(expense.userId).toBe(userId);

      const expenses = await expenseService.findAll(userId);
      expect(expenses).toContainEqual(
        expect.objectContaining({
          description: createExpenseDto.description,
        }),
      );
    });

    it('deve deletar despesa e remover referência', async () => {
      const createExpenseDto: CreateExpenseDto = {
        description: 'Expense to Delete',
        amount: 200,
        date: new Date(),
        userId: userId,
      };

      const expense = await expenseService.create(createExpenseDto);
      const expenseId = expense._id.toString();

      const foundExpense = await expenseService.findById(expenseId);
      expect(foundExpense).toBeDefined();

      await expenseService.remove(expenseId);

      await expect(expenseService.findById(expenseId)).rejects.toThrow();
    });

    it('deve atualizar despesa mantendo associação com usuário', async () => {
      const createExpenseDto: CreateExpenseDto = {
        description: 'Original Description',
        amount: 100,
        date: new Date(),
        userId: userId,
      };

      const expense = await expenseService.create(createExpenseDto);
      const expenseId = expense._id.toString();

      const updatedExpense = await expenseService.update(expenseId, {
        description: 'Updated Description',
        amount: 150,
      });

      expect(updatedExpense.description).toBe('Updated Description');
      expect(updatedExpense.amount).toBe(150);
      expect(updatedExpense.userId).toBe(userId);
    });
  });

  describe('Integração Income + User', () => {
    it('deve criar receita e associar ao usuário', async () => {
      const createIncomeDto: CreateIncomeDto = {
        description: 'Test Income Integration',
        amount: 1000,
        date: new Date(),
        userId: userId,
        category: 'Salary',
      };

      const income = await incomeService.create(createIncomeDto);

      expect(income).toBeDefined();
      expect(income.description).toBe(createIncomeDto.description);
      expect(income.amount).toBe(createIncomeDto.amount);
      expect(income.userId.toString()).toBe(userId);

      const incomes = await incomeService.findAll(userId);
      expect(incomes.length).toBeGreaterThan(0);
      expect(incomes.some((i) => i._id.toString() === income._id.toString())).toBe(true);
    });

    it('deve deletar receita e remover referência', async () => {
      const createIncomeDto: CreateIncomeDto = {
        description: 'Income to Delete',
        amount: 500,
        date: new Date(),
        userId: userId,
      };

      const income = await incomeService.create(createIncomeDto);
      const incomeId = income._id.toString();

      const foundIncome = await incomeService.findOne(incomeId);
      expect(foundIncome).toBeDefined();

      await incomeService.remove(incomeId);

      const deletedIncome = await incomeService.findOne(incomeId);
      expect(deletedIncome).toBeNull();
    });
  });

  describe('Integração Report + Expense + Income', () => {
    it('deve gerar relatório mensal com dados reais', async () => {
      const currentDate = new Date();
      const month = currentDate.getMonth() + 1;
      const year = currentDate.getFullYear();

      const income1 = await incomeService.create({
        description: 'Salary',
        amount: 5000,
        date: new Date(year, month - 1, 15),
        userId: userId,
      });

      const income2 = await incomeService.create({
        description: 'Freelance',
        amount: 2000,
        date: new Date(year, month - 1, 20),
        userId: userId,
      });

      const expense1 = await expenseService.create({
        description: 'Rent',
        amount: 1500,
        date: new Date(year, month - 1, 1),
        userId: userId,
      });

      const expense2 = await expenseService.create({
        description: 'Food',
        amount: 500,
        date: new Date(year, month - 1, 10),
        userId: userId,
      });

      const report = await reportsService.getMonthlyReport(userId, month, year);

      expect(report).toBeDefined();
      expect(report.totalIncome).toBe(7000);
      expect(report.totalExpense).toBe(2000);
      expect(report.balance).toBe(5000);
      expect(report.month).toBe(month);
      expect(report.year).toBe(year);
    });

    it('deve gerar relatório anual com dados agregados', async () => {
      const year = 2024;

      await incomeService.create({
        description: 'Jan Income',
        amount: 5000,
        date: new Date(year, 0, 15),
        userId: userId,
      });

      await incomeService.create({
        description: 'Feb Income',
        amount: 6000,
        date: new Date(year, 1, 15),
        userId: userId,
      });

      await expenseService.create({
        description: 'Jan Expense',
        amount: 2000,
        date: new Date(year, 0, 10),
        userId: userId,
      });

      await expenseService.create({
        description: 'Feb Expense',
        amount: 2500,
        date: new Date(year, 1, 10),
        userId: userId,
      });

      const report = await reportsService.getYearlyReport(userId, year);

      expect(report).toBeDefined();
      expect(report.year).toBe(year);
      expect(report).toHaveProperty('monthlyData');
      expect(report.monthlyData).toHaveLength(12);
      expect(report.totalIncome).toBeGreaterThan(0);
      expect(report.totalExpense).toBeGreaterThan(0);
    });

    it('deve gerar relatório por categoria com dados reais', async () => {
      const startDate = new Date('2024-01-01');
      const endDate = new Date('2024-01-31');

      await incomeService.create({
        description: 'Salary',
        amount: 5000,
        date: new Date('2024-01-15'),
        userId: userId,
        category: 'Salary',
      });

      await incomeService.create({
        description: 'Freelance',
        amount: 2000,
        date: new Date('2024-01-20'),
        userId: userId,
        category: 'Freelance',
      });

      await expenseService.create({
        description: 'Food',
        amount: 500,
        date: new Date('2024-01-10'),
        userId: userId,
        category: 'Food',
      });

      await expenseService.create({
        description: 'Transport',
        amount: 300,
        date: new Date('2024-01-12'),
        userId: userId,
        category: 'Transport',
      });

      const report = await reportsService.getCategoryReport(userId, startDate, endDate);

      expect(report).toBeDefined();
      expect(report).toHaveProperty('incomeCategories');
      expect(report).toHaveProperty('expenseCategories');
      expect(report.totalIncome).toBe(7000);
      expect(report.totalExpense).toBe(800);
    });

    it('deve calcular saldo correto (receitas - despesas)', async () => {
      const currentDate = new Date();
      const month = currentDate.getMonth() + 1;
      const year = currentDate.getFullYear();

      await incomeService.create({
        description: 'Income 1',
        amount: 6000,
        date: new Date(year, month - 1, 15),
        userId: userId,
      });

      await incomeService.create({
        description: 'Income 2',
        amount: 4000,
        date: new Date(year, month - 1, 20),
        userId: userId,
      });

      await expenseService.create({
        description: 'Expense 1',
        amount: 2000,
        date: new Date(year, month - 1, 5),
        userId: userId,
      });

      await expenseService.create({
        description: 'Expense 2',
        amount: 1500,
        date: new Date(year, month - 1, 10),
        userId: userId,
      });

      const report = await reportsService.getMonthlyReport(userId, month, year);

      expect(report.balance).toBe(6500);
    });
  });

  describe('Fluxo completo financeiro', () => {
    it('deve realizar fluxo completo: criar despesa → criar receita → gerar relatório', async () => {
      const expense1 = await expenseService.create({
        description: 'Rent',
        amount: 1500,
        date: new Date(),
        userId: userId,
      });

      const expense2 = await expenseService.create({
        description: 'Food',
        amount: 500,
        date: new Date(),
        userId: userId,
      });

      expect(expense1).toBeDefined();
      expect(expense2).toBeDefined();

      const income1 = await incomeService.create({
        description: 'Salary',
        amount: 5000,
        date: new Date(),
        userId: userId,
      });

      const income2 = await incomeService.create({
        description: 'Freelance',
        amount: 2000,
        date: new Date(),
        userId: userId,
      });

      expect(income1).toBeDefined();
      expect(income2).toBeDefined();

      const currentDate = new Date();
      const report = await reportsService.getMonthlyReport(
        userId,
        currentDate.getMonth() + 1,
        currentDate.getFullYear(),
      );

      expect(report.totalIncome).toBe(7000);
      expect(report.totalExpense).toBe(2000);
      expect(report.balance).toBe(5000);
    });
  });
});

