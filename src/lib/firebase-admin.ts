
import * as admin from 'firebase-admin';
import { serviceAccount } from '@/lib/service-account';

// This file provides a centralized, guaranteed-to-be-initialized Firebase Admin instance.

if (!admin.apps.length) {
  try {
    admin.initializeApp({
      credential: admin.credential.cert(serviceAccount),
    });
    console.log("Firebase Admin SDK initialized successfully.");
  } catch (e: any) {
    console.error('Firebase Admin SDK initialization error', e.stack);
  }
}

export const adminAuth = admin.auth();
export const adminDb = admin.firestore();
