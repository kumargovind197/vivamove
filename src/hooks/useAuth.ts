
"use client";

import { useState, useEffect } from 'react';
import { auth } from '@/lib/firebase';
import type { User } from 'firebase/auth';

export function useAuth() {
  const [user, setUser] = useState<User | null>(null);
  const [isAdmin, setIsAdmin] = useState(false);
  const [isClinic, setIsClinic] = useState(false);
  const [loading, setLoading] = useState(true);
  const [clinicId, setClinicId] = useState<string | null>(null);

  useEffect(() => {
    const unsubscribe = auth.onAuthStateChanged(async (firebaseUser) => {
      setLoading(true);
      if (firebaseUser) {
        setUser(firebaseUser);
        const tokenResult = await firebaseUser.getIdTokenResult();
        const claims = tokenResult.claims;
        
        setIsAdmin(!!claims.admin);
        setIsClinic(!!claims.clinic);

        if (claims.clinic) {
            // For clinic users, their UID is the clinic ID
            setClinicId(firebaseUser.uid);
        } else if (claims.clinicId) {
            // For patients, the clinicId is a custom claim
            setClinicId(claims.clinicId as string);
        } else {
            setClinicId(null);
        }

      } else {
        setUser(null);
        setIsAdmin(false);
        setIsClinic(false);
        setClinicId(null);
      }
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  return { user, isAdmin, isClinic, loading, clinicId };
}
