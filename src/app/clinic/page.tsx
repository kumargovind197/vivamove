"use client";

import React, { useState, useEffect } from 'react';
import AppHeader from '@/components/app-header';
import PatientManagement from '@/components/patient-management';
import type { User } from 'firebase/auth';

// Mock data since security is removed
type ClinicData = {
    id: string;
    name: string;
    logo: string;
}

const mockClinicUser: User = {
  uid: 'mock-clinic-id',
  email: 'clinic@example.com',
  displayName: 'Clinic Staff',
  photoURL: null,
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
    claims: { clinic: true, clinicId: 'mock-clinic-id' },
  }),
  reload: async () => {},
  toJSON: () => ({}),
};


export default function ClinicPage() {
  // All security checks have been removed as requested.
  const [clinicData, setClinicData] = useState<ClinicData | null>(null);

  useEffect(() => {
    // In a real app, this would fetch from Firestore.
    // We are using mock data to ensure the UI works without login.
    setClinicData({id: "mock-clinic-id", name: "Wellness Clinic", logo: "https://placehold.co/200x80.png"});
  }, []);
  
  return (
    <div className="flex min-h-screen w-full flex-col">
      <AppHeader user={mockClinicUser} view="clinic" clinic={clinicData}/>
      <main className="flex-1">
        <PatientManagement clinicId={mockClinicUser.uid} />
      </main>
    </div>
  );
}
