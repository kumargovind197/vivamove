
"use client";

import React, { useState, useEffect } from 'react';
import AppHeader from '@/components/app-header';
import PatientManagement from '@/components/patient-management';
import type { User } from 'firebase/auth';
import { auth } from '@/lib/firebase';
import { getFirestore, doc, getDoc } from 'firebase/firestore';
import { Skeleton } from '@/components/ui/skeleton';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { AlertTriangle, LogIn } from 'lucide-react';
import { Button } from '@/components/ui/button';
import Link from 'next/link';

type ClinicData = {
    id: string;
    name: string;
    logo: string;
    // Add other fields as necessary
}

export default function ClinicPage() {
  const [user, setUser] = useState<User | null>(null);
  const [isClinic, setIsClinic] = useState(false);
  const [clinicId, setClinicId] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [clinicData, setClinicData] = useState<ClinicData | null>(null);

  useEffect(() => {
    const unsubscribe = auth.onAuthStateChanged(async (firebaseUser) => {
        if (firebaseUser) {
            const tokenResult = await firebaseUser.getIdTokenResult(true);
            const isClinicClaim = !!tokenResult.claims.clinic;

            if (isClinicClaim) {
                setUser(firebaseUser);
                setIsClinic(true);
                setClinicId(firebaseUser.uid);
            } else {
                 setIsClinic(false);
            }
        } else {
            setUser(null);
            setIsClinic(false);
            setClinicId(null);
        }
        setLoading(false);
    });
    return () => unsubscribe();
  }, []);

  useEffect(() => {
    if (!user || !isClinic || !clinicId) return;

    const db = getFirestore();
    const clinicRef = doc(db, "clinics", clinicId);
    
    getDoc(clinicRef).then(docSnap => {
        if (docSnap.exists()) {
            setClinicData(docSnap.data() as ClinicData);
        } else {
            console.error("No clinic data found for this user in Firestore!");
        }
    });
  }, [user, isClinic, clinicId]);

  if (loading) {
    return (
        <div className="flex min-h-screen w-full flex-col items-center justify-center bg-background">
            <div className="w-full max-w-4xl space-y-4 m-4">
                <Skeleton className="h-12 w-1/2" />
                <Skeleton className="h-8 w-1/4" />
                <Skeleton className="h-96 w-full" />
            </div>
        </div>
    );
  }

  if (!user || !isClinic) {
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
                    <p className="text-muted-foreground">You do not have permission to view this page. Please log in with a clinic account.</p>
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
      <AppHeader user={user} view="clinic" clinic={clinicData}/>
      <main className="flex-1">
        <PatientManagement clinicId={clinicId} />
      </main>
    </div>
  );
}
