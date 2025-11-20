import { Type } from 'class-transformer';
import { IsDate, IsNotEmpty, IsNumber, IsOptional, IsString, Min } from 'class-validator';

export class CreateIncomeDto {
  @IsString()
  @IsNotEmpty()
  description: string;

  @IsNumber()
  @Min(0)
  @IsNotEmpty()
  amount: number;

  @IsDate()
  @Type(() => Date)
  @IsNotEmpty()
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
