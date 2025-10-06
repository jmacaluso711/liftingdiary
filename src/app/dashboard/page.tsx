'use client';

import { useState } from 'react';
import { format } from 'date-fns';
import { Calendar } from '@/components/ui/calendar';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';

export default function DashboardPage() {
  const [date, setDate] = useState<Date>(new Date());

  // Mock workout data - will be replaced with real data later
  const mockWorkouts = [
    {
      id: 1,
      name: 'Morning Strength Training',
      exercises: ['Bench Press', 'Squats', 'Deadlifts'],
      duration: '45 min',
      time: '8:00 AM',
    },
    {
      id: 2,
      name: 'Evening Cardio',
      exercises: ['Running', 'Jump Rope'],
      duration: '30 min',
      time: '6:00 PM',
    },
  ];

  return (
    <div className="container mx-auto p-6 max-w-6xl">
      <h1 className="text-3xl font-bold mb-8">Workout Dashboard</h1>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Calendar Section */}
        <Card className="md:col-span-1">
          <CardHeader>
            <CardTitle>Select Date</CardTitle>
            <CardDescription>
              {format(date, 'do MMM yyyy')}
            </CardDescription>
          </CardHeader>
          <CardContent className="flex justify-center">
            <Calendar
              mode="single"
              selected={date}
              onSelect={(newDate) => newDate && setDate(newDate)}
              className="rounded-md border"
            />
          </CardContent>
        </Card>

        {/* Workouts List Section */}
        <Card className="md:col-span-2">
          <CardHeader>
            <CardTitle>Workouts for {format(date, 'do MMM yyyy')}</CardTitle>
            <CardDescription>
              {mockWorkouts.length} workout{mockWorkouts.length !== 1 ? 's' : ''} logged
            </CardDescription>
          </CardHeader>
          <CardContent>
            {mockWorkouts.length === 0 ? (
              <div className="text-center py-12 text-muted-foreground">
                <p>No workouts logged for this date.</p>
                <p className="text-sm mt-2">Start tracking your fitness journey!</p>
              </div>
            ) : (
              <div className="space-y-4">
                {mockWorkouts.map((workout) => (
                  <Card key={workout.id}>
                    <CardHeader>
                      <div className="flex justify-between items-start">
                        <div>
                          <CardTitle className="text-lg">{workout.name}</CardTitle>
                          <CardDescription>{workout.time}</CardDescription>
                        </div>
                        <span className="text-sm text-muted-foreground">
                          {workout.duration}
                        </span>
                      </div>
                    </CardHeader>
                    <CardContent>
                      <div className="flex flex-wrap gap-2">
                        {workout.exercises.map((exercise, index) => (
                          <span
                            key={index}
                            className="px-3 py-1 bg-secondary text-secondary-foreground rounded-full text-sm"
                          >
                            {exercise}
                          </span>
                        ))}
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
