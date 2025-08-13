"use client";

import React from 'react';
import AdminPanel from '@/components/admin-panel';
import AppHeader from '@/components/app-header';
import { useAuth } from '@/app/auth-provider';
import { useRouter } from 'next/navigation';
import { Skeleton } from '@/components/ui/skeleton';

export default function AdminPage() {
  const { user, userClaims, loading } = useAuth();
  const router = useRouter();
  const hasAdminRole = userClaims?.admin === true;

  if (loading) {
    return (
      <div className="flex min-h-screen w-full flex-col items-center justify-center">
        <div className="p-8 space-y-4">
            <Skeleton className="h-10 w-48" />
            <Skeleton className="h-4 w-96" />
            <Skeleton className="h-64 w-full" />
        </div>
      </div>
    );
  }

  if (!user || !hasAdminRole) {
    // Redirect to login if not authenticated or not an admin
    // Use a timeout to prevent redirect loops during initial load
    setTimeout(() => router.push('/login'), 0);
    return (
        <div className="flex min-h-screen w-full flex-col items-center justify-center">
            <p>Access Denied. You must be an administrator to view this page.</p>
            <p>Redirecting to login...</p>
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
