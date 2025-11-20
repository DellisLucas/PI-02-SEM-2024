import { Controller, Get, Post, Body, Put, Param, Delete, UseGuards, Query, Request, HttpException, HttpStatus, ValidationPipe } from '@nestjs/common';
import { ExpenseService } from './expense.service';
import { CreateExpenseDto } from './dto/create-expense.dto';
import { UpdateExpenseDto } from './dto/update-expense.dto';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { Expense } from './schemas/expense.schema';

@Controller('expenses')
@UseGuards(JwtAuthGuard)
export class ExpenseController {
  constructor(private readonly expenseService: ExpenseService) {}

  @Get()
  async findAll(@Request() req, @Query('userId') userId: string): Promise<any> {
    try {
      if (req.user.id !== userId) {
        throw new HttpException('Não autorizado a acessar estas despesas', HttpStatus.FORBIDDEN);
      }
      const expenses = await this.expenseService.findAll(userId);
      return {
        success: true,
        data: expenses
      };
    } catch (error: any) {
      throw new HttpException(
        error?.message || 'Erro ao buscar despesas',
        error?.status || HttpStatus.INTERNAL_SERVER_ERROR
      );
    }
  }

  @Post()
  async create(
    @Request() req,
    @Body(new ValidationPipe({ transform: true })) createExpenseDto: CreateExpenseDto
  ): Promise<any> {
    try {
      const expenseData = {
        ...createExpenseDto,
        userId: req.user.id
      };
      
      const expense = await this.expenseService.create(expenseData);
      return {
        success: true,
        data: expense
      };
    } catch (error: any) {
      console.error('Erro ao criar despesa:', error);
      throw new HttpException(
        error?.message || 'Erro ao criar despesa',
        error?.status || HttpStatus.INTERNAL_SERVER_ERROR
      );
    }
  }

  @Get('range')
  async findByDateRange(
    @Request() req,
    @Query('startDate') startDate: string,
    @Query('endDate') endDate: string,
    @Query('userId') userId: string,
  ): Promise<any> {
    try {
      if (req.user.id !== userId) {
        throw new HttpException('Não autorizado a acessar estas despesas', HttpStatus.FORBIDDEN);
      }
      const expenses = await this.expenseService.getByDateRange(
        userId,
        new Date(startDate),
        new Date(endDate)
      );
      return {
        success: true,
        data: expenses
      };
    } catch (error: any) {
      throw new HttpException(
        error?.message || 'Erro ao buscar despesas por período',
        error?.status || HttpStatus.INTERNAL_SERVER_ERROR
      );
    }
  }

  @Put(':id')
  async update(
    @Request() req,
    @Param('id') id: string,
    @Body(new ValidationPipe({ transform: true })) updateExpenseDto: UpdateExpenseDto,
  ): Promise<any> {
    try {
      const expense = await this.expenseService.findById(id);
      if (!expense) {
        throw new HttpException('Despesa não encontrada', HttpStatus.NOT_FOUND);
      }
      if (expense.userId !== req.user.id) {
        throw new HttpException('Não autorizado a atualizar esta despesa', HttpStatus.FORBIDDEN);
      }
      const updatedExpense = await this.expenseService.update(id, updateExpenseDto);
      return {
        success: true,
        data: updatedExpense
      };
    } catch (error: any) {
      throw new HttpException(
        error?.message || 'Erro ao atualizar despesa',
        error?.status || HttpStatus.INTERNAL_SERVER_ERROR
      );
    }
  }

  @Delete(':id')
  async remove(@Request() req, @Param('id') id: string): Promise<any> {
    try {
      const expense = await this.expenseService.findById(id);
      if (!expense) {
        throw new HttpException('Despesa não encontrada', HttpStatus.NOT_FOUND);
      }
      if (expense.userId !== req.user.id) {
        throw new HttpException('Não autorizado a remover esta despesa', HttpStatus.FORBIDDEN);
      }
      await this.expenseService.remove(id);
      return {
        success: true,
        message: 'Despesa removida com sucesso'
      };
    } catch (error: any) {
      throw new HttpException(
        error?.message || 'Erro ao remover despesa',
        error?.status || HttpStatus.INTERNAL_SERVER_ERROR
      );
    }
  }
}
