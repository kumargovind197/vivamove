
"use client";

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { UserCircle, Wrench, ShieldQuestion, Hospital, ChevronLeft, Sparkles } from 'lucide-react';
import { Button } from '@/components/ui/button';
import type { User } from 'firebase/auth';
import { MOCK_CLINICS } from '@/lib/mock-data';

type Clinic = typeof MOCK_CLINICS[keyof typeof MOCK_CLINICS];

const VivaMoveLogo = () => {
    const [logoUrl, setLogoUrl] = useState<string | null>(null);

    useEffect(() => {
        // This runs only on the client, avoiding hydration errors
        const savedLogo = localStorage.getItem('vivaMoveLogo');
        if (savedLogo) {
            setLogoUrl(savedLogo);
        }
    }, []);

    if (logoUrl) {
        return <img src={logoUrl} alt="ViVa move Logo" className="h-8 w-auto" />;
    }

    // Fallback Icon
    return (
        <div className="flex items-center gap-2">
            <Sparkles className="h-6 w-6 text-primary" />
        </div>
    );
};

type AppHeaderProps = {
  user: User | null;
  clinic: Clinic | null;
  view: 'client' | 'clinic' | 'admin';
  patientId?: string;
  patientName?: string;
};

export default function AppHeader({ user, clinic, view, patientId, patientName }: AppHeaderProps) {

  const renderClientBranding = () => {
    if (clinic) {
      return (
        <div className="flex items-center gap-4">
          <Image
            data-ai-hint="medical logo"
            src={clinic.logo.replace('128x128', '600x128')} // Assume we can request a wider version
            alt={`${clinic.name} Logo`}
            width={160}
            height={40}
            className="rounded-md object-contain"
            priority
          />
          <span className="hidden sm:block font-headline text-xl font-bold text-foreground">
            {clinic.name}
          </span>
        </div>
      );
    }
    // Default icon for non-enrolled users
    return (
      <div className="h-10 w-10 flex items-center justify-center rounded-md bg-muted">
        <ShieldQuestion className="h-6 w-6 text-muted-foreground" />
      </div>
    );
  };


  const renderClinicBranding = () => {
    if (clinic) {
        return (
            <Image
                data-ai-hint="medical logo"
                src={clinic.logo}
                alt={`${clinic.name} Logo`}
                width={40}
                height={40}
                className="rounded-md"
            />
        );
    }
    // Default icon for non-enrolled users
    return (
        <div className="h-10 w-10 flex items-center justify-center rounded-md bg-muted">
            <ShieldQuestion className="h-6 w-6 text-muted-foreground"/>
        </div>
    );
  }

  return (
    <>
      <header className="sticky top-0 z-50 w-full border-b bg-white/80 backdrop-blur-sm shadow-sm bg-gradient-to-r from-background via-white to-background">
        <div className="container flex h-16 items-center justify-between px-4 md:px-6">
          
          <div className="flex items-center">
            {view === 'client' && renderClientBranding()}
            {(view === 'clinic' && !patientId && clinic) && (
                <Image
                    data-ai-hint="medical logo"
                    src={clinic.logo}
                    alt={`${clinic.name} Logo`}
                    width={40}
                    height={40}
                    className="rounded-md"
                />
            )}
             {view === 'clinic' && patientId && (
                <Button asChild variant="outline" size="sm">
                    <Link href="/clinic">
                        <ChevronLeft className="mr-2" />
                        <span>Back to All Patients</span>
                    </Link>
                </Button>
            )}
             {view === 'admin' && (
                 <div className="h-10 w-10 flex items-center justify-center rounded-md bg-muted">
                    <Wrench className="h-6 w-6 text-muted-foreground"/>
                </div>
            )}
             {patientName && (
                 <span className="font-headline text-lg font-semibold text-foreground ml-4">
                    Patient: {patientName}
                 </span>
             )}
          </div>

          <div className="flex items-center gap-6">
             <div className="flex items-center gap-2">
                <VivaMoveLogo />
                <div>
                    <span className="block text-sm font-semibold text-primary/80">ViVa move</span>
                    <span className="block text-[0.6rem] leading-tight text-muted-foreground">by Viva health solutions</span>
                </div>
             </div>

             {view === 'client' && (
               <div className="flex items-center gap-2">
                 <Button asChild variant="outline">
                    <Link href="/clinic">
                        <Hospital className="mr-2 h-4 w-4" />
                        <span>Clinic View</span>
                    </Link>
                 </Button>
                 <Button asChild variant="outline">
                    <Link href="/admin">
                        <Wrench className="mr-2 h-4 w-4" />
                        <span>Admin</span>
                    </Link>
                 </Button>
               </div>
            )}
             {(view === 'clinic' || view === 'admin') && (
                <Button asChild variant="outline">
                    <Link href="/">
                        <UserCircle className="mr-2 h-4 w-4" />
                        <span>Client View</span>
                    </Link>
                </Button>
            )}
          </div>
        </div>
      </header>
    </>
  );
}

    