
'use server';

import { createPatient as createPatientFlow, CreatePatientInput } from "@/ai/flows/create-patient-flow";
import { deletePatient as deletePatientFlow, DeletePatientInput } from "@/ai/flows/delete-patient-flow";
import { setAdminRole as setAdminRoleFlow, SetAdminRoleInput } from "@/ai/flows/set-admin-role-flow";

// NOTE: createClinic flow has been removed to implement a more direct, client-side approach for reliability.

export async function createPatient(input: CreatePatientInput) {
    return await createPatientFlow(input);
}

export async function deletePatient(input: DeletePatientInput) {
    return await deletePatientFlow(input);
}

export async function setAdminRole(input: SetAdminRoleInput) {
    return await setAdminRoleFlow(input);
}
