import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Expense } from './expense.entity';

@Injectable()
export class ExpenseService {
  constructor(
    @InjectRepository(Expense)
    private expenseRepository: Repository<Expense>,
  ) {}

  findAll(): Promise<Expense[]> {
    return this.expenseRepository.find();
  }

  create(expense: Partial<Expense>): Promise<Expense> {
    const newExpense = this.expenseRepository.create(expense);
    return this.expenseRepository.save(newExpense);
  }

  // Método para consultar por intervalo de data (usando QueryBuilder)
  async findByDateRange(startDate: string, endDate: string): Promise<Expense[]> {
    return this.expenseRepository
      .createQueryBuilder('expense')
      .where('expense.date >= :startDate', { startDate })
      .andWhere('expense.date <= :endDate', { endDate })
      .getMany();
  }

  // Atualizar um registro
  async update(id: number, expense: Partial<Expense>): Promise<Expense> {
    await this.expenseRepository.update(id, expense);
    return this.expenseRepository.findOne({ where: { id } });
  }

  // Excluir um registro
  async delete(id: string): Promise<void> {
    await this.expenseRepository.delete(id);
  }
}
