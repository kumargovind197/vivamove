
"use client";

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import AppHeader from '@/components/app-header';
import ClientDashboard from '@/components/client-dashboard';
import MessageInbox from '@/components/message-inbox';
import NotificationManager from '@/components/notification-manager';
import DataCards from '@/components/data-cards';
import { auth } from '@/lib/firebase';
import type { User } from 'firebase/auth';
import { Button } from '@/components/ui/button';
import { AlertTriangle, LogIn } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import Link from 'next/link';
import AdBanner from '@/components/ad-banner';
import FooterAdBanner from '@/components/footer-ad-banner';
import { Skeleton } from '@/components/ui/skeleton';
import { getFirestore, doc, getDoc } from 'firebase/firestore';

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
  const [dailyStepGoal, setDailyStepGoal] = useState(8000);
  const [fitData, setFitData] = useState<{steps: number | null, activeMinutes: number | null}>({ steps: null, activeMinutes: null });
  const [clinicData, setClinicData] = useState<ClinicData | null>(null);
  
  const [showPopupAd, setShowPopupAd] = useState(false);
  const [showFooterAd, setShowFooterAd] = useState(false);
  const [popupAdContent, setPopupAdContent] = useState<Ad | null>(null);
  const [footerAdContent, setFooterAdContent] = useState<Ad | null>(null);

  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [clinicId, setClinicId] = useState<string | null>(null);
  const router = useRouter();

  useEffect(() => {
    const unsubscribe = auth.onAuthStateChanged(async (firebaseUser) => {
        if (firebaseUser) {
            setUser(firebaseUser);
            const tokenResult = await firebaseUser.getIdTokenResult();
            setClinicId(tokenResult.claims.clinicId as string || null);
        } else {
            setUser(null);
            setClinicId(null);
        }
        setLoading(false);
    });
    return () => unsubscribe();
  }, []);


  useEffect(() => {
    if (loading || !user) {
        return;
    }

    const fetchClinicData = async () => {
        if (!clinicId) {
            setClinicData(null);
            setShowPopupAd(false);
            setShowFooterAd(false);
            return;
        }

        const db = getFirestore();
        const clinicRef = doc(db, "clinics", clinicId);
        const clinicSnap = await getDoc(clinicRef);

        if (clinicSnap.exists()) {
            const data = clinicSnap.data() as ClinicData;
            setClinicData(data);

            if (data.adsEnabled) {
                const savedPopupAds = localStorage.getItem('popupAds');
                const savedFooterAds = localStorage.getItem('footerAds');
                const popupAds: Ad[] = savedPopupAds ? JSON.parse(savedPopupAds) : [];
                const footerAds: Ad[] = savedFooterAds ? JSON.parse(savedFooterAds) : [];

                if (popupAds.length > 0) {
                    const randomAd = popupAds[Math.floor(Math.random() * popupAds.length)];
                    setPopupAdContent(randomAd);
                    setShowPopupAd(true);
                } else {
                    setShowPopupAd(false);
                }
                
                if (footerAds.length > 0) {
                    const randomAd = footerAds[Math.floor(Math.random() * footerAds.length)];
                    setFooterAdContent(randomAd);
                    setShowFooterAd(true);
                } else {
                    setShowFooterAd(false);
                }
            } else {
                setShowPopupAd(false);
                setShowFooterAd(false);
            }
        } else {
            console.log("No such clinic document!");
            setClinicData(null);
        }
    };

    fetchClinicData();

  }, [user, loading, clinicId, router]);


  if (loading) {
      return (
         <div className="flex min-h-screen w-full flex-col items-center justify-center bg-background">
            <div className="w-full max-w-lg space-y-4 m-4">
              <Skeleton className="h-12 w-3/4" />
              <Skeleton className="h-8 w-1/2" />
              <div className="grid grid-cols-2 gap-4">
                  <Skeleton className="h-40 w-full" />
                  <Skeleton className="h-40 w-full" />
              </div>
               <Skeleton className="h-64 w-full" />
            </div>
        </div>
      );
  }
  
  if (!user) {
      return (
        <div className="flex min-h-screen w-full flex-col items-center justify-center bg-background">
            <Card className="w-full max-w-md m-4">
                <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                        <AlertTriangle className="text-destructive"/>
                        Access Denied
                    </CardTitle>
                </CardHeader>
                <CardContent>
                    <p className="text-muted-foreground">You must be logged in to view this page. Please log in to continue.</p>
                     <Button asChild className="mt-6 w-full">
                        <Link href="/login">
                            <LogIn className="mr-2" />
                            Return to Login
                        </Link>
                    </Button>
                </CardContent>
            </Card>
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
