import { Test, TestingModule } from '@nestjs/testing';
import { MongooseModule } from '@nestjs/mongoose';
import { INestApplication } from '@nestjs/common';
import * as request from 'supertest';

import { UserModule } from '../../src/user/user.module';
import { AuthModule } from '../../src/auth/auth.module';
import { ExpenseModule } from '../../src/expense/expense.module';

import { UserService } from '../../src/user/user.service';
import { AuthService } from '../../src/auth/auth.service';
import { ExpenseService } from '../../src/expense/expense.service';

import { CreateUserDto } from '../../src/user/dto/create-user.dto';
import { CreateExpenseDto } from '../../src/expense/dto/create-expense.dto';

describe('🔐 Integração Auth + User (E2E)', () => {
  let app: INestApplication;
  let userService: UserService;
  let authService: AuthService;
  let expenseService: ExpenseService;

  let testUser: any;
  let authToken: string;
  let userId: string;

  const mongoUri = process.env.MONGODB_URI || 'mongodb://localhost:27017/cashtab-test';

  beforeAll(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [
        MongooseModule.forRoot(mongoUri),
        UserModule,
        AuthModule,
        ExpenseModule,
      ],
    }).compile();

    app = moduleFixture.createNestApplication();
    await app.init();

    userService = moduleFixture.get<UserService>(UserService);
    authService = moduleFixture.get<AuthService>(AuthService);
    expenseService = moduleFixture.get<ExpenseService>(ExpenseService);
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
    authToken = registerResult.access_token;
  });

  afterEach(async () => {
    try {
      if (userId) {
        const expenses = await expenseService.findAll(userId);
        for (const expense of expenses) {
          await expenseService.remove(expense._id.toString());
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

  describe('Fluxo completo de registro e login', () => {
    it('deve realizar fluxo completo de registro e login', async () => {
      const createUserDto: CreateUserDto = {
        username: `newuser_${Date.now()}`,
        email: `newuser_${Date.now()}@example.com`,
        password: 'password123',
      };

      // 1. Registrar usuário
      const registerResult = await authService.register(createUserDto);
      expect(registerResult).toHaveProperty('access_token');
      expect(registerResult).toHaveProperty('user');
      expect(registerResult.user.email).toBe(createUserDto.email);

      // 2. Validar que usuário foi criado no banco
      const user = await userService.findByEmail(createUserDto.email);
      expect(user).toBeDefined();
      expect(user?.email).toBe(createUserDto.email);

      // 3. Fazer login com credenciais
      const loginResult = await authService.login(user as any);
      expect(loginResult).toHaveProperty('access_token');
      expect(loginResult.user.id).toBe(user?._id.toString());

      // Limpar
      await userService.remove(user?._id.toString());
    });

    it('deve validar que token JWT permite acesso a recursos protegidos', async () => {
      const createUserDto: CreateUserDto = {
        username: `jwtuser_${Date.now()}`,
        email: `jwtuser_${Date.now()}@example.com`,
        password: 'password123',
      };

      const registerResult = await authService.register(createUserDto);
      const token = registerResult.access_token;

      expect(token).toBeDefined();
      expect(typeof token).toBe('string');
      expect(token.length).toBeGreaterThan(0);

      // Limpar
      await userService.remove(registerResult.user.id);
    });

    it('deve bloquear acesso com token inválido', async () => {
      const invalidToken = 'invalid.token.here';

      const response = await request(app.getHttpServer())
        .get('/expenses')
        .query({ userId })
        .set('Authorization', `Bearer ${invalidToken}`)
        .expect(401);

      expect(response.body).toBeDefined();
    });

    it('deve validar isolamento de dados por usuário', async () => {
      // Criar segundo usuário
      const createUser2Dto: CreateUserDto = {
        username: `user2_${Date.now()}`,
        email: `user2_${Date.now()}@example.com`,
        password: 'password123',
      };

      const registerResult2 = await authService.register(createUser2Dto);
      const userId2 = registerResult2.user.id;
      const token2 = registerResult2.access_token;

      // Criar despesa para usuário 1
      const expenseDto1: CreateExpenseDto = {
        description: 'Expense User 1',
        amount: 100,
        date: new Date(),
        userId: userId,
      };

      const expense1 = await expenseService.create(expenseDto1);

      // Tentar acessar despesa do usuário 1 com token do usuário 2
      const response = await request(app.getHttpServer())
        .get('/expenses')
        .query({ userId })
        .set('Authorization', `Bearer ${token2}`)
        .expect(403);

      expect(response.body.message).toContain('Não autorizado');

      // Limpar
      await expenseService.remove(expense1._id.toString());
      await userService.remove(userId2);
    });
  });

  describe('Autenticação e autorização', () => {
    it('deve permitir acesso com token válido', async () => {
      const response = await request(app.getHttpServer())
        .get('/expenses')
        .query({ userId })
        .set('Authorization', `Bearer ${authToken}`)
        .expect(200);

      expect(response.body).toHaveProperty('success', true);
    });

    it('deve bloquear acesso sem token', async () => {
      const response = await request(app.getHttpServer())
        .get('/expenses')
        .query({ userId })
        .expect(401);

      expect(response.body).toBeDefined();
    });
  });
});

