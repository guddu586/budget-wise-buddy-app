
export interface User {
  id: string;
  email: string;
}

export interface Expense {
  id: string;
  amount: number;
  category: string;
  date: Date;
  description?: string;
  userId: string;
}

export interface ExpenseFormData {
  amount: number;
  category: string;
  date: Date;
  description?: string;
}

export interface AuthContextType {
  user: User | null;
  loading: boolean;
  login: (email: string, password: string) => Promise<void>;
  signup: (email: string, password: string) => Promise<void>;
  logout: () => void;
}

export interface ExpenseContextType {
  expenses: Expense[];
  loading: boolean;
  addExpense: (expense: ExpenseFormData) => void;
  deleteExpense: (id: string) => void;
  getExpensesByCategory: (category: string) => Expense[];
  categories: string[];
}
