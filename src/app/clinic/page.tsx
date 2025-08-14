
"use client";

import React, { useState, useEffect } from 'react';
import AppHeader from '@/components/app-header';
import PatientManagement from '@/components/patient-management';
import { getClinicData, MOCK_USERS } from '@/lib/mock-data';
import type { ClinicData } from '@/lib/types';


export default function ClinicPage() {
  const [clinicData, setClinicData] = useState<ClinicData | null>(null);

  // Use the mock clinic user for the header and to fetch data
  const mockClinicUser = MOCK_USERS.find(u => u.claims.clinic)!;
  
  useEffect(() => {
    if (mockClinicUser.claims.clinicId) {
      const data = getClinicData(mockClinicUser.claims.clinicId);
      setClinicData(data);
    }
  }, [mockClinicUser.claims.clinicId]);
  
  return (
    <div className="flex min-h-screen w-full flex-col">
      <AppHeader user={mockClinicUser} view="clinic" clinic={clinicData}/>
      <main className="flex-1">
       <PatientManagement clinicId={mockClinicUser.claims.clinicId!} />
      </main>
    </div>
  );
}
