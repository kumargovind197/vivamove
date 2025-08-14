
'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { AuthContext, AuthContextType } from '@/hooks/useAuth';
import { MOCK_USERS, getMockUserByEmail } from '@/lib/mock-data';
import type { MockUser } from '@/lib/types';

export const AuthProvider: React.FC<{children: React.ReactNode}> = ({ children }) => {
  const [user, setUser] = useState<MockUser | null>(null);
  const [loading, setLoading] = useState(true);
  const [claims, setClaims] = useState<AuthContextType['claims']>(null);

  useEffect(() => {
    // On initial load, check if a user session is stored in localStorage
    try {
        const storedUser = localStorage.getItem('viva-move-user');
        if (storedUser) {
            const parsedUser = JSON.parse(storedUser);
            setUser(parsedUser);
            setClaims(parsedUser.claims);
        }
    } catch (error) {
        console.error("Failed to parse user from localStorage", error);
        localStorage.removeItem('viva-move-user');
    }
    setLoading(false);
  }, []);

  const login = useCallback((email: string, aassword: string): Promise<MockUser> => {
      setLoading(true);
      return new Promise((resolve, reject) => {
          setTimeout(() => {
            const foundUser = getMockUserByEmail(email);

            if (foundUser && foundUser.password === aassword) {
                setUser(foundUser);
                setClaims(foundUser.claims);
                localStorage.setItem('viva-move-user', JSON.stringify(foundUser));
                setLoading(false);
                resolve(foundUser);
            } else {
                setLoading(false);
                reject(new Error("Invalid credentials. Please check your email and password."));
            }
          }, 1000); // Simulate network delay
      });
  }, []);

  const logout = useCallback(() => {
    setUser(null);
    setClaims(null);
    localStorage.removeItem('viva-move-user');
  }, []);

  const value = { user, loading, claims, login, logout };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};
