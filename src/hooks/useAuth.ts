
"use client";

import { useState, useEffect } from 'react';
import { auth } from '@/lib/firebase';
import type { User } from 'firebase/auth';
import { MOCK_USERS } from '@/lib/mock-data';

// This is the single source of truth for who the admin is.
const ADMIN_EMAIL = 'vinitkiranshah@gmail.com';

// This custom type allows us to represent both real Firebase users and our mock users.
type AppUser = User | {
  uid: string;
  email: string | null;
  displayName: string | null;
  // Add other properties as needed to match the User type if you expand functionality
};


export function useAuth() {
  const [user, setUser] = useState<AppUser | null>(null);
  const [isAdmin, setIsAdmin] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // This listener handles REAL Firebase user authentication state changes.
    const unsubscribe = auth.onAuthStateChanged(async (firebaseUser) => {
      setLoading(true);
      if (firebaseUser) {
        setUser(firebaseUser);
        // Securely check for admin custom claim on the real user's token.
        // This is the proper way for production.
        const tokenResult = await firebaseUser.getIdTokenResult();
        setIsAdmin(!!tokenResult.claims.admin);
      } else {
        // No real Firebase user is logged in. 
        // We now check our session storage for a mock user.
        const mockUserIdentifier = sessionStorage.getItem('mockUser');
        if (mockUserIdentifier && MOCK_USERS[mockUserIdentifier]) {
           const mockUserData = MOCK_USERS[mockUserIdentifier];
           setUser({
               uid: mockUserIdentifier,
               email: mockUserIdentifier,
               displayName: mockUserIdentifier,
           });
           // For mock users, admin status is determined by the hardcoded email.
           setIsAdmin(mockUserIdentifier.toLowerCase() === ADMIN_EMAIL);
        } else {
            // No real user, no mock user.
            setUser(null);
            setIsAdmin(false);
        }
      }
      setLoading(false);
    });

    // Also listen for changes in session storage to handle mock user logins/logouts
    const handleStorageChange = () => {
        const mockUserIdentifier = sessionStorage.getItem('mockUser');
        if (mockUserIdentifier && MOCK_USERS[mockUserIdentifier]) {
            const mockUserData = MOCK_USERS[mockUserIdentifier];
            setUser({
               uid: mockUserIdentifier,
               email: mockUserIdentifier,
               displayName: mockUserIdentifier,
            });
            setIsAdmin(mockUserIdentifier.toLowerCase() === ADMIN_EMAIL);
        } else if (!auth.currentUser) { // Only clear if no real user is logged in
            setUser(null);
            setIsAdmin(false);
        }
    }

    window.addEventListener('storage', handleStorageChange);
    
    // Cleanup subscriptions on unmount
    return () => {
        unsubscribe();
        window.removeEventListener('storage', handleStorageChange);
    };
  }, []);

  return { user, isAdmin, loading };
}
