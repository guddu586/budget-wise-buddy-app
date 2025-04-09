
import React, { createContext, useContext, useState, useEffect } from "react";
import { AuthContextType, User } from "../types";
import { toast } from "sonner";

// Mock authentication - in a real app, this would use a backend service
const USERS_STORAGE_KEY = "expense-tracker-users";
const CURRENT_USER_KEY = "expense-tracker-current-user";
const RESET_CODES_KEY = "expense-tracker-reset-codes";

// Default users for easy testing
const DEFAULT_USERS = [
  {
    id: "123456",
    email: "demo@example.com",
    password: "password123"
  }
];

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Initialize default users if none exist
    const storedUsers = localStorage.getItem(USERS_STORAGE_KEY);
    if (!storedUsers) {
      localStorage.setItem(USERS_STORAGE_KEY, JSON.stringify(DEFAULT_USERS));
    }

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

  const forgotPassword = async (email: string) => {
    setLoading(true);
    try {
      // In a real app, this would send an email with a reset link
      const storedUsers = localStorage.getItem(USERS_STORAGE_KEY);
      const users = storedUsers ? JSON.parse(storedUsers) : [];
      
      const userExists = users.some((u: any) => u.email === email);
      if (!userExists) {
        throw new Error("No account exists with this email");
      }
      
      // Generate a 6-digit reset code
      const resetCode = Math.floor(100000 + Math.random() * 900000).toString();
      
      // Store the reset code with the email and expiration time (30 minutes)
      const resetCodes = JSON.parse(localStorage.getItem(RESET_CODES_KEY) || "{}");
      resetCodes[email] = {
        code: resetCode,
        expires: Date.now() + 30 * 60 * 1000, // 30 minutes
      };
      localStorage.setItem(RESET_CODES_KEY, JSON.stringify(resetCodes));
      
      // For demo purposes, log the reset code to console
      console.log(`===== RESET CODE for ${email}: ${resetCode} =====`);
      
      // In a real production app, we would use a backend service to send an email
      // This would typically involve making an API call to your backend
      // Example pseudo-code for a real implementation:
      /*
        await fetch('https://your-backend-api.com/send-reset-email', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ 
            email, 
            resetCode,
            // potentially other data like app name, reset URL, etc.
          })
        });
      */
      
      // For this demo, we simulate the email sending process
      simulateEmailSending(email, resetCode);
      
      toast.success("Password reset code sent to your email");
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Password reset request failed");
      throw error;
    } finally {
      setLoading(false);
    }
  };

  // Simulate the email sending process (for demo purposes only)
  const simulateEmailSending = (email: string, resetCode: string) => {
    // In a real app, this would be replaced with an actual email service integration
    // Possible email services include:
    // - SendGrid
    // - Mailgun
    // - Amazon SES
    // - Gmail API (which would require OAuth2 authentication)
    // - Nodemailer with SMTP (for backend implementations)
    
    setTimeout(() => {
      toast.success(`For demo purposes: Email with reset code ${resetCode} would be sent to ${email}`);
      console.log(`[DEMO] Email would be sent to ${email} with reset code: ${resetCode}`);
      
      // Example of what the email content might look like:
      console.log(`
=============== SIMULATED EMAIL CONTENT ===============
From: BudgetWise <noreply@budgetwise.com>
To: ${email}
Subject: Password Reset Code for BudgetWise

Hello,

You recently requested to reset your password for your BudgetWise account.
Please use the following code to reset your password:

${resetCode}

This code will expire in 30 minutes.

If you did not request a password reset, please ignore this email or contact support.

Best regards,
The BudgetWise Team
============================================================
      `);
    }, 1500); // Simulate network delay
  };

  const resetPassword = async (email: string, resetCode: string, newPassword: string) => {
    setLoading(true);
    try {
      // Get stored reset codes
      const resetCodes = JSON.parse(localStorage.getItem(RESET_CODES_KEY) || "{}");
      const resetData = resetCodes[email];
      
      // Validate reset code
      if (!resetData) {
        throw new Error("Invalid or expired reset code");
      }
      
      if (resetData.code !== resetCode) {
        throw new Error("Invalid reset code");
      }
      
      if (Date.now() > resetData.expires) {
        throw new Error("Reset code has expired");
      }
      
      // Update the user's password
      const storedUsers = localStorage.getItem(USERS_STORAGE_KEY);
      const users = storedUsers ? JSON.parse(storedUsers) : [];
      
      const userIndex = users.findIndex((u: any) => u.email === email);
      if (userIndex === -1) {
        throw new Error("User not found");
      }
      
      // Update password
      users[userIndex].password = newPassword;
      localStorage.setItem(USERS_STORAGE_KEY, JSON.stringify(users));
      
      // Remove the used reset code
      delete resetCodes[email];
      localStorage.setItem(RESET_CODES_KEY, JSON.stringify(resetCodes));
      
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
      resetPassword
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
