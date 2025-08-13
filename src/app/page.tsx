"use client";

import React, { useState, useEffect } from 'react';
import AppHeader from '@/components/app-header';
import ClientDashboard from '@/components/client-dashboard';
import MessageInbox from '@/components/message-inbox';
import NotificationManager from '@/components/notification-manager';
import DataCards from '@/components/data-cards';
import AdBanner from '@/components/ad-banner';
import FooterAdBanner from '@/components/footer-ad-banner';
import { useAuth } from './auth-provider';
import { getFirestore, doc, getDoc, collection, getDocs } from 'firebase/firestore';
import { useRouter } from 'next/navigation';
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

export default function Home() {
  const { user, userClaims, loading } = useAuth();
  const router = useRouter();

  const [dailyStepGoal, setDailyStepGoal] = useState(8000);
  const [fitData, setFitData] = useState<{steps: number | null, activeMinutes: number | null}>({ steps: null, activeMinutes: null });
  const [clinicData, setClinicData] = useState<ClinicData | null>(null);
  
  const [showPopupAd, setShowPopupAd] = useState(false);
  const [showFooterAd, setShowFooterAd] = useState(false);
  const [popupAdContent, setPopupAdContent] = useState<Ad | null>(null);
  const [footerAdContent, setFooterAdContent] = useState<Ad | null>(null);
  
  const [isLoadingClinic, setIsLoadingClinic] = useState(true);

  const clinicId = userClaims?.clinicId as string | undefined;

  useEffect(() => {
    if (loading) return;
    
    // Redirect non-patients or non-logged-in users
    if (!user) {
        setTimeout(() => router.push('/login'), 0);
        return;
    }
    // if user is admin or clinic, redirect them away from patient view
    if (userClaims?.admin) {
        setTimeout(() => router.push('/admin'), 0);
        return;
    }
     if (userClaims?.clinic) {
        setTimeout(() => router.push('/clinic'), 0);
        return;
    }

    const fetchClinicAndAdData = async () => {
        if (!clinicId) {
             setIsLoadingClinic(false);
             return;
        }

        const db = getFirestore();
        const clinicRef = doc(db, 'clinics', clinicId);
        const clinicSnap = await getDoc(clinicRef);
        
        if (clinicSnap.exists()) {
            const data = clinicSnap.data() as Omit<ClinicData, 'id'>;
            const currentClinicData = { id: clinicSnap.id, ...data };
            setClinicData(currentClinicData);

            if (currentClinicData.adsEnabled) {
                // Using mock ads since local storage may not be available or populated
                const popupAds: Ad[] = JSON.parse(localStorage.getItem('popupAds') || '[]');
                const footerAds: Ad[] = JSON.parse(localStorage.getItem('footerAds') || '[]');

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
        }
        setIsLoadingClinic(false);
    };

    fetchClinicAndAdData();
  }, [user, clinicId, loading, router, userClaims]);

  if (loading || isLoadingClinic) {
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

  if (!user) {
      return null; // Render nothing while redirecting
  }

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
