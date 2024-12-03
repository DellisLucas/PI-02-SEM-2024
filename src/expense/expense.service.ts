import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Expense } from './expense.entity';

@Injectable()
export class ExpenseService {
  constructor(
    @InjectRepository(Expense)
    private expenseRepository: Repository<Expense>,
  ) {}

  async findAll(userId: number): Promise<Expense[]> {
    return this.expenseRepository.find({ where: { user: { id: userId } } });
  }
  
  async create(expense: Partial<Expense>, userId: number): Promise<Expense> {
    const newExpense = this.expenseRepository.create({ ...expense, user: { id: userId } });
    return this.expenseRepository.save(newExpense);
  }

  async findByDateRange(startDate: string, endDate: string, userId: number): Promise<Expense[]> {
    return this.expenseRepository
      .createQueryBuilder('expense')
      .where('expense.date >= :startDate', { startDate })
      .andWhere('expense.date <= :endDate', { endDate })
      .andWhere('expense.user.id = :userId', { userId })
      .getMany();
  }

  async update(id: number, expense: Partial<Expense>, userId: number): Promise<Expense> {
    const existingExpense = await this.expenseRepository.findOne({ where: { id, user: { id: userId } } });
    if (!existingExpense) {
      throw new NotFoundException('Despesa não encontrada ou não pertence ao usuário.');
    }
    Object.assign(existingExpense, expense);
    return this.expenseRepository.save(existingExpense);
  }

  async delete(id: string, userId: number): Promise<void> {
    const expense = await this.expenseRepository.findOne({ where: { id: +id, user: { id: userId } } });
    if (!expense) {
      throw new NotFoundException('Despesa não encontrada ou não pertence ao usuário.');
    }
    await this.expenseRepository.delete(id);
  }
}
