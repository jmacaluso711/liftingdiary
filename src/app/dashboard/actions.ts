'use server';

import { currentUser } from '@clerk/nextjs/server';
import { getWorkoutsByUserIdAndDate } from '@/data/workouts';

export async function getWorkoutsForDate(date: string) {
  const user = await currentUser();

  if (!user) {
    throw new Error('Unauthorized');
  }

  const dateObj = new Date(date);
  const workouts = await getWorkoutsByUserIdAndDate(user.id, dateObj);

  return workouts;
}
