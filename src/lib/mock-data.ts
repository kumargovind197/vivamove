
// In a real app, you would use Firebase Auth for this.
// For this prototype, we'll hardcode users and clinics.

// -- MOCK USER DATABASE --
export let MOCK_USERS: Record<string, { role: 'client' | 'clinic' | 'admin', password: string, redirect: string }> = {
    'patient@example.com': { role: 'client', password: 'password', redirect: '/' },
    'clinic-wellness': { role: 'clinic', password: 'password123', redirect: '/clinic' },
    'vinitkiranshah@gmail.com': { role: 'admin', password: 'adminpassword', redirect: '/admin' },
    'john.smith@example.com': { role: 'client', password: 'password', redirect: '/' },
    'emily.jones@example.com': { role: 'client', password: 'password', redirect: '/' },
    'michael.johnson@example.com': { role: 'client', password: 'password', redirect: '/' },
    'sarah.miller@example.com': { role: 'client', password: 'password', redirect: '/' },
    'david.wilson@example.com': { role: 'client', password: 'password', redirect: '/' },
    'jessica.brown@example.com': { role: 'client', password: 'password', redirect: '/' },
};

// -- MOCK CLINIC DATABASE --
export let MOCK_CLINICS: Record<string, {
    id: string;
    name: string;
    capacity: number;
    enrolled: number;
    logo: string;
    password?: string;
    adsEnabled: boolean;
}> = {
    'clinic-wellness': { id: 'clinic-wellness', name: 'Wellness Clinic', capacity: 200, enrolled: 120, logo: 'https://placehold.co/128x128.png', adsEnabled: true },
    'clinic-healthfirst': { id: 'clinic-healthfirst', name: 'HealthFirst Medical', capacity: 150, enrolled: 88, logo: 'https://placehold.co/128x128.png', adsEnabled: false },
    'clinic-cityheart': { id: 'clinic-cityheart', name: 'City Heart Specialists', capacity: 100, enrolled: 45, logo: 'https://placehold.co/128x128.png', adsEnabled: true },
};


// Function to "disable" a user by removing them from the mock database
export function removeUser(email: string) {
    const userKey = email.toLowerCase() as keyof typeof MOCK_USERS;
    if (MOCK_USERS[userKey]) {
        delete MOCK_USERS[userKey];
        console.log(`User ${email} removed from mock database.`);
    }
}

// Function to add a new user to the mock database. Default password is 'password'
export function addUser(email: string, role: 'client' | 'clinic', redirect: string, password = 'password'): boolean {
    const userKey = email.toLowerCase();
    if (MOCK_USERS[userKey]) {
        return false; // User already exists
    }
    MOCK_USERS[userKey] = { role, password, redirect };
    return true;
}


// Function to add a new clinic user to the mock database
export function addClinicUser(clinicId: string, password: string, overwrite: boolean = false): boolean {
    const userKey = clinicId.toLowerCase();
    if (MOCK_USERS[userKey] && !overwrite) {
        // User already exists, and we are not overwriting
        return false;
    }
    MOCK_USERS[userKey] = { role: 'clinic', password: password, redirect: '/clinic' };
    return true;
}
