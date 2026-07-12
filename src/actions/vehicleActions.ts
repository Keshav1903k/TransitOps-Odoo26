'use server';

import { prisma } from '@/lib/db';
import { revalidatePath } from 'next/cache';
import { z } from 'zod';

const vehicleSchema = z.object({
  registrationNumber: z.string().min(1, 'Registration number is required'),
  name: z.string().min(1, 'Name/Model is required'),
  type: z.string().min(1, 'Type (e.g. Van, Truck, Bike) is required'),
  maxLoadCapacity: z.number().positive('Max load capacity must be positive'),
  odometer: z.number().nonnegative('Odometer must be non-negative'),
  acquisitionCost: z.number().positive('Acquisition cost must be positive'),
  region: z.string().min(1, 'Region is required'),
});

export async function addVehicle(formData: FormData) {
  try {
    const rawData = {
      registrationNumber: formData.get('registrationNumber') as string,
      name: formData.get('name') as string,
      type: formData.get('type') as string,
      maxLoadCapacity: Number(formData.get('maxLoadCapacity')),
      odometer: Number(formData.get('odometer')),
      acquisitionCost: Number(formData.get('acquisitionCost')),
      region: formData.get('region') as string,
    };

    const validated = vehicleSchema.parse(rawData);

    // Check if registration number already exists
    const existing = await prisma.vehicle.findUnique({
      where: { registrationNumber: validated.registrationNumber },
    });

    if (existing) {
      return { error: 'A vehicle with this registration number already exists.' };
    }

    await prisma.vehicle.create({
      data: {
        ...validated,
        status: 'AVAILABLE',
      },
    });

    revalidatePath('/vehicles');
    return { success: true };
  } catch (err: any) {
    if (err instanceof z.ZodError) {
      return { error: err.issues.map((e) => e.message).join(', ') };
    }
    return { error: err.message || 'Failed to add vehicle.' };
  }
}
