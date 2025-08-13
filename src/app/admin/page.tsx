
"use client";

import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import AppHeader from '@/components/app-header';
import AdminPanel from '@/components/admin-panel';
import { useAuth } from '@/hooks/useAuth';
import { Button } from '@/components/ui/button';
import { ShieldOff, ShieldCheck } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { getAuth, onIdTokenChanged } from 'firebase/auth';

// This is a placeholder function. In a real backend, you'd have an endpoint
// to check if any admin users exist. For this prototype, we'll simulate it
// on the client, which is NOT secure for production but allows us to bootstrap the first admin.
const checkForAdmins = async (): Promise<boolean> => {
    // In a real app, this would be a secure call to a backend function.
    // Since we cannot do that here, we will have to rely on the honor system
    // for the very first admin creation. The UI will guide the user.
    // For the purpose of this prototype, we assume no admins exist initially.
    return false; 
};


export default function AdminPage() {
  const { user, isAdmin, loading } = useAuth();
  const router = useRouter();
  const [noAdminsExist, setNoAdminsExist] = useState(false);
  const [checkingAdmins, setCheckingAdmins] = useState(true);

  useEffect(() => {
    const check = async () => {
        // This is a simplified check. A real app would need a secure backend endpoint.
        const auth = getAuth();
        const currentUser = auth.currentUser;
        if (currentUser) {
            const tokenResult = await currentUser.getIdTokenResult(true); // Force refresh
             // This check is imperfect. If the current user logs in and IS the first admin,
             // isAdmin will be true, but we still want to show the bootstrap message once.
             // We use a session storage flag to ensure we only show the bootstrap once per session.
            if (sessionStorage.getItem('firstAdminCheck')) {
                setNoAdminsExist(false);
            } else if (!tokenResult.claims.admin) {
                 // Simulate checking if ANY admin exists. We assume none do if the current user isn't one.
                 // This is the bootstrap scenario.
                setNoAdminsExist(true);
            }
        }
        setCheckingAdmins(false);
    };
    if (!loading) {
       check();
    }
  }, [loading, user]);
  
   useEffect(() => {
    // Listen for claims changes to automatically refresh the page state after making self-admin
    const auth = getAuth();
    const unsubscribe = onIdTokenChanged(auth, async (user) => {
        if (user) {
            const tokenResult = await user.getIdTokenResult(true);
            if (tokenResult.claims.admin) {
                // Once the user is an admin, remove the bootstrap message
                sessionStorage.setItem('firstAdminCheck', 'done');
                setNoAdminsExist(false);
                // Force a re-render with new state
                router.refresh();
            }
        }
    });

    return () => unsubscribe();
  }, [router]);


  if (loading || checkingAdmins) {
    return (
       <div className="flex min-h-screen w-full flex-col items-center justify-center bg-background">
          <div className="w-full max-w-md space-y-4 m-4">
            <Skeleton className="h-10 w-3/4" />
            <Skeleton className="h-6 w-1/2" />
            <Skeleton className="h-40 w-full" />
          </div>
      </div>
    );
  }

  // Special "bootstrap" mode if no admins exist in the system yet.
  if (!isAdmin && noAdminsExist) {
    return (
      <div className="flex min-h-screen w-full flex-col items-center justify-center bg-background p-4">
        <AppHeader user={user} view="admin" clinic={null} />
         <main className="flex-1 w-full max-w-4xl py-8">
            <Card className="w-full border-primary/50">
              <CardHeader>
                  <CardTitle className="flex items-center gap-2 text-primary">
                      <ShieldCheck className="h-6 w-6"/>
                      Set Up Your First Administrator
                  </CardTitle>
                  <CardDescription>
                    Since no admin users exist, you can now grant the first administrator role. 
                    Log in with the account you want to be the primary admin, and use the panel below to grant yourself the role.
                    Once you do this, this page will become restricted to admins only.
                  </CardDescription>
              </CardHeader>
              <CardContent>
                  <AdminPanel />
              </CardContent>
          </Card>
        </main>
      </div>
    );
  }

  // Standard access denied for non-admins when admins *do* exist
  if (!user || !isAdmin) {
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
                  <p className="text-muted-foreground">You do not have the necessary permissions to view this page. This area is for administrators only.</p>
                   <Button onClick={() => router.push('/')} className="mt-6 w-full">
                      Return to Homepage
                  </Button>
              </CardContent>
          </Card>
      </div>
    );
  }
  
  // Standard view for logged-in admins
  return (
    <div className="flex min-h-screen w-full flex-col">
      <AppHeader user={user} view="admin" clinic={null} />
      <main className="flex-1">
        <AdminPanel />
      </main>
    </div>
  );
}
