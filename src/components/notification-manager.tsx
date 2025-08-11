
'use client';

import { useEffect, useRef } from 'react';
import { useToast } from '@/hooks/use-toast';
import { User } from 'firebase/auth';
import { getMotivationalMessage } from '@/lib/motivational-messages';
import { Award, Footprints } from 'lucide-react';

interface NotificationManagerProps {
  user: User | null;
  currentSteps: number | null;
  dailyStepGoal: number;
}

// Define the milestones and the maximum number of notifications per day
const NOTIFICATION_LIMIT = 3; 

export default function NotificationManager({ user, currentSteps, dailyStepGoal }: NotificationManagerProps) {
  const { toast } = useToast();
  
  // Use a ref to track sent notifications for the current session/day
  const sentNotifications = useRef(new Set<string>());
  
  // Use a ref to track the count of notifications sent today
  const notificationsSentToday = useRef(0);

  useEffect(() => {
    // Reset notification tracking at the start of a new day
    const now = new Date();
    const lastResetKey = `lastNotificationReset_${user?.uid || 'guest'}`;
    const lastReset = localStorage.getItem(lastResetKey);
    if (!lastReset || new Date(lastReset).getDate() !== now.getDate()) {
        sentNotifications.current.clear();
        notificationsSentToday.current = 0;
        localStorage.setItem(lastResetKey, now.toISOString());
    }

    if (!user || currentSteps === null || dailyStepGoal === 0) {
      return;
    }

    const checkAndSendNotification = () => {
      // Stop if we've already sent the max number of notifications for the day
      if (notificationsSentToday.current >= NOTIFICATION_LIMIT) {
          return;
      }
      
      const result = getMotivationalMessage(currentSteps, dailyStepGoal);

      if (result) {
        const { id, message } = result;

        // Check if a notification for this specific milestone has already been sent
        if (!sentNotifications.current.has(id)) {
            sentNotifications.current.add(id); // Mark milestone as achieved for today
            notificationsSentToday.current++; // Increment the count of sent notifications

            const finalMessage = message.replace('{userName}', user.displayName?.split(' ')[0] || 'User');
            
            toast({
              title: (
                <div className="flex items-center gap-2">
                  <Award className="h-5 w-5 text-primary" />
                  <span className="font-headline">Way to Go!</span>
                </div>
              ),
              description: finalMessage,
            });
        }
      }
    };

    checkAndSendNotification();

  }, [currentSteps, dailyStepGoal, user, toast]);

  return null; // This is a non-visual component
}
