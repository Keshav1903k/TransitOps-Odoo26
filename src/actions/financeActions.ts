'use server';

import { prisma } from '@/lib/db';
import { revalidatePath } from 'next/cache';
import { z } from 'zod';

const fuelLogSchema = z.object({
  vehicleId: z.string().min(1, 'Vehicle is required'),
  liters: z.number().positive('Liters must be positive'),
  cost: z.number().positive('Cost must be positive'),
  date: z.string().transform((str) => new Date(str)),
});

const expenseSchema = z.object({
  vehicleId: z.string().min(1, 'Vehicle is required'),
  type: z.string().min(1, 'Expense type is required'),
  amount: z.number().positive('Amount must be positive'),
  date: z.string().transform((str) => new Date(str)),
});

export async function addFuelLog(formData: FormData) {
  try {
    const rawData = {
      vehicleId: formData.get('vehicleId') as string,
      liters: Number(formData.get('liters')),
      cost: Number(formData.get('cost')),
      date: formData.get('date') as string,
    };

    const validated = fuelLogSchema.parse(rawData);

    await prisma.fuelLog.create({
      data: validated,
    });

    revalidatePath('/finance');
    return { success: true };
  } catch (err: any) {
    if (err instanceof z.ZodError) {
      return { error: err.issues.map((e) => e.message).join(', ') };
    }
    return { error: err.message || 'Failed to add fuel log.' };
  }
}

export async function addExpense(formData: FormData) {
  try {
    const rawData = {
      vehicleId: formData.get('vehicleId') as string,
      type: formData.get('type') as string,
      amount: Number(formData.get('amount')),
      date: formData.get('date') as string,
    };

    const validated = expenseSchema.parse(rawData);

    await prisma.expense.create({
      data: validated,
    });

    revalidatePath('/finance');
    return { success: true };
  } catch (err: any) {
    if (err instanceof z.ZodError) {
      return { error: err.issues.map((e) => e.message).join(', ') };
    }
    return { error: err.message || 'Failed to add expense.' };
  }
}
