
'use server';

import { setAdminRole as setAdminRoleFlow } from "@/ai/flows/set-admin-role-flow";
import type { SetAdminRoleInput } from '@/lib/types';


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
