
"use client";

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import AppHeader from '@/components/app-header';
import PatientManagement from '@/components/patient-management';
import { Skeleton } from '@/components/ui/skeleton';
import { useAuth } from '@/hooks/useAuth';
import { ShieldAlert } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { getClinicData } from '@/lib/mock-data';
import type { ClinicData } from '@/lib/types';


export default function ClinicPage() {
  const { user, loading, claims, logout } = useAuth();
  const router = useRouter();
  const [clinicData, setClinicData] = useState<ClinicData | null>(null);
  const [isLoadingClinic, setIsLoadingClinic] = useState(true);

  useEffect(() => {
    if (loading) return; // Wait for auth to finish
    if (!user || !claims?.clinic) {
      setIsLoadingClinic(false);
      return;
    }

    const fetchClinicData = async () => {
      setIsLoadingClinic(true);
      // In a real app, this would be a database call.
      // Here, we use the mock data function.
      const data = getClinicData(claims.clinicId);
      setClinicData(data);
      setIsLoadingClinic(false);
    };

    fetchClinicData();
  }, [user, loading, claims]);

  if (loading || isLoadingClinic) {
     return (
        <div className="flex min-h-screen w-full flex-col items-center justify-center p-8">
            <div className="p-8 space-y-4 w-full max-w-4xl">
                <Skeleton className="h-16 w-full" />
                <div className="space-y-4 mt-8">
                    <Skeleton className="h-10 w-1/4" />
                    <Skeleton className="h-10 w-full" />
                    <Skeleton className="h-64 w-full" />
                </div>
            </div>
        </div>
    );
  }

  // Strict check: If not loading, and user is not a clinic user, deny access.
  if (!user || !claims?.clinic) {
     return (
      <div className="flex min-h-screen w-full flex-col items-center justify-center bg-background p-4 text-center">
        <ShieldAlert className="h-16 w-16 text-destructive mb-4" />
        <h1 className="text-2xl font-bold text-foreground">Access Denied</h1>
        <p className="mt-2 text-muted-foreground max-w-sm">
          You do not have the required permissions to view this page. Please log in as a clinic user.
        </p>
        <Button onClick={() => {
            logout();
            router.push('/clinic/login');
        }} className="mt-6">
          Go to Clinic Login
        </Button>
      </div>
    );
  }
  
  return (
    <div className="flex min-h-screen w-full flex-col">
      <AppHeader user={user} view="clinic" clinic={clinicData}/>
      <main className="flex-1">
       <PatientManagement clinicId={claims.clinicId} />
      </main>
    </div>
  );
}
