"use client";

import React, { useState, useEffect } from 'react';
import AppHeader from '@/components/app-header';
import ClientDashboard from '@/components/client-dashboard';
import MessageInbox from '@/components/message-inbox';
import NotificationManager from '@/components/notification-manager';
import DataCards from '@/components/data-cards';
import AdBanner from '@/components/ad-banner';
import FooterAdBanner from '@/components/footer-ad-banner';
import type { User } from 'firebase/auth';

type Ad = {
  id: string;
  imageUrl: string;
  description: string;
  targetUrl: string;
}

type ClinicData = {
    id: string;
    name: string;
    logo: string;
    adsEnabled: boolean;
}

// Mock user since security is removed
const mockPatientUser: User = {
  uid: 'mock-patient-id',
  email: 'patient@example.com',
  displayName: 'John Doe',
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
    claims: { patient: true, clinicId: 'mock-clinic-id' },
  }),
  reload: async () => {},
  toJSON: () => ({}),
};


export default function Home() {
  const [dailyStepGoal, setDailyStepGoal] = useState(8000);
  const [fitData, setFitData] = useState<{steps: number | null, activeMinutes: number | null}>({ steps: null, activeMinutes: null });
  const [clinicData, setClinicData] = useState<ClinicData | null>(null);
  
  const [showPopupAd, setShowPopupAd] = useState(false);
  const [showFooterAd, setShowFooterAd] = useState(false);
  const [popupAdContent, setPopupAdContent] = useState<Ad | null>(null);
  const [footerAdContent, setFooterAdContent] = useState<Ad | null>(null);
  
  const user = mockPatientUser; // Use mock user

  useEffect(() => {
    // This logic now runs for the mock user
    const fetchClinicAndAdData = () => {
        const mockClinicData = {id: "mock-clinic-id", name: "Wellness Clinic", logo: "https://placehold.co/200x80.png", adsEnabled: true};
        setClinicData(mockClinicData);

        if (mockClinicData.adsEnabled) {
            // Using mock ads since local storage may not be available or populated
            const popupAds: Ad[] = [{id: '1', imageUrl: 'https://placehold.co/400x300.png', description: 'ad', targetUrl: '#'}];
            const footerAds: Ad[] = [{id: '1', imageUrl: 'https://placehold.co/728x90.png', description: 'ad', targetUrl: '#'}];

            if (popupAds.length > 0) {
                const randomAd = popupAds[Math.floor(Math.random() * popupAds.length)];
                setPopupAdContent(randomAd);
                setShowPopupAd(true);
            }
            
            if (footerAds.length > 0) {
                const randomAd = footerAds[Math.floor(Math.random() * footerAds.length)];
                setFooterAdContent(randomAd);
                setShowFooterAd(true);
            }
        }
    };

    fetchClinicAndAdData();
  }, []);

  return (
    <div className="flex min-h-screen w-full flex-col">
      <AppHeader user={user} clinic={clinicData} view="client" />
      <main className="flex-1">
        <DataCards user={user} onDataFetched={setFitData} />
        <ClientDashboard user={user} fitData={fitData} dailyStepGoal={dailyStepGoal} onStepGoalChange={setDailyStepGoal} view="client" clinic={clinicData}/>
        <MessageInbox />
        <NotificationManager user={user} currentSteps={fitData.steps} dailyStepGoal={dailyStepGoal}/>
        <AdBanner isPopupVisible={showPopupAd} adContent={popupAdContent} />
      </main>
      <FooterAdBanner isVisible={showFooterAd} adContent={footerAdContent} />
    </div>
  );
}
