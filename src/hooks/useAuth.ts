
"use client";

import { useState, useEffect, useCallback } from 'react';
import { auth } from '@/lib/firebase';
import type { User } from 'firebase/auth';

// A function to get the user's claims, forcing a refresh if necessary.
const getClaims = async (user: User, forceRefresh = false) => {
    const tokenResult = await user.getIdTokenResult(forceRefresh);
    return tokenResult.claims;
}

export function useAuth() {
  const [user, setUser] = useState<User | null>(null);
  const [isAdmin, setIsAdmin] = useState(false);
  const [isClinic, setIsClinic] = useState(false);
  const [clinicId, setClinicId] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  const updateUserClaims = useCallback(async (firebaseUser: User | null) => {
    if (firebaseUser) {
        setUser(firebaseUser);
        try {
            const claims = await getClaims(firebaseUser, true); // Force refresh on change
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
  }, []);

  useEffect(() => {
    setLoading(true);
    const unsubscribe = auth.onIdTokenChanged(updateUserClaims);
    return () => unsubscribe();
  }, [updateUserClaims]);

  return { user, isAdmin, isClinic, loading, clinicId };
}
