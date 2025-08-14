
'use client';

import { useContext, createContext } from 'react';
import type { MockUser } from '@/lib/types';


export interface AuthContextType {
  user: MockUser | null;
  loading: boolean;
  claims: { [key: string]: any } | null;
  login: (email: string, password: string) => Promise<MockUser>;
  logout: () => void;
}

export const AuthContext = createContext<AuthContextType>({
  user: null,
  loading: true,
  claims: null,
  login: async () => MOCK_USERS[0],
  logout: () => {},
});

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
