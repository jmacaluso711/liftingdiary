import { auth } from '@clerk/nextjs/server';
import { redirect } from 'next/navigation';
import Link from 'next/link';
import { getWorkoutById } from '@/data/workouts';
import { getAllExercises, getWorkoutExercisesWithSets } from '@/data/exercises';
import { AddExerciseForm } from './add-exercise-form';
import { ExerciseList } from './exercise-list';
import { Button } from '@/components/ui/button';
import { format } from 'date-fns';

interface WorkoutPageProps {
  params: Promise<{
    workoutId: string;
  }>;
}

export default async function WorkoutPage({ params }: WorkoutPageProps) {
  const { userId } = await auth();

  if (!userId) {
    redirect('/sign-in');
  }

  const { workoutId } = await params;
  const workoutIdNum = parseInt(workoutId, 10);

  if (isNaN(workoutIdNum)) {
    redirect('/dashboard');
  }

  // Fetch workout details
  const workout = await getWorkoutById(workoutIdNum, userId);

  if (!workout) {
    redirect('/dashboard');
  }

  // Fetch all available exercises for the dropdown
  const allExercises = await getAllExercises();

  // Fetch workout exercises with their sets
  const workoutExercises = await getWorkoutExercisesWithSets(workoutIdNum, userId);

  return (
    <div className="container mx-auto py-8 max-w-4xl">
      {/* Header */}
      <div className="mb-8">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h1 className="text-3xl font-bold">{workout.name}</h1>
            <p className="text-muted-foreground">
              {format(new Date(workout.startedAt), 'do MMM yyyy')}
            </p>
          </div>
          <div className="flex gap-2">
            <Button variant="outline" asChild>
              <Link href={`/dashboard/workout/${workoutIdNum}/edit`}>Edit Workout</Link>
            </Button>
            <Button variant="outline" asChild>
              <Link href="/dashboard">Back to Dashboard</Link>
            </Button>
          </div>
        </div>
      </div>

      {/* Add Exercise Form */}
      <div className="mb-8">
        <AddExerciseForm workoutId={workoutIdNum} exercises={allExercises} />
      </div>

      {/* Exercise List with Sets */}
      <div>
        <ExerciseList exercises={workoutExercises ?? []} />
      </div>
    </div>
  );
}
