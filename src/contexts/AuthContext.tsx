
import React, { createContext, useContext, useState, useEffect } from "react";
import { AuthContextType, User } from "../types";
import { toast } from "sonner";

// Mock authentication - in a real app, this would use a backend service
const USERS_STORAGE_KEY = "expense-tracker-users";
const CURRENT_USER_KEY = "expense-tracker-current-user";

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Check if user is already logged in
    const storedUser = localStorage.getItem(CURRENT_USER_KEY);
    if (storedUser) {
      setUser(JSON.parse(storedUser));
    }
    setLoading(false);
  }, []);

  const login = async (email: string, password: string) => {
    setLoading(true);
    try {
      // In a real app, this would be an API call
      const storedUsers = localStorage.getItem(USERS_STORAGE_KEY);
      const users = storedUsers ? JSON.parse(storedUsers) : [];
      
      const foundUser = users.find(
        (u: any) => u.email === email && u.password === password
      );
      
      if (!foundUser) {
        throw new Error("Invalid email or password");
      }
      
      const userInfo: User = { id: foundUser.id, email: foundUser.email };
      localStorage.setItem(CURRENT_USER_KEY, JSON.stringify(userInfo));
      setUser(userInfo);
      toast.success("Login successful!");
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Login failed");
      throw error;
    } finally {
      setLoading(false);
    }
  };

  const signup = async (email: string, password: string) => {
    setLoading(true);
    try {
      // In a real app, this would be an API call
      const storedUsers = localStorage.getItem(USERS_STORAGE_KEY);
      const users = storedUsers ? JSON.parse(storedUsers) : [];
      
      const userExists = users.some((u: any) => u.email === email);
      if (userExists) {
        throw new Error("User already exists with this email");
      }
      
      const newUser = {
        id: Date.now().toString(),
        email,
        password, // In a real app, this would be hashed
      };
      
      users.push(newUser);
      localStorage.setItem(USERS_STORAGE_KEY, JSON.stringify(users));
      
      const userInfo: User = { id: newUser.id, email: newUser.email };
      localStorage.setItem(CURRENT_USER_KEY, JSON.stringify(userInfo));
      setUser(userInfo);
      toast.success("Account created successfully!");
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Signup failed");
      throw error;
    } finally {
      setLoading(false);
    }
  };

  const logout = () => {
    localStorage.removeItem(CURRENT_USER_KEY);
    setUser(null);
    toast.success("Logged out successfully");
  };

  return (
    <AuthContext.Provider value={{ user, loading, login, signup, logout }}>
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
