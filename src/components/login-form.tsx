
"use client";

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from '@/hooks/use-toast';
import { Eye, EyeOff, LogIn } from 'lucide-react';
import { useAuth } from '@/hooks/useAuth';

interface LoginFormProps {
    redirectTo?: string;
}

export default function LoginForm({ redirectTo = '/' }: LoginFormProps) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const router = useRouter();
  const { toast } = useToast();
  const { login } = useAuth();

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      await login(email, password);

      toast({
        title: "Login Successful",
        description: `Welcome back! Redirecting...`,
      });
      
      router.push(redirectTo);

    } catch (error: any) {
       console.error("Login Error:", error);
       toast({
        variant: "destructive",
        title: "Login Failed",
        description: error.message || "An unexpected error occurred. Please try again.",
      });
    } finally {
        setIsLoading(false);
    }
  };
  
  const handlePasswordRecovery = async () => {
    if (!email) {
      toast({
        variant: 'destructive',
        title: 'Email Required',
        description: 'Please enter your email address to recover your password.',
      });
      return;
    }
    toast({
        title: 'Password Recovery (Mock)',
        description: `In a real app, a recovery link would be sent to ${email}.`,
    });
  }


  return (
    <Card>
      <CardHeader>
        <CardTitle>Sign In</CardTitle>
        <CardDescription>Enter your credentials to access your dashboard.</CardDescription>
      </CardHeader>
      <form onSubmit={handleLogin}>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="email">Email</Label>
            <Input
              id="email"
              type="email"
              placeholder="user@example.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              disabled={isLoading}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="password">Password</Label>
            <div className="relative">
                <Input
                id="password"
                type={showPassword ? "text" : "password"}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                disabled={isLoading}
                />
                <Button 
                    type="button"
                    variant="ghost" 
                    size="icon" 
                    className="absolute right-1 top-1/2 -translate-y-1/2 h-7 w-7"
                    onClick={() => setShowPassword(!showPassword)}
                    aria-label={showPassword ? "Hide password" : "Show password"}
                >
                    {showPassword ? <EyeOff /> : <Eye />}
                </Button>
            </div>
          </div>
        </CardContent>
        <CardFooter className="flex-col items-stretch gap-4">
          <Button type="submit" disabled={isLoading} className="w-full">
            {isLoading ? 'Signing In...' : 'Sign In'}
            {!isLoading && <LogIn className="ml-2" />}
          </Button>
           <Button 
            type="button" 
            variant="link" 
            size="sm" 
            onClick={handlePasswordRecovery}
            className="text-muted-foreground"
            disabled={isLoading}
            >
            Forgot Password?
          </Button>
        </CardFooter>
      </form>
    </Card>
  );
}
