
"use client";

import React from 'react';
import AppHeader from '@/components/app-header';
import AdminPanel from '@/components/admin-panel';
import { MOCK_USERS } from '@/lib/mock-data';

export default function AdminPage() {
    // Use the mock admin user for the header
    const mockAdminUser = MOCK_USERS.find(u => u.claims.admin)!;

    return (
        <div className="flex min-h-screen w-full flex-col">
            <AppHeader user={mockAdminUser} view="admin" />
            <main className="flex-1">
                <AdminPanel />
            </main>
        </div>
    );
}
