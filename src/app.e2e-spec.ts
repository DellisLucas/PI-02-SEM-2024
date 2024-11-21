import { Test, TestingModule } from '@nestjs/testing';
import { AppModule } from './app.module';
import * as request from 'supertest';
import { INestApplication } from '@nestjs/common';

describe('API Endpoints E2E', () => {
  let app: INestApplication;

  beforeAll(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleFixture.createNestApplication();
    await app.init();
  });

  // Testes de autenticação
  describe('Auth', () => {
    it('/auth/register (POST)', () => {
      return request(app.getHttpServer())
        .post('/auth/register')
        .send({ username: 'testuser', password: 'testpass' })
        .expect(201);
    });

    it('/auth/login (POST)', () => {
      return request(app.getHttpServer())
        .post('/auth/login')
        .send({ username: 'testuser', password: 'testpass' })
        .expect(200)
        .expect(({ body }) => {
          expect(body).toHaveProperty('token');
        });
    });
  });

  // Testes de usuários
  describe('User', () => {
    let userId: number;

    it('/users (GET)', () => {
      return request(app.getHttpServer())
        .get('/users')
        .expect(200);
    });

    it('/users (POST)', () => {
      return request(app.getHttpServer())
        .post('/users')
        .send({ username: 'newuser', password: 'newpass' })
        .expect(201)
        .expect(({ body }) => {
          userId = body.id; // Armazena o ID do usuário criado
        });
    });

    it('/users/:id (GET)', () => {
      return request(app.getHttpServer())
        .get(`/users/${userId}`)
        .expect(200);
    });

    it('/users/:id (PUT)', () => {
      return request(app.getHttpServer())
        .put(`/users/${userId}`)
        .send({ username: 'updateduser' })
        .expect(200);
    });

    it('/users/:id (DELETE)', () => {
      return request(app.getHttpServer())
        .delete(`/users/${userId}`)
        .expect(204);
    });
  });

  // Testes de income
  describe('Income', () => {
    let incomeId: number;

    it('/incomes (GET)', () => {
      return request(app.getHttpServer())
        .get('/incomes')
        .expect(200);
    });

    it('/incomes (POST)', () => {
      return request(app.getHttpServer())
        .post('/incomes')
        .send({ amount: 1000, description: 'Salary', userId: 1 }) // Ajuste o userId conforme necessário
        .expect(201)
        .expect(({ body }) => {
          incomeId = body.id; // Armazena o ID da renda criada
        });
    });

    it('/incomes/:id (GET)', () => {
      return request(app.getHttpServer())
        .get(`/incomes/${incomeId}`)
        .expect(200);
    });

    it('/incomes/:id (PUT)', () => {
      return request(app.getHttpServer())
        .put(`/incomes/${incomeId}`)
        .send({ amount: 1200, description: 'Updated Salary' })
        .expect(200);
    });

    it('/incomes/:id (DELETE)', () => {
      return request(app.getHttpServer())
        .delete(`/incomes/${incomeId}`)
        .expect(204);
    });
  });

  // Testes de expense
  describe('Expense', () => {
    let expenseId: number;

    it('/expenses (GET)', () => {
      return request(app.getHttpServer())
        .get('/expenses')
        .expect(200);
    });

    it('/expenses (POST)', () => {
      return request(app.getHttpServer())
        .post('/expenses')
        .send({ amount: 500, description: 'Groceries', userId: 1 }) // Ajuste o userId conforme necessário
        .expect(201)
        .expect(({ body }) => {
          expenseId = body.id; // Armazena o ID da despesa criada
        });
    });

    it('/expenses/:id (GET)', () => {
      return request(app.getHttpServer())
        .get(`/expenses/${expenseId}`)
        .expect(200);
    });

    it('/expenses/:id (PUT)', () => {
      return request(app.getHttpServer())
        .put(`/expenses/${expenseId}`)
        .send({ amount: 600, description: 'Updated Groceries' })
        .expect(200);
    });

    it('/expenses/:id (DELETE)', () => {
      return request(app.getHttpServer())
        .delete(`/expenses/${expenseId}`)
        .expect(204);
    });
  });

  afterAll(async () => {
    await app.close();
  });
});
