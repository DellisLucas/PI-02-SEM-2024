import { Injectable } from '@nestjs/common';
import { Repository } from 'typeorm';
import { InjectRepository } from '@nestjs/typeorm';
import { Expense } from '../expense/expense.entity';
import { Income } from '../income/income.entity';

@Injectable()
export class ReportsService {
  constructor(
    @InjectRepository(Expense)
    private readonly expenseRepository: Repository<Expense>,
    @InjectRepository(Income)
    private readonly incomeRepository: Repository<Income>,
  ) {}

  async getFilteredData(filters: any) {
    const { type, startDate, endDate, minValue, maxValue } = filters;

    let results = [];

    if (type === 'expenses' || type === 'both') {
      const expensesQuery = this.expenseRepository.createQueryBuilder('expense');

      if (startDate) {
        expensesQuery.andWhere('expense.date >= :startDate', { startDate });
      }
      if (endDate) {
        expensesQuery.andWhere('expense.date <= :endDate', { endDate });
      }
      if (minValue) {
        expensesQuery.andWhere('expense.amount >= :minValue', { minValue });
      }
      if (maxValue) {
        expensesQuery.andWhere('expense.amount <= :maxValue', { maxValue });
      }

      const expenses = await expensesQuery.getMany();
      results.push(...expenses.map((e) => ({ ...e, type: 'Despesa' })));
    }

    if (type === 'incomes' || type === 'both') {
      const incomesQuery = this.incomeRepository.createQueryBuilder('income');

      if (startDate) {
        incomesQuery.andWhere('income.date >= :startDate', { startDate });
      }
      if (endDate) {
        incomesQuery.andWhere('income.date <= :endDate', { endDate });
      }
      if (minValue) {
        incomesQuery.andWhere('income.amount >= :minValue', { minValue });
      }
      if (maxValue) {
        incomesQuery.andWhere('income.amount <= :maxValue', { maxValue });
      }

      const incomes = await incomesQuery.getMany();
      results.push(...incomes.map((i) => ({ ...i, type: 'Receita' })));
    }

    return results;
  }
}
