
'use server';

/**
 * @fileOverview A flow for securely deleting a patient, which includes
 * deleting their Firebase Auth user and their Firestore document.
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

const DeletePatientInputSchema = z.object({
  uid: z.string().describe('The UID of the patient user to delete.'),
  clinicId: z.string().describe('The Firestore document ID of the clinic where the patient is enrolled.'),
});

export type DeletePatientInput = z.infer<typeof DeletePatientInputSchema>;

const DeletePatientOutputSchema = z.object({
  uid: z.string().describe("The UID of the deleted user."),
  message: z.string().describe("A confirmation message."),
});

export type DeletePatientOutput = z.infer<typeof DeletePatientOutputSchema>;

/**
 * Deletes a patient user from Firebase Authentication and their associated
 * document from Firestore.
 * @param input The patient's UID and their clinic's ID.
 * @returns A confirmation message.
 */
export async function deletePatient(input: DeletePatientInput): Promise<DeletePatientOutput> {
    return deletePatientFlow(input);
}

const deletePatientFlow = ai.defineFlow(
  {
    name: 'deletePatientFlow',
    inputSchema: DeletePatientInputSchema,
    outputSchema: DeletePatientOutputSchema,
  },
  async (input) => {
    try {
      // Step 1: Delete the user from Firebase Authentication
      await admin.auth().deleteUser(input.uid);
      
      // Step 2: Delete the patient document from Firestore
      const db = admin.firestore();
      const patientRef = db.collection('clinics').doc(input.clinicId).collection('patients').doc(input.uid);
      
      await patientRef.delete();

      return {
        uid: input.uid,
        message: `Successfully deleted patient (UID: ${input.uid}) and their data.`,
      };
    } catch (error: any) {
        console.error("Error deleting patient:", error);
        
        if (error.code === 'auth/user-not-found') {
            // If user doesn't exist in Auth, still try to delete from Firestore just in case
             try {
                const db = admin.firestore();
                const patientRef = db.collection('clinics').doc(input.clinicId).collection('patients').doc(input.uid);
                await patientRef.delete();
                return {
                    uid: input.uid,
                    message: `Patient auth account not found, but deleted Firestore record for UID: ${input.uid}.`,
                };
            } catch (fsError: any) {
                 throw new Error(`Patient with UID ${input.uid} not found in Authentication, and failed to delete from Firestore.`);
            }
        }
        
        throw new Error("An unexpected error occurred while deleting the patient.");
    }
  }
);
