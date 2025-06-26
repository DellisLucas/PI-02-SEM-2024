import { Controller, Get, Post, Body, Param, Put, Delete, UseGuards, Req } from '@nestjs/common';
import { IncomeService } from './income.service';
import { Income } from './schemas/income.schema';
import { JwtAuthGuard } from 'src/auth/jwt-auth.guard';
import { CreateIncomeDto } from './dto/create-income.dto';

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
  create(@Body() createIncomeDto: CreateIncomeDto, @Req() req): Promise<Income> {
    const userId = req.user.id;
    return this.incomeService.create({ ...createIncomeDto, userId });
  }

  @Get('by-date')
  findByDateRange(
    @Body() { startDate, endDate }: { startDate: string; endDate: string },
    @Req() req,
  ): Promise<Income[]> {
    const userId = req.user.id;
    return this.incomeService.getByDateRange(userId, new Date(startDate), new Date(endDate));
  }

  @Put(':id')
  update(@Param('id') id: string, @Body() income: Partial<Income>): Promise<Income> {
    return this.incomeService.update(id, income);
  }

  @Delete(':id')
  remove(@Param('id') id: string): Promise<Income> {
    return this.incomeService.remove(id);
  }
}
