import { IsString, IsNumber, IsDate, IsOptional, Min, IsNotEmpty } from 'class-validator';
import { Type } from 'class-transformer';

export class CreateExpenseDto {
  @IsString()
  @IsNotEmpty()
  description: string;

  @IsNumber()
  @Min(0)
  amount: number;

  @IsDate()
  @Type(() => Date)
  date: Date;

  @IsString()
  @IsOptional()
  category?: string;

  @IsString()
  @IsOptional()
  image?: string;

  @IsString()
  @IsOptional()
  userId?: string;
} 