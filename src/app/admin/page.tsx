"use client";

import React from 'react';
import AdminPanel from '@/components/admin-panel';
import AppHeader from '@/components/app-header';
import type { User } from 'firebase/auth';

// Mock user for display purposes since security is removed.
const mockAdminUser: User = {
  uid: 'mock-admin-id',
  email: 'admin@example.com',
  displayName: 'Admin User',
  photoURL: null,
  providerId: 'password',
  emailVerified: true,
  isAnonymous: false,
  metadata: {},
  providerData: [],
  tenantId: null,
  delete: async () => {},
  getIdToken: async () => 'mock-token',
  getIdTokenResult: async () => ({
    token: 'mock-token',
    expirationTime: '',
    authTime: '',
    issuedAtTime: '',
    signInProvider: null,
    signInSecondFactor: null,
    claims: { admin: true },
  }),
  reload: async () => {},
  toJSON: () => ({}),
};


export default function AdminPage() {
  // All security checks have been removed as requested.
  // This page is now publicly accessible.
  
  return (
    <div className="flex min-h-screen w-full flex-col">
       <AppHeader user={mockAdminUser} view="admin" clinic={null} />
      <main className="flex-1">
        <AdminPanel />
      </main>
    </div>
  );
}
