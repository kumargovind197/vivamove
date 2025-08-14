
'use server';

import { createClinic as createClinicFlow, CreateClinicInput } from "@/ai/flows/create-clinic-flow";
import { createPatient as createPatientFlow, CreatePatientInput } from "@/ai/flows/create-patient-flow";
import { deletePatient as deletePatientFlow, DeletePatientInput } from "@/ai/flows/delete-patient-flow";
import { setAdminRole as setAdminRoleFlow, SetAdminRoleInput } from "@/ai/flows/set-admin-role-flow";

export async function createClinic(input: CreateClinicInput) {
    return await createClinicFlow(input);
}

export async function createPatient(input: CreatePatientInput) {
    return await createPatientFlow(input);
}

export async function deletePatient(input: DeletePatientInput) {
    return await deletePatientFlow(input);
}

export async function setAdminRole(input: SetAdminRoleInput) {
    return await setAdminRoleFlow(input);
}
