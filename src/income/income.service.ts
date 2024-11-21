import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Income } from './income.entity';

@Injectable()
export class IncomeService {
  constructor(
    @InjectRepository(Income)
    private incomeRepository: Repository<Income>,
  ) {}

  findAll(): Promise<Income[]> {
    return this.incomeRepository.find();
  }

  create(income: Partial<Income>): Promise<Income> {
    const newIncome = this.incomeRepository.create(income);
    return this.incomeRepository.save(newIncome);
  }

  // Método para consultar por intervalo de data
  async findByDateRange(startDate: string, endDate: string): Promise<Income[]> {
    return this.incomeRepository
      .createQueryBuilder('income')
      .where('income.date >= :startDate', { startDate })
      .andWhere('income.date <= :endDate', { endDate })
      .getMany();
  }

  // Atualizar um registro
  async update(id: number, income: Partial<Income>): Promise<Income> {
    await this.incomeRepository.update(id, income);
    return this.incomeRepository.findOne({ where: { id } }); // Corrigido aqui
  }


  // Excluir um registro
  async delete(id: string): Promise<void> {
    await this.incomeRepository.delete(id);
  }
}
