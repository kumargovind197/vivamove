"use client";

import React, { useState, useEffect } from 'react';
import AppHeader from '@/components/app-header';
import AdminPanel from '@/components/admin-panel';

// Mock user for development purposes since login is disabled
const mockAdminUser = {
  uid: 'mock-admin-id',
  email: 'admin@example.com',
  displayName: 'Admin User',
};

export default function AdminPage() {

  // Since authentication is removed for public access, we will use mock data.
  // The AdminPanel component itself contains the logic for interacting with Firestore.
  // Proper authentication would be required for those Firestore rules to pass.

  return (
    <div className="flex min-h-screen w-full flex-col">
       <AppHeader user={mockAdminUser as any} view="admin" clinic={null} />
      <main className="flex-1">
        <AdminPanel />
      </main>
    </div>
  );
}
