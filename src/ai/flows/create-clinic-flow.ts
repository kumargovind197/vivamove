
'use server';

/**
 * @fileOverview A flow for securely creating a new clinic, which includes
 * creating a Firebase Auth user and a corresponding Firestore document.
 */
import { ai } from '@/ai/genkit';
import { z } from 'zod';
import * as admin from 'firebase-admin';
import { serviceAccount } from '@/lib/service-account';


// Initialize Firebase Admin SDK if not already initialized
if (!admin.apps.length) {
  try {
    admin.initializeApp({
      credential: admin.credential.cert(serviceAccount),
    });
  } catch (e) {
    console.error('Firebase admin initialization error', e);
  }
}

const CreateClinicInputSchema = z.object({
  name: z.string().describe('The name of the new clinic.'),
  email: z.string().email().describe('The email for the new clinic user.'),
  password: z.string().min(6).describe('A temporary password for the new user.'),
  logo: z.string().optional().describe("A data URL of the clinic's logo image."),
  capacity: z.number().int().positive().describe('The maximum number of patients the clinic can enroll.'),
  adsEnabled: z.boolean().describe('Whether the advertising module is enabled for this clinic.'),
});

export type CreateClinicInput = z.infer<typeof CreateClinicInputSchema>;

const CreateClinicOutputSchema = z.object({
  uid: z.string().describe("The UID of the newly created clinic user."),
  email: z.string().describe("The email of the newly created clinic."),
  message: z.string().describe("A confirmation message."),
});

export type CreateClinicOutput = z.infer<typeof CreateClinicOutputSchema>;


/**
 * Creates a new clinic user in Firebase Authentication and a corresponding
 * clinic document in Firestore.
 * @param input The clinic's details.
 * @returns A confirmation message with the new user's UID.
 */
export async function createClinic(input: CreateClinicInput): Promise<CreateClinicOutput> {
    return createClinicFlow(input);
}


const createClinicFlow = ai.defineFlow(
  {
    name: 'createClinicFlow',
    inputSchema: CreateClinicInputSchema,
    outputSchema: CreateClinicOutputSchema,
  },
  async (input) => {
    let userRecord;
    try {
      // Step 1: Create the user in Firebase Authentication
      userRecord = await admin.auth().createUser({
        email: input.email,
        password: input.password,
        displayName: input.name,
        emailVerified: false, 
      });
      
      // Step 2: Set a custom claim to identify the user as a clinic
      await admin.auth().setCustomUserClaims(userRecord.uid, { clinic: true });
      
      // Step 3: Create the clinic document in Firestore
      const db = admin.firestore();
      const clinicRef = db.collection('clinics').doc(userRecord.uid);
      
      // Explicitly create the object for Firestore, excluding auth details
      const { email, password, ...clinicData } = input;
      const placeholderLogo = 'https://placehold.co/200x80.png';

      await clinicRef.set({
          ...clinicData,
          logo: clinicData.logo || placeholderLogo, // Use uploaded logo or placeholder
      });

      return {
        uid: userRecord.uid,
        email: userRecord.email!,
        message: `Successfully created clinic ${input.name}.`,
      };
    } catch (error: any) {
        console.error("Error creating clinic:", error);
        
        // Clean up partially created user if any step fails after user creation
        if (userRecord && userRecord.uid) {
            await admin.auth().deleteUser(userRecord.uid).catch(e => console.error("Cleanup failed for user:", userRecord.uid, e));
        }

        if (error.code === 'auth/email-already-exists') {
            throw new Error(`A user with the email ${input.email} already exists.`);
        }
        
        throw new Error("An unexpected error occurred while creating the clinic.");
    }
  }
);
