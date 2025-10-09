import db from '@/db';
import { sets, workoutExercises, workouts } from '@/db/schema';
import { eq, and, max } from 'drizzle-orm';

/**
 * Fetches all sets for a specific workout exercise
 */
export async function getSetsByWorkoutExercise(workoutExerciseId: number) {
  return await db
    .select()
    .from(sets)
    .where(eq(sets.workoutExerciseId, workoutExerciseId))
    .orderBy(sets.setNumber);
}

/**
 * Creates a new set for a workout exercise
 * Verifies the workout exercise belongs to a workout owned by the user
 */
export async function createSet(
  workoutExerciseId: number,
  reps: number,
  weight: string,
  userId: string
) {
  // Verify the workout exercise belongs to a workout owned by the user
  const workoutExercise = await db
    .select({
      workoutExerciseId: workoutExercises.id,
    })
    .from(workoutExercises)
    .innerJoin(workouts, eq(workoutExercises.workoutId, workouts.id))
    .where(
      and(
        eq(workoutExercises.id, workoutExerciseId),
        eq(workouts.userId, userId)
      )
    );

  if (!workoutExercise || workoutExercise.length === 0) {
    return null;
  }

  // Get the max set number for this workout exercise
  const maxSetResult = await db
    .select({ maxSet: max(sets.setNumber) })
    .from(sets)
    .where(eq(sets.workoutExerciseId, workoutExerciseId));

  const nextSetNumber = (maxSetResult[0]?.maxSet ?? 0) + 1;

  // Insert the set
  const [set] = await db
    .insert(sets)
    .values({
      workoutExerciseId,
      setNumber: nextSetNumber,
      reps,
      weight,
      createdAt: new Date(),
    })
    .returning();

  return set;
}

/**
 * Updates an existing set
 * Verifies the set belongs to a workout owned by the user
 */
export async function updateSet(
  setId: number,
  reps: number,
  weight: string,
  userId: string
) {
  // Verify the set belongs to a workout owned by the user
  const setRecord = await db
    .select({
      setId: sets.id,
    })
    .from(sets)
    .innerJoin(workoutExercises, eq(sets.workoutExerciseId, workoutExercises.id))
    .innerJoin(workouts, eq(workoutExercises.workoutId, workouts.id))
    .where(
      and(
        eq(sets.id, setId),
        eq(workouts.userId, userId)
      )
    );

  if (!setRecord || setRecord.length === 0) {
    return null;
  }

  // Update the set
  const [updatedSet] = await db
    .update(sets)
    .set({
      reps,
      weight,
    })
    .where(eq(sets.id, setId))
    .returning();

  return updatedSet;
}

/**
 * Deletes a set
 * Verifies the set belongs to a workout owned by the user
 */
export async function deleteSet(setId: number, userId: string) {
  // Verify the set belongs to a workout owned by the user
  const setRecord = await db
    .select({
      setId: sets.id,
    })
    .from(sets)
    .innerJoin(workoutExercises, eq(sets.workoutExerciseId, workoutExercises.id))
    .innerJoin(workouts, eq(workoutExercises.workoutId, workouts.id))
    .where(
      and(
        eq(sets.id, setId),
        eq(workouts.userId, userId)
      )
    );

  if (!setRecord || setRecord.length === 0) {
    return null;
  }

  // Delete the set
  const [deleted] = await db
    .delete(sets)
    .where(eq(sets.id, setId))
    .returning();

  return deleted;
}
