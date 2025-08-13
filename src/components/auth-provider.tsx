
'use client';

import React, { useState, useEffect } from 'react';
import { onAuthStateChanged, User, getIdTokenResult } from 'firebase/auth';
import { auth } from '@/lib/firebase';
import { AuthContext, AuthContextType } from '@/hooks/useAuth';

export const AuthProvider: React.FC<{children: React.ReactNode}> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [claims, setClaims] = useState<AuthContextType['claims']>(null);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      if (user) {
        setUser(user);
        const tokenResult = await getIdTokenResult(user, true);
        setClaims(tokenResult.claims);
      } else {
        setUser(null);
        setClaims(null);
      }
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  return (
    <AuthContext.Provider value={{ user, loading, claims }}>
      {children}
    </AuthContext.Provider>
  );
};
