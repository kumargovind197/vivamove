
import * as admin from 'firebase-admin';

let app: admin.app.App;

export function getFirebaseAdmin() {
  if (app) {
    return app;
  }

  // This is required for the Vercel/Next.js environment
  // It loads the .env.local file for local development.
  if (process.env.NODE_ENV !== 'production') {
    require('dotenv').config({ path: '.env' });
  }

  const privateKey = process.env.FIREBASE_PRIVATE_KEY;
  const projectId = process.env.FIREBASE_PROJECT_ID;
  const clientEmail = process.env.FIREBASE_CLIENT_EMAIL;

  if (!privateKey || !projectId || !clientEmail) {
    throw new Error("FIREBASE_PROJECT_ID, FIREBASE_CLIENT_EMAIL, and FIREBASE_PRIVATE_KEY must be set in the environment variables.");
  }
  
  const serviceAccount: admin.ServiceAccount = {
    projectId: projectId,
    clientEmail: clientEmail,
    // The private key must be correctly formatted with newlines
    privateKey: privateKey.replace(/\\n/g, '\n')
  };

  if (!admin.apps.length) {
    try {
      app = admin.initializeApp({
        credential: admin.credential.cert(serviceAccount),
      });
    } catch (e: any) {
      console.error('Firebase Admin SDK initialization error', e.stack);
      // Re-throw a more specific error to help with debugging
      if (e.message.includes("Failed to parse private key")) {
          throw new Error("Failed to parse Firebase private key. Ensure it is correctly formatted in the .env file, including the -----BEGIN and -----END lines.");
      }
      throw new Error(`Failed to initialize Firebase Admin SDK: ${e.message}`);
    }
  } else {
    app = admin.app();
  }
  return app;
}
