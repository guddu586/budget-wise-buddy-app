import { useState } from "react";
import { useAuth } from "../../contexts/AuthContext";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { ForgotPasswordForm } from "./ForgotPasswordForm";
import { Loader2, LogIn } from "lucide-react";

type AuthMode = "login" | "signup" | "forgot-password";

export const AuthForm = () => {
  const [mode, setMode] = useState<AuthMode>("login");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState("");
  
  const { login, signup, firebaseLogin } = useAuth();

  const toggleMode = () => {
    setMode(mode === "login" ? "signup" : "login");
    setError("");
    setEmail("");
    setPassword("");
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setIsSubmitting(true);

    try {
      if (mode === "login") {
        await login(email, password);
      } else {
        await signup(email, password);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "Authentication failed");
    } finally {
      setIsSubmitting(false);
    }
  };
  
  const handleFirebaseLogin = async () => {
    setError("");
    setIsSubmitting(true);
    try {
      await firebaseLogin();
    } catch (err) {
      console.error("Firebase login error:", err);
      setError(err instanceof Error ? err.message : "Firebase authentication failed");
    } finally {
      setIsSubmitting(false);
    }
  };

  if (mode === "forgot-password") {
    return <ForgotPasswordForm onCancel={() => setMode("login")} />;
  }

  return (
    <Card className="w-full max-w-md mx-auto">
      <CardHeader>
        <CardTitle>{mode === "login" ? "Login" : "Sign Up"}</CardTitle>
        <CardDescription>
          {mode === "login" 
            ? "Enter your credentials to access your account" 
            : "Create a new account to get started"}
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="email">Email</Label>
            <Input
              id="email"
              type="email"
              placeholder="you@example.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="password">Password</Label>
            <Input
              id="password"
              type="password"
              placeholder="••••••••"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              minLength={6}
            />
            {mode === "login" && (
              <Button 
                variant="link" 
                className="p-0 h-auto text-xs"
                onClick={(e) => {
                  e.preventDefault();
                  setMode("forgot-password");
                }}
              >
                Forgot password?
              </Button>
            )}
          </div>
          {error && (
            <div className="text-destructive text-sm">{error}</div>
          )}
          <Button 
            type="submit" 
            className="w-full"
            disabled={isSubmitting}
          >
            {isSubmitting 
              ? <><Loader2 className="mr-2 h-4 w-4 animate-spin" /> Processing...</> 
              : mode === "login" ? "Login" : "Sign Up"}
          </Button>
          
          <div className="relative my-4">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-gray-300"></div>
            </div>
            <div className="relative flex justify-center text-sm">
              <span className="px-2 bg-background text-muted-foreground">
                Or continue with
              </span>
            </div>
          </div>
          
          <Button 
            type="button"
            variant="outline"
            className="w-full"
            onClick={handleFirebaseLogin}
            disabled={isSubmitting}
          >
            <LogIn className="mr-2 h-4 w-4" />
            Login with Firebase
          </Button>
        </form>
      </CardContent>
      <CardFooter className="flex justify-center">
        <Button 
          variant="link" 
          onClick={toggleMode}
          className="text-sm"
        >
          {mode === "login" 
            ? "Don't have an account? Sign up" 
            : "Already have an account? Login"}
        </Button>
      </CardFooter>
    </Card>
  );
};
