import { Module } from '@nestjs/common';
import { ReportsController } from './report.controller';
import { ReportsService } from './report.service';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Expense } from '../expense/expense.entity';
import { Income } from '../income/income.entity';

@Module({
  imports: [TypeOrmModule.forFeature([Expense, Income])],
  controllers: [ReportsController],
  providers: [ReportsService],
})
export class ReportsModule {}
