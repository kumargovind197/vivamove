
"use client";

import React, { useState, useEffect } from 'react';
import { Button } from './ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogTrigger, DialogFooter } from './ui/dialog';
import { Info, Sparkles } from 'lucide-react';

const VivaMoveLogo = () => {
    const [logoUrl, setLogoUrl] = useState<string | null>(null);

    useEffect(() => {
        // This runs only on the client, avoiding hydration errors
        const savedLogo = localStorage.getItem('vivaMoveLogo');
        if (savedLogo) {
            setLogoUrl(savedLogo);
        }
    }, []);

    if (logoUrl) {
        return <img src={logoUrl} alt="ViVa move Logo" className="h-8 w-auto" />;
    }

    // Fallback Icon
    return <Sparkles className="h-6 w-6 text-primary" />;
};

export default function AppInfoDialog() {
  const currentYear = new Date().getFullYear();

  return (
    <Dialog>
      <DialogTrigger asChild>
        <Button variant="link" size="sm" className="text-muted-foreground">
          <Info className="mr-2 h-4 w-4" />
          App Info
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <div className="flex items-center gap-4 mb-4">
             <VivaMoveLogo />
             <div>
                <DialogTitle className="text-xl">ViVa move</DialogTitle>
                <DialogDescription>A motivational step tracking app.</DialogDescription>
             </div>
          </div>
        </DialogHeader>
        <div className="grid gap-4 py-4 text-sm">
            <div className="flex justify-between">
                <span className="text-muted-foreground">App Name:</span>
                <span className="font-medium">ViVa move</span>
            </div>
            <div className="flex justify-between">
                <span className="text-muted-foreground">App Version:</span>
                <span className="font-medium">1.0.0</span>
            </div>
             <div className="flex justify-between">
                <span className="text-muted-foreground">Clinic:</span>
                <span className="font-medium">Wellness Clinic</span>
            </div>
             <div className="flex justify-between">
                <span className="text-muted-foreground">Contact:</span>
                <span className="font-medium">Your admin for support</span>
            </div>
        </div>
        <DialogFooter>
          <p className="text-xs text-muted-foreground w-full text-center">
            &copy; {currentYear} Viva health solutions. All rights reserved.
          </p>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

    