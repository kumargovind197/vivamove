"use client";

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import AdminPanel from '@/components/admin-panel';
import { Button } from '@/components/ui/button';
import { ShieldOff, Loader2 } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { auth } from '@/lib/firebase';
import type { User } from 'firebase/auth';

export default function AdminPage() {
  const [user, setUser] = useState<User | null>(null);
  const [isAdmin, setIsAdmin] = useState(false);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    const unsubscribe = auth.onAuthStateChanged((firebaseUser) => {
      if (firebaseUser) {
        // User is logged in, check for admin claim
        firebaseUser.getIdTokenResult(true) // Force refresh the token
          .then((idTokenResult) => {
            if (idTokenResult.claims.admin) {
              setUser(firebaseUser);
              setIsAdmin(true);
            } else {
              // Not an admin
              setUser(firebaseUser);
              setIsAdmin(false);
            }
            setLoading(false);
          })
          .catch((error) => {
            console.error("Error fetching user claims:", error);
            setUser(firebaseUser);
            setIsAdmin(false);
            setLoading(false);
          });
      } else {
        // User is not logged in, redirect to login
        setUser(null);
        setIsAdmin(false);
        router.push('/login');
      }
    });

    return () => unsubscribe();
  }, [router]);

  if (loading) {
    return (
       <div className="flex min-h-screen w-full flex-col items-center justify-center bg-background">
          <div className="w-full max-w-md space-y-4 m-4 text-center">
             <Card>
                <CardHeader>
                  <CardTitle>Verifying Credentials</CardTitle>
                </CardHeader>
                <CardContent className="flex flex-col items-center gap-4">
                    <Loader2 className="h-8 w-8 animate-spin text-primary" />
                    <p className="text-sm text-muted-foreground">Please wait while we confirm your administrator access...</p>
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
  
  // At this point, user is confirmed to be an admin
  return (
    <div className="flex min-h-screen w-full flex-col">
      <main className="flex-1">
        <AdminPanel />
      </main>
    </div>
  );
}
