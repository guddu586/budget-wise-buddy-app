
import { ReactNode } from "react";
import { Header } from "./Header";
import { useAuth } from "../../contexts/AuthContext";
import { AuthForm } from "../auth/AuthForm";

interface LayoutProps {
  children: ReactNode;
}

export const Layout = ({ children }: LayoutProps) => {
  const { user, loading } = useAuth();

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-pulse">Loading...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col bg-background">
      <Header />
      <main className="flex-1 container py-8">
        {!user ? (
          <div className="max-w-md mx-auto py-8">
            <h1 className="text-3xl font-bold text-center mb-8">Welcome to BudgetWise</h1>
            <AuthForm />
          </div>
        ) : (
          children
        )}
      </main>
      <footer className="border-t py-4">
        <div className="container text-sm text-center text-muted-foreground">
          BudgetWise Expense Tracker &copy; {new Date().getFullYear()}
        </div>
      </footer>
    </div>
  );
};
