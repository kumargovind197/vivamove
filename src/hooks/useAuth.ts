
"use client";

import { useState, useEffect, useCallback } from 'react';
import { auth } from '@/lib/firebase';
import type { User } from 'firebase/auth';

export function useAuth() {
  const [user, setUser] = useState<User | null>(null);
  const [isAdmin, setIsAdmin] = useState(false);
  const [isClinic, setIsClinic] = useState(false);
  const [clinicId, setClinicId] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const unsubscribe = auth.onIdTokenChanged(async (firebaseUser) => {
        if (firebaseUser) {
            setUser(firebaseUser);
            try {
                // Force a refresh of the token to get the latest claims.
                const tokenResult = await firebaseUser.getIdTokenResult(true);
                const claims = tokenResult.claims;
                
                const isAdminClaim = !!claims.admin;
                const isClinicClaim = !!claims.clinic;

                setIsAdmin(isAdminClaim);
                setIsClinic(isClinicClaim);

                if (isClinicClaim) {
                    setClinicId(firebaseUser.uid);
                } else if (claims.clinicId) {
                    setClinicId(claims.clinicId as string);
                } else {
                    setClinicId(null);
                }
            } catch (error) {
                console.error("Error fetching custom claims:", error);
                // Reset state on error
                setIsAdmin(false);
                setIsClinic(false);
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

    // Cleanup subscription on unmount
    return () => unsubscribe();
  }, []);

  return { user, isAdmin, isClinic, loading, clinicId };
}
