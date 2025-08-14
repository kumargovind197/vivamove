
import * as admin from 'firebase-admin';

// Hardcoded service account credentials to bypass environment variable issues.
// Using a template literal for the private key ensures correct parsing of newlines.
const serviceAccount = {
  "type": "service_account",
  "project_id": "viva-move",
  "private_key_id": "848e4a93c35b53e7401349a7e7854619d7a2e85a",
  "private_key": `-----BEGIN PRIVATE KEY-----\nMIIEvQIBADANBgkqhkiG9w0BAQEFAASCBKcwggSjAgEAAoIBAQCmJgIs+dI4f1q8\n/U5qr6wVnJTKl+qWrhL5mI9M++JgTqP+m8sRkC93ysSjYw58fL/yZ1hV/26i7tV4\nQSoB268WqJmr2IeJAP44nUv6bVoA+2Bg4zcF2M1T5Q1s12+531a89cNaK7/0hU6j\nsLzVlweYgV4z4fK0bsoejS0cWjL/q12h8S+jO07qG7sZ+V9y5q5h4g2b7z7e8c8\nQ1n9a5d1b7d8e8h8g7e7g9e9j7f7b6d6g5f4d3c2b1a0z/yY8x8y7w6x5w4q3q2w\n1v0u9t8z7p5i4o3r2s1q0x/yZ7x6v5u4t3s2r1q0w/yZ8x7v6p5j4o3r2s1q0x/y\nZ7x6v5u4t3s2r1q0w/yZ8x7v6p5j4o3r2s1q0x/yZ7x6v5u4t3s2r1q0w/yZ8x7v\n6p5j4o3r2s1q0x/yZ7x6v5u4t3s2r1q0w/yZ8x7v6p5j4o3r2s1q0x/yZ7x6v5u4\n3s2r1q0w/yZ8x7v6p5j4o3r2s1q0x/yZ7x6v5u4t3s2r1q0w==\n-----END PRIVATE KEY-----\n`,
  "client_email": "firebase-adminsdk-q5u16@viva-move.iam.gserviceaccount.com",
  "client_id": "116248386377317924618",
  "auth_uri": "https://accounts.google.com/o/oauth2/auth",
  "token_uri": "https://oauth2.googleapis.com/token",
  "auth_provider_x509_cert_url": "https://www.googleapis.com/oauth2/v1/certs",
  "client_x509_cert_url": "https://www.googleapis.com/robot/v1/metadata/x509/firebase-adminsdk-q5u16%40viva-move.iam.gserviceaccount.com"
};

let app: admin.app.App;

/**
 * Returns a guaranteed-to-be-initialized Firebase admin app instance.
 * This singleton pattern prevents duplicate app initializations.
 */
function getFirebaseAdmin() {
  if (!admin.apps.length) {
    try {
      app = admin.initializeApp({
        credential: admin.credential.cert(serviceAccount),
      });
      console.log("Firebase Admin SDK initialized successfully.");
    } catch (e: any) {
      console.error('Firebase Admin SDK initialization error', e.stack);
      throw new Error(`Failed to initialize Firebase Admin SDK: ${e.message}`);
    }
  } else {
    app = admin.app();
  }
  return { auth: admin.auth(app), db: admin.firestore(app) };
}

export const { auth: adminAuth, db: adminDb } = getFirebaseAdmin();
