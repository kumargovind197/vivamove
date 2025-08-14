
'use server';

import { ai } from '@/ai/genkit';
import { getFirebaseAdmin } from '@/lib/firebase-admin';
import { z } from 'zod';

/**
 * @fileoverview A flow for setting custom claims on a Firebase user.
 * This is a secure server-side operation that uses the Firebase Admin SDK.
 */

export const SetAdminRoleInputSchema = z.object({
  email: z.string().email('Invalid email address.'),
  claims: z.record(z.any()).describe('The custom claims to set.'),
});

export const SetAdminRoleOutputSchema = z.object({
  success: z.boolean(),
  message: z.string(),
  uid: z.string().optional(),
});

export const setAdminRole = ai.defineFlow(
  {
    name: 'setAdminRoleFlow',
    inputSchema: SetAdminRoleInputSchema,
    outputSchema: SetAdminRoleOutputSchema,
  },
  async ({ email, claims }) => {
    try {
      const adminAuth = getFirebaseAdmin().auth();
      const user = await adminAuth.getUserByEmail(email);
      
      if (!user) {
        throw new Error(`User with email ${email} not found.`);
      }

      await adminAuth.setCustomUserClaims(user.uid, claims);
      
      return {
        success: true,
        message: `Successfully set custom claims for ${email}.`,
        uid: user.uid,
      };
    } catch (error: any) {
      console.error('Error setting custom claims:', error);
      // It's important to throw the error message back to the caller
      // so it can be displayed in the UI.
      throw new Error(error.message || 'An unexpected error occurred while setting user role.');
    }
  }
);
