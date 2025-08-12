"use client";

import React from 'react';
import AppHeader from '@/components/app-header';
import AdminPanel from '@/components/admin-panel';
import type { User } from 'firebase/auth';

// This page will now use a specific user as the admin.
// In a real application, you would implement proper role-based access control.
const adminUser: User = {
  uid: 'admin-user-id',
  email: 'vinitkiranshah@gmail.com',
  displayName: 'Admin',
  photoURL: 'https://placehold.co/100x100.png',
  providerId: 'password',
  emailVerified: true,
  isAnonymous: false,
  metadata: {},
  providerData: [],
  tenantId: null,
  delete: async () => {},
  getIdToken: async () => 'mock-admin-token',
  getIdTokenResult: async () => ({
    token: 'mock-admin-token',
    expirationTime: '',
    authTime: '',
    issuedAtTime: '',
    signInProvider: null,
    signInSecondFactor: null,
    claims: { admin: true }, // Simulate the admin claim
  }),
  reload: async () => {},
  toJSON: () => ({}),
};


export default function AdminPage() {
  // In a real app, you would have logic here to check if the *currently logged-in user*
  // has admin privileges. For this prototype, we are granting access to the hardcoded admin user.
  
  return (
    <div className="flex min-h-screen w-full flex-col">
      <AppHeader user={adminUser} view="admin" clinic={null} />
      <main className="flex-1">
        <AdminPanel />
      </main>
    </div>
  );
}
