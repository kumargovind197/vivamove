
"use client";

import React from 'react';
import AppInfoDialog from './app-info-dialog';
import LogoutButton from './logout-button';

export default function AppFooter() {
  return (
    <footer className="w-full py-4 px-4 md:px-6 border-t bg-card/50 backdrop-blur-sm mt-auto">
      <div className="container mx-auto flex items-center justify-center gap-4 text-sm text-muted-foreground">
        <AppInfoDialog />
        <LogoutButton />
      </div>
    </footer>
  );
}
