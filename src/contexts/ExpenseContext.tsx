import React, { createContext, useContext, useState, useEffect } from "react";
import { Expense, ExpenseContextType, ExpenseFormData } from "../types";
import { useAuth } from "./AuthContext";
import { toast } from "sonner";

const EXPENSES_STORAGE_KEY = "expense-tracker-expenses";

const ExpenseContext = createContext<ExpenseContextType | undefined>(undefined);

export const ExpenseProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [expenses, setExpenses] = useState<Expense[]>([]);
  const [loading, setLoading] = useState(true);
  const { user } = useAuth();

  // Predefined categories
  const categories = [
    "Food & Dining",
    "Transportation",
    "Entertainment",
    "Shopping",
    "Utilities",
    "Housing",
    "Healthcare",
    "Education",
    "Personal",
    "Travel",
    "Other"
  ];

  useEffect(() => {
    if (user) {
      loadExpenses();
    } else {
      setExpenses([]);
      setLoading(false);
    }
  }, [user]);

  const loadExpenses = () => {
    setLoading(true);
    try {
      const storedExpenses = localStorage.getItem(EXPENSES_STORAGE_KEY);
      const allExpenses: Expense[] = storedExpenses ? JSON.parse(storedExpenses) : [];
      
      // Filter expenses for the current user and parse dates
      const userExpenses = allExpenses
        .filter(expense => expense.userId === user?.id)
        .map(expense => ({
          ...expense,
          date: new Date(expense.date)
        }));
      
      setExpenses(userExpenses);
    } catch (error) {
      console.error("Failed to load expenses:", error);
      toast.error("Failed to load expenses");
    } finally {
      setLoading(false);
    }
  };

  const saveExpenses = (updatedExpenses: Expense[]) => {
    try {
      const storedExpenses = localStorage.getItem(EXPENSES_STORAGE_KEY);
      const allExpenses: Expense[] = storedExpenses ? JSON.parse(storedExpenses) : [];
      
      // Filter out current user's expenses and add the updated ones
      const otherUsersExpenses = allExpenses.filter(expense => expense.userId !== user?.id);
      const newAllExpenses = [...otherUsersExpenses, ...updatedExpenses];
      
      localStorage.setItem(EXPENSES_STORAGE_KEY, JSON.stringify(newAllExpenses));
    } catch (error) {
      console.error("Failed to save expenses:", error);
      toast.error("Failed to save expenses");
    }
  };

  const addExpense = (expenseData: ExpenseFormData) => {
    if (!user) {
      toast.error("You must be logged in to add expenses");
      return;
    }

    const newExpense: Expense = {
      id: Date.now().toString(),
      ...expenseData,
      userId: user.id,
      currency: expenseData.currency || "USD", // Default to USD if not specified
    };

    const updatedExpenses = [...expenses, newExpense];
    setExpenses(updatedExpenses);
    saveExpenses(updatedExpenses);
    toast.success("Expense added successfully");
  };

  const deleteExpense = (id: string) => {
    const updatedExpenses = expenses.filter(expense => expense.id !== id);
    setExpenses(updatedExpenses);
    saveExpenses(updatedExpenses);
    toast.success("Expense deleted successfully");
  };

  const getExpensesByCategory = (category: string) => {
    return category === "All" 
      ? expenses 
      : expenses.filter(expense => expense.category === category);
  };

  return (
    <ExpenseContext.Provider value={{ 
      expenses, 
      loading, 
      addExpense, 
      deleteExpense, 
      getExpensesByCategory,
      categories 
    }}>
      {children}
    </ExpenseContext.Provider>
  );
};

export const useExpenses = () => {
  const context = useContext(ExpenseContext);
  if (context === undefined) {
    throw new Error("useExpenses must be used within an ExpenseProvider");
  }
  return context;
};
