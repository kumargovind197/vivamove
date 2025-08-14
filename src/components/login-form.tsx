
"use client";

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from '@/hooks/use-toast';
import { Eye, EyeOff, LogIn } from 'lucide-react';
import { auth, signInWithEmailAndPassword, sendPasswordResetEmail } from '@/lib/firebase';
import { getIdTokenResult } from 'firebase/auth';

interface LoginFormProps {
    redirectTo?: string;
}

export default function LoginForm({ redirectTo = '/' }: LoginFormProps) {
  const [identifier, setIdentifier] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const router = useRouter();
  const { toast } = useToast();

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      const userCredential = await signInWithEmailAndPassword(auth, identifier, password);
      
      // Force refresh of the token to get custom claims, though we won't use them for routing here
      await getIdTokenResult(userCredential.user, true);

      toast({
        title: "Login Successful",
        description: `Welcome back! Redirecting...`,
      });

      // Use the explicit redirect path provided
      router.push(redirectTo);

    } catch (error: any) {
       console.error("Login Error:", error);
       toast({
        variant: "destructive",
        title: "Login Failed",
        description: error.code === 'auth/invalid-credential' 
            ? "Invalid credentials. Please check your email and password."
            : "An unexpected error occurred. Please try again.",
      });
    } finally {
        setIsLoading(false);
    }
  };
  
  const handlePasswordRecovery = async () => {
    if (!identifier) {
      toast({
        variant: 'destructive',
        title: 'Email Required',
        description: 'Please enter your email address to recover your password.',
      });
      return;
    }

    setIsLoading(true);
    try {
        await sendPasswordResetEmail(auth, identifier);
        toast({
            title: 'Password Recovery Email Sent',
            description: `If an account exists for ${identifier}, a recovery link has been sent.`,
        });
    } catch (error: any) {
        console.error("Password Reset Error:", error);
        toast({
            variant: "destructive",
            title: 'Password Recovery Failed',
            description: "Please ensure you have entered a valid email address.",
        });
    } finally {
        setIsLoading(false);
    }
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
            <Label htmlFor="identifier">Email</Label>
            <Input
              id="identifier"
              type="email"
              placeholder="user@example.com"
              value={identifier}
              onChange={(e) => setIdentifier(e.target.value)}
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
