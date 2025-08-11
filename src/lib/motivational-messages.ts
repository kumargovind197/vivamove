
"use client";

type MilestoneId = 'not_started' | 'quarter_way' | 'halfway' | 'almost_there' | 'goal_reached' | 'goal_crushed';
type TimeOfDay = 'morning' | 'afternoon' | 'evening';

const messages: Record<TimeOfDay, Record<MilestoneId, string[]>> = {
    morning: {
        not_started: [
            "Good morning, {userName}! A short walk is a great way to start your day.",
            "Rise and shine, {userName}! Let's get some steps in this morning.",
            "A new day, a new goal! Let's make today count, {userName}.",
            "Morning, {userName}! Even a 10-minute walk can make a big difference.",
            "Let's get a head start on your goal today, {userName}!",
            "Every journey begins with a single step. Let's take the first one, {userName}!",
            "Good morning! Your future self will thank you for being active today.",
            "Start your day on the right foot, {userName}. Let's get moving!",
            "Today is full of potential, {userName}. Let's kick it off with some activity.",
            "Let's beat yesterday! Time to get those morning steps in, {userName}.",
            "Morning, {userName}! Seize the day, one step at a time.",
            "The early bird gets the steps! Let's get going, {userName}."
        ],
        quarter_way: [
            "Excellent start to the day, {userName}! You're already on your way.",
            "Look at you go! A great foundation for the rest of the day, {userName}.",
            "You're already 25% of the way there. Keep that morning momentum!",
            "That's a fantastic start, {userName}. Keep building on it!",
            "You've smashed the first quarter of your goal before lunch. Great job!",
            "Just getting warmed up! Great to see you're already making progress.",
            "You're off to a flying start, {userName}! Keep it up.",
            "The first milestone of the day is done. Onwards and upwards!",
            "A brilliant effort this morning, {userName}. You're making great time.",
            "That's the way to do it! Keep this energy going all day."
        ],
        halfway: [
            "Incredible morning, {userName}! You're already halfway to your goal.",
            "Halfway there and the day's not even half over. You're on fire, {userName}!",
            "What a star! Hitting 50% of your goal this early is amazing.",
            "You're making incredible progress this morning, {userName}. Keep it up!",
            "50% done and dusted. This is shaping up to be a great day!",
            "You're sailing through your goal today. Fantastic work!",
            "Halfway to the finish line, {userName}! You've got this in the bag.",
            "Look at that progress bar! You're crushing it this morning.",
            "Incredible! What an impressive achievement for this time of day.",
            "You're right on track for a record-breaking day, {userName}."
        ],
        almost_there: [
            "Wow, {userName}! You've nearly hit your goal and it's still morning. Amazing!",
            "You're closing in on that goal. Incredible work for so early in the day!",
            "Almost there, {userName}! You're making this look easy.",
            "The finish line is in sight, and it's not even noon! Go, {userName}!",
            "Just a little more to go. Fantastic morning effort!",
            "You're in the home stretch now. This is an amazing pace!",
            "That goal is just around the corner. You're unstoppable this morning!",
            "Don't stop now, {userName}, you're on the verge of victory!",
            "Incredible determination! You're about to smash your goal.",
            "The final push! You've done the hard work, now enjoy the reward."
        ],
        goal_reached: [
            "Goal complete, and it's still morning! Absolutely brilliant, {userName}!",
            "You did it! Goal reached. What an amazing start to your day.",
            "Congratulations, {userName}! You've hit your daily goal before lunchtime.",
            "Mission accomplished, {userName}! Time to enjoy that winning feeling.",
            "And that's a wrap! Goal met. You're a morning champion, {userName}!",
            "Target acquired and achieved! Well done on your focus and effort.",
            "You've ticked all the boxes for today's goal. Outstanding work!",
            "Consider that goal officially conquered. What an achievement!",
            "And that is how it's done! Congratulations on hitting your goal.",
            "You set a target and you reached it. Be proud of yourself, {userName}!"
        ],
        goal_crushed: [
            "You're on another level today, {userName}! Goal crushed before the day has even really begun.",
            "Wow! You've already smashed today's goal. What will you do with the rest of this energy?",
            "Goal crushed! You're setting a new standard for yourself, {userName}.",
            "Is there a super goal? Because you just flew past the regular one. Amazing!",
            "Absolutely outstanding, {userName}. You've left your goal in the dust!",
            "You're going for the high score! Incredible work today.",
            "That's what we call going above and beyond. Phenomenal effort!",
            "Your goal didn't stand a chance! Amazing work, {userName}.",
            "You're in a league of your own today. Congratulations on crushing your goal!",
            "You haven't just met your goal, you've lapped it. Sensational!"
        ]
    },
    afternoon: {
        not_started: [
            "Good afternoon, {userName}! Still time to get started on your goal. How about a quick walk?",
            "Let's turn this afternoon around, {userName}. A little activity can boost your energy!",
            "The day's not over yet! Let's get some steps in, {userName}.",
            "Feeling that afternoon slump? A short walk is the perfect cure, {userName}.",
            "Let's make some progress on your goal this afternoon, {userName}.",
            "A little movement can make a big difference to your afternoon. Let's go!",
            "The afternoon is a perfect time for a fresh start on your goal.",
            "Ready to stretch your legs, {userName}? Let's get some steps in.",
            "Don't let the day slip away. Let's get active this afternoon!",
            "Your goal is waiting for you, {userName}. Let's make a start."
        ],
        quarter_way: [
            "Nice one, {userName}! You're on the board and building momentum.",
            "That's the way! A good afternoon effort to get you towards your goal.",
            "You're 25% of the way there. Keep chipping away at it, {userName}!",
            "Every step is a victory. Keep up the great work this afternoon!",
            "A solid start. Let's see how much more we can do before the evening.",
            "Progress looks good, {userName}! Keep that rhythm going.",
            "You're making steady headway. Well done!",
            "Great to see you moving this afternoon. You're doing great!",
            "The journey to your goal is well underway. Keep it up!",
            "A quarter of the way there is a great place to be. Let's keep going!"
        ],
        halfway: [
            "You're halfway there, {userName}! Fantastic afternoon progress.",
            "Great job hitting the 50% mark! The finish line is in sight.",
            "Keep up that great rhythm, {userName}. You're doing brilliantly.",
            "You're right on track. Halfway down, halfway to go!",
            "50% complete. You've got this, {userName}!",
            "The second half of the goal is calling. You're doing an amazing job!",
            "You've hit the halfway point with style. Keep it up!",
            "Your hard work this afternoon is paying off. Halfway there!",
            "Over the hill and heading for the finish line. Great work!",
            "Fantastic! You've completed half of your goal for today."
        ],
        almost_there: [
            "You're so close, {userName}! Just a little further to go.",
            "Look at that! You're in the home stretch now. Fantastic work.",
            "Just a little more to reach that goal. You can do it, {userName}!",
            "The goal is just around the corner. Keep pushing through!",
            "Incredible effort this afternoon. You're almost there!",
            "The end is in sight! Your persistence is amazing.",
            "You're on the final lap, {userName}. Finish strong!",
            "Don't look back, you're almost there! Fantastic job.",
            "Your goal is within reach. A fantastic afternoon's work!",
            "Just a few more steps to victory. You're doing so well!"
        ],
        goal_reached: [
            "You did it, {userName}! Goal reached. Congratulations!",
            "Fantastic work today! You've hit your goal.",
            "Goal complete! A brilliant achievement for the day, {userName}.",
            "Mission accomplished! Enjoy the feeling of success.",
            "And that's the goal! Well done, {userName}!",
            "You've crossed the finish line for today. Be proud of your achievement!",
            "Target hit! Your hard work and dedication have paid off.",
            "A goal met is a day well spent. Congratulations, {userName}!",
            "Pop the confetti! You've reached your goal for the day.",
            "Success! You've done exactly what you set out to do. Well done."
        ],
        goal_crushed: [
            "You're unstoppable, {userName}! You've smashed today's goal.",
            "Going above and beyond! That's what we love to see. Great job!",
            "Goal crushed! You're really on a roll now.",
            "Extraordinary effort, {userName}! You've outdone yourself today.",
            "You didn't just meet your goal, you conquered it. Well done!",
            "Leaving your goal in the rear-view mirror! That's impressive.",
            "You've raised the bar today, {userName}. Amazing effort!",
            "Is there anything you can't do? Goal absolutely crushed!",
            "You're setting a new personal best! Incredible performance.",
            "That's a victory lap! Congratulations on surpassing your goal."
        ]
    },
    evening: {
         not_started: [
            "Good evening, {userName}. There's still time for a relaxing walk to end the day.",
            "The day is almost over, but it's not too late to get a few steps in.",
            "How about a short walk to clear your head this evening, {userName}?",
            "Even a little activity now can help you finish the day strong.",
            "Let's get a few steps on the board before the day is done, {userName}.",
            "A calm evening walk can be the perfect way to reach your goal.",
            "It's not too late to show today who's boss. Let's get moving!",
            "Finish your day with a sense of accomplishment. A few steps is all it takes to start.",
            "The moon is out, and so is your opportunity to get active, {userName}!",
            "Let's end the day on a positive note. How about a little walk?"
        ],
        quarter_way: [
            "Well done for getting those steps in today, {userName}. A solid effort!",
            "You're a quarter of the way there. A great way to wrap up the day.",
            "It's never too late to make progress. Good job, {userName}!",
            "You've made a great start, even late in the day. Keep it up!",
            "Every step counts. Nice work on your progress today.",
            "Finishing the day with purpose. Great job on getting started!",
            "A solid evening effort, {userName}. Well done.",
            "You're on your way. A great final push for the day.",
            "That's a good number to end the day on, and you can still get more!",
            "Persistence pays off. Great job making progress this evening."
        ],
        halfway: [
            "You're halfway to your goal, {userName}! A fantastic effort for the day.",
            "Look at that, 50% complete. Well done on your commitment today!",
            "You're right on track. A great way to finish the day.",
            "Keep it up, {userName}! You're doing great.",
            "Halfway there. You should be proud of your progress today.",
            "You've made it to the halfway point. A brilliant end-of-day effort.",
            "Don't underestimate that evening energy! You're at 50%.",
            "This is a great achievement for your day, {userName}. Well done.",
            "You're showing amazing commitment. Halfway there!",
            "A fantastic push to get to the 50% mark. Keep going!"
        ],
        almost_there: [
            "You're so close, {userName}! Just a final push to hit your goal.",
            "The finish line is right there. You've done so well today!",
            "Look how far you've come today! Almost at your goal.",
            "Incredible! You're nearly there. Don't give up now.",
            "You're ending the day on a high note. Just a little more to go!",
            "What a fantastic final effort. You're about to hit your goal!",
            "The goal is in your grasp. Just a few more steps!",
            "This is how you finish a day strong. Almost there, {userName}!",
            "Your dedication is shining through. The goal is so close!",
            "One last effort to get you over the line. You can do it!"
        ],
        goal_reached: [
            "You did it! Goal reached right at the end of the day. Fantastic dedication, {userName}!",
            "Congratulations, {userName}! You've hit your goal. A perfect end to the day.",
            "What a finish! You met your goal. Time to rest and celebrate.",
            "And that's a wrap! Goal achieved. You should be very proud, {userName}.",
            "You made it! Excellent work sticking with it all day.",
            "Right down to the wire, and you've done it! Congratulations.",
            "A goal achieved is the perfect way to end your evening. Well done!",
            "You've successfully completed today's mission. Great job!",
            "You never gave up, and you hit your goal. That's a win!",
            "Rest easy knowing you've achieved your goal. Fantastic work, {userName}."
        ],
        goal_crushed: [
            "Absolutely phenomenal, {userName}! You crushed your goal and finished the day strong.",
            "You didn't just meet your goal, you soared past it. Incredible work!",
            "What a way to end the day! Goal crushed. You're an inspiration.",
            "You've gone the extra mile today, {userName}. Truly outstanding!",
            "That's how you do it! An amazing effort to smash your goal.",
            "An evening victory lap! You've gone way beyond today's goal.",
            "You have completely dominated your goal today. What an effort!",
            "More than 100%! That's what we call a successful day. Congratulations!",
            "You've set a high bar for tomorrow! Amazing work crushing your goal.",
            "Ending the day as a champion. You've blown past your goal, {userName}!"
        ]
    }
};

