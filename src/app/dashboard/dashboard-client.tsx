'use client';

import { useState, useTransition } from 'react';
import { format } from 'date-fns';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { Calendar } from '@/components/ui/calendar';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { CalendarIcon } from 'lucide-react';
import { getWorkoutsForDate } from './actions';

type Workout = {
  id: number;
  userId: string;
  name: string;
  startedAt: Date;
  completedAt: Date | null;
  createdAt: Date;
  updatedAt: Date;
};

type DashboardClientProps = {
  initialWorkouts: Workout[];
  initialDate: Date;
};

export function DashboardClient({ initialWorkouts, initialDate }: DashboardClientProps) {
  const [date, setDate] = useState<Date>(initialDate);
  const [workouts, setWorkouts] = useState<Workout[]>(initialWorkouts);
  const [isPending, startTransition] = useTransition();
  const [isPopoverOpen, setIsPopoverOpen] = useState(false);
  const router = useRouter();

  const handleDateChange = async (newDate: Date | undefined) => {
    if (!newDate) return;

    setDate(newDate);
    setIsPopoverOpen(false); // Close popover when date is selected

    // Update URL with date query parameter
    const dateParam = format(newDate, 'yyyy-MM-dd');
    router.push(`/dashboard?date=${dateParam}`);

    // Fetch workouts for the new date using server action
    startTransition(async () => {
      const data = await getWorkoutsForDate(newDate.toISOString());
      setWorkouts(data);
    });
  };

  return (
    <div className="container mx-auto p-6 max-w-6xl">
      <h1 className="text-3xl font-bold mb-8">Workout Dashboard</h1>

      <div className="grid grid-cols-1 gap-6">
        {/* Workouts List Section */}
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle>Workouts for {format(date, 'do MMM yyyy')}</CardTitle>
                <CardDescription>
                  {workouts.length} workout{workouts.length !== 1 ? 's' : ''} logged
                </CardDescription>
              </div>
              <div className="flex items-center gap-2">
                <Button asChild>
                  <Link href="/dashboard/workout/new">Log New Workout</Link>
                </Button>
                <Popover open={isPopoverOpen} onOpenChange={setIsPopoverOpen}>
                  <PopoverTrigger asChild>
                    <Button variant="outline" className="gap-2">
                      <CalendarIcon className="h-4 w-4" />
                      {format(date, 'do MMM yyyy')}
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0" align="end">
                    <Calendar
                      mode="single"
                      selected={date}
                      onSelect={handleDateChange}
                      disabled={isPending}
                    />
                  </PopoverContent>
                </Popover>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            {isPending ? (
              <div className="text-center py-12 text-muted-foreground">
                <p>Loading workouts...</p>
              </div>
            ) : workouts.length === 0 ? (
              <div className="text-center py-12 text-muted-foreground">
                <p>No workouts logged for this date.</p>
                <p className="text-sm mt-2">Start tracking your fitness journey!</p>
              </div>
            ) : (
              <div className="space-y-4">
                {workouts.map((workout) => (
                  <Link key={workout.id} href={`/dashboard/workout/${workout.id}`} className="block hover:opacity-80 transition-opacity">
                    <Card>
                      <CardHeader>
                        <div className="flex justify-between items-start">
                          <div>
                            <CardTitle className="text-lg">{workout.name}</CardTitle>
                            <CardDescription>
                              {format(new Date(workout.startedAt), 'h:mm a')}
                            </CardDescription>
                          </div>
                          {workout.completedAt && (
                            <span className="text-sm text-muted-foreground">
                              {Math.round(
                                (new Date(workout.completedAt).getTime() -
                                  new Date(workout.startedAt).getTime()) /
                                  1000 /
                                  60
                              )}{' '}
                              min
                            </span>
                          )}
                        </div>
                      </CardHeader>
                      <CardContent>
                        {/* Exercise chips would go here - currently not fetched */}
                        <div className="text-sm text-muted-foreground">
                          {workout.completedAt ? 'Completed' : 'In Progress'}
                        </div>
                      </CardContent>
                    </Card>
                  </Link>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
