"use client";

import React, { useState, useEffect } from 'react';
import AppHeader from '@/components/app-header';
import PatientManagement from '@/components/patient-management';
import { Skeleton } from '@/components/ui/skeleton';

type ClinicData = {
    id: string;
    name: string;
    logo: string;
}

// Mock user for development purposes
const mockClinicUser = {
  uid: 'mock-clinic-id',
  email: 'clinic@example.com',
  displayName: 'Clinic User',
};

// Mock clinic ID for development
const MOCK_CLINIC_ID = 'YOUR_MOCK_CLINIC_ID'; // Replace with a relevant mock ID if needed

export default function ClinicPage() {
  const [clinicData, setClinicData] = useState<ClinicData | null>(null);
  const [isLoadingClinic, setIsLoadingClinic] = useState(true);

  // In this public version, we'll just use mock data.
  useEffect(() => {
    setIsLoadingClinic(true);
    // Simulate fetching clinic data
    setTimeout(() => {
      setClinicData({
        id: MOCK_CLINIC_ID,
        name: "Test Clinic",
        logo: "https://placehold.co/200x80.png"
      });
      setIsLoadingClinic(false);
    }, 500);
  }, []);


  if (isLoadingClinic) {
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
  
  return (
    <div className="flex min-h-screen w-full flex-col">
      <AppHeader user={mockClinicUser as any} view="clinic" clinic={clinicData}/>
      <main className="flex-1">
       {/* In a real app, you would pass a real clinicId */}
       <PatientManagement clinicId={MOCK_CLINIC_ID} />
      </main>
    </div>
  );
}
