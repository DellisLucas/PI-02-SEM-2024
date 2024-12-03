import { Controller, Get, Post, Body, Param, Put, Delete, UseGuards, Req } from '@nestjs/common';
import { IncomeService } from './income.service';
import { Income } from './income.entity';
import { JwtAuthGuard } from 'src/auth/jwt-auth.guard';

@UseGuards(JwtAuthGuard)
@Controller('incomes')
export class IncomeController {
  constructor(private readonly incomeService: IncomeService) {}

  @Get()
  findAll(@Req() req): Promise<Income[]> {
    const userId = req.user.id;
    return this.incomeService.findAll(userId);
  }

  @Post()
  create(@Body() income: Partial<Income>, @Req() req): Promise<Income> {
    const userId = req.user.id;
    return this.incomeService.create(income, userId);
  }

  @Get('by-date')
  findByDateRange(
    @Body() { startDate, endDate }: { startDate: string; endDate: string },
    @Req() req,
  ): Promise<Income[]> {
    const userId = req.user.id;
    return this.incomeService.findByDateRange(startDate, endDate, userId);
  }

  @Put(':id')
  update(@Param('id') id: number, @Body() income: Partial<Income>, @Req() req): Promise<Income> {
    const userId = req.user.id;
    return this.incomeService.update(id, income, userId);
  }

  @Delete(':id')
  delete(@Param('id') id: string, @Req() req): Promise<void> {
    const userId = req.user.id;
    return this.incomeService.delete(id, userId);
  }
}
