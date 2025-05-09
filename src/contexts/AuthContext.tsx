
import React, { createContext, useContext, useState, useEffect } from "react";
import { AuthContextType, User } from "../types";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { 
  signInWithPopup, 
  GoogleAuthProvider, 
  signInWithEmailAndPassword as firebaseSignIn,
  createUserWithEmailAndPassword as firebaseSignUp,
  sendPasswordResetEmail,
  signOut as firebaseSignOut
} from "firebase/auth";
import { auth } from "@/integrations/firebase/config";

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

    // Also set up Firebase auth state listener
    const unsubscribeFirebase = auth.onAuthStateChanged(async (firebaseUser) => {
      if (firebaseUser) {
        // If Firebase user exists, link with Supabase
        try {
          // Get the Firebase ID token
          const idToken = await firebaseUser.getIdToken();
          
          // Sign in to Supabase with the Firebase token
          const { data, error } = await supabase.auth.signInWithIdToken({
            provider: 'firebase',
            token: idToken,
          });
          
          if (error) {
            console.error("Error linking Firebase with Supabase:", error);
          }
        } catch (error) {
          console.error("Error getting Firebase ID token:", error);
        }
      }
    });

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
      unsubscribeFirebase();
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

  const firebaseLogin = async () => {
    setLoading(true);
    try {
      const provider = new GoogleAuthProvider();
      const result = await signInWithPopup(auth, provider);
      
      // The signed-in user info.
      const firebaseUser = result.user;
      
      // Get the Google ID token
      const idToken = await firebaseUser.getIdToken();
      
      // Now sign in to Supabase with the Firebase token
      const { data, error } = await supabase.auth.signInWithIdToken({
        provider: 'firebase',
        token: idToken,
      });
      
      if (error) throw error;
      
      toast.success("Firebase login successful!");
    } catch (error) {
      console.error("Firebase login error:", error);
      toast.error(error instanceof Error ? error.message : "Firebase login failed");
      throw error;
    } finally {
      setLoading(false);
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
      // Sign out from Firebase if user was logged in with Firebase
      await firebaseSignOut(auth);
      
      // Sign out from Supabase
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
      // Use the correct Supabase method for password reset
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

  // Updated to use Supabase's method for updating password
  const resetPassword = async (newPassword: string) => {
    setLoading(true);
    try {
      const { error } = await supabase.auth.updateUser({
        password: newPassword
      });
      
      if (error) throw error;
      
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
      firebaseLogin
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
