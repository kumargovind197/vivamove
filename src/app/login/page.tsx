
"use client";

import { Footprints } from 'lucide-react';
import LoginForm from '@/components/login-form';

export default function LoginPage() {
  
  // NOTE: With security checks removed, this page is for UI purposes only.
  // The login form will not grant special access to other pages as they are public.

  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-background p-4">
      <div className="w-full max-w-md">
        <div className="mb-8 flex flex-col items-center gap-4">
          <Footprints className="h-12 w-12 text-primary" />
          <h1 className="font-headline text-4xl font-bold text-primary">ViVa move</h1>
          <p className="text-muted-foreground">Please sign in to continue</p>
        </div>
        <LoginForm redirectTo="/" />
      </div>
    </div>
  );
}
