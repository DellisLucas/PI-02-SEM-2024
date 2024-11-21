import { Controller, Get, Post, Body, Param, Put, Delete, UseGuards } from '@nestjs/common';
import { ExpenseService } from './expense.service';
import { Expense } from './expense.entity';
import { JwtAuthGuard } from 'src/auth/jwt-auth.guard';

@UseGuards(JwtAuthGuard)
@Controller('expenses')
export class ExpenseController {
  constructor(private readonly expenseService: ExpenseService) {}

  @Get()
  findAll(): Promise<Expense[]> {
    return this.expenseService.findAll();
  }

  @Post()
  create(@Body() expense: Partial<Expense>): Promise<Expense> {
    return this.expenseService.create(expense);
  }

  // Consulta por intervalo de data
  @Get('by-date')
  findByDateRange(
    @Body() { startDate, endDate }: { startDate: string; endDate: string },
  ): Promise<Expense[]> {
    return this.expenseService.findByDateRange(startDate, endDate);
  }

  // Atualizar um registro de despesa
  @Put(':id')
  update(@Param('id') id: number, @Body() expense: Partial<Expense>): Promise<Expense> {
    return this.expenseService.update(id, expense);
  }

  // Excluir um registro de despesa
  @Delete(':id')
  delete(@Param('id') id: string): Promise<void> {
    return this.expenseService.delete(id);
  }
}
