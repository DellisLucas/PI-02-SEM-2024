import { NestFactory } from '@nestjs/core';
import { AppModule } from '../app.module';
import { IncomeService } from '../income/income.service';
import { ExpenseService } from '../expense/expense.service';
import { Types } from 'mongoose';

async function bootstrap() {
  const app = await NestFactory.createApplicationContext(AppModule);
  const incomeService = app.get(IncomeService);
  const expenseService = app.get(ExpenseService);

  // ID do usuário para teste
  const userId = '65f2d5e8c261b6001234abcd'; // Substitua pelo ID real do usuário

  // Dados de receitas
  const incomes = [
    // Abril
    {
      userId: userId,
      amount: 5000,
      description: 'Salário',
      date: new Date('2024-04-05'),
      category: 'Salário',
      paymentMethod: 'Transferência',
      isRecurring: true,
      recurrenceFrequency: 'monthly',
      notes: 'Salário mensal'
    },
    {
      userId: userId,
      amount: 800,
      description: 'Freelance',
      date: new Date('2024-04-15'),
      category: 'Freelance',
      paymentMethod: 'PIX',
      isRecurring: false,
      notes: 'Projeto de desenvolvimento web'
    },
    // Maio
    {
      userId: userId,
      amount: 5000,
      description: 'Salário',
      date: new Date('2024-05-05'),
      category: 'Salário',
      paymentMethod: 'Transferência',
      isRecurring: true,
      recurrenceFrequency: 'monthly',
      notes: 'Salário mensal'
    },
    {
      userId: userId,
      amount: 1200,
      description: 'Freelance',
      date: new Date('2024-05-20'),
      category: 'Freelance',
      paymentMethod: 'PIX',
      isRecurring: false,
      notes: 'Projeto de consultoria'
    },
    // Junho
    {
      userId: userId,
      amount: 5000,
      description: 'Salário',
      date: new Date('2024-06-05'),
      category: 'Salário',
      paymentMethod: 'Transferência',
      isRecurring: true,
      recurrenceFrequency: 'monthly',
      notes: 'Salário mensal'
    },
    {
      userId: userId,
      amount: 1500,
      description: 'Freelance',
      date: new Date('2024-06-25'),
      category: 'Freelance',
      paymentMethod: 'PIX',
      isRecurring: false,
      notes: 'Projeto de design'
    }
  ];

  // Dados de despesas
  const expenses = [
    // Abril
    {
      userId: userId,
      amount: 1200,
      description: 'Aluguel',
      date: new Date('2024-04-01'),
      category: 'Moradia',
      paymentMethod: 'Débito Automático',
      isRecurring: true,
      recurrenceFrequency: 'monthly',
      notes: 'Aluguel do apartamento'
    },
    {
      userId: userId,
      amount: 350,
      description: 'Supermercado',
      date: new Date('2024-04-10'),
      category: 'Alimentação',
      paymentMethod: 'Cartão de Crédito',
      isRecurring: false,
      notes: 'Compras mensais'
    },
    {
      userId: userId,
      amount: 150,
      description: 'Internet',
      date: new Date('2024-04-15'),
      category: 'Serviços',
      paymentMethod: 'Débito Automático',
      isRecurring: true,
      recurrenceFrequency: 'monthly',
      notes: 'Plano de internet'
    },
    // Maio
    {
      userId: userId,
      amount: 1200,
      description: 'Aluguel',
      date: new Date('2024-05-01'),
      category: 'Moradia',
      paymentMethod: 'Débito Automático',
      isRecurring: true,
      recurrenceFrequency: 'monthly',
      notes: 'Aluguel do apartamento'
    },
    {
      userId: userId,
      amount: 400,
      description: 'Supermercado',
      date: new Date('2024-05-12'),
      category: 'Alimentação',
      paymentMethod: 'Cartão de Crédito',
      isRecurring: false,
      notes: 'Compras mensais'
    },
    {
      userId: userId,
      amount: 150,
      description: 'Internet',
      date: new Date('2024-05-15'),
      category: 'Serviços',
      paymentMethod: 'Débito Automático',
      isRecurring: true,
      recurrenceFrequency: 'monthly',
      notes: 'Plano de internet'
    },
    {
      userId: userId,
      amount: 200,
      description: 'Presente',
      date: new Date('2024-05-20'),
      category: 'Lazer',
      paymentMethod: 'Cartão de Crédito',
      isRecurring: false,
      notes: 'Presente de aniversário'
    },
    // Junho
    {
      userId: userId,
      amount: 1200,
      description: 'Aluguel',
      date: new Date('2024-06-01'),
      category: 'Moradia',
      paymentMethod: 'Débito Automático',
      isRecurring: true,
      recurrenceFrequency: 'monthly',
      notes: 'Aluguel do apartamento'
    },
    {
      userId: userId,
      amount: 380,
      description: 'Supermercado',
      date: new Date('2024-06-08'),
      category: 'Alimentação',
      paymentMethod: 'Cartão de Crédito',
      isRecurring: false,
      notes: 'Compras mensais'
    },
    {
      userId: userId,
      amount: 150,
      description: 'Internet',
      date: new Date('2024-06-15'),
      category: 'Serviços',
      paymentMethod: 'Débito Automático',
      isRecurring: true,
      recurrenceFrequency: 'monthly',
      notes: 'Plano de internet'
    },
    {
      userId: userId,
      amount: 500,
      description: 'Manutenção Carro',
      date: new Date('2024-06-20'),
      category: 'Transporte',
      paymentMethod: 'Cartão de Crédito',
      isRecurring: false,
      notes: 'Troca de óleo e filtros'
    }
  ];

  try {
    // Inserir receitas
    for (const income of incomes) {
      await incomeService.create(income);
      console.log(`Receita criada: ${income.description} - ${income.amount}`);
    }

    // Inserir despesas
    for (const expense of expenses) {
      await expenseService.create(expense);
      console.log(`Despesa criada: ${expense.description} - ${expense.amount}`);
    }

    console.log('Banco de dados populado com sucesso!');
  } catch (error) {
    console.error('Erro ao popular banco de dados:', error);
  } finally {
    await app.close();
  }
}

bootstrap(); 