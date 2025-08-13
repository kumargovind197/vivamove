
"use client";

import React, { useState, useEffect } from 'react';
import { useParams } from 'next/navigation';
import AppHeader from '@/components/app-header';
import ClientDashboard from '@/components/client-dashboard';
import DataCards from '@/components/data-cards';
import type { User } from 'firebase/auth';

type Clinic = {
    id: string;
    name: string;
    logo: string;
}

// Mock user for development purposes - this would be the patient's user object
const mockPatientUser: User = {
  uid: 'mock-user-id-from-clinic-view',
  email: 'patient@example.com',
  displayName: 'John Doe',
  photoURL: 'https://placehold.co/100x100.png',
  providerId: 'password',
  emailVerified: true,
  isAnonymous: false,
  metadata: {},
  providerData: [],
  tenantId: null,
  delete: async () => {},
  getIdToken: async () => 'mock-token',
  getIdTokenResult: async () => ({
    token: 'mock-token',
    expirationTime: '',
    authTime: '',
    issuedAtTime: '',
    signInProvider: null,
    signInSecondFactor: null,
    claims: {},
  }),
  reload: async () => {},
  toJSON: () => ({}),
};

// Mock clinic user for the header
const mockClinicUser: User = {
  uid: 'mock-clinic-id',
  email: 'clinic@example.com',
  displayName: 'Dr. Smith',
  photoURL: 'https://placehold.co/100x100.png',
  providerId: 'password',
  emailVerified: true,
  isAnonymous: false,
  metadata: {},
  providerData: [],
  tenantId: null,
  delete: async () => {},
  getIdToken: async () => 'mock-token',
  getIdTokenResult: async () => ({
    token: 'mock-token',
    expirationTime: '',
    authTime: '',
    issuedAtTime: '',
    signInProvider: null,
    signInSecondFactor: null,
    claims: {},
  }),
  reload: async () => {},
  toJSON: () => ({}),
};

const USER_CLINIC_ID = 'clinic-wellness';

export default function PatientDetailPage() {
  const [fitData, setFitData] = useState<{steps: number | null, activeMinutes: number | null}>({ steps: 5432, activeMinutes: 25 });
  const [dailyStepGoal, setDailyStepGoal] = useState(10000);
  const [clinicData, setClinicData] = useState<Clinic | null>(null);
  
  const params = useParams();
  const patientId = params.id as string;

  // In a real app, you would fetch real clinic data
  useEffect(() => {
    // This is where you would fetch the real clinic data from firestore
    // For now we use a placeholder:
    setClinicData({id: "clinic-123", name: "Wellness Clinic", logo: "https://placehold.co/200x80.png"});
  }, []);

  // In a real app, you would use patientId to fetch the patient's data.

  return (
    <div className="flex min-h-screen w-full flex-col">
      {/* The header knows it's in a patient detail view from the 'clinic' view context */}
      <AppHeader user={mockClinicUser} view="clinic" clinic={clinicData} patientId={patientId} patientName={mockPatientUser.displayName || 'Patient'} />
      <main className="flex-1">
        {/* These components are for the patient being viewed */}
        <DataCards user={mockPatientUser} onDataFetched={setFitData} />
        <ClientDashboard view="clinic" user={mockPatientUser} fitData={fitData} dailyStepGoal={dailyStepGoal} onStepGoalChange={setDailyStepGoal} clinic={clinicData}/>
      </main>
    </div>
  );
}
