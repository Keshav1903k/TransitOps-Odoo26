'use server';

import { prisma } from '@/lib/db';
import { revalidatePath } from 'next/cache';
import { z } from 'zod';

const driverSchema = z.object({
  name: z.string().min(1, 'Name is required'),
  licenseNumber: z.string().min(1, 'License number is required'),
  licenseCategory: z.string().min(1, 'License category is required'),
  licenseExpiryDate: z.string().transform((str) => new Date(str)),
  contactNumber: z.string().min(1, 'Contact number is required'),
  safetyScore: z.number().min(0).max(100).default(100),
});

export async function addDriver(formData: FormData) {
  try {
    const rawData = {
      name: formData.get('name') as string,
      licenseNumber: formData.get('licenseNumber') as string,
      licenseCategory: formData.get('licenseCategory') as string,
      licenseExpiryDate: formData.get('licenseExpiryDate') as string,
      contactNumber: formData.get('contactNumber') as string,
      safetyScore: Number(formData.get('safetyScore') || 100),
    };

    const validated = driverSchema.parse(rawData);

    // Check unique license number
    const existing = await prisma.driver.findUnique({
      where: { licenseNumber: validated.licenseNumber },
    });

    if (existing) {
      return { error: 'A driver with this license number already exists.' };
    }

    await prisma.driver.create({
      data: {
        ...validated,
        status: 'AVAILABLE',
      },
    });

    revalidatePath('/drivers');
    return { success: true };
  } catch (err: any) {
    if (err instanceof z.ZodError) {
      return { error: err.issues.map((e) => e.message).join(', ') };
    }
    return { error: err.message || 'Failed to add driver.' };
  }
}

export async function updateDriverSafetyScore(driverId: string, safetyScore: number) {
  try {
    if (safetyScore < 0 || safetyScore > 100) {
      return { error: 'Safety score must be between 0 and 100.' };
    }

    await prisma.driver.update({
      where: { id: driverId },
      data: { safetyScore },
    });

    revalidatePath('/drivers');
    return { success: true };
  } catch (err: any) {
    return { error: err.message || 'Failed to update safety score.' };
  }
}

export async function updateDriverStatus(driverId: string, status: 'AVAILABLE' | 'OFF_DUTY' | 'SUSPENDED') {
  try {
    await prisma.driver.update({
      where: { id: driverId },
      data: { status },
    });

    revalidatePath('/drivers');
    return { success: true };
  } catch (err: any) {
    return { error: err.message || 'Failed to update driver status.' };
  }
}
