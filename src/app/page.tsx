
"use client";

import React, { useState, useEffect } from 'react';
import AppHeader from '@/components/app-header';
import ClientDashboard from '@/components/client-dashboard';
import MessageInbox from '@/components/message-inbox';
import NotificationManager from '@/components/notification-manager';
import DataCards from '@/components/data-cards';
import AdBanner from '@/components/ad-banner';
import FooterAdBanner from '@/components/footer-ad-banner';
import { getClinicData, getAds, MOCK_USERS } from '@/lib/mock-data';
import type { Ad, ClinicData, MockUser } from '@/lib/types';


export default function Home() {
  const [dailyStepGoal, setDailyStepGoal] = useState(8000);
  const [fitData, setFitData] = useState<{steps: number | null, activeMinutes: number | null}>({ steps: null, activeMinutes: null });
  const [clinicData, setClinicData] = useState<ClinicData | null>(null);
  
  const [showPopupAd, setShowPopupAd] = useState(false);
  const [showFooterAd, setShowFooterAd] = useState(false);
  const [popupAdContent, setPopupAdContent] = useState<Ad | null>(null);
  const [footerAdContent, setFooterAdContent] = useState<Ad | null>(null);
  
  // Use the mock patient user for the dashboard
  const mockPatientUser = MOCK_USERS.find(u => !u.claims.admin && !u.claims.clinic)!;
  
  useEffect(() => {
    // Fetch clinic data if mock patient is enrolled
    if (mockPatientUser.claims.clinicId) {
        const clinic = getClinicData(mockPatientUser.claims.clinicId);
        setClinicData(clinic);

        if (clinic?.adsEnabled) {
            const { popupAds, footerAds } = getAds();
            if (popupAds.length > 0) {
                setPopupAdContent(popupAds[0]);
                setShowPopupAd(true);
            }
             if (footerAds.length > 0) {
                setFooterAdContent(footerAds[0]);
                setShowFooterAd(true);
            }
        }
    }
  }, [mockPatientUser.claims.clinicId]);


  return (
    <div className="flex min-h-screen w-full flex-col">
      <AppHeader user={mockPatientUser} clinic={clinicData} view="client" />
      <main className="flex-1">
        <DataCards user={mockPatientUser} onDataFetched={setFitData} />
        <ClientDashboard user={mockPatientUser} fitData={fitData} dailyStepGoal={dailyStepGoal} onStepGoalChange={setDailyStepGoal} view="client" clinic={clinicData}/>
        <MessageInbox />
        <NotificationManager user={mockPatientUser} currentSteps={fitData.steps} dailyStepGoal={dailyStepGoal}/>
        <AdBanner isPopupVisible={showPopupAd} adContent={popupAdContent} />
      </main>
      <FooterAdBanner isVisible={showFooterAd} adContent={footerAdContent} />
    </div>
  );
}
