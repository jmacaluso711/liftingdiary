import db from '@/db';
import { workouts, workoutExercises, exercises } from '@/db/schema';
import { eq, and, gte, lte } from 'drizzle-orm';
import { startOfDay, endOfDay } from 'date-fns';

/**
 * Fetches all workouts for a specific user
 */
export async function getWorkoutsByUserId(userId: string) {
  return await db
    .select()
    .from(workouts)
    .where(eq(workouts.userId, userId))
    .orderBy(workouts.startedAt);
}

/**
 * Fetches workouts for a specific user on a specific date
 */
export async function getWorkoutsByUserIdAndDate(userId: string, date: Date) {
  const dayStart = startOfDay(date);
  const dayEnd = endOfDay(date);

  return await db
    .select()
    .from(workouts)
    .where(
      and(
        eq(workouts.userId, userId),
        gte(workouts.startedAt, dayStart),
        lte(workouts.startedAt, dayEnd)
      )
    )
    .orderBy(workouts.startedAt);
}

/**
 * Fetches a single workout by ID with user verification
 */
export async function getWorkoutById(workoutId: number, userId: string) {
  const result = await db
    .select()
    .from(workouts)
    .where(
      and(
        eq(workouts.id, workoutId),
        eq(workouts.userId, userId)
      )
    );

  return result[0] ?? null;
}

/**
 * Fetches workout with all associated exercises
 */
export async function getWorkoutWithExercises(workoutId: number, userId: string) {
  // First verify the workout belongs to the user
  const workout = await getWorkoutById(workoutId, userId);

  if (!workout) {
    return null;
  }

  // Fetch associated exercises
  const workoutExerciseData = await db
    .select({
      id: workoutExercises.id,
      order: workoutExercises.order,
      exerciseId: exercises.id,
      exerciseName: exercises.name,
    })
    .from(workoutExercises)
    .innerJoin(exercises, eq(workoutExercises.exerciseId, exercises.id))
    .where(eq(workoutExercises.workoutId, workoutId))
    .orderBy(workoutExercises.order);

  return {
    ...workout,
    exercises: workoutExerciseData,
  };
}
