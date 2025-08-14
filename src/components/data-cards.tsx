
"use client";

import React, { useEffect, useState } from 'react';
import { Skeleton } from './ui/skeleton';
import type { MockUser } from '@/lib/types';


interface DataCardsProps {
  user: MockUser | null;
  onDataFetched: (data: { steps: number | null, activeMinutes: number | null }) => void;
}

export default function DataCards({ user, onDataFetched }: DataCardsProps) {
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // We will use mock data generation since we cannot securely implement
    // the Google Fit OAuth2 flow required for the live API.
    const generateMockData = () => {
      // Simulate a brief loading period
      setLoading(true);
      
      const isMockPatient = user?.uid === 'patient-123';
      const steps = isMockPatient ? 5432 : Math.floor(Math.random() * (12000 - 3000 + 1)) + 3000;
      const activeMinutes = isMockPatient ? 25 : Math.floor(Math.random() * (60 - 15 + 1)) + 15;

      onDataFetched({ steps, activeMinutes });

      // End loading after a short delay
      setTimeout(() => setLoading(false), 500);
    };

    if (user) {
        generateMockData();
    }
    
  }, [user, onDataFetched]);
  
  if (loading) {
       return (
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="mb-6 grid gap-6 md:grid-cols-2">
              <Skeleton className="h-[180px]" />
              <Skeleton className="h-[180px]" />
          </div>
        </div>
      );
  }

  return null; // This component now only fetches data and shows loaders/errors.
}