const getTimeOfDay = (): TimeOfDay => {
    const hour = new Date().getHours();
    if (hour < 12) return 'morning';
    if (hour < 17) return 'afternoon';
    return 'evening';
}

export const getMotivationalMessage = (currentSteps: number, dailyStepGoal: number): { id: MilestoneId, message: string } | null => {
    
    const progress = (currentSteps / dailyStepGoal) * 100;
    const timeOfDay = getTimeOfDay();
    let milestoneId: MilestoneId | null = null;
    
    // Determine which milestone has been hit
    if (progress === 0) milestoneId = 'not_started';
    else if (progress >= 125) milestoneId = 'goal_crushed';
    else if (progress >= 100) milestoneId = 'goal_reached';
    else if (progress >= 75) milestoneId = 'almost_there';
    else if (progress >= 50) milestoneId = 'halfway';
    else if (progress > 0) milestoneId = 'quarter_way'; // Any progress counts as starting

    if (!milestoneId) return null;

    const possibleMessages = messages[timeOfDay][milestoneId];
    
    if (!possibleMessages || possibleMessages.length === 0) {
        // Fallback to afternoon messages if a category is empty for some reason
        const fallbackMessages = messages['afternoon'][milestoneId];
        if (!fallbackMessages || fallbackMessages.length === 0) return null;
        const randomIndex = Math.floor(Math.random() * fallbackMessages.length);
        return { id: milestoneId, message: fallbackMessages[randomIndex] };
    }

    const randomIndex = Math.floor(Math.random() * possibleMessages.length);
    const message = possibleMessages[randomIndex];

    return { id: milestoneId, message };
};

    