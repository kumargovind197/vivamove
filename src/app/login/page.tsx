'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { collection, getDocs } from 'firebase/firestore';
import { db } from '@/lib/firebase';

type Clinic = {
  id: string;
  name: string;
  email: string;
  password: string;
  // add other fields if needed
};

export default function SigninPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const router = useRouter();
const handleSignin = async (e: React.FormEvent) => {
  e.preventDefault();
  setError('');
  setLoading(true);

  try {
    // ✅ Direct Admin login
    if (email === "admin123@gmail.com" && password === "admin123") {
      localStorage.setItem("isAdmin", "true");
      router.push('/admin');
      return;
    }

    // 🔎 Clinic Owner login
    const clinicsSnap = await getDocs(collection(db, "newClinics"));
    const clinics: Clinic[] = clinicsSnap.docs.map(
      doc => ({ id: doc.id, ...(doc.data() as Omit<Clinic, "id">) })
    );
    const foundClinic = clinics.find(
      (c) => c.email.trim().toLowerCase() === email.trim().toLowerCase() && c.password === password
    );
    if (foundClinic) {
      localStorage.setItem("clinicId", foundClinic.id);
      localStorage.setItem("clinicName", foundClinic.name);
      router.push(`/clinic`);
      return;
    }

     // 🔎 Patient login (only in 'wellness-clinic')
    const patientsSnap = await getDocs(collection(db, "clinics", "wellness-clinic", "patients"));
    const patients = patientsSnap.docs.map(doc => ({ id: doc.id, ...doc.data() }));
    const foundPatient = patients.find(
      (p: any) =>
        p.email?.trim().toLowerCase() === email.trim().toLowerCase() &&
        p.password === password
    );
    if (foundPatient) {
      localStorage.setItem("patientId", foundPatient.id);
      localStorage.setItem("clinicId", "wellness-clinic");
      router.push(`/`); // Change to your patient dashboard route
      return;
    
    }

    setError('Invalid email or password. Please try again.');
  } catch (err: any) {
    setError('An unexpected error occurred. Please try again.');
  } finally {
    setLoading(false);
  }
};
  return (
    <div className="flex min-h-screen items-center justify-center bg-gray-100 p-4">
      <div className="w-full max-w-lg rounded-xl bg-white p-8 shadow-lg">
        <div className="mb-8 text-center">
          <h2 className="text-3xl font-bold text-gray-900">Sign in to your Account </h2>
          <p className="mt-2 text-sm text-gray-600">Welcome back!</p>
        </div>

        {error && (
          <div className="mb-4 rounded-md bg-red-50 p-3 text-sm text-red-700">
            {error}
          </div>
        )}

        <form onSubmit={handleSignin} className="space-y-6">
          <div>
            <label htmlFor="email" className="block text-sm font-medium text-gray-700">
              Email Address
            </label>
            <input
              type="email"
              id="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              disabled={loading}
              className="mt-1 block w-full rounded-md border-gray-300 py-2 px-3 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
            />
          </div>

          <div>
            <label htmlFor="password" className="block text-sm font-medium text-gray-700">
              Password
            </label>
            <input
              type="password"
              id="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              disabled={loading}
              className="mt-1 block w-full rounded-md border-gray-300 py-2 px-3 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
            />
          </div>

          <div>
            <button
              type="submit"
              disabled={loading}
              className="w-full rounded-md border border-transparent bg-indigo-600 py-2 px-4 text-sm font-medium text-white shadow-sm transition-colors duration-200 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 disabled:cursor-not-allowed disabled:bg-indigo-300"
            >
              {loading ? 'Signing In...' : 'Sign In'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}