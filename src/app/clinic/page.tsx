"use client";

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import AppHeader from '@/components/app-header';
import PatientManagement from '@/components/patient-management';
import { useAuth } from '@/app/auth-provider';
import { getFirestore, doc, getDoc } from 'firebase/firestore';
import { Skeleton } from '@/components/ui/skeleton';

type ClinicData = {
    id: string;
    name: string;
    logo: string;
}

export default function ClinicPage() {
  const { user, userClaims, loading } = useAuth();
  const router = useRouter();
  
  const [clinicData, setClinicData] = useState<ClinicData | null>(null);
  const [isLoadingClinic, setIsLoadingClinic] = useState(true);

  const hasClinicRole = userClaims?.clinic === true;
  const clinicId = userClaims?.clinicId as string | undefined;

  useEffect(() => {
    if (loading) return; // Wait for auth to finish loading
    
    if (!user || !hasClinicRole || !clinicId) {
       setTimeout(() => router.push('/login'), 0);
       return;
    }
    
    const fetchClinicData = async () => {
        setIsLoadingClinic(true);
        const db = getFirestore();
        const clinicRef = doc(db, 'clinics', clinicId);
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
    
  }, [user, hasClinicRole, clinicId, loading, router]);


  if (loading || isLoadingClinic) {
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

  if (!user || !hasClinicRole) {
     return (
        <div className="flex min-h-screen w-full flex-col items-center justify-center">
            <p>Access Denied. You must be a clinic user to view this page.</p>
            <p>Redirecting to login...</p>
        </div>
    );
  }
  
  return (
    <div className="flex min-h-screen w-full flex-col">
      <AppHeader user={user} view="clinic" clinic={clinicData}/>
      <main className="flex-1">
       {clinicId && <PatientManagement clinicId={clinicId} />}
      </main>
    </div>
  );
}
