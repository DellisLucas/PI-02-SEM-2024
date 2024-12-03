import { Entity, PrimaryGeneratedColumn, Column, OneToMany } from 'typeorm';
import { Income } from '../income/income.entity';
import { Expense } from '../expense/expense.entity';

@Entity()
export class User {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ unique: true })
  username: string;

  @Column()
  password: string;

  @OneToMany(() => Income, (income) => income.user)
  incomes: Income[];

  @OneToMany(() => Expense, (expense) => expense.user)
  expenses: Expense[];
}
