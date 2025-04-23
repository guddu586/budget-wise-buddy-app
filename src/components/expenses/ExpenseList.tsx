import { useState } from "react";
import { useExpenses } from "../../contexts/ExpenseContext";
import { Expense, CURRENCY_SYMBOLS } from "../../types";
import { format } from "date-fns";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { CalendarIcon, DollarSign, Trash2 } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Label } from "@/components/ui/label";

export const ExpenseList = () => {
  const { expenses, deleteExpense, categories, getExpensesByCategory } = useExpenses();
  const [selectedCategory, setSelectedCategory] = useState<string>("All");
  
  const filteredExpenses = getExpensesByCategory(selectedCategory);
  
  // Sort expenses by date (newest first)
  const sortedExpenses = [...filteredExpenses].sort((a, b) => {
    return new Date(b.date).getTime() - new Date(a.date).getTime();
  });

  return (
    <div className="space-y-4">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
        <h2 className="text-2xl font-bold">Your Expenses</h2>
        <div className="w-full sm:w-auto sm:min-w-[200px]">
          <Select
            value={selectedCategory}
            onValueChange={setSelectedCategory}
          >
            <SelectTrigger>
              <SelectValue placeholder="Filter by category" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="All">All Categories</SelectItem>
              {categories.map((category) => (
                <SelectItem key={category} value={category}>
                  {category}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>

      {sortedExpenses.length === 0 ? (
        <div className="text-center py-8">
          <p className="text-muted-foreground">
            {selectedCategory === "All" 
              ? "You haven't added any expenses yet." 
              : `No expenses found in the "${selectedCategory}" category.`}
          </p>
        </div>
      ) : (
        <div className="space-y-3">
          {sortedExpenses.map((expense) => (
            <ExpenseItem 
              key={expense.id} 
              expense={expense} 
              onDelete={deleteExpense} 
            />
          ))}
        </div>
      )}
    </div>
  );
};

interface ExpenseItemProps {
  expense: Expense;
  onDelete: (id: string) => void;
}

const ExpenseItem = ({ expense, onDelete }: ExpenseItemProps) => {
  return (
    <Card className="expense-card">
      <CardContent className="p-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
          <div className="flex flex-col sm:flex-row sm:items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0">
              <DollarSign className="h-5 w-5 text-primary" />
            </div>
            
            <div>
              <div className="expense-amount text-lg font-semibold">
                {CURRENCY_SYMBOLS[expense.currency || "USD"]}{expense.amount.toFixed(2)}
              </div>
              {expense.description && (
                <p className="text-sm text-muted-foreground line-clamp-1">
                  {expense.description}
                </p>
              )}
            </div>
          </div>
          
          <div className="flex flex-wrap items-center gap-2 mt-2 sm:mt-0">
            <Badge variant="outline" className="expense-category">
              {expense.category}
            </Badge>
            <div className="expense-date flex items-center gap-1 text-sm text-muted-foreground">
              <CalendarIcon className="h-3 w-3" />
              {format(new Date(expense.date), "MMM d, yyyy")}
            </div>
            <Button 
              variant="ghost" 
              size="icon" 
              className="h-8 w-8 text-muted-foreground hover:text-destructive"
              onClick={() => onDelete(expense.id)}
            >
              <Trash2 className="h-4 w-4" />
              <span className="sr-only">Delete</span>
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};
