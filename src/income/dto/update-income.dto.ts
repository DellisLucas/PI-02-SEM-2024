import { IsString, IsNumber, IsDate, IsOptional } from 'class-validator';
import { Prop } from '@nestjs/mongoose';
import { Types } from 'mongoose';
import { Type } from 'class-transformer';

export class UpdateIncomeDto {
  @IsString()
  @IsOptional()
  description?: string;

  @IsNumber()
  @IsOptional()
  amount?: number;

  @IsDate()
  @Type(() => Date)
  @IsOptional()
  date?: Date;

  @IsString()
  @IsOptional()
  category?: string;

  @IsString()
  @IsOptional()
  image?: string;

  @Prop({ type: Types.ObjectId })
  @IsOptional()
  userId?: Types.ObjectId;
} 