import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { Income } from '../income/schemas/income.schema';
import { Expense } from '../expense/schemas/expense.schema';
import { CategoryGroup, CategoryReport } from './interfaces/report.interface';

@Injectable()
export class ReportsService {
  constructor(
    @InjectModel(Income.name) private incomeModel: Model<Income>,
    @InjectModel(Expense.name) private expenseModel: Model<Expense>
  ) {}

  async getMonthlyReport(userId: string, month: number, year: number) {
    const [incomeResult, expenseResult] = await Promise.all([
      this.incomeModel.aggregate([
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
            totalIncome: { $sum: { $toDouble: '$amount' } },
            incomes: { $push: '$$ROOT' }
          }
        }
      ]).exec(),
      this.expenseModel.aggregate([
        {
          $match: {
            userId: userId,
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
            totalExpense: { $sum: { $toDouble: '$amount' } },
            expenses: { $push: '$$ROOT' }
          }
        }
      ]).exec()
    ]);

    const totalIncome = incomeResult[0]?.totalIncome || 0;
    const totalExpense = expenseResult[0]?.totalExpense || 0;
    const incomes = incomeResult[0]?.incomes || [];
    const expenses = expenseResult[0]?.expenses || [];
    const balance = totalIncome - totalExpense;

    return {
      month,
      year,
      totalIncome,
      totalExpense,
      balance,
      incomes,
      expenses
    };
  }

  async getYearlyReport(userId: string, year: number) {
    const [incomeResult, expenseResult] = await Promise.all([
      this.incomeModel.aggregate([
        {
          $match: {
            userId: new Types.ObjectId(userId),
            $expr: { $eq: [{ $year: '$date' }, year] }
          }
        },
        {
          $group: {
            _id: { $month: '$date' },
            totalIncome: { $sum: { $toDouble: '$amount' } },
            count: { $sum: 1 }
          }
        },
        {
          $sort: { _id: 1 }
        }
      ]).exec(),
      this.expenseModel.aggregate([
        {
          $match: {
            userId: userId,
            $expr: { $eq: [{ $year: '$date' }, year] }
          }
        },
        {
          $group: {
            _id: { $month: '$date' },
            totalExpense: { $sum: { $toDouble: '$amount' } },
            count: { $sum: 1 }
          }
        },
        {
          $sort: { _id: 1 }
        }
      ]).exec()
    ]);

    // Criar array com todos os meses
    const monthlyData = Array.from({ length: 12 }, (_, i) => {
      const month = i + 1;
      const income = incomeResult.find(r => r._id === month) || { totalIncome: 0, count: 0 };
      const expense = expenseResult.find(r => r._id === month) || { totalExpense: 0, count: 0 };
      
      return {
        month,
        totalIncome: income.totalIncome,
        totalExpense: expense.totalExpense,
        balance: income.totalIncome - expense.totalExpense,
        incomeCount: income.count,
        expenseCount: expense.count
      };
    });

    const yearlyTotal = monthlyData.reduce((acc, curr) => ({
      totalIncome: acc.totalIncome + curr.totalIncome,
      totalExpense: acc.totalExpense + curr.totalExpense,
      balance: acc.balance + curr.balance,
      incomeCount: acc.incomeCount + curr.incomeCount,
      expenseCount: acc.expenseCount + curr.expenseCount
    }), { totalIncome: 0, totalExpense: 0, balance: 0, incomeCount: 0, expenseCount: 0 });

    return {
      year,
      ...yearlyTotal,
      monthlyData
    };
  }

  async getCategoryReport(userId: string, startDate: Date, endDate: Date) {
    const [incomeCategories, expenseCategories] = await Promise.all([
      this.incomeModel.aggregate([
        {
          $match: {
            userId: new Types.ObjectId(userId),
            date: { $gte: startDate, $lte: endDate }
          }
        },
        {
          $group: {
            _id: '$category',
            total: { $sum: { $toDouble: '$amount' } },
            count: { $sum: 1 }
          }
        },
        {
          $project: {
            category: '$_id',
            total: 1,
            count: 1,
            _id: 0
          }
        },
        {
          $sort: { total: -1 }
        }
      ]).exec(),
      this.expenseModel.aggregate([
        {
          $match: {
            userId: userId,
            date: { $gte: startDate, $lte: endDate }
          }
        },
        {
          $group: {
            _id: '$category',
            total: { $sum: { $toDouble: '$amount' } },
            count: { $sum: 1 }
          }
        },
        {
          $project: {
            category: '$_id',
            total: 1,
            count: 1,
            _id: 0
          }
        },
        {
          $sort: { total: -1 }
        }
      ]).exec()
    ]);

    // Agrupar receitas por categoria
    const groupedIncomes = incomeCategories.reduce<Record<string, CategoryGroup>>((acc, curr) => {
      if (!acc[curr.category]) {
        acc[curr.category] = {
          category: curr.category,
          total: 0,
          count: 0
        };
      }
      acc[curr.category].total += curr.total;
      acc[curr.category].count += curr.count;
      return acc;
    }, {});

    // Agrupar despesas por categoria
    const groupedExpenses = expenseCategories.reduce<Record<string, CategoryGroup>>((acc, curr) => {
      if (!acc[curr.category]) {
        acc[curr.category] = {
          category: curr.category,
          total: 0,
          count: 0
        };
      }
      acc[curr.category].total += curr.total;
      acc[curr.category].count += curr.count;
      return acc;
    }, {});

    return {
      period: {
        startDate,
        endDate
      },
      incomeCategories: Object.values(groupedIncomes),
      expenseCategories: Object.values(groupedExpenses),
      totalIncome: Object.values(groupedIncomes).reduce((sum, cat) => sum + cat.total, 0),
      totalExpense: Object.values(groupedExpenses).reduce((sum, cat) => sum + cat.total, 0)
    };
  }

  async getCashFlowReport(userId: string, months: number = 6) {
    const startDate = new Date();
    startDate.setMonth(startDate.getMonth() - months);

    return this.incomeModel.collection.aggregate([
      {
        $facet: {
          incomes: [
            {
              $match: {
                userId: new Types.ObjectId(userId),
                date: { $gte: startDate }
              }
            },
            {
              $group: {
                _id: {
                  year: { $year: '$date' },
                  month: { $month: '$date' },
                  day: { $dayOfMonth: '$date' }
                },
                total: { $sum: '$amount' }
              }
            },
            {
              $sort: { '_id.year': 1, '_id.month': 1, '_id.day': 1 }
            }
          ],
          expenses: [
            {
              $match: {
                userId: userId,
                date: { $gte: startDate }
              }
            },
            {
              $group: {
                _id: {
                  year: { $year: '$date' },
                  month: { $month: '$date' },
                  day: { $dayOfMonth: '$date' }
                },
                total: { $sum: '$amount' }
              }
            },
            {
              $sort: { '_id.year': 1, '_id.month': 1, '_id.day': 1 }
            }
          ]
        }
      }
    ]).toArray();
  }

  async getFinancialHealthReport(userId: string) {
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

    return this.incomeModel.collection.aggregate([
      {
        $facet: {
          monthlyStats: [
            {
              $match: { userId: new Types.ObjectId(userId) }
            },
            {
              $group: {
                _id: {
                  year: { $year: '$date' },
                  month: { $month: '$date' }
                },
                totalIncome: { $sum: '$amount' },
                avgIncome: { $avg: '$amount' },
                incomeCount: { $sum: 1 }
              }
            },
            {
              $sort: { '_id.year': -1, '_id.month': -1 }
            },
            {
              $limit: 12
            }
          ],
          recentActivity: [
            {
              $match: {
                userId: new Types.ObjectId(userId),
                date: { $gte: thirtyDaysAgo }
              }
            },
            {
              $group: {
                _id: {
                  year: { $year: '$date' },
                  month: { $month: '$date' },
                  day: { $dayOfMonth: '$date' }
                },
                total: { $sum: '$amount' },
                count: { $sum: 1 }
              }
            },
            {
              $sort: { '_id.year': -1, '_id.month': -1, '_id.day': -1 }
            }
          ],
          categoryAnalysis: [
            {
              $match: { userId: new Types.ObjectId(userId) }
            },
            {
              $group: {
                _id: '$category',
                total: { $sum: '$amount' },
                count: { $sum: 1 },
                avgAmount: { $avg: '$amount' },
                minAmount: { $min: '$amount' },
                maxAmount: { $max: '$amount' }
              }
            },
            {
              $sort: { total: -1 }
            }
          ]
        }
      }
    ]).toArray();
  }

  async getTrendAnalysisReport(userId: string) {
    return this.incomeModel.collection.aggregate([
      {
        $match: { userId: new Types.ObjectId(userId) }
      },
      {
        $group: {
          _id: {
            year: { $year: '$date' },
            month: { $month: '$date' }
          },
          total: { $sum: '$amount' },
          count: { $sum: 1 },
          transactions: { $push: { amount: '$amount', date: '$date', description: '$description' } }
        }
      },
      {
        $sort: { '_id.year': 1, '_id.month': 1 }
      },
      {
        $group: {
          _id: null,
          monthlyData: { $push: '$$ROOT' },
          avgMonthlyTotal: { $avg: '$total' },
          avgMonthlyCount: { $avg: '$count' },
          stdDevTotal: { $stdDevPop: '$total' },
          stdDevCount: { $stdDevPop: '$count' },
          totalTransactions: { $sum: '$count' },
          totalAmount: { $sum: '$total' }
        }
      },
      {
        $project: {
          _id: 0,
          summary: {
            totalAmount: '$totalAmount',
            totalTransactions: '$totalTransactions',
            avgMonthlyTotal: { $round: ['$avgMonthlyTotal', 2] },
            avgMonthlyCount: { $round: ['$avgMonthlyCount', 2] },
            stdDevTotal: { $round: ['$stdDevTotal', 2] },
            stdDevCount: { $round: ['$stdDevCount', 2] }
          },
          monthlyData: {
            $map: {
              input: '$monthlyData',
              as: 'month',
              in: {
                year: '$$month._id.year',
                month: '$$month._id.month',
                total: '$$month.total',
                count: '$$month.count',
                transactions: '$$month.transactions'
              }
            }
          },
          trend: {
            $map: {
              input: { $range: [1, { $size: '$monthlyData' }] },
              as: 'i',
              in: {
                fromMonth: {
                  $concat: [
                    { $toString: { $arrayElemAt: ['$monthlyData._id.month', { $subtract: ['$$i', 1] }] } },
                    '/',
                    { $toString: { $arrayElemAt: ['$monthlyData._id.year', { $subtract: ['$$i', 1] }] } }
                  ]
                },
                toMonth: {
                  $concat: [
                    { $toString: { $arrayElemAt: ['$monthlyData._id.month', '$$i'] } },
                    '/',
                    { $toString: { $arrayElemAt: ['$monthlyData._id.year', '$$i'] } }
                  ]
                },
                growthRate: {
                  $round: [{
                    $multiply: [
                      {
                        $divide: [
                          { $subtract: [
                              { $arrayElemAt: ['$monthlyData.total', '$$i'] },
                              { $arrayElemAt: ['$monthlyData.total', { $subtract: ['$$i', 1] }] }
                            ]
                          },
                          { $arrayElemAt: ['$monthlyData.total', { $subtract: ['$$i', 1] }] }
                        ]
                      },
                      100
                    ]
                  }, 2]
                }
              }
            }
          }
        }
      }
    ]).toArray();
  }

  async getComparativeReport(userId: string, compareWith: string) {
    return this.incomeModel.collection.aggregate([
      {
        $match: {
          userId: { $in: [new Types.ObjectId(userId), new Types.ObjectId(compareWith)] }
        }
      },
      {
        $group: {
          _id: {
            userId: '$userId',
            year: { $year: '$date' },
            month: { $month: '$date' }
          },
          total: { $sum: '$amount' },
          count: { $sum: 1 },
          avgAmount: { $avg: '$amount' }
        }
      },
      {
        $group: {
          _id: {
            year: '$_id.year',
            month: '$_id.month'
          },
          users: {
            $push: {
              userId: '$_id.userId',
              total: '$total',
              count: '$count',
              avgAmount: '$avgAmount'
            }
          }
        }
      },
      {
        $sort: { '_id.year': -1, '_id.month': -1 }
      }
    ]).toArray();
  }

  async getPredictiveReport(userId: string) {
    const result = await this.incomeModel.collection.aggregate([
      {
        $match: { userId: new Types.ObjectId(userId) }
      },
      {
        $group: {
          _id: {
            year: { $year: '$date' },
            month: { $month: '$date' }
          },
          total: { $sum: '$amount' },
          count: { $sum: 1 }
        }
      },
      {
        $sort: { '_id.year': 1, '_id.month': 1 }
      },
      {
        $group: {
          _id: null,
          monthlyData: { $push: '$$ROOT' },
          avgMonthlyTotal: { $avg: '$total' },
          stdDevTotal: { $stdDevPop: '$total' },
          totalTransactions: { $sum: '$count' },
          totalAmount: { $sum: '$total' }
        }
      },
      {
        $project: {
          _id: 0,
          monthlyData: 1,
          avgMonthlyTotal: 1,
          stdDevTotal: 1,
          totalTransactions: 1,
          totalAmount: 1,
          trend: {
            $cond: {
              if: { $gt: [{ $size: '$monthlyData' }, 1] },
              then: {
                $avg: {
                  $map: {
                    input: { $range: [1, { $size: '$monthlyData' }] },
                    as: 'i',
                    in: {
                      $cond: {
                        if: {
                          $and: [
                            { $gt: [{ $arrayElemAt: ['$monthlyData.total', { $subtract: ['$$i', 1] }] }, 0] },
                            { $gt: [{ $arrayElemAt: ['$monthlyData.total', '$$i'] }, 0] }
                          ]
                        },
                        then: {
                          $divide: [
                            { $subtract: [
                                { $arrayElemAt: ['$monthlyData.total', '$$i'] },
                                { $arrayElemAt: ['$monthlyData.total', { $subtract: ['$$i', 1] }] }
                              ]
                            },
                            { $arrayElemAt: ['$monthlyData.total', { $subtract: ['$$i', 1] }] }
                          ]
                        },
                        else: 0
                      }
                    }
                  }
                }
              },
              else: 0
            }
          }
        }
      },
      {
        $project: {
          monthlyData: 1,
          avgMonthlyTotal: { $round: ['$avgMonthlyTotal', 2] },
          stdDevTotal: { $round: ['$stdDevTotal', 2] },
          totalTransactions: 1,
          totalAmount: 1,
          trend: { $round: ['$trend', 2] },
          nextMonthPrediction: {
            $cond: {
              if: { $gt: ['$avgMonthlyTotal', 0] },
              then: {
                $round: [{
                  $add: [
                    '$avgMonthlyTotal',
                    { $multiply: ['$trend', '$avgMonthlyTotal'] }
                  ]
                }, 2]
              },
              else: 0
            }
          },
          confidenceInterval: {
            $cond: {
              if: { $gt: ['$stdDevTotal', 0] },
              then: {
                lower: { $round: [{ $subtract: ['$avgMonthlyTotal', { $multiply: ['$stdDevTotal', 2] }] }, 2] },
                upper: { $round: [{ $add: ['$avgMonthlyTotal', { $multiply: ['$stdDevTotal', 2] }] }, 2] }
              },
              else: {
                lower: 0,
                upper: 0
              }
            }
          }
        }
      }
    ]).toArray();

    if (!result || result.length === 0) {
      return {
        monthlyData: [],
        avgMonthlyTotal: 0,
        stdDevTotal: 0,
        totalTransactions: 0,
        totalAmount: 0,
        trend: 0,
        nextMonthPrediction: 0,
        confidenceInterval: {
          lower: 0,
          upper: 0
        }
      };
    }

    return result[0];
  }
}
