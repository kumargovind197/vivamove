
'use server';
/**
 * @fileOverview A flow for setting admin custom claims on a Firebase user.
 * 
 * - setAdminRole - A function that sets a custom claim on a user's auth token.
 */

import { ai } from '@/ai/genkit';
import { z } from 'genkit';
import { initializeApp, getApps, getApp } from 'firebase-admin/app';
import { getAuth } from 'firebase-admin/auth';

const SetAdminRoleInputSchema = z.object({
    email: z.string().email().describe('The email address of the user to make an admin.'),
});
export type SetAdminRoleInput = z.infer<typeof SetAdminRoleInputSchema>;

// Initialize Firebase Admin SDK if it hasn't been already.
if (getApps().length === 0) {
  initializeApp();
}

const setAdminRoleFlow = ai.defineFlow(
    {
        name: 'setAdminRoleFlow',
        inputSchema: SetAdminRoleInputSchema,
        outputSchema: z.object({ success: z.boolean(), message: z.string() }),
    },
    async (input) => {
        try {
            const auth = getAuth();

            const user = await auth.getUserByEmail(input.email);
            if (!user) {
                throw new Error(`User with email ${input.email} not found.`);
            }

            // Set custom user claims
            await auth.setCustomUserClaims(user.uid, { admin: true });

            return {
                success: true,
                message: `Successfully set admin role for ${input.email}.`,
            };
        } catch (error: any) {
            console.error('Error setting admin role:', error);
            // It's important to not leak detailed error messages to the client
            return {
                success: false,
                message: error.message || 'An unexpected error occurred while setting the admin role.',
            };
        }
    }
);

export async function setAdminRole(input: SetAdminRoleInput): Promise<{ success: boolean; message: string }> {
  return await setAdminRoleFlow(input);
}
