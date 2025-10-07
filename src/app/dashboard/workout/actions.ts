'use server';

import { z } from 'zod';
import { createWorkout } from '@/data/workouts';
import { auth } from '@clerk/nextjs/server';
import { revalidatePath } from 'next/cache';

// Define Zod schema for validation
const CreateWorkoutSchema = z.object({
  name: z.string().min(1, 'Workout name is required').max(100),
  startedAt: z.string().refine((date) => !isNaN(Date.parse(date)), {
    message: 'Invalid date format',
  }),
});

// Server Action with typed parameters
export async function createWorkoutAction(data: {
  name: string;
  startedAt: string;
}) {
  try {
    // 1. Get authenticated user
    const { userId } = await auth();
    if (!userId) {
      return { error: 'Unauthorized' };
    }

    // 2. Validate input with Zod
    const validatedData = CreateWorkoutSchema.parse(data);

    // 3. Call helper function from /data
    const workout = await createWorkout({
      userId,
      name: validatedData.name,
      startedAt: new Date(validatedData.startedAt),
    });

    // 4. Revalidate
    revalidatePath('/dashboard');

    // 5. Return success with workout data
    return { success: true, workout };
  } catch (error) {
    // Handle Zod validation errors
    if (error instanceof z.ZodError) {
      return { error: 'Invalid input', details: error.errors };
    }

    // Handle other errors
    console.error('Failed to create workout:', error);
    return { error: 'Failed to create workout' };
  }
}
