
"use client";

import React from 'react';
import { useRouter } from 'next/navigation';
import AppHeader from '@/components/app-header';
import AdminPanel from '@/components/admin-panel';
import { useAuth } from '@/hooks/useAuth';
import { Button } from '@/components/ui/button';
import { AlertTriangle, ShieldOff } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';


export default function AdminPage() {
  const { user, isAdmin, loading } = useAuth();
  const router = useRouter();

  if (loading) {
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
  
  // Only render the admin panel if the user is authenticated and is an admin
  return (
    <div className="flex min-h-screen w-full flex-col">
      <AppHeader user={user} view="admin" clinic={null} />
      <main className="flex-1">
        <AdminPanel />
      </main>
    </div>
  );
}
