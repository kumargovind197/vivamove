"use client";

import React, { useState, useEffect } from 'react';
import AppHeader from '@/components/app-header';
import ClientDashboard from '@/components/client-dashboard';
import MessageInbox from '@/components/message-inbox';
import NotificationManager from '@/components/notification-manager';
import DataCards from '@/components/data-cards';
import AdBanner from '@/components/ad-banner';
import FooterAdBanner from '@/components/footer-ad-banner';
import { Skeleton } from '@/components/ui/skeleton';

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

// Mock user for development since login is disabled
const mockPatientUser = {
  uid: 'mock-patient-id',
  email: 'patient@example.com',
  displayName: 'John Doe',
};

export default function Home() {
  const [dailyStepGoal, setDailyStepGoal] = useState(8000);
  const [fitData, setFitData] = useState<{steps: number | null, activeMinutes: number | null}>({ steps: null, activeMinutes: null });
  const [clinicData, setClinicData] = useState<ClinicData | null>(null);
  
  const [showPopupAd, setShowPopupAd] = useState(false);
  const [showFooterAd, setShowFooterAd] = useState(false);
  const [popupAdContent, setPopupAdContent] = useState<Ad | null>(null);
  const [footerAdContent, setFooterAdContent] = useState<Ad | null>(null);
  
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Simulate loading data now that auth is removed
    setIsLoading(true);

    // Simulate fetching clinic data
    const mockClinic: ClinicData = {
        id: 'mock-clinic-id',
        name: 'Wellness Clinic',
        logo: 'https://placehold.co/200x80.png',
        adsEnabled: true,
    };
    setClinicData(mockClinic);

    if (mockClinic.adsEnabled) {
        // Using mock ads since there's no live data fetch
        const mockPopupAd: Ad = {
            id: 'popup1',
            imageUrl: 'https://placehold.co/400x300.png',
            description: 'A sample pop-up ad',
            targetUrl: 'https://example.com'
        };
        const mockFooterAd: Ad = {
            id: 'footer1',
            imageUrl: 'https://placehold.co/728x90.png',
            description: 'A sample footer ad',
            targetUrl: 'https://example.com'
        };
        
        setPopupAdContent(mockPopupAd);
        setShowPopupAd(true);
        setFooterAdContent(mockFooterAd);
        setShowFooterAd(true);
    }
    
    // End loading after a short delay
    setTimeout(() => setIsLoading(false), 500);

  }, []);

  if (isLoading) {
     return (
        <div className="flex min-h-screen w-full flex-col items-center justify-center">
            <div className="p-8 space-y-4 w-full max-w-4xl">
                <Skeleton className="h-16 w-full" />
                <div className="grid grid-cols-3 gap-6">
                    <Skeleton className="h-24 w-full" />
                    <Skeleton className="h-24 w-full" />
                    <Skeleton className="h-24 w-full" />
                </div>
                 <div className="grid grid-cols-2 gap-6">
                    <Skeleton className="h-64 w-full" />
                    <Skeleton className="h-64 w-full" />
                </div>
                <Skeleton className="h-48 w-full" />
            </div>
        </div>
    );
  }

  return (
    <div className="flex min-h-screen w-full flex-col">
      <AppHeader user={mockPatientUser as any} clinic={clinicData} view="client" />
      <main className="flex-1">
        <DataCards user={mockPatientUser as any} onDataFetched={setFitData} />
        <ClientDashboard user={mockPatientUser as any} fitData={fitData} dailyStepGoal={dailyStepGoal} onStepGoalChange={setDailyStepGoal} view="client" clinic={clinicData}/>
        <MessageInbox />
        <NotificationManager user={mockPatientUser as any} currentSteps={fitData.steps} dailyStepGoal={dailyStepGoal}/>
        <AdBanner isPopupVisible={showPopupAd} adContent={popupAdContent} />
      </main>
      <FooterAdBanner isVisible={showFooterAd} adContent={footerAdContent} />
    </div>
  );
}
