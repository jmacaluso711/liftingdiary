import { auth } from '@clerk/nextjs/server';
import { redirect } from 'next/navigation';
import { getWorkoutById } from '@/data/workouts';
import { EditWorkoutForm } from './edit-workout-form';

interface EditWorkoutPageProps {
  params: Promise<{
    workoutId: string;
  }>;
}

export default async function EditWorkoutPage({ params }: EditWorkoutPageProps) {
  const { userId } = await auth();

  if (!userId) {
    redirect('/sign-in');
  }

  const { workoutId } = await params;
  const workoutIdNum = parseInt(workoutId, 10);

  if (isNaN(workoutIdNum)) {
    redirect('/dashboard');
  }

  const workout = await getWorkoutById(workoutIdNum, userId);

  if (!workout) {
    redirect('/dashboard');
  }

  return (
    <div className="container mx-auto py-8 max-w-2xl">
      <EditWorkoutForm workout={workout} />
    </div>
  );
}
