
"use client";
import React, { useState, useMemo, useEffect } from 'react';
import Image from 'next/image';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import ActivityChart from '@/components/activity-chart';
import { User } from 'firebase/auth';
import { Footprints, Flame, Target, Trophy, Sparkles } from 'lucide-react';
import ProgressRing from './progress-ring';
import { Button } from './ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from './ui/dialog';
import { Slider } from './ui/slider';
import { cn } from '@/lib/utils';
import { getDashboardMessage } from '@/lib/motivational-messages';

type Clinic = {
    id: string;
    name: string;
    logo: string;
}

// --- MOCK LOCAL DEVICE STORAGE ---
const generateInitialLocalData = () => {
    const data = [];
    const today = new Date();
    // Simulate having the last 35 days of data stored on the device
    for (let i = 0; i < 35; i++) {
        const date = new Date(today);
        date.setDate(today.getDate() - i);
        data.push({
            date: date.toISOString().split('T')[0], // YYYY-MM-DD
            steps: Math.floor(Math.random() * 18000),
            activeMinutes: Math.floor(Math.random() * 90),
        });
    }
    return data.reverse(); // Return in chronological order
};
// --- END MOCK ---

const DAILY_MINUTE_GOAL = 30;

const chartConfigSteps = {
  steps: { label: "Steps", color: "hsl(var(--accent))" },
};

const chartConfigMinutes = {
  activeMinutes: { label: "Active Minutes", color: "hsl(var(--chart-2))" },
}

const chartConfigDailyAverage = {
    steps: { label: "Avg Steps", color: "hsl(var(--primary))" },
};

type ClientDashboardProps = {
  user: User | null;
  fitData: {
      steps: number | null;
      activeMinutes: number | null;
  };
  dailyStepGoal: number;
  onStepGoalChange: (goal: number) => void;
  view: 'client' | 'clinic';
  clinic: Clinic | null;
};

const stepMilestones = [
  { name: '0-30%', goal: 0, color: 'bg-red-500', height: 'h-1/4' },
  { name: '30-60%', goal: 30, color: 'bg-amber-500', height: 'h-2/4' },
  { name: '60-80%', goal: 60, color: 'bg-yellow-500', height: 'h-3/4' },
  { name: '>80%', goal: 80, color: 'bg-green-500', height: 'h-full' }
];

const StepStaircase = ({ progress }: { progress: number }) => (
    <div className="flex w-full min-h-[120px] items-end gap-2 rounded-lg bg-muted p-2">
      {stepMilestones.map((step) => {
        const isAchieved = progress >= step.goal;
        return (
          <div key={step.name} className={`w-1/4 rounded-t-md ${step.height} ${isAchieved ? `${step.color} animate-pulse-bright` : 'bg-muted-foreground/20'} transition-colors duration-500`}>
          </div>
        );
      })}
    </div>
);

