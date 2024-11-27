import { Controller, Post, Body, Res, UseGuards } from '@nestjs/common';
import { Response } from 'express';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import * as ExcelJS from 'exceljs';
import { ReportsService } from './report.service';

@Controller('reports')
export class ReportsController {
  constructor(private readonly reportsService: ReportsService) {}

  @UseGuards(JwtAuthGuard) // Protege a rota com autenticação JWT
  @Post('generate')
  async generateReport(@Body() filters: any, @Res() res: Response) {
    const { type, startDate, endDate, minValue, maxValue } = filters;

    // Obter os dados do banco de acordo com os filtros
    const data = await this.reportsService.getFilteredData({
      type,
      startDate,
      endDate,
      minValue,
      maxValue,
    });

    // Criar um arquivo Excel
    const workbook = new ExcelJS.Workbook();
    const worksheet = workbook.addWorksheet('Relatório');

    // Adicionar cabeçalhos
    worksheet.columns = [
      { header: 'Descrição', key: 'description', width: 30 },
      { header: 'Tipo', key: 'type', width: 15 },
      { header: 'Data', key: 'date', width: 15 },
      { header: 'Valor', key: 'amount', width: 15 },
    ];

    // Adicionar linhas
    data.forEach((item) => {
      worksheet.addRow({
        description: item.description,
        type: item.type,
        date: item.date,
        amount: item.amount,
      });
    });

    // Configurar resposta com o arquivo Excel
    res.setHeader(
      'Content-Type',
      'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
    );
    res.setHeader(
      'Content-Disposition',
      `attachment; filename=relatorio-${type}-${Date.now()}.xlsx`,
    );

    // Enviar o arquivo Excel como resposta
    await workbook.xlsx.write(res);
    res.end();
  }
}
