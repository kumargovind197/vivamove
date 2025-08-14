
import * as admin from 'firebase-admin';

let app: admin.app.App;

export function getFirebaseAdmin() {
  if (app) {
    return app;
  }

  // Ensure environment variables are loaded (especially for local development)
  require('dotenv').config({ path: '.env' });

  const privateKey = process.env.FIREBASE_PRIVATE_KEY;
  if (!privateKey) {
    throw new Error("FIREBASE_PRIVATE_KEY is not set in the environment variables.");
  }
  
  const serviceAccount: admin.ServiceAccount = {
    projectId: process.env.FIREBASE_PROJECT_ID,
    clientEmail: process.env.FIREBASE_CLIENT_EMAIL,
    // Replace the escaped newlines with actual newlines
    privateKey: privateKey.replace(/\\n/g, '\n')
  };

  if (!admin.apps.length) {
    try {
      app = admin.initializeApp({
        credential: admin.credential.cert(serviceAccount),
      });
    } catch (e: any) {
      console.error('Firebase Admin SDK initialization error', e.stack);
      throw new Error(`Failed to initialize Firebase Admin SDK: ${e.message}`);
    }
  } else {
    app = admin.app();
  }
  return app;
}
