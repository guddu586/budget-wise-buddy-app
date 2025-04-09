
import { useState } from "react";
import { useAuth } from "../../contexts/AuthContext";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { ForgotPasswordForm } from "./ForgotPasswordForm";
import { Separator } from "@/components/ui/separator";
import { Github, Loader2 } from "lucide-react";

type AuthMode = "login" | "signup" | "forgot-password";

export const AuthForm = () => {
  const [mode, setMode] = useState<AuthMode>("login");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState("");
  const [isGoogleLoading, setIsGoogleLoading] = useState(false);
  
  const { login, signup, signInWithGoogle } = useAuth();

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

  const handleGoogleSignIn = async () => {
    setError("");
    setIsGoogleLoading(true);
    try {
      await signInWithGoogle();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Google authentication failed");
      setIsGoogleLoading(false);
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
        <div className="space-y-4">
          <Button 
            type="button" 
            className="w-full flex items-center justify-center gap-2" 
            variant="outline"
            onClick={handleGoogleSignIn}
            disabled={isGoogleLoading}
          >
            {isGoogleLoading ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <svg width="16" height="16" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 488 512">
                <path fill="currentColor" d="M488 261.8C488 403.3 391.1 504 248 504 110.8 504 0 393.2 0 256S110.8 8 248 8c66.8 0 123 24.5 166.3 64.9l-67.5 64.9C258.5 52.6 94.3 116.6 94.3 256c0 86.5 69.1 156.6 153.7 156.6 98.2 0 135-70.4 140.8-106.9H248v-85.3h236.1c2.3 12.7 3.9 24.9 3.9 41.4z"/>
              </svg>
            )}
            {isGoogleLoading ? "Signing in..." : "Sign in with Google"}
          </Button>

          <div className="relative">
            <div className="absolute inset-0 flex items-center">
              <span className="w-full border-t" />
            </div>
            <div className="relative flex justify-center text-xs uppercase">
              <span className="bg-background px-2 text-muted-foreground">
                Or continue with
              </span>
            </div>
          </div>

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
                ? "Processing..." 
                : mode === "login" ? "Login" : "Sign Up"}
            </Button>
          </form>
        </div>
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
