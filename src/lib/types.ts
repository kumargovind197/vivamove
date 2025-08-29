
export type MockUser = {
  uid: string;
  
  email: string;
  displayName: string;
  password?: string; // Should not be sent to client in real app
  claims: {
    admin?: boolean;
    clinic?: boolean;
    clinicId?: string;
  };
};

export type Clinic = {
  id: string;
  name: string;
  logo: string;
  capacity: number;
  adsEnabled: boolean;
  email: string; // The login email for the main clinic user
};

export type Patient = { 
  id: string;
  uhid: string; 
  firstName: string; 
  surname: string; 
  email: string; 
  age: number; 
  gender: string; 
  weeklySteps?: number;
  weeklyMinutes?: number; 
  monthlySteps?: number;
  monthlyMinutes?: number; 
};

export type Ad = {
  id: string;
  imageUrl: string;
  description: string;
  targetUrl: string;
};

export type ClinicData = {
    id: string;
    name: string;
    logo: string;
    adsEnabled: boolean;
};
