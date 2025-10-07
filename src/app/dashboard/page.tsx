import { format, isValid, parseISO } from 'date-fns';
import { currentUser } from '@clerk/nextjs/server';
import { redirect } from 'next/navigation';
import { getWorkoutsByUserIdAndDate } from '@/data/workouts';
import { DashboardClient } from './dashboard-client';

type DashboardPageProps = {
  searchParams: Promise<{ date?: string }>;
};

export default async function DashboardPage({ searchParams }: DashboardPageProps) {
  const user = await currentUser();

  if (!user) {
    redirect('/sign-in');
  }

  // Parse date from query params or default to today
  const params = await searchParams;
  let selectedDate = new Date();

  if (params.date) {
    const parsedDate = parseISO(params.date);
    if (isValid(parsedDate)) {
      selectedDate = parsedDate;
    }
  }

  const workouts = await getWorkoutsByUserIdAndDate(user.id, selectedDate);

  return <DashboardClient initialWorkouts={workouts} initialDate={selectedDate} />;
}
