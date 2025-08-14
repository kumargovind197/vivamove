
"use client";

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import AppHeader from '@/components/app-header';
import ClientDashboard from '@/components/client-dashboard';
import MessageInbox from '@/components/message-inbox';
import NotificationManager from '@/components/notification-manager';
import DataCards from '@/components/data-cards';
import AdBanner from '@/components/ad-banner';
import FooterAdBanner from '@/components/footer-ad-banner';
import { Skeleton } from '@/components/ui/skeleton';
import { useAuth } from '@/hooks/useAuth';
import { ShieldAlert } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { getClinicData, getAds } from '@/lib/mock-data';
import type { Ad, ClinicData, MockUser } from '@/lib/types';


export default function Home() {
  const { user, loading, claims, logout } = useAuth();
  const router = useRouter();

  const [dailyStepGoal, setDailyStepGoal] = useState(8000);
  const [fitData, setFitData] = useState<{steps: number | null, activeMinutes: number | null}>({ steps: null, activeMinutes: null });
  const [clinicData, setClinicData] = useState<ClinicData | null>(null);
  
  const [showPopupAd, setShowPopupAd] = useState(false);
  const [showFooterAd, setShowFooterAd] = useState(false);
  const [popupAdContent, setPopupAdContent] = useState<Ad | null>(null);
  const [footerAdContent, setFooterAdContent] = useState<Ad | null>(null);
  
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (loading) return; // Wait for auth to finish
    if (!user) {
        setIsLoading(false);
        return;
    }

    const fetchData = async () => {
        setIsLoading(true);

        // Fetch clinic data if user is a patient
        if (claims?.clinicId) {
            const clinic = getClinicData(claims.clinicId);
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
        setIsLoading(false);
    };

    fetchData();
  }, [user, loading, claims]);

  if (loading || isLoading) {
     return (
        <div className="flex min-h-screen w-full flex-col items-center justify-center p-8">
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

  // Strict check: If not loading and no user, deny access.
  if (!user) {
      return (
        <div className="flex min-h-screen w-full flex-col items-center justify-center bg-background p-4 text-center">
            <ShieldAlert className="h-16 w-16 text-destructive mb-4" />
            <h1 className="text-2xl font-bold text-foreground">Access Denied</h1>
            <p className="mt-2 text-muted-foreground max-w-sm">
            You must be logged in to view this page.
            </p>
            <Button onClick={() => {
                logout();
                router.push('/login');
            }} className="mt-6">
              Go to Login
            </Button>
        </div>
    );
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
