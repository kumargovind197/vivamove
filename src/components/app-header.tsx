
"use client";

import React from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { UserCircle, Wrench, ShieldQuestion, Hospital, ChevronLeft } from 'lucide-react';
import { Button } from '@/components/ui/button';
import type { User } from 'firebase/auth';
import { MOCK_CLINICS } from '@/lib/mock-data';

type Clinic = typeof MOCK_CLINICS[keyof typeof MOCK_CLINICS];

const VivaMoveLogo = () => (
    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
        <path d="M12.25,18.5C12.25,18.5,12.25,18.5,12.25,18.5L12.55,18.84C13.26,19.63,14.01,20.3,14.79,20.84L15.32,21.22C15.86,21.57,16.84,21.49,17.29,20.97C17.74,20.45,17.65,19.47,17.11,19.12L16.58,18.74C15.8,18.2,15.05,17.53,14.34,16.74L13.81,16.14C13.72,16.03,13.56,16.03,13.46,6.13L13.19,15.77C12.48,14.98,11.73,14.31,10.95,13.77L10.42,13.39C9.88,13.04,8.9,13.12,8.45,13.64C8,14.16,8.09,15.14,8.63,15.49L9.16,15.87C9.94,16.41,10.69,17.08,11.4,17.87L11.7,18.2C11.96,18.49,12.25,18.5,12.25,18.5Z" fill="hsl(var(--primary))"/>
        <path d="M10.15,10.62L10.35,10.85C10.98,11.55,11.51,12.33,11.91,13.16L12.07,13.53C12.3,14.07,12.98,14.3,13.52,14.07C14.06,13.84,14.29,13.16,14.06,12.62L13.9,12.25C13.5,11.42,12.97,10.64,12.34,9.94L12.14,9.71C11.88,9.41,11.42,9.41,11.16,9.71L10.74,10.19C10.04,10.97,9.43,11.83,8.96,12.72L8.79,13.04C8.55,13.5,8.81,14.07,9.3,14.28C9.79,14.49,10.36,14.23,10.57,13.74L10.74,13.42C11.21,12.53,11.82,11.67,12.52,10.89L11.16,9.71C10.9,9.41,10.41,9.41,10.15,10.62ZM6.44,15.19L6.54,15.25C6.93,15.51,7.28,15.8,7.58,16.14L7.74,16.32C7.99,16.6,8.42,16.65,8.7,16.4C9.07,16.06,9.02,15.54,8.65,15.2L8.49,15.02C8.19,14.68,7.84,14.39,7.45,14.13L7.35,14.07C6.96,13.81,6.44,13.93,6.18,14.32C5.92,14.71,6.04,15.23,6.44,15.19Z" fill="hsl(var(--primary))"/>
        <path d="M12,2C6.48,2,2,6.48,2,12C2,17.52,6.48,22,12,22C17.52,22,22,17.52,22,12C22,6.48,17.52,2,12,2ZM12,20C7.58,20,4,16.42,4,12C4,7.58,7.58,4,12,4C16.42,4,20,7.58,20,12C20,16.42,16.42,20,12,20Z" fill="hsl(var(--primary))"/>
    </svg>
)

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
            src={clinic.logo.replace('128x128', '400x128')} // Assume we can request a wider version
            alt={`${clinic.name} Logo`}
            width={140}
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
      <header className="sticky top-0 z-50 w-full border-b bg-card shadow-sm">
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