export default function ClientDashboard({ user, fitData, dailyStepGoal, onStepGoalChange, view, clinic }: ClientDashboardProps) {
  const [isGoalDialogOpen, setGoalDialogOpen] = useState(false);
  const [pendingStepGoal, setPendingStepGoal] = useState(dailyStepGoal);
  
  // This state now simulates the data stored locally on the user's phone.
  const [localDeviceData, setLocalDeviceData] = useState<any[]>([]);
  const [dashboardMessage, setDashboardMessage] = useState<string | null>(null);

  useEffect(() => {
    // Generate mock data on client-side only to prevent hydration mismatch
    setLocalDeviceData(generateInitialLocalData());
  }, []);

  useEffect(() => {
    // This ensures the random message is only generated on the client, avoiding hydration errors.
    setDashboardMessage(getDashboardMessage(fitData.steps ?? 0, dailyStepGoal));
  }, [fitData.steps, dailyStepGoal]);

  const { steps, activeMinutes } = fitData;

  const stepProgress = steps && dailyStepGoal > 0 ? (steps / dailyStepGoal) * 100 : 0;
  const minuteProgress = activeMinutes ? (activeMinutes / DAILY_MINUTE_GOAL) * 100 : 0;
  
  const getRingColor = (progress: number) => {
    if (progress < 40) return "#ef4444"; // red-500
    if (progress < 80) return "#f59e0b"; // amber-500
    return "#22c55e"; // green-500
  }

  const handleSaveGoal = () => {
    onStepGoalChange(pendingStepGoal);
    setGoalDialogOpen(false);
  }

  // --- DATA CALCULATIONS based on LOCAL DATA ---
  
  const weeklyData = useMemo(() => {
    if (localDeviceData.length === 0) return [];
    const dayNames = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
    // Get the last 7 days from our local storage
    const last7DaysData = localDeviceData.slice(-7);
    return last7DaysData.map(d => ({
        day: dayNames[new Date(d.date).getUTCDay()],
        steps: d.steps
    }));
  }, [localDeviceData]);
  
  const weeklyAverage = useMemo(() => {
    if (weeklyData.length === 0) return 0;
    return Math.round(weeklyData.reduce((acc, curr) => acc + curr.steps, 0) / weeklyData.length);
  }, [weeklyData]);

  const monthlyData = useMemo(() => {
    if (localDeviceData.length === 0) return [];
    // Get the last 30 days from local storage
    return localDeviceData.slice(-30);
  }, [localDeviceData]);

  const monthlyTotalSteps = monthlyData.reduce((acc, curr) => acc + curr.steps, 0);
  const monthlyAverageSteps = monthlyData.length > 0 ? Math.round(monthlyTotalSteps / monthlyData.length) : 0;
  const daysStepGoalMetMonthly = monthlyData.filter(day => day.steps >= dailyStepGoal).length;
  
  const monthlyTotalMinutes = monthlyData.reduce((acc, curr) => acc + curr.activeMinutes, 0);
  const monthlyAverageMinutes = monthlyData.length > 0 ? Math.round(monthlyTotalMinutes / monthlyData.length) : 0;
  const daysMinuteGoalMetMonthly = monthlyData.filter(day => day.activeMinutes >= DAILY_MINUTE_GOAL).length;

  const averageStepsByDay = useMemo(() => {
    if (localDeviceData.length === 0) return [];
    const dayNames = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];
    const dayMap: { [key: string]: { total: number, count: number } } = {};
    
    // Use last 4 weeks of data for a stable average
    localDeviceData.slice(-28).forEach(d => {
        const dayName = dayNames[new Date(d.date).getUTCDay()];
        if (!dayMap[dayName]) {
            dayMap[dayName] = { total: 0, count: 0 };
        }
        dayMap[dayName].total += d.steps;
        dayMap[dayName].count += 1;
    });

    return dayNames.map(dayName => ({
        day: dayName,
        steps: dayMap[dayName] ? Math.round(dayMap[dayName].total / dayMap[dayName].count) : 0,
    }));
  }, [localDeviceData]);
  
  const averageMinutesByDay = useMemo(() => {
    if (localDeviceData.length === 0) return [];
     const dayNames = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];
     const dayMap: { [key: string]: { total: number, count: number } } = {};
    
    // Use last 4 weeks of data for a stable average
    localDeviceData.slice(-28).forEach(d => {
        const dayName = dayNames[new Date(d.date).getUTCDay()];
        if (!dayMap[dayName]) {
            dayMap[dayName] = { total: 0, count: 0 };
        }
        dayMap[dayName].total += d.activeMinutes;
        dayMap[dayName].count += 1;
    });

    return dayNames.map(dayName => ({
        day: dayName,
        activeMinutes: dayMap[dayName] ? Math.round(dayMap[dayName].total / dayMap[dayName].count) : 0,
    }));
  }, [localDeviceData]);

   const getCardColoring = (value: number, goal: number, isHigherBetter: boolean = true) => {
    const progress = (value / goal) * 100;
    if (isHigherBetter) {
      if (progress < 75) return "bg-amber-600/10 border-amber-500/20";
      if (progress >= 100) return "bg-green-600/10 border-green-500/20";
    }
    return ""; // Default
  };

  const daysMetProgress = monthlyData.length > 0 ? (daysStepGoalMetMonthly / monthlyData.length) * 100 : 0;

  return (
    <>
      <div className="container mx-auto px-4 py-8 sm:px-6 lg:px-8">
         <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8 items-center">
            {/* Welcome Section */}
            <div className="space-y-1">
                <h1 className="font-headline text-2xl font-bold tracking-tight">Welcome back, {user?.displayName?.split(' ')[0] || 'User'}!</h1>
                <p className="text-muted-foreground text-sm">Here's your activity summary.</p>
            </div>

            {/* Motivation Section */}
            <div className="flex justify-center">
                 <Card className="bg-gradient-to-r from-pink-500 via-purple-500 to-indigo-500 border-0 max-w-sm">
                    <CardContent className="p-3 flex items-center justify-center gap-3 text-center w-full">
                        <Sparkles className="text-white/80 h-5 w-5 shrink-0" />
                        <p className="text-sm font-medium text-white">
                           {dashboardMessage || "Let's make today count!"}
                        </p>
                    </CardContent>
                </Card>
            </div>
            
            {/* Clinic Section */}
            <div className="flex justify-end">
                 <Card className="flex items-center gap-4 p-3 bg-card border-muted">
                    {clinic && <Image data-ai-hint="medical logo" src={clinic.logo} alt="Clinic Logo" width={48} height={48} className="rounded-md" />}
                    <div>
                        <p className="text-sm text-muted-foreground">Enrolled with</p>
                        <p className="font-headline font-semibold">{clinic?.name || 'Your Clinic'}</p>
                    </div>
                </Card>
            </div>
        </div>

        <div className="grid gap-6 md:grid-cols-2 mb-6">
          <Card className="bg-secondary/50 flex flex-col">
             <CardHeader className="flex-grow-0">
                <div className="flex flex-row items-center justify-between pb-2">
                    <div>
                        <CardTitle>Daily Steps</CardTitle>
                        <CardDescription>
                          Your goal is {dailyStepGoal.toLocaleString()} steps today.
                        </CardDescription>
                    </div>
                     <Button variant="outline" size="sm" onClick={() => {
                        setPendingStepGoal(dailyStepGoal);
                        setGoalDialogOpen(true)
                    }}>
                        Change Goal
                    </Button>
                </div>
                 <div className="text-center py-2">
                    <span className="text-4xl font-bold text-primary">{steps?.toLocaleString() ?? 0}</span>
                    <span className="text-sm text-muted-foreground"> / {dailyStepGoal.toLocaleString()}</span>
                </div>
            </CardHeader>
            <CardContent className="flex-grow flex flex-col justify-end">
               <StepStaircase progress={stepProgress} />
            </CardContent>
          </Card>
          <Card className="bg-secondary/50">
            <CardHeader>
              <CardTitle className="flex items-center justify-between">
                <span>Active Minutes</span>
                <Flame className="h-6 w-6 text-muted-foreground" />
              </CardTitle>
              <CardDescription>
                Your goal is {DAILY_MINUTE_GOAL} active minutes today.
              </CardDescription>
               <div className="text-center">
                    <span className="text-4xl font-bold text-primary">{activeMinutes?.toLocaleString() ?? 0}</span>
                    <span className="text-sm text-muted-foreground"> / {DAILY_MINUTE_GOAL}</span>
                </div>
            </CardHeader>
            <CardContent className="flex items-center justify-center">
              <ProgressRing progress={minuteProgress} color={getRingColor(minuteProgress)} trackColor="hsl(var(--muted))" />
            </CardContent>
          </Card>
        </div>


        <Tabs defaultValue="weekly" className="w-full">
          <TabsList className="grid w-full grid-cols-2 md:w-[300px]">
            <TabsTrigger value="weekly">Weekly</TabsTrigger>
            <TabsTrigger value="monthly">Monthly</TabsTrigger>
          </TabsList>
          
          <TabsContent value="weekly">
            <Card>
                <CardHeader>
                    <CardTitle>This Week's Steps</CardTitle>
                    <CardDescription>Your daily step count for the last 7 days. Your daily average was {weeklyAverage.toLocaleString()} steps.</CardDescription>
                </CardHeader>
                <CardContent className="h-[350px]">
                    <ActivityChart data={weeklyData} config={chartConfigSteps} dataKey={"steps"} timeKey="day" type="line" goal={dailyStepGoal} />
                </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="monthly">
            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4 mb-6">
                 <Card className={cn(getCardColoring(monthlyAverageSteps, dailyStepGoal))}>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Daily Step Average</CardTitle>
                        <Footprints className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">{monthlyAverageSteps.toLocaleString()}</div>
                        <p className="text-xs text-muted-foreground">in the last 30 days</p>
                    </CardContent>
                </Card>
                 <Card className={cn(getCardColoring(daysMetProgress, 80))}>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Step Goals Met</CardTitle>
                        <Trophy className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">{daysStepGoalMetMonthly} / {monthlyData.length}</div>
                        <p className="text-xs text-muted-foreground">days you reached your goal</p>
                    </CardContent>
                </Card>
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Avg. Active Minutes</CardTitle>
                        <Flame className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">{monthlyAverageMinutes}</div>
                        <p className="text-xs text-muted-foreground">minutes per day</p>
                    </CardContent>
                </Card>
                 <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Current Step Goal</CardTitle>
                        <Target className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">{dailyStepGoal.toLocaleString()}</div>
                        <p className="text-xs text-muted-foreground">steps per day</p>
                    </CardContent>
                </Card>
            </div>
            <div className="grid gap-6 md:grid-cols-2 mt-6">
                <Card>
                    <CardHeader>
                        <CardTitle>Daily Averages by Weekday (Steps)</CardTitle>
                        <CardDescription>Your average step count for each day of the week over the last month.</CardDescription>
                    </CardHeader>
                    <CardContent className="h-[350px]">
                        <ActivityChart data={averageStepsByDay} config={chartConfigDailyAverage} dataKey="steps" timeKey="day" type="bar" goal={dailyStepGoal}/>
                    </CardContent>
                </Card>
                <Card>
                    <CardHeader>
                        <CardTitle>Daily Averages by Weekday (Minutes)</CardTitle>
                        <CardDescription>Your average active minutes for each day of the week over the last month.</CardDescription>
                    </CardHeader>
                    <CardContent className="h-[350px]">
                        <ActivityChart data={averageMinutesByDay} config={chartConfigMinutes} dataKey="activeMinutes" timeKey="day" type="bar" goal={DAILY_MINUTE_GOAL} />
                    </CardContent>
                </Card>
            </div>
          </TabsContent>
        </Tabs>
      </div>

      <Dialog open={isGoalDialogOpen} onOpenChange={setGoalDialogOpen}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>Set Your Daily Step Goal</DialogTitle>
            <DialogDescription>
              Adjust the slider to set a new daily step goal.
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
              <div className="text-center text-2xl font-bold text-primary">{pendingStepGoal.toLocaleString()} steps</div>
              <Slider
                defaultValue={[dailyStepGoal]}
                value={[pendingStepGoal]}
                max={20000}
                min={2000}
                step={500}
                onValueChange={(value) => setPendingStepGoal(value[0])}
              />
               <div className="flex justify-between text-xs text-muted-foreground">
                <span>2,000</span>
                <span>20,000</span>
              </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setGoalDialogOpen(false)}>Cancel</Button>
            <Button onClick={handleSaveGoal}>Save</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}
