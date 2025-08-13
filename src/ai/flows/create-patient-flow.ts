
'use server';

/**
 * @fileOverview A flow for securely creating a new patient, which includes
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

const PatientDataSchema = z.object({
    uhid: z.string().describe("The patient's unique health ID."),
    firstName: z.string().describe("The patient's first name."),
    surname: z.string().describe("The patient's surname."),
    email: z.string().email().describe("The patient's email address."),
    age: z.number().int().positive().describe("The patient's age."),
    gender: z.string().describe("The patient's gender."),
});

const CreatePatientInputSchema = z.object({
  email: z.string().email().describe('The email for the new patient user.'),
  password: z.string().min(6).describe('A temporary password for the new user.'),
  displayName: z.string().describe('The full name of the patient.'),
  clinicId: z.string().describe('The Firestore document ID of the clinic enrolling the patient.'),
  patientData: PatientDataSchema.describe("The patient's details to be stored in Firestore."),
});

export type CreatePatientInput = z.infer<typeof CreatePatientInputSchema>;

const CreatePatientOutputSchema = z.object({
  uid: z.string().describe("The UID of the newly created user."),
  email: z.string().describe("The email of the newly created user."),
  message: z.string().describe("A confirmation message."),
});

export type CreatePatientOutput = z.infer<typeof CreatePatientOutputSchema>;


/**
 * Creates a new patient user in Firebase Authentication and an associated
 * patient document in Firestore.
 * @param input The patient's details.
 * @returns A confirmation message with the new user's UID.
 */
export async function createPatient(input: CreatePatientInput): Promise<CreatePatientOutput> {
    return createPatientFlow(input);
}


const createPatientFlow = ai.defineFlow(
  {
    name: 'createPatientFlow',
    inputSchema: CreatePatientInputSchema,
    outputSchema: CreatePatientOutputSchema,
  },
  async (input) => {
    try {
      // Step 1: Create the user in Firebase Authentication
      const userRecord = await admin.auth().createUser({
        email: input.email,
        password: input.password,
        displayName: input.displayName,
        emailVerified: false, // Or true, depending on your flow
      });
      
      // Step 2: Set a custom claim to link the user to their clinic
      await admin.auth().setCustomUserClaims(userRecord.uid, { clinicId: input.clinicId, patient: true });
      
      // Step 3: Create the patient document in the clinic's sub-collection in Firestore
      const db = admin.firestore();
      const patientRef = db.collection('clinics').doc(input.clinicId).collection('patients').doc(userRecord.uid);
      
      await patientRef.set(input.patientData);

      return {
        uid: userRecord.uid,
        email: userRecord.email!,
        message: `Successfully created patient ${input.displayName}.`,
      };
    } catch (error: any) {
        console.error("Error creating patient:", error);
        if (error.code === 'auth/email-already-exists') {
            throw new Error(`A user with the email ${input.email} already exists.`);
        }
        // Clean up partially created user if Firestore write fails
        if (error.uid) {
            await admin.auth().deleteUser(error.uid).catch(e => console.error("Cleanup failed for user:", error.uid, e));
        }
        throw new Error("An unexpected error occurred while creating the patient.");
    }
  }
);
