
import { z } from 'zod';

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
