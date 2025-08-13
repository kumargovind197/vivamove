"use client";

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { onAuthStateChanged, getIdTokenResult } from "firebase/auth";
import { auth } from '@/lib/firebase';
import AppHeader from '@/components/app-header';
import AdminPanel from '@/components/admin-panel';
import { Skeleton } from '@/components/ui/skeleton';

export default function AdminPage() {
  const [user, setUser] = useState<any | null>(null);
  const [isAdmin, setIsAdmin] = useState(false);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (userAuth) => {
      if (userAuth) {
        // User is signed in, now check for admin claim.
        try {
          const idTokenResult = await getIdTokenResult(userAuth);
          const isAdminClaim = !!idTokenResult.claims.admin;
          
          if (isAdminClaim) {
            setUser(userAuth);
            setIsAdmin(true);
          } else {
            // User is logged in but not an admin
            setIsAdmin(false);
            setUser(null);
          }
        } catch (error) {
          console.error("Error getting user token:", error);
          setIsAdmin(false);
          setUser(null);
        }
      } else {
        // User is not signed in.
        setIsAdmin(false);
        setUser(null);
      }
      setLoading(false);
    });

    // Cleanup subscription on unmount
    return () => unsubscribe();
  }, [router]);

  if (loading) {
    return (
      <div className="flex min-h-screen w-full flex-col items-center justify-center">
        <div className="p-8 space-y-4 w-full max-w-4xl">
          <Skeleton className="h-16 w-full" />
          <Skeleton className="h-10 w-48" />
          <div className="grid grid-cols-1 gap-6">
            <Skeleton className="h-64 w-full" />
            <Skeleton className="h-64 w-full" />
          </div>
        </div>
      </div>
    );
  }

  if (!isAdmin) {
    return (
      <div className="flex min-h-screen flex-col items-center justify-center bg-background p-4">
        <div className="w-full max-w-md text-center">
          <h1 className="text-2xl font-bold text-destructive">Access Denied</h1>
          <p className="text-muted-foreground mt-2">
            You do not have the required permissions to view this page. Please contact your system administrator.
          </p>
          <Button onClick={() => router.push('/login')} className="mt-6">
            Go to Login
          </Button>
        </div>
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
