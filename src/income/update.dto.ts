// src/income/update-income.dto.ts
import { IsOptional, IsNotEmpty, IsNumber, IsDateString } from 'class-validator';

export class UpdateIncomeDto {
  @IsOptional()
  @IsNotEmpty()
  description?: string;

  @IsOptional()
  @IsNumber()
  amount?: number;

  @IsOptional()
  @IsDateString()
  date?: string; // Campo opcional para atualização
}
