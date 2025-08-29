'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';

import { signInWithEmailAndPassword } from 'firebase/auth';
import { doc, getDoc } from 'firebase/firestore';
import { auth, db } from '@/lib/firebase';

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
    // ✅ Direct Admin login (without Firebase)
    if (email === "admin123@gmail.com" && password === "admin123") {
      localStorage.setItem("isAdmin", "true");
      router.push('/admin');
      return; // Return here to prevent further execution
    }

    // 🔐 Normal Firebase auth
    const userCredential = await signInWithEmailAndPassword(auth, email, password);
    const user = userCredential.user;

    // 🔎 Role check in Firestore
    const patientDoc = await getDoc(doc(db, 'userRolepatients', user.uid));
    const clinicDoc = await getDoc(doc(db, 'userRoleclinics', user.uid));

    if (patientDoc.exists()) {
      router.push('/');  // Patient dashboard
    } else if (clinicDoc.exists()) {
      router.push('/clinic');    // Clinic dashboard
    } else {
      // If no role is found, it's an error. Display a message, don't redirect.
      console.warn("User has no assigned role. Redirecting to login to prevent loops.");
      // You can also sign them out here to be safe
      await auth.signOut();
      setError('Your account is not assigned a role. Please contact support.');
    }
  } catch (err: any) {
    console.error('Signin error:', err.message);
    let errorMessage = 'An unexpected error occurred. Please try again.';

    if (err.code === 'auth/invalid-credential') {
      errorMessage = 'Invalid email or password. Please try again.';
    } else if (err.code === 'auth/network-request-failed') {
      errorMessage = 'Network error. Please check your internet connection.';
    } else if (err.code === 'auth/user-not-found') {
      errorMessage = 'User not found. Please check your email or sign up.';
    }

    setError(errorMessage);
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

        <div className="mt-6 text-center text-sm">
          Don't have an account?{' '}
          <Link href="../signup" className="font-medium text-indigo-600 hover:text-indigo-500">
            Create a new account
          </Link>
        </div>
      </div>
    </div>
  );
}
