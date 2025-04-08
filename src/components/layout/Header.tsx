
import { useAuth } from "../../contexts/AuthContext";
import { Button } from "@/components/ui/button";
import { LogOut, DollarSign } from "lucide-react";

export const Header = () => {
  const { user, logout } = useAuth();

  return (
    <header className="border-b">
      <div className="container py-4 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <DollarSign className="h-6 w-6 text-expense-blue" />
          <h1 className="text-xl font-bold">BudgetWise</h1>
        </div>
        
        {user && (
          <div className="flex items-center gap-4">
            <div className="text-sm text-muted-foreground hidden sm:block">
              {user.email}
            </div>
            <Button 
              variant="ghost" 
              size="sm" 
              onClick={logout}
              className="flex items-center gap-1"
            >
              <LogOut className="h-4 w-4" />
              <span>Logout</span>
            </Button>
          </div>
        )}
      </div>
    </header>
  );
};
