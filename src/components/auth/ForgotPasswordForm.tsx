
import { useState } from "react";
import { useAuth } from "../../contexts/AuthContext";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { InfoIcon } from "lucide-react";

type ResetMode = "request" | "reset";

export const ForgotPasswordForm = ({ onCancel }: { onCancel: () => void }) => {
  const [mode, setMode] = useState<ResetMode>("request");
  const [email, setEmail] = useState("");
  const [resetCode, setResetCode] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState("");
  const [showResetInfo, setShowResetInfo] = useState(false);
  
  const { forgotPassword, resetPassword } = useAuth();

  const handleRequestReset = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setIsSubmitting(true);

    try {
      await forgotPassword(email);
      setMode("reset");
      setShowResetInfo(true);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Password reset request failed");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleResetPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    if (newPassword !== confirmPassword) {
      setError("Passwords do not match");
      return;
    }

    if (newPassword.length < 6) {
      setError("Password must be at least 6 characters");
      return;
    }

    setIsSubmitting(true);

    try {
      await resetPassword(email, resetCode, newPassword);
      onCancel(); // Return to login after successful reset
    } catch (err) {
      setError(err instanceof Error ? err.message : "Password reset failed");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Card className="w-full max-w-md mx-auto">
      <CardHeader>
        <CardTitle>
          {mode === "request" ? "Forgot Password" : "Reset Password"}
        </CardTitle>
        <CardDescription>
          {mode === "request" 
            ? "Enter your email to receive a password reset code" 
            : "Enter the reset code and your new password"}
        </CardDescription>
      </CardHeader>
      <CardContent>
        {mode === "request" ? (
          <form onSubmit={handleRequestReset} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="reset-email">Email</Label>
              <Input
                id="reset-email"
                type="email"
                placeholder="you@example.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />
            </div>
            {error && (
              <div className="text-destructive text-sm">{error}</div>
            )}
            <Button 
              type="submit" 
              className="w-full"
              disabled={isSubmitting}
            >
              {isSubmitting ? "Sending..." : "Send Reset Code"}
            </Button>
          </form>
        ) : (
          <form onSubmit={handleResetPassword} className="space-y-4">
            {showResetInfo && (
              <Alert className="mb-4">
                <InfoIcon className="h-4 w-4" />
                <AlertTitle>Demo Mode Information</AlertTitle>
                <AlertDescription>
                  In this demo, reset codes are not actually sent via email. 
                  Please check your browser's console (F12 &gt; Console tab) to see 
                  the reset code for {email}.
                </AlertDescription>
              </Alert>
            )}
            <div className="space-y-2">
              <Label htmlFor="reset-code">Reset Code</Label>
              <Input
                id="reset-code"
                type="text"
                placeholder="123456"
                value={resetCode}
                onChange={(e) => setResetCode(e.target.value)}
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="new-password">New Password</Label>
              <Input
                id="new-password"
                type="password"
                placeholder="••••••••"
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                required
                minLength={6}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="confirm-password">Confirm New Password</Label>
              <Input
                id="confirm-password"
                type="password"
                placeholder="••••••••"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                required
                minLength={6}
              />
            </div>
            {error && (
              <div className="text-destructive text-sm">{error}</div>
            )}
            <Button 
              type="submit" 
              className="w-full"
              disabled={isSubmitting}
            >
              {isSubmitting ? "Resetting..." : "Reset Password"}
            </Button>
          </form>
        )}
      </CardContent>
      <CardFooter className="flex justify-center">
        <Button 
          variant="link" 
          onClick={onCancel}
          className="text-sm"
        >
          Back to Login
        </Button>
      </CardFooter>
    </Card>
  );
};
