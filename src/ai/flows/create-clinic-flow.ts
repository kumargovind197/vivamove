
'use server';

/**
 * @fileOverview A flow for an admin to create a new clinic, which includes
 * creating a Firebase Auth user, setting a 'clinic' custom claim, and creating
 * a corresponding Firestore document for the clinic's data.
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

const ClinicDataSchema = z.object({
  name: z.string().describe("The clinic's official name."),
  logo: z.string().url().optional().describe("A URL to the clinic's logo image."),
  capacity: z.number().int().positive().describe("The maximum number of patients the clinic can manage."),
  adsEnabled: z.boolean().describe("Whether the advertising module is enabled for this clinic's patients."),
});

const CreateClinicInputSchema = z.object({
  email: z.string().email().describe('The email for the new clinic user.'),
  password: z.string().min(6).describe('A temporary password for the new clinic user.'),
  name: z.string().describe("The clinic's official name."),
  logo: z.string().url().optional().describe("A URL to the clinic's logo image."),
  capacity: z.number().int().positive().describe("The maximum number of patients the clinic can manage."),
  adsEnabled: z.boolean().describe("Whether the advertising module is enabled for this clinic's patients."),
});

export type CreateClinicInput = z.infer<typeof CreateClinicInputSchema>;

const CreateClinicOutputSchema = z.object({
  uid: z.string().describe("The UID of the newly created clinic user."),
  email: z.string().describe("The email of the newly created clinic user."),
  message: z.string().describe("A confirmation message."),
});

export type CreateClinicOutput = z.infer<typeof CreateClinicOutputSchema>;

/**
 * Creates a new clinic user in Firebase Authentication and an associated
 * clinic document in Firestore. This flow should be protected and only be
 * callable by an existing administrator.
 * @param input The clinic's details.
 * @returns A confirmation message with the new clinic's UID.
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
    try {
      // Step 1: Create the user in Firebase Authentication
      const userRecord = await admin.auth().createUser({
        email: input.email,
        password: input.password,
        displayName: input.name,
      });
      
      // Step 2: Set a custom claim to identify the user as a clinic administrator
      await admin.auth().setCustomUserClaims(userRecord.uid, { clinic: true });
      
      // Step 3: Create the clinic document in Firestore, using the user's UID as the document ID
      const db = admin.firestore();
      const clinicRef = db.collection('clinics').doc(userRecord.uid);
      
      const clinicData = {
          name: input.name,
          logo: input.logo || `https://placehold.co/200x80.png?text=${encodeURIComponent(input.name)}`, // Default placeholder
          capacity: input.capacity,
          adsEnabled: input.adsEnabled,
      };

      await clinicRef.set(clinicData);

      return {
        uid: userRecord.uid,
        email: userRecord.email!,
        message: `Successfully created and enrolled clinic: ${input.name}.`,
      };
    } catch (error: any) {
        console.error("Error creating clinic:", error);
        
        // Clean up partially created user if Firestore write fails or other errors occur
        if (error.uid) {
            await admin.auth().deleteUser(error.uid).catch(e => console.error("Cleanup failed for user:", error.uid, e));
        }
        
        if (error.code === 'auth/email-already-exists') {
            throw new Error(`A user with the email ${input.email} already exists.`);
        }
        
        throw new Error("An unexpected error occurred while creating the clinic.");
    }
  }
);

    