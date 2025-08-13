"use client";

import React from 'react';
import AdminPanel from '@/components/admin-panel';
import AppHeader from '@/components/app-header';

// This is a mock user object. In a real application, you would get this
// from your authentication provider.
const mockAdminUser = {
  uid: 'admin-user-id',
  email: 'admin@example.com',
  displayName: 'Admin User',
};

export default function AdminPage() {
  
  // Since we are removing login checks, we will render the page directly
  // with mock data where needed.

  return (
    <div className="flex min-h-screen w-full flex-col">
       <AppHeader user={mockAdminUser as any} view="admin" clinic={null} />
      <main className="flex-1">
        <AdminPanel />
      </main>
    </div>
  );
}
