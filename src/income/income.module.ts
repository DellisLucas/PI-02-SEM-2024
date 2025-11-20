import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { IncomeController } from './income.controller';
import { IncomeService } from './income.service';
import { Income, IncomeSchema } from './schemas/income.schema';

@Module({
  imports: [
    MongooseModule.forFeature([{ name: Income.name, schema: IncomeSchema }])
  ],
  controllers: [IncomeController],
  providers: [IncomeService],
  exports: [IncomeService]
})
export class IncomeModule {}
