"use client";

import React from 'react';
import { useRouter } from 'next/navigation';
import AppHeader from '@/components/app-header';
import AdminPanel from '@/components/admin-panel';
import { useAuth } from '@/hooks/useAuth';
import { Skeleton } from '@/components/ui/skeleton';
import { ShieldAlert } from 'lucide-react';
import { Button } from '@/components/ui/button';

export default function AdminPage() {
  const { user, loading, claims } = useAuth();
  const router = useRouter();

  if (loading) {
    return (
      <div className="flex min-h-screen w-full flex-col items-center justify-center p-8">
        <div className="space-y-4 w-full max-w-4xl">
            <Skeleton className="h-16 w-full" />
            <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
                <div className="md:col-span-1 space-y-2">
                    <Skeleton className="h-10 w-full" />
                    <Skeleton className="h-10 w-full" />
                    <Skeleton className="h-10 w-full" />
                </div>
                <div className="md:col-span-3">
                     <Skeleton className="h-96 w-full" />
                </div>
            </div>
        </div>
      </div>
    );
  }

  if (!user || !claims?.admin) {
    return (
      <div className="flex min-h-screen w-full flex-col items-center justify-center bg-background p-4 text-center">
        <ShieldAlert className="h-16 w-16 text-destructive mb-4" />
        <h1 className="text-2xl font-bold text-foreground">Access Denied</h1>
        <p className="mt-2 text-muted-foreground max-w-sm">
          You do not have the required permissions to view this page. Please log in as an administrator.
        </p>
        <Button onClick={() => router.push('/login')} className="mt-6">
          Go to Login
        </Button>
      </div>
    );
  }

  return (
    <div className="flex min-h-screen w-full flex-col">
      <AppHeader user={user} view="admin" clinic={null} />
      <main className="flex-1">
        <AdminPanel />
      </main>
    </div>
  );
}
