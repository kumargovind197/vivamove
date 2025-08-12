
"use client";

import { useState, useEffect } from 'react';
import { Card, CardContent } from './ui/card';
import { getDashboardMessage } from '@/lib/motivational-messages';
import { Sparkles } from 'lucide-react';

interface MotivationalCardProps {
    currentSteps: number;
    dailyStepGoal: number;
}

export default function MotivationalCard({ currentSteps, dailyStepGoal }: MotivationalCardProps) {
    const [message, setMessage] = useState<string | null>(null);

    useEffect(() => {
        // This ensures the random message is only generated on the client, avoiding hydration errors.
        setMessage(getDashboardMessage(currentSteps, dailyStepGoal));
    }, [currentSteps, dailyStepGoal]);
    
    if (!message) {
        return null; // Don't render until the message is ready on the client
    }

    return (
        <Card className="bg-gradient-to-r from-pink-500 via-purple-500 to-indigo-500 border-0">
            <CardContent className="p-4 flex items-center justify-center gap-4 text-center w-full">
                <Sparkles className="text-white/80 h-5 w-5 shrink-0" />
                <p className="text-sm font-medium text-white">
                    {message}
                </p>
            </CardContent>
        </Card>
    );
}
