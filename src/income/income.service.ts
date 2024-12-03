import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Income } from './income.entity';

@Injectable()
export class IncomeService {
  constructor(
    @InjectRepository(Income)
    private incomeRepository: Repository<Income>,
  ) {}

  async findAll(userId: number): Promise<Income[]> {
    return this.incomeRepository.find({ where: { user: { id: userId } } });
  }

  async create(income: Partial<Income>, userId: number): Promise<Income> {
    const newIncome = this.incomeRepository.create({ ...income, user: { id: userId } });
    return this.incomeRepository.save(newIncome);
  }

  async findByDateRange(startDate: string, endDate: string, userId: number): Promise<Income[]> {
    return this.incomeRepository
      .createQueryBuilder('income')
      .where('income.date >= :startDate', { startDate })
      .andWhere('income.date <= :endDate', { endDate })
      .andWhere('income.user.id = :userId', { userId })
      .getMany();
  }

  async update(id: number, income: Partial<Income>, userId: number): Promise<Income> {
    const existingIncome = await this.incomeRepository.findOne({ where: { id, user: { id: userId } } });
    if (!existingIncome) {
      throw new NotFoundException('Receita não encontrada ou não pertence ao usuário.');
    }
    Object.assign(existingIncome, income);
    return this.incomeRepository.save(existingIncome);
  }

  async delete(id: string, userId: number): Promise<void> {
    const income = await this.incomeRepository.findOne({ where: { id: +id, user: { id: userId } } });
    if (!income) {
      throw new NotFoundException('Receita não encontrada ou não pertence ao usuário.');
    }
    await this.incomeRepository.delete(id);
  }
}
