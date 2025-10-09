import db from '@/db';
import { exercises, workoutExercises, workouts, sets } from '@/db/schema';
import { eq, and, max } from 'drizzle-orm';

/**
 * Fetches all available exercises from the catalog
 */
export async function getAllExercises() {
  return await db
    .select()
    .from(exercises)
    .orderBy(exercises.name);
}

/**
 * Fetches all exercises for a specific workout with their sets
 * Verifies workout belongs to the user
 */
export async function getWorkoutExercisesWithSets(workoutId: number, userId: string) {
  // First verify the workout belongs to the user
  const workout = await db
    .select()
    .from(workouts)
    .where(
      and(
        eq(workouts.id, workoutId),
        eq(workouts.userId, userId)
      )
    );

  if (!workout || workout.length === 0) {
    return null;
  }

  // Fetch workout exercises with exercise details and sets
  const workoutExerciseData = await db
    .select({
      id: workoutExercises.id,
      workoutId: workoutExercises.workoutId,
      exerciseId: workoutExercises.exerciseId,
      order: workoutExercises.order,
      exerciseName: exercises.name,
      createdAt: workoutExercises.createdAt,
    })
    .from(workoutExercises)
    .innerJoin(exercises, eq(workoutExercises.exerciseId, exercises.id))
    .where(eq(workoutExercises.workoutId, workoutId))
    .orderBy(workoutExercises.order);

  // Fetch sets for each workout exercise
  const exercisesWithSets = await Promise.all(
    workoutExerciseData.map(async (workoutExercise) => {
      const exerciseSets = await db
        .select({
          id: sets.id,
          setNumber: sets.setNumber,
          reps: sets.reps,
          weight: sets.weight,
          createdAt: sets.createdAt,
        })
        .from(sets)
        .where(eq(sets.workoutExerciseId, workoutExercise.id))
        .orderBy(sets.setNumber);

      return {
        ...workoutExercise,
        sets: exerciseSets,
      };
    })
  );

  return exercisesWithSets;
}

/**
 * Adds an exercise to a workout with proper ordering
 * Verifies workout belongs to the user
 */
export async function addExerciseToWorkout(
  workoutId: number,
  exerciseId: number,
  userId: string
) {
  // Verify workout belongs to user
  const workout = await db
    .select()
    .from(workouts)
    .where(
      and(
        eq(workouts.id, workoutId),
        eq(workouts.userId, userId)
      )
    );

  if (!workout || workout.length === 0) {
    return null;
  }

  // Get the max order number for this workout
  const maxOrderResult = await db
    .select({ maxOrder: max(workoutExercises.order) })
    .from(workoutExercises)
    .where(eq(workoutExercises.workoutId, workoutId));

  const nextOrder = (maxOrderResult[0]?.maxOrder ?? -1) + 1;

  // Insert the workout exercise
  const [workoutExercise] = await db
    .insert(workoutExercises)
    .values({
      workoutId,
      exerciseId,
      order: nextOrder,
      createdAt: new Date(),
    })
    .returning();

  return workoutExercise;
}

/**
 * Removes an exercise from a workout
 * Verifies workout belongs to the user
 */
export async function removeExerciseFromWorkout(
  workoutExerciseId: number,
  userId: string
) {
  // Verify the workout exercise belongs to a workout owned by the user
  const workoutExercise = await db
    .select({
      workoutExerciseId: workoutExercises.id,
      workoutId: workoutExercises.workoutId,
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

  // Delete the workout exercise (cascade will delete sets)
  const [deleted] = await db
    .delete(workoutExercises)
    .where(eq(workoutExercises.id, workoutExerciseId))
    .returning();

  return deleted;
}
