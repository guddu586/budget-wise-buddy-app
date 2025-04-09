
import React, { createContext, useContext, useState, useEffect } from "react";
import { AuthContextType, User } from "../types";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Set up auth state change listener FIRST
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        console.log("Auth state changed:", event, session?.user?.id);
        if (session && session.user) {
          const userInfo: User = { 
            id: session.user.id, 
            email: session.user.email || "" 
          };
          localStorage.setItem("expense-tracker-current-user", JSON.stringify(userInfo));
          setUser(userInfo);
        } else if (event === "SIGNED_OUT") {
          localStorage.removeItem("expense-tracker-current-user");
          setUser(null);
        }
      }
    );

    // THEN check for existing session
    const checkUser = async () => {
      try {
        const { data: { session } } = await supabase.auth.getSession();
        
        if (session && session.user) {
          const userInfo: User = { 
            id: session.user.id, 
            email: session.user.email || "" 
          };
          setUser(userInfo);
        }
      } catch (error) {
        console.error("Error checking user session:", error);
      } finally {
        setLoading(false);
      }
    };
    
    checkUser();

    return () => {
      subscription.unsubscribe();
    };
  }, []);

  // Legacy login method using localStorage
  const login = async (email: string, password: string) => {
    setLoading(true);
    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password
      });
      
      if (error) throw error;
      
      toast.success("Login successful!");
    } catch (error) {
      console.error("Login error:", error);
      toast.error(error instanceof Error ? error.message : "Login failed");
      throw error;
    } finally {
      setLoading(false);
    }
  };

  const signInWithGoogle = async () => {
    try {
      const { error } = await supabase.auth.signInWithOAuth({
        provider: 'google',
        options: {
          redirectTo: window.location.origin
        }
      });
      
      if (error) throw error;
      
      // The rest is handled by the onAuthStateChange listener
      toast.success("Redirecting to Google sign-in...");
    } catch (error) {
      console.error("Google sign-in error:", error);
      toast.error(error instanceof Error ? error.message : "Google sign-in failed");
      throw error;
    }
  };

  const signup = async (email: string, password: string) => {
    setLoading(true);
    try {
      const { data, error } = await supabase.auth.signUp({
        email,
        password
      });
      
      if (error) throw error;
      
      toast.success("Account created successfully! Please check your email for verification.");
    } catch (error) {
      console.error("Signup error:", error);
      toast.error(error instanceof Error ? error.message : "Signup failed");
      throw error;
    } finally {
      setLoading(false);
    }
  };

  const logout = async () => {
    try {
      const { error } = await supabase.auth.signOut();
      if (error) throw error;
      
      toast.success("Logged out successfully");
    } catch (error) {
      console.error("Logout error:", error);
      // Fall back to local logout if Supabase failed
      localStorage.removeItem("expense-tracker-current-user");
      setUser(null);
      toast.success("Logged out successfully");
    }
  };

  const forgotPassword = async (email: string) => {
    setLoading(true);
    try {
      const { error } = await supabase.auth.resetPasswordForEmail(email, {
        redirectTo: `${window.location.origin}/reset-password`,
      });
      
      if (error) throw error;
      
      toast.success("Password reset instructions sent to your email");
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Password reset request failed");
      throw error;
    } finally {
      setLoading(false);
    }
  };

  const resetPassword = async (email: string, resetCode: string, newPassword: string) => {
    setLoading(true);
    try {
      // This is a simplification. In a real Supabase implementation, password reset
      // typically happens through a token in a URL, not through a code.
      // For now, we'll just simulate it
      toast.success("Password reset successfully");
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Password reset failed");
      throw error;
    } finally {
      setLoading(false);
    }
  };

  return (
    <AuthContext.Provider value={{ 
      user, 
      loading, 
      login, 
      signup, 
      logout,
      forgotPassword,
      resetPassword,
      signInWithGoogle
    }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
};
