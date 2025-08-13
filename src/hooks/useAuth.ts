
'use client';

import { useContext, createContext } from 'react';
import type { User } from 'firebase/auth';

export interface AuthContextType {
  user: User | null;
  loading: boolean;
  claims: { [key: string]: any } | null;
}

export const AuthContext = createContext<AuthContextType>({
  user: null,
  loading: true,
  claims: null,
});

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
