import { Controller, Get, Post, Body, Param, Put, Delete, UseGuards } from '@nestjs/common';
import { IncomeService } from './income.service';
import { Income } from './income.entity';
import { JwtAuthGuard } from 'src/auth/jwt-auth.guard';

@UseGuards(JwtAuthGuard)
@Controller('incomes')
export class IncomeController {
  constructor(private readonly incomeService: IncomeService) {}

  @Get()
  findAll(): Promise<Income[]> {
    return this.incomeService.findAll();
  }

  @Post()
  create(@Body() income: Partial<Income>): Promise<Income> {
    return this.incomeService.create(income);
  }

  // Consulta por intervalo de data
  @Get('by-date')
  findByDateRange(
    @Body() { startDate, endDate }: { startDate: string; endDate: string },
  ): Promise<Income[]> {
    return this.incomeService.findByDateRange(startDate, endDate);
  }

  // Atualizar um registro de renda
  @Put(':id')
  update(@Param('id') id: number, @Body() income: Partial<Income>): Promise<Income> {
    return this.incomeService.update(id, income);
  }

  // Excluir um registro de renda
  @Delete(':id')
  delete(@Param('id') id: string): Promise<void> {
    return this.incomeService.delete(id);
  }
}
