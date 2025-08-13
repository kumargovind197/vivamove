
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
import { MOCK_USERS } from '@/lib/mock-data';

const ADMIN_EMAIL = 'vinitkiranshah@gmail.com';

export default function LoginForm() {
  const [identifier, setIdentifier] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const router = useRouter();
  const { toast } = useToast();

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    const lowerCaseIdentifier = identifier.toLowerCase();
    
    // --- MOCK USER LOGIN CHECK ---
    const mockUserKey = Object.keys(MOCK_USERS).find(key => key.toLowerCase() === lowerCaseIdentifier);
    const mockUserData = mockUserKey ? MOCK_USERS[mockUserKey as keyof typeof MOCK_USERS] : null;

    if (mockUserData && mockUserData.password === password) {
        toast({
            title: "Login Successful",
            description: "Redirecting...",
        });

        sessionStorage.setItem('mockUser', mockUserKey); 
        
        window.dispatchEvent(new Event('storage'));
        
        // Explicitly check for the admin email for redirection
        if (lowerCaseIdentifier === ADMIN_EMAIL) {
            router.push('/admin');
        } else {
            router.push(mockUserData.redirect || '/');
        }
        return;
    }
    
    // --- FIREBASE AUTH LOGIN (for real users) ---
    try {
      sessionStorage.removeItem('mockUser');

      const userCredential = await signInWithEmailAndPassword(auth, identifier, password);
      const user = userCredential.user;

      toast({
        title: "Login Successful",
        description: `Redirecting...`,
      });
      
       const tokenResult = await user.getIdTokenResult();
       if (tokenResult.claims.admin) {
           router.push('/admin');
       } else {
           router.push('/');
       }

    } catch (error: any) {
       console.error("Login Error:", error);
       toast({
        variant: "destructive",
        title: "Login Failed",
        description: "Invalid credentials. Please check your username and password.",
      });
    } finally {
        setIsLoading(false);
    }
  };
  
  const handlePasswordRecovery = async () => {
    if (!identifier) {
      toast({
        variant: 'destructive',
        title: 'Email/ID Required',
        description: 'Please enter your email or Clinic ID to recover your password.',
      });
      return;
    }

    setIsLoading(true);
    try {
        await sendPasswordResetEmail(auth, identifier);
        toast({
            title: 'Password Recovery Email Sent',
            description: `If a real account exists for ${identifier}, a recovery link has been sent. This does not apply to mock users.`,
        });
    } catch (error: any) {
        console.error("Password Reset Error:", error);
        toast({
            title: 'Password Recovery Attempted',
            description: `If a real account exists for ${identifier}, a recovery link has been sent. This does not apply to mock users with Clinic IDs.`,
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
            <Label htmlFor="identifier">Email or Clinic ID</Label>
            <Input
              id="identifier"
              type="text"
              placeholder="e.g., patient@example.com or clinic-wellness"
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
