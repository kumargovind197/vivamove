
'use server';

import { createClinic as createClinicFlow, CreateClinicInput } from "@/ai/flows/create-clinic-flow";

export async function createClinic(input: CreateClinicInput) {
    return await createClinicFlow(input);
}
