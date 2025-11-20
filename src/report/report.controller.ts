import { Controller, Get, Query, UseGuards } from '@nestjs/common';
import { ReportsService } from './report.service';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { CategoryReport } from './interfaces/report.interface';

@Controller('reports')
export class ReportsController {
  constructor(private readonly reportsService: ReportsService) {}

  @Get('monthly')
  @UseGuards(JwtAuthGuard)
  async getMonthlyReport(
    @Query('userId') userId: string,
    @Query('month') month: string,
    @Query('year') year: string
  ) {
    return this.reportsService.getMonthlyReport(userId, parseInt(month), parseInt(year));
  }

  @Get('yearly')
  @UseGuards(JwtAuthGuard)
  async getYearlyReport(
    @Query('userId') userId: string,
    @Query('year') year: string
  ) {
    return this.reportsService.getYearlyReport(userId, parseInt(year));
  }

  @Get('categories')
  @UseGuards(JwtAuthGuard)
  async getCategoryReport(
    @Query('userId') userId: string,
    @Query('startDate') startDate: string,
    @Query('endDate') endDate: string
  ): Promise<CategoryReport> {
    return this.reportsService.getCategoryReport(
      userId,
      new Date(startDate),
      new Date(endDate)
    );
  }

  @Get('cash-flow')
  @UseGuards(JwtAuthGuard)
  async getCashFlowReport(
    @Query('userId') userId: string,
    @Query('months') months?: string
  ) {
    return this.reportsService.getCashFlowReport(
      userId,
      months ? parseInt(months) : undefined
    );
  }

  @Get('financial-health')
  @UseGuards(JwtAuthGuard)
  async getFinancialHealthReport(
    @Query('userId') userId: string
  ) {
    return this.reportsService.getFinancialHealthReport(userId);
  }

  @Get('trend-analysis')
  @UseGuards(JwtAuthGuard)
  async getTrendAnalysisReport(
    @Query('userId') userId: string
  ) {
    return this.reportsService.getTrendAnalysisReport(userId);
  }

  @Get('comparative')
  @UseGuards(JwtAuthGuard)
  async getComparativeReport(
    @Query('userId') userId: string,
    @Query('compareWith') compareWith: string
  ) {
    return this.reportsService.getComparativeReport(userId, compareWith);
  }

  @Get('predictive')
  @UseGuards(JwtAuthGuard)
  async getPredictiveReport(
    @Query('userId') userId: string
  ) {
    return this.reportsService.getPredictiveReport(userId);
  }
}
