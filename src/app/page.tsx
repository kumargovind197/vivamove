
"use client";

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import AppHeader from '@/components/app-header';
import ClientDashboard from '@/components/client-dashboard';
import MessageInbox from '@/components/message-inbox';
import NotificationManager from '@/components/notification-manager';
import { useToast } from '@/hooks/use-toast';
import DataCards from '@/components/data-cards';
import type { User } from 'firebase/auth';
import { Button } from '@/components/ui/button';
import { AlertTriangle } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import Link from 'next/link';
import { MOCK_USERS, MOCK_CLINICS } from '@/lib/mock-data';
import AdBanner from '@/components/ad-banner';
import FooterAdBanner from '@/components/footer-ad-banner';

// This now represents the "logged-in" user's ID for the session.
const LOGGED_IN_USER_ID = 'patient@example.com';
const USER_CLINIC_ID = 'clinic-wellness'; // The clinic this user is assigned to.

type Ad = {
  id: string;
  imageUrl: string;
  description: string;
  targetUrl: string;
}

export default function Home() {
  const [dailyStepGoal, setDailyStepGoal] = useState(8000);
  const [fitData, setFitData] = useState<{steps: number | null, activeMinutes: number | null}>({ steps: null, activeMinutes: null });
  
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [isAccessRevoked, setAccessRevoked] = useState(false);
  const [clinicData, setClinicData] = useState<typeof MOCK_CLINICS[keyof typeof MOCK_CLINICS] | null>(null);
  
  // States for controlling ad visibility
  const [showPopupAd, setShowPopupAd] = useState(false);
  const [showFooterAd, setShowFooterAd] = useState(false);
  const [popupAdContent, setPopupAdContent] = useState<Ad | null>(null);
  const [footerAdContent, setFooterAdContent] = useState<Ad | null>(null);


  const { toast } = useToast();
  const router = useRouter();

   useEffect(() => {
    // SIMULATE AUTH CHECK: Check if the user still exists in our mock database.
    const userRecord = MOCK_USERS[LOGGED_IN_USER_ID as keyof typeof MOCK_USERS];
    const clinicRecord = MOCK_CLINICS[USER_CLINIC_ID as keyof typeof MOCK_CLINICS];
    setClinicData(clinicRecord);


    if (userRecord) {
        const mockUser: User = {
          uid: 'mock-user-id',
          email: LOGGED_IN_USER_ID,
          displayName: 'John Doe',
          photoURL: 'https://placehold.co/100x100.png',
          providerId: 'password',
          emailVerified: true, isAnonymous: false, metadata: {}, providerData: [], tenantId: null,
          delete: async () => {},
          getIdToken: async () => 'mock-token',
          getIdTokenResult: async () => ({ token: 'mock-token', expirationTime: '', authTime: '', issuedAtTime: '', signInProvider: null, signInSecondFactor: null, claims: {}, }),
          reload: async () => {},
          toJSON: () => ({}),
        };
        setCurrentUser(mockUser);
        setAccessRevoked(false);

        // Check the clinic's ad setting from mock data
        if (clinicRecord?.adsEnabled) {
            const savedPopupAds = localStorage.getItem('popupAds');
            const savedFooterAds = localStorage.getItem('footerAds');
            const popupAds: Ad[] = savedPopupAds ? JSON.parse(savedPopupAds) : [];
            const footerAds: Ad[] = savedFooterAds ? JSON.parse(savedFooterAds) : [];

            // Independently decide to show a pop-up ad
            if (popupAds.length > 0) {
                const randomAd = popupAds[Math.floor(Math.random() * popupAds.length)];
                setPopupAdContent(randomAd);
                setShowPopupAd(true);
            } else {
                setShowPopupAd(false);
            }
            
            // Independently decide to show a footer ad
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
        setCurrentUser(null);
        setAccessRevoked(true);
    }
  }, []);

  // Render a "logged out" or "access revoked" state if the user has been deleted.
  if (isAccessRevoked || !currentUser) {
      return (
        <div className="flex min-h-screen w-full flex-col items-center justify-center bg-background">
            <Card className="w-full max-w-md m-4">
                <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                        <AlertTriangle className="text-destructive"/>
                        Access Revoked
                    </CardTitle>
                </CardHeader>
                <CardContent>
                    <p className="text-muted-foreground">Your access to ViVa move has been revoked by the clinic administrator. If you believe this is an error, please contact your clinic admin.</p>
                     <Button asChild className="mt-6 w-full">
                        <Link href="/login">
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
      <AppHeader user={currentUser} clinic={clinicData} view="client" />
      <main className="flex-1">
        <DataCards user={currentUser} onDataFetched={setFitData} />
        <ClientDashboard user={currentUser} fitData={fitData} dailyStepGoal={dailyStepGoal} onStepGoalChange={setDailyStepGoal} view="client" clinic={clinicData}/>
        <MessageInbox />
        <NotificationManager user={currentUser} currentSteps={fitData.steps} dailyStepGoal={dailyStepGoal}/>
        <AdBanner isPopupVisible={showPopupAd} adContent={popupAdContent} />
      </main>
      <FooterAdBanner isVisible={showFooterAd} adContent={footerAdContent} />
    </div>
  );
}

