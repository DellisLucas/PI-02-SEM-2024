import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { ReportsController } from './report.controller';
import { ReportsService } from './report.service';
import { Income, IncomeSchema } from '../income/schemas/income.schema';
import { Expense, ExpenseSchema } from '../expense/schemas/expense.schema';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: Income.name, schema: IncomeSchema },
      { name: Expense.name, schema: ExpenseSchema }
    ])
  ],
  controllers: [ReportsController],
  providers: [ReportsService],
  exports: [ReportsService]
})
export class ReportModule {}
