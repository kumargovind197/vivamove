
"use client";

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import AppHeader from '@/components/app-header';
import PatientManagement from '@/components/patient-management';
import { Skeleton } from '@/components/ui/skeleton';
import { useAuth } from '@/hooks/useAuth';
import { doc, getDoc, getFirestore } from 'firebase/firestore';
import { ShieldAlert } from 'lucide-react';
import { Button } from '@/components/ui/button';

type ClinicData = {
    id: string;
    name: string;
    logo: string;
}

export default function ClinicPage() {
  const { user, loading, claims } = useAuth();
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
      const db = getFirestore();
      // Use the clinicId from the claims to fetch the correct document
      const clinicRef = doc(db, 'clinics', claims.clinicId); 
      const clinicSnap = await getDoc(clinicRef);

      if (clinicSnap.exists()) {
        const data = clinicSnap.data();
        setClinicData({
          id: clinicSnap.id,
          name: data.name,
          logo: data.logo
        });
      }
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

  if (!user || !claims?.clinic) {
     return (
      <div className="flex min-h-screen w-full flex-col items-center justify-center bg-background p-4 text-center">
        <ShieldAlert className="h-16 w-16 text-destructive mb-4" />
        <h1 className="text-2xl font-bold text-foreground">Access Denied</h1>
        <p className="mt-2 text-muted-foreground max-w-sm">
          You do not have the required permissions to view this page. Please log in as a clinic user.
        </p>
        <Button onClick={() => router.push('/clinic/login')} className="mt-6">
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
