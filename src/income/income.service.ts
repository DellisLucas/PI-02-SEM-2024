import { Injectable, BadRequestException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { Income } from './schemas/income.schema';
import { CreateIncomeDto } from './dto/create-income.dto';

@Injectable()
export class IncomeService {
  constructor(
    @InjectModel(Income.name) private incomeModel: Model<Income>
  ) {}

  async create(createIncomeDto: CreateIncomeDto): Promise<Income> {
    try {
      const createdIncome = new this.incomeModel({
        ...createIncomeDto,
        date: new Date(createIncomeDto.date),
        userId: new Types.ObjectId(createIncomeDto.userId),
        createdAt: new Date(),
        updatedAt: new Date()
      });
      return createdIncome.save();
    } catch (error: any) {
      throw new BadRequestException('Erro ao criar receita: ' + (error?.message || 'Erro desconhecido'));
    }
  }

  async findAll(userId: string): Promise<Income[]> {
    return this.incomeModel
      .find({ userId: new Types.ObjectId(userId) })
      .sort({ date: -1 })
      .exec();
  }

  async findOne(id: string): Promise<Income> {
    return this.incomeModel.findById(id).exec();
  }

  async update(id: string, updateIncomeDto: Partial<Income>): Promise<Income> {
    return this.incomeModel
      .findByIdAndUpdate(
        id,
        { 
          ...updateIncomeDto,
          updatedAt: new Date()
        },
        { 
          new: true,
          runValidators: true
        }
      )
      .exec();
  }

  async remove(id: string): Promise<Income> {
    return this.incomeModel.findByIdAndDelete(id).exec();
  }

  async getTotalByMonth(userId: string, month: number, year: number): Promise<number> {
    const result = await this.incomeModel.aggregate([
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

  async getByDateRange(userId: string, startDate: Date, endDate: Date): Promise<Income[]> {
    return this.incomeModel
      .find({
        userId: new Types.ObjectId(userId),
        date: { $gte: startDate, $lte: endDate }
      })
      .sort({ date: -1 })
      .exec();
  }

  async getMonthlyStats(userId: string, year: number): Promise<any[]> {
    return this.incomeModel.aggregate([
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
    return this.incomeModel.aggregate([
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

  async searchIncomes(userId: string, query: string): Promise<Income[]> {
    return this.incomeModel
      .find({
        userId: new Types.ObjectId(userId),
        $or: [
          { description: { $regex: query, $options: 'i' } }
        ]
      })
      .sort({ date: -1 })
      .exec();
  }

  async getTopCategories(userId: string, limit: number = 5): Promise<{ category: string; total: number }[]> {
    return this.incomeModel.aggregate([
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
}