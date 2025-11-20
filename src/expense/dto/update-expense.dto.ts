import { IsString, IsNumber, IsDateString, IsOptional, Min } from 'class-validator';
import { Type } from 'class-transformer';

export class UpdateExpenseDto {
  @IsString()
  @IsOptional()
  description?: string;

  @IsNumber()
  @Min(0)
  @IsOptional()
  amount?: number;

  @IsDateString()
  @IsOptional()
  date?: string;

  @IsString()
  @IsOptional()
  category?: string;

  @IsString()
  @IsOptional()
  image?: string;
} 