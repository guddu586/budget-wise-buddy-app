export interface User {
  id: string;
  email: string;
  preferredCurrency?: string;
}

export interface Expense {
  id: string;
  amount: number;
  category: string;
  date: Date;
  description?: string;
  userId: string;
  currency?: string;
}

export interface ExpenseFormData {
  amount: number;
  category: string;
  date: Date;
  description?: string;
  currency?: string;
}

export interface AuthContextType {
  user: User | null;
  loading: boolean;
  login: (email: string, password: string) => Promise<void>;
  signup: (email: string, password: string) => Promise<void>;
  logout: () => void;
  forgotPassword: (email: string) => Promise<void>;
  resetPassword: (newPassword: string) => Promise<void>;
  firebaseLogin: () => Promise<void>;
}

export interface ExpenseContextType {
  expenses: Expense[];
  loading: boolean;
  addExpense: (expense: ExpenseFormData) => void;
  deleteExpense: (id: string) => void;
  getExpensesByCategory: (category: string) => Expense[];
  categories: string[];
}

export type Currency = "USD" | "INR" | "YEN" | "EURO";

export const CURRENCIES: Currency[] = ["USD", "INR", "YEN", "EURO"];

export const CURRENCY_SYMBOLS: Record<Currency, string> = {
  USD: "$",
  INR: "₹",
  YEN: "¥",
  EURO: "€"
};
