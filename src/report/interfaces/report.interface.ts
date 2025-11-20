export interface CategoryGroup {
  category: string;
  total: number;
  count: number;
}

export interface CategoryReport {
  period: {
    startDate: Date;
    endDate: Date;
  };
  incomeCategories: CategoryGroup[];
  expenseCategories: CategoryGroup[];
  totalIncome: number;
  totalExpense: number;
} 