import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { Expense } from './schemas/expense.schema';
import { CreateExpenseDto } from './dto/create-expense.dto';
import { UpdateExpenseDto } from './dto/update-expense.dto';

@Injectable()
export class ExpenseService {
  constructor(
    @InjectModel(Expense.name) private expenseModel: Model<Expense>
  ) {}

  async findById(id: string): Promise<Expense> {
    try {
      if (!Types.ObjectId.isValid(id)) {
        throw new BadRequestException('ID inválido');
      }
      const expense = await this.expenseModel.findById(id).exec();
      if (!expense) {
        throw new NotFoundException('Despesa não encontrada');
      }
      return expense;
    } catch (error: any) {
      if (error instanceof BadRequestException || error instanceof NotFoundException) {
        throw error;
      }
      throw new BadRequestException('Erro ao buscar despesa: ' + (error?.message || 'Erro desconhecido'));
    }
  }

  async findAll(userId: string): Promise<Expense[]> {
    return this.expenseModel.find({ userId }).exec();
  }

  async create(createExpenseDto: CreateExpenseDto): Promise<Expense> {
    try {
      // Garante que a data seja um objeto Date válido
      const expenseData = {
        ...createExpenseDto,
        date: new Date(createExpenseDto.date)
      };

      // Valida se a data é válida
      if (isNaN(expenseData.date.getTime())) {
        throw new BadRequestException('Data inválida');
      }
      
      const newExpense = new this.expenseModel(expenseData);
      return newExpense.save();
    } catch (error: any) {
      if (error instanceof BadRequestException) {
        throw error;
      }
      throw new BadRequestException('Erro ao criar despesa: ' + (error?.message || 'Erro desconhecido'));
    }
  }

  async getByDateRange(userId: string, startDate: Date, endDate: Date): Promise<Expense[]> {
    return this.expenseModel.find({
      userId,
      date: {
        $gte: startDate,
        $lte: endDate
      }
    }).exec();
  }

  async update(id: string, updateExpenseDto: UpdateExpenseDto): Promise<Expense> {
    try {
      // Converte a data se ela estiver presente
      const updateData = {
        ...updateExpenseDto,
        date: updateExpenseDto.date ? new Date(updateExpenseDto.date) : undefined
      };

      // Valida a data se ela estiver presente
      if (updateData.date && isNaN(updateData.date.getTime())) {
        throw new BadRequestException('Data inválida');
      }

      const updatedExpense = await this.expenseModel
        .findByIdAndUpdate(id, updateData, { new: true })
        .exec();
      if (!updatedExpense) {
        throw new NotFoundException('Despesa não encontrada');
      }
      return updatedExpense;
    } catch (error: any) {
      if (error instanceof BadRequestException || error instanceof NotFoundException) {
        throw error;
      }
      throw new BadRequestException('Erro ao atualizar despesa: ' + (error?.message || 'Erro desconhecido'));
    }
  }

  async remove(id: string): Promise<void> {
    const result = await this.expenseModel.findByIdAndDelete(id).exec();
    if (!result) {
      throw new NotFoundException('Despesa não encontrada');
    }
  }

  async getTotalByMonth(userId: string, month: number, year: number): Promise<number> {
    const result = await this.expenseModel.aggregate([
      {
        $match: {
          userId: new Types.ObjectId(userId),
          $expr: {
            $and: [
              { $eq: [{ $month: '$date' }, month] },
              { $eq: [{ $year: '$date' }, year] }
            ]
          }
        }
      },
      {
        $group: {
          _id: null,
          total: { $sum: { $toDouble: '$amount' } }
        }
      }
    ]).exec();

    return result[0]?.total || 0;
  }

  async getTopCategories(userId: string, limit: number = 5): Promise<{ category: string; total: number }[]> {
    return this.expenseModel.aggregate([
      {
        $match: {
          userId: new Types.ObjectId(userId)
        }
      },
      {
        $group: {
          _id: '$description',
          total: { $sum: { $toDouble: '$amount' } }
        }
      },
      {
        $project: {
          category: '$_id',
          total: 1,
          _id: 0
        }
      },
      {
        $sort: { total: -1 }
      },
      {
        $limit: limit
      }
    ]).exec();
  }

  async getMonthlyStats(userId: string, year: number): Promise<any[]> {
    return this.expenseModel.aggregate([
      {
        $match: {
          userId: new Types.ObjectId(userId),
          $expr: { $eq: [{ $year: '$date' }, year] }
        }
      },
      {
        $group: {
          _id: { month: { $month: '$date' } },
          total: { $sum: { $toDouble: '$amount' } },
          count: { $sum: 1 }
        }
      },
      {
        $project: {
          month: '$_id.month',
          total: 1,
          count: 1,
          average: { $divide: ['$total', '$count'] },
          _id: 0
        }
      },
      {
        $sort: { month: 1 }
      }
    ]).exec();
  }

  async getDailyStats(userId: string, startDate: Date, endDate: Date): Promise<any[]> {
    return this.expenseModel.aggregate([
      {
        $match: {
          userId: new Types.ObjectId(userId),
          date: { $gte: startDate, $lte: endDate }
        }
      },
      {
        $group: {
          _id: { 
            year: { $year: '$date' },
            month: { $month: '$date' },
            day: { $dayOfMonth: '$date' }
          },
          total: { $sum: { $toDouble: '$amount' } },
          count: { $sum: 1 }
        }
      },
      {
        $project: {
          date: {
            $dateFromParts: {
              year: '$_id.year',
              month: '$_id.month',
              day: '$_id.day'
            }
          },
          total: 1,
          count: 1,
          _id: 0
        }
      },
      {
        $sort: { date: 1 }
      }
    ]).exec();
  }

  async searchExpenses(userId: string, query: string): Promise<Expense[]> {
    return this.expenseModel
      .find({
        userId: new Types.ObjectId(userId),
        $or: [
          { description: { $regex: query, $options: 'i' } }
        ]
      })
      .sort({ date: -1 })
      .exec();
  }
}
