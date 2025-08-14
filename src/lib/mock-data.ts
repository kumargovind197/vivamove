
"use client";

import type { MockUser, Clinic, Patient, Ad } from './types';

// ====================================================================
// In-memory "database" for the prototype.
// This data will reset on every page refresh.
// ====================================================================

// --- AUTHENTICATION ---

export const MOCK_USERS: MockUser[] = [
  { 
    uid: 'admin-01', 
    email: 'admin@vivamove.com', 
    displayName: 'Admin User',
    password: 'password',
    claims: { admin: true } 
  },
  { 
    uid: 'clinic-01', 
    email: 'clinic@vivamove.com', 
    displayName: 'Dr. Evelyn Reed',
    password: 'password',
    claims: { clinic: true, clinicId: 'wellness-clinic' } 
  },
  { 
    uid: 'patient-01', 
    email: 'patient@vivamove.com', 
    displayName: 'John Doe',
    password: 'password',
    claims: { clinicId: 'wellness-clinic' }
  },
];

export function getMockUserByEmail(email: string): MockUser | undefined {
    return MOCK_USERS.find(user => user.email.toLowerCase() === email.toLowerCase());
}


// --- CLINICS & PATIENTS ---

let MOCK_CLINICS: Clinic[] = [
    { 
        id: 'wellness-clinic', 
        name: 'Wellness Clinic', 
        logo: 'https://placehold.co/200x80.png',
        capacity: 100,
        adsEnabled: true,
        email: 'clinic@vivamove.com'
    },
    { 
        id: 'city-health-group', 
        name: 'City Health Group', 
        logo: 'https://placehold.co/200x80.png',
        capacity: 50,
        adsEnabled: false,
        email: 'cityhealth@example.com'
    },
];

let MOCK_PATIENTS: Record<string, Patient[]> = {
    'wellness-clinic': [
        { id: 'patient-123', uhid: 'UHID-001', firstName: 'John', surname: 'Doe', email: 'john.d@example.com', age: 45, gender: 'Male', weeklySteps: 85, weeklyMinutes: 90, monthlySteps: 75, monthlyMinutes: 80 },
        { id: 'patient-456', uhid: 'UHID-002', firstName: 'Jane', surname: 'Smith', email: 'jane.s@example.com', age: 34, gender: 'Female', weeklySteps: 45, weeklyMinutes: 50, monthlySteps: 60, monthlyMinutes: 65 },
        { id: 'patient-789', uhid: 'UHID-003', firstName: 'Sam', surname: 'Jones', email: 'sam.j@example.com', age: 52, gender: 'Other', weeklySteps: 25, weeklyMinutes: 30, monthlySteps: 40, monthlyMinutes: 35 },
    ],
    'city-health-group': [
        { id: 'patient-abc', uhid: 'UHID-101', firstName: 'Peter', surname: 'Pan', email: 'peter.p@example.com', age: 28, gender: 'Male', weeklySteps: 95, weeklyMinutes: 92, monthlySteps: 88, monthlyMinutes: 85 },
    ]
};

// Clinic Management
export function getClinics(): Clinic[] {
    return [...MOCK_CLINICS];
}

export function getClinicData(id: string): Clinic | null {
    return MOCK_CLINICS.find(c => c.id === id) || null;
}

export function createClinic(clinicData: Omit<Clinic, 'id'>) {
    const newId = clinicData.name.toLowerCase().replace(/\s+/g, '-') + `-${Math.random().toString(36).substr(2, 5)}`;
    const newUser: MockUser = {
        uid: newId,
        email: clinicData.email,
        displayName: `Staff at ${clinicData.name}`,
        password: 'password', // Default password for mock user
        claims: { clinic: true, clinicId: newId }
    };
    MOCK_USERS.push(newUser);
    
    const newClinic: Clinic = { ...clinicData, id: newId };
    MOCK_CLINICS.push(newClinic);
    MOCK_PATIENTS[newId] = [];
}

export function updateClinic(id: string, updatedData: Clinic) {
    const index = MOCK_CLINICS.findIndex(c => c.id === id);
    if (index !== -1) {
        MOCK_CLINICS[index] = updatedData;
    } else {
        throw new Error("Clinic not found");
    }
}

export function deleteClinic(id: string) {
    MOCK_CLINICS = MOCK_CLINICS.filter(c => c.id !== id);
    delete MOCK_PATIENTS[id];
}

// Patient Management
export function getPatientsForClinic(clinicId: string): Patient[] {
    return MOCK_PATIENTS[clinicId] || [];
}

export function getPatientById(clinicId: string, patientId: string): Patient | null {
    const patients = MOCK_PATIENTS[clinicId] || [];
    return patients.find(p => p.id === patientId) || null;
}

export function addPatientToClinic(clinicId: string, patientData: Omit<Patient, 'id'>) {
    if (!MOCK_PATIENTS[clinicId]) {
        throw new Error("Clinic not found");
    }
    const newId = `patient-${Math.random().toString(36).substr(2, 9)}`;
    const newPatient: Patient = { 
        ...patientData, 
        id: newId,
        weeklySteps: Math.floor(Math.random() * 101),
        weeklyMinutes: Math.floor(Math.random() * 101),
        monthlySteps: Math.floor(Math.random() * 101),
        monthlyMinutes: Math.floor(Math.random() * 101),
    };

    const newUser: MockUser = {
        uid: newId,
        email: patientData.email,
        displayName: `${patientData.firstName} ${patientData.surname}`,
        password: 'password', // Default password
        claims: { clinicId }
    };

    MOCK_USERS.push(newUser);
    MOCK_PATIENTS[clinicId].push(newPatient);
}

export function updatePatientInClinic(clinicId: string, patientId: string, updatedData: Patient) {
    const clinicPatients = MOCK_PATIENTS[clinicId];
    if (!clinicPatients) {
        throw new Error("Clinic not found");
    }
    const index = clinicPatients.findIndex(p => p.id === patientId);
    if (index !== -1) {
        clinicPatients[index] = updatedData;
    } else {
        throw new Error("Patient not found");
    }
}

export function removePatientFromClinic(clinicId: string, patientId: string) {
     if (!MOCK_PATIENTS[clinicId]) {
        throw new Error("Clinic not found");
    }
    MOCK_PATIENTS[clinicId] = MOCK_PATIENTS[clinicId].filter(p => p.id !== patientId);
}


// --- ADVERTISEMENTS ---

let MOCK_ADS = {
    popupAds: [
        {
            id: 'popup1',
            imageUrl: 'https://placehold.co/400x300.png',
            description: 'A sample pop-up ad',
            targetUrl: 'https://example.com'
        }
    ],
    footerAds: [
        {
            id: 'footer1',
            imageUrl: 'https://placehold.co/728x90.png',
            description: 'A sample footer ad',
            targetUrl: 'https://example.com'
        }
    ]
};

export function getAds(): { popupAds: Ad[], footerAds: Ad[] } {
    return JSON.parse(JSON.stringify(MOCK_ADS));
}

export function updateAds(newAds: { popupAds: Ad[], footerAds: Ad[] }) {
    MOCK_ADS = JSON.parse(JSON.stringify(newAds));
}
