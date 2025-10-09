'use server';

import { z } from 'zod';
import { addExerciseToWorkout, removeExerciseFromWorkout } from '@/data/exercises';
import { createSet, updateSet, deleteSet } from '@/data/sets';
import { auth } from '@clerk/nextjs/server';
import { revalidatePath } from 'next/cache';

// Add Exercise to Workout Action
const AddExerciseToWorkoutSchema = z.object({
  workoutId: z.number().int().positive(),
  exerciseId: z.number().int().positive(),
});

export async function addExerciseToWorkoutAction(data: {
  workoutId: number;
  exerciseId: number;
}) {
  try {
    const { userId } = await auth();
    if (!userId) {
      return { error: 'Unauthorized' };
    }

    const validatedData = AddExerciseToWorkoutSchema.parse(data);

    const workoutExercise = await addExerciseToWorkout(
      validatedData.workoutId,
      validatedData.exerciseId,
      userId
    );

    if (!workoutExercise) {
      return { error: 'Workout not found or unauthorized' };
    }

    revalidatePath(`/dashboard/workout/${validatedData.workoutId}`);

    return { success: true, workoutExercise };
  } catch (error) {
    if (error instanceof z.ZodError) {
      return { error: 'Invalid input', details: error.issues };
    }
    console.error('Failed to add exercise to workout:', error);
    return { error: 'Failed to add exercise to workout' };
  }
}

// Remove Exercise from Workout Action
const RemoveExerciseFromWorkoutSchema = z.object({
  workoutExerciseId: z.number().int().positive(),
});

export async function removeExerciseFromWorkoutAction(data: {
  workoutExerciseId: number;
}) {
  try {
    const { userId } = await auth();
    if (!userId) {
      return { error: 'Unauthorized' };
    }

    const validatedData = RemoveExerciseFromWorkoutSchema.parse(data);

    const deleted = await removeExerciseFromWorkout(
      validatedData.workoutExerciseId,
      userId
    );

    if (!deleted) {
      return { error: 'Exercise not found or unauthorized' };
    }

    revalidatePath(`/dashboard/workout/${deleted.workoutId}`);

    return { success: true };
  } catch (error) {
    if (error instanceof z.ZodError) {
      return { error: 'Invalid input', details: error.issues };
    }
    console.error('Failed to remove exercise from workout:', error);
    return { error: 'Failed to remove exercise from workout' };
  }
}

// Create Set Action
const CreateSetSchema = z.object({
  workoutExerciseId: z.number().int().positive(),
  reps: z.number().int().positive().min(1).max(1000),
  weight: z.string().refine((val) => !isNaN(parseFloat(val)) && parseFloat(val) >= 0, {
    message: 'Weight must be a valid non-negative number',
  }),
});

export async function createSetAction(data: {
  workoutExerciseId: number;
  reps: number;
  weight: string;
}) {
  try {
    const { userId } = await auth();
    if (!userId) {
      return { error: 'Unauthorized' };
    }

    const validatedData = CreateSetSchema.parse(data);

    const set = await createSet(
      validatedData.workoutExerciseId,
      validatedData.reps,
      validatedData.weight,
      userId
    );

    if (!set) {
      return { error: 'Exercise not found or unauthorized' };
    }

    revalidatePath(`/dashboard/workout/*`);

    return { success: true, set };
  } catch (error) {
    if (error instanceof z.ZodError) {
      return { error: 'Invalid input', details: error.issues };
    }
    console.error('Failed to create set:', error);
    return { error: 'Failed to create set' };
  }
}

// Update Set Action
const UpdateSetSchema = z.object({
  setId: z.number().int().positive(),
  reps: z.number().int().positive().min(1).max(1000),
  weight: z.string().refine((val) => !isNaN(parseFloat(val)) && parseFloat(val) >= 0, {
    message: 'Weight must be a valid non-negative number',
  }),
});

export async function updateSetAction(data: {
  setId: number;
  reps: number;
  weight: string;
}) {
  try {
    const { userId } = await auth();
    if (!userId) {
      return { error: 'Unauthorized' };
    }

    const validatedData = UpdateSetSchema.parse(data);

    const set = await updateSet(
      validatedData.setId,
      validatedData.reps,
      validatedData.weight,
      userId
    );

    if (!set) {
      return { error: 'Set not found or unauthorized' };
    }

    revalidatePath(`/dashboard/workout/*`);

    return { success: true, set };
  } catch (error) {
    if (error instanceof z.ZodError) {
      return { error: 'Invalid input', details: error.issues };
    }
    console.error('Failed to update set:', error);
    return { error: 'Failed to update set' };
  }
}

// Delete Set Action
const DeleteSetSchema = z.object({
  setId: z.number().int().positive(),
});

export async function deleteSetAction(data: { setId: number }) {
  try {
    const { userId } = await auth();
    if (!userId) {
      return { error: 'Unauthorized' };
    }

    const validatedData = DeleteSetSchema.parse(data);

    const deleted = await deleteSet(validatedData.setId, userId);

    if (!deleted) {
      return { error: 'Set not found or unauthorized' };
    }

    revalidatePath(`/dashboard/workout/*`);

    return { success: true };
  } catch (error) {
    if (error instanceof z.ZodError) {
      return { error: 'Invalid input', details: error.issues };
    }
    console.error('Failed to delete set:', error);
    return { error: 'Failed to delete set' };
  }
}
