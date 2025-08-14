import * as admin from 'firebase-admin';
import { serviceAccount } from '@/lib/service-account';

let app: admin.app.App;

/**
 * Returns a guaranteed-to-be-initialized Firebase admin app instance.
 * This singleton pattern prevents duplicate app initializations.
 */
function getFirebaseAdmin() {
  if (!admin.apps.length) {
    try {
      // The serviceAccount object is now imported with the values already resolved.
      // This check ensures we don't try to initialize with an empty/invalid object.
      if (!serviceAccount || !serviceAccount.project_id) {
          throw new Error('Service account credentials are not loaded. Check your .env file and src/lib/service-account.ts');
      }

      app = admin.initializeApp({
        credential: admin.credential.cert(serviceAccount),
      });
      console.log("Firebase Admin SDK initialized successfully.");
    } catch (e: any) {
      console.error('Firebase Admin SDK initialization error', e.stack);
      // Re-throw the error to make it visible to the caller
      throw new Error(`Failed to initialize Firebase Admin SDK: ${e.message}`);
    }
  } else {
    app = admin.app();
  }
  return { auth: admin.auth(app), db: admin.firestore(app) };
}

// Export the function that provides access to the initialized services.
export const { auth: adminAuth, db: adminDb } = getFirebaseAdmin();
