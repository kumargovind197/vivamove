
'use server';

/**
 * @fileOverview A flow for securely setting admin custom claims on a user.
 *
 * - setAdminRole - A function that grants admin privileges to a user by their email.
 */
import { ai } from '@/ai/genkit';
import { z } from 'zod';
import * as admin from 'firebase-admin';

// Initialize Firebase Admin SDK if not already initialized.
// This ensures it's ready when any flow in this file is called.
if (!admin.apps.length) {
    admin.initializeApp({
      credential: admin.credential.applicationDefault(),
    });
}

const SetAdminRoleInputSchema = z.object({
  email: z.string().email().describe('The email address of the user to grant admin privileges.'),
});

export type SetAdminRoleInput = z.infer<typeof SetAdminRoleInputSchema>;

const SetAdminRoleOutputSchema = z.object({
  uid: z.string().describe("The UID of the user who was made an admin."),
  email: z.string().describe("The email of the user who was made an admin."),
  message: z.string().describe("A confirmation message."),
});

export type SetAdminRoleOutput = z.infer<typeof SetAdminRoleOutputSchema>;


/**
 * Sets a custom claim on a Firebase user to grant them admin privileges.
 * This flow should be protected and only be callable by an existing administrator.
 * @param input - The user's email address.
 * @returns A confirmation message.
 */
export async function setAdminRole(input: SetAdminRoleInput): Promise<SetAdminRoleOutput> {
    return setAdminRoleFlow(input);
}


const setAdminRoleFlow = ai.defineFlow(
  {
    name: 'setAdminRoleFlow',
    inputSchema: SetAdminRoleInputSchema,
    outputSchema: SetAdminRoleOutputSchema,
  },
  async (input) => {
    try {
      const userRecord = await admin.auth().getUserByEmail(input.email);
      
      await admin.auth().setCustomUserClaims(userRecord.uid, { admin: true });

      return {
        uid: userRecord.uid,
        email: userRecord.email!,
        message: `Successfully granted admin privileges to ${userRecord.email}.`,
      };
    } catch (error: any) {
        console.error("Error setting admin role:", error);
        if (error.code === 'auth/user-not-found') {
            throw new Error(`User with email ${input.email} not found.`);
        }
        throw new Error("An unexpected error occurred while setting the admin role.");
    }
  }
);
