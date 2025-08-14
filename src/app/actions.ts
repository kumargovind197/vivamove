
'use server';

import { z } from 'zod';
import { setAdminRole as setAdminRoleFlow } from "@/ai/flows/set-admin-role-flow";


export const SetAdminRoleInputSchema = z.object({
  email: z.string().email('Invalid email address.'),
  claims: z.record(z.any()).describe('The custom claims to set.'),
});
export type SetAdminRoleInput = z.infer<typeof SetAdminRoleInputSchema>;


export const SetAdminRoleOutputSchema = z.object({
  success: z.boolean(),
  message: z.string(),
  uid: z.string().optional(),
});
export type SetAdminRoleOutput = z.infer<typeof SetAdminRoleOutputSchema>;


export async function setCustomUserClaims(email: string, claims: object) {
  console.log(`Attempting to set custom claims for ${email}:`, claims);
  try {
    const input: SetAdminRoleInput = { email, claims };
    const result = await setAdminRoleFlow(input);
    if (!result.success) {
        throw new Error(result.message);
    }
    return { success: true, message: `Claims for ${email} have been set.` };
  } catch(e) {
    console.error("Error in setCustomUserClaims action:", e);
    return { success: false, message: (e as Error).message };
  }
}

export async function placeholderAction() {
    // This is a placeholder to avoid build errors.
    console.log("Placeholder action executed.");
    return { message: "No server actions are currently configured." };
}
