
"use client";

import React, { useState, useEffect } from 'react';
import { useParams } from 'next/navigation';
import AppHeader from '@/components/app-header';
import ClientDashboard from '@/components/client-dashboard';
import DataCards from '@/components/data-cards';
import { getPatientById, getClinicData, MOCK_USERS } from '@/lib/mock-data';
import type { ClinicData, MockUser, Patient } from '@/lib/types';


export default function PatientDetailPage() {
  const [fitData, setFitData] = useState<{steps: number | null, activeMinutes: number | null}>({ steps: 5432, activeMinutes: 25 });
  const [dailyStepGoal, setDailyStepGoal] = useState(10000);
  const [clinicData, setClinicData] = useState<ClinicData | null>(null);
  const [patientData, setPatientData] = useState<Patient | null>(null);
  
  const params = useParams();
  const patientId = params.id as string;

  // Use the mock clinic user for the header
  const mockClinicUser = MOCK_USERS.find(u => u.claims.clinic)!;

  useEffect(() => {
    if (mockClinicUser.claims.clinicId) {
        const clinic = getClinicData(mockClinicUser.claims.clinicId);
        setClinicData(clinic);
        const patient = getPatientById(mockClinicUser.claims.clinicId, patientId);
        setPatientData(patient);
    }
  }, [patientId, mockClinicUser.claims.clinicId]);
  
  const patientAsUser: MockUser | null = patientData ? {
      uid: patientData.id,
      email: patientData.email,
      displayName: `${patientData.firstName} ${patientData.surname}`,
      claims: {}
  } : null;

  return (
    <div className="flex min-h-screen w-full flex-col">
      <AppHeader user={mockClinicUser} view="clinic" clinic={clinicData} patientId={patientId} patientName={patientAsUser?.displayName || 'Patient'} />
      <main className="flex-1">
        {patientAsUser && (
            <>
                <DataCards user={patientAsUser} onDataFetched={setFitData} />
                <ClientDashboard view="clinic" user={patientAsUser} fitData={fitData} dailyStepGoal={dailyStepGoal} onStepGoalChange={setDailyStepGoal} clinic={clinicData}/>
            </>
        )}
      </main>
    </div>
  );
}
