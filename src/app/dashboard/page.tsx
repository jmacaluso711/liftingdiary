import { format } from 'date-fns';
import { currentUser } from '@clerk/nextjs/server';
import { redirect } from 'next/navigation';
import { getWorkoutsByUserIdAndDate } from '@/data/workouts';
import { DashboardClient } from './dashboard-client';

export default async function DashboardPage() {
  const user = await currentUser();

  if (!user) {
    redirect('/sign-in');
  }

  // Default to today's date
  const today = new Date();
  const workouts = await getWorkoutsByUserIdAndDate(user.id, today);

  return <DashboardClient initialWorkouts={workouts} initialDate={today} />;
}
