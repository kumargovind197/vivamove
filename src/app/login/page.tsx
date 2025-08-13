
"use client";

import { useEffect } from 'react';
import { Footprints } from 'lucide-react';
import LoginForm from '@/components/login-form';
import { useAuth } from '../auth-provider';
import { useRouter } from 'next/navigation';

export default function LoginPage() {
  const { user, userClaims, loading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!loading && user) {
        if (userClaims?.admin) {
            router.push('/admin');
        } else if (userClaims?.clinic) {
            router.push('/clinic');
        } else {
            router.push('/');
        }
    }
  }, [user, userClaims, loading, router]);


  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-background p-4">
      <div className="w-full max-w-md">
        <div className="mb-8 flex flex-col items-center gap-4">
          <Footprints className="h-12 w-12 text-primary" />
          <h1 className="font-headline text-4xl font-bold text-primary">ViVa move</h1>
          <p className="text-muted-foreground">Please sign in to continue</p>
        </div>
        <LoginForm />
      </div>
    </div>
  );
}
