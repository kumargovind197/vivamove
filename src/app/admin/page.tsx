
"use client";

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import AppHeader from '@/components/app-header';
import AdminPanel from '@/components/admin-panel';
import { Button } from '@/components/ui/button';
import { ShieldOff } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { auth } from '@/lib/firebase';
import type { User } from 'firebase/auth';

export default function AdminPage() {
  const [user, setUser] = useState<User | null>(null);
  const [isAdmin, setIsAdmin] = useState(false);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    const unsubscribe = auth.onAuthStateChanged(async (firebaseUser) => {
      if (firebaseUser) {
        // User is signed in.
        try {
          const tokenResult = await firebaseUser.getIdTokenResult(true); // Force refresh
          if (tokenResult.claims.admin) {
            setUser(firebaseUser);
            setIsAdmin(true);
          } else {
            // User is not an admin, deny access.
            setUser(null);
            setIsAdmin(false);
            router.push('/'); // Redirect non-admins away
          }
        } catch (error) {
          console.error("Error fetching user token:", error);
          setIsAdmin(false);
          setUser(null);
          router.push('/');
        } finally {
            setLoading(false);
        }
      } else {
        // User is signed out, redirect to login.
        setIsAdmin(false);
        setUser(null);
        setLoading(false);
        router.push('/login');
      }
    });

    // Cleanup subscription on unmount
    return () => unsubscribe();
  }, [router]);

  if (loading) {
    return (
       <div className="flex min-h-screen w-full flex-col items-center justify-center bg-background">
          <div className="w-full max-w-md space-y-4 m-4">
             <Card>
                <CardHeader>
                  <Skeleton className="h-8 w-3/4 mb-2" />
                  <Skeleton className="h-4 w-1/2" />
                </CardHeader>
                <CardContent>
                    <p className="text-sm text-muted-foreground">Verifying administrator credentials...</p>
                    <Skeleton className="h-10 w-full mt-6" />
                </CardContent>
            </Card>
          </div>
      </div>
    );
  }

  if (!isAdmin) {
    return (
      <div className="flex min-h-screen w-full flex-col items-center justify-center bg-background">
          <Card className="w-full max-w-md m-4 border-destructive">
              <CardHeader>
                  <CardTitle className="flex items-center gap-2 text-destructive">
                      <ShieldOff className="h-6 w-6"/>
                      Access Denied
                  </CardTitle>
              </CardHeader>
              <CardContent>
                  <p className="text-muted-foreground">You do not have the necessary permissions to view this page. Please log in with an administrator account.</p>
                   <Button onClick={() => router.push('/login')} className="mt-6 w-full">
                      Return to Login
                  </Button>
              </CardContent>
          </Card>
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
