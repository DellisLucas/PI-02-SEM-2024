import { Controller, Get, Post, Body, Param, Put, Delete, UseGuards, Req } from '@nestjs/common';
import { ExpenseService } from './expense.service';
import { Expense } from './expense.entity';
import { JwtAuthGuard } from 'src/auth/jwt-auth.guard';

@UseGuards(JwtAuthGuard)
@Controller('expenses')
export class ExpenseController {
  constructor(private readonly expenseService: ExpenseService) {}

  @Get()
  findAll(@Req() req): Promise<Expense[]> {
    const userId = req.user.id;
    return this.expenseService.findAll(userId);
  }

  @Post()
  create(@Body() expense: Partial<Expense>, @Req() req): Promise<Expense> {
    const userId = req.user.id;
    return this.expenseService.create(expense, userId);
  }

  @Get('by-date')
  findByDateRange(
    @Body() { startDate, endDate }: { startDate: string; endDate: string },
    @Req() req,
  ): Promise<Expense[]> {
    const userId = req.user.id;
    return this.expenseService.findByDateRange(startDate, endDate, userId);
  }


  @Put(':id')
  update(@Param('id') id: number, @Body() expense: Partial<Expense>, @Req() req): Promise<Expense> {
    const userId = req.user.id;
    return this.expenseService.update(id, expense, userId);
  }

  @Delete(':id')
  delete(@Param('id') id: string, @Req() req): Promise<void> {
    const userId = req.user.id;
    return this.expenseService.delete(id, userId);
  }
}
