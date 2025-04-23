
import { useExpenses } from "../../contexts/ExpenseContext";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ExpenseList } from "./ExpenseList";
import { ExpenseForm } from "./ExpenseForm";
import { CURRENCY_SYMBOLS } from "../../types";
import { CalendarIcon, DollarSign, CreditCard, TrendingDown } from "lucide-react";
import { useAuth } from "../../contexts/AuthContext";

export const ExpenseDashboard = () => {
  const { expenses } = useExpenses();
  const { user } = useAuth();

  // Calculate total expenses
  const totalExpenses = expenses.reduce((sum, expense) => sum + expense.amount, 0);

  // Calculate expense by category
  const expensesByCategory = expenses.reduce((acc, expense) => {
    acc[expense.category] = (acc[expense.category] || 0) + expense.amount;
    return acc;
  }, {} as Record<string, number>);

  // Get top category
  let topCategory = { name: "None", amount: 0 };
  Object.entries(expensesByCategory).forEach(([category, amount]) => {
    if (amount > topCategory.amount) {
      topCategory = { name: category, amount };
    }
  });

  // Get most recent expense date
  const mostRecentDate = expenses.length > 0
    ? new Date(Math.max(...expenses.map(e => new Date(e.date).getTime())))
    : null;
    
  // Determine which currency symbol to display
  const currencySymbol = expenses.length > 0 
    ? CURRENCY_SYMBOLS[expenses[0]?.currency || "USD"] 
    : CURRENCY_SYMBOLS["USD"];

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Expenses</CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {currencySymbol}{totalExpenses.toFixed(2)}
            </div>
            <p className="text-xs text-muted-foreground">
              Across {expenses.length} expense{expenses.length !== 1 ? "s" : ""}
            </p>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Top Category</CardTitle>
            <CreditCard className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {topCategory.name !== "None" ? topCategory.name : "N/A"}
            </div>
            <p className="text-xs text-muted-foreground">
              {topCategory.amount > 0 ? `${currencySymbol}${topCategory.amount.toFixed(2)}` : "No expenses yet"}
            </p>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Last Expense</CardTitle>
            <CalendarIcon className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {mostRecentDate 
                ? mostRecentDate.toLocaleDateString('en-US', { month: 'short', day: 'numeric' }) 
                : "N/A"}
            </div>
            <p className="text-xs text-muted-foreground">
              {mostRecentDate 
                ? mostRecentDate.toLocaleDateString('en-US', { year: 'numeric' }) 
                : "No expenses recorded yet"}
            </p>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2">
          <ExpenseList />
        </div>
        <div>
          <ExpenseForm />
        </div>
      </div>
    </div>
  );
};
