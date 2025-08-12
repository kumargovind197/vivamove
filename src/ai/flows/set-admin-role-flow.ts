'use server';
/**
 * @fileOverview A flow for securely setting admin custom claims on a Firebase user.
 */

import { ai } from '@/ai/genkit';
import { z } from 'genkit';
import * as admin from 'firebase-admin';
import { PRIMARY_ADMINS } from '@/lib/admin-config';
import { auth } from 'firebase-admin';

// Helper function to initialize Firebase Admin SDK only once.
function getFirebaseAdminApp() {
  if (admin.apps.length > 0) {
    return admin.apps[0]!;
  }
  // Initialize without arguments to use Application Default Credentials
  return admin.initializeApp();
}

const SetAdminRoleInputSchema = z.object({
  email: z.string().email().describe('The email address of the user to make an admin.'),
});
export type SetAdminRoleInput = z.infer<typeof SetAdminRoleInputSchema>;

const SetAdminRoleOutputSchema = z.object({
  message: z.string().optional(),
  error: z.string().optional(),
});
export type SetAdminRoleOutput = z.infer<typeof SetAdminRoleOutputSchema>;

// This is the exported function that the client-side component will call.
export async function setAdminRole(input: SetAdminRoleInput): Promise<SetAdminRoleOutput> {
  return setAdminRoleFlow(input);
}

const setAdminRoleFlow = ai.defineFlow(
  {
    name: 'setAdminRoleFlow',
    inputSchema: SetAdminRoleInputSchema,
    outputSchema: SetAdminRoleOutputSchema,
    auth: (auth, input) => {
        // SECURITY CHECK:
        // Ensure the calling user is one of the designated primary admins.
        const callingUserEmail = auth?.email;
        if (!callingUserEmail || !PRIMARY_ADMINS.includes(callingUserEmail)) {
            throw new Error('You are not authorized to perform this action.');
        }
    },
  },
  async (input) => {
    try {
      getFirebaseAdminApp();
      const user = await admin.auth().getUserByEmail(input.email);
      await admin.auth().setCustomUserClaims(user.uid, { admin: true });
      return { message: `Success! ${input.email} has been made an admin.` };
    } catch (error: any) {
      console.error('Error in setAdminRoleFlow:', error);
      
      let errorMessage = 'An unexpected error occurred.';
      if (error.code === 'auth/user-not-found') {
          errorMessage = 'User with this email does not exist. Please create the user first.';
      } else if (error.message) {
          errorMessage = error.message;
      }
      
      return { error: errorMessage };
    }
  }
);
