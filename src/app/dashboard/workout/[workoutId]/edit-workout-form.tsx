'use client';

import { updateWorkoutAction } from '../actions';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { useState, useTransition } from 'react';
import { useRouter } from 'next/navigation';
import { format } from 'date-fns';

interface EditWorkoutFormProps {
  workout: {
    id: number;
    name: string;
    startedAt: Date;
  };
}

export function EditWorkoutForm({ workout }: EditWorkoutFormProps) {
  const [isPending, startTransition] = useTransition();
  const [errors, setErrors] = useState<Record<string, string>>({});
  const router = useRouter();

  // Format the date for datetime-local input
  const formattedDate = format(new Date(workout.startedAt), "yyyy-MM-dd'T'HH:mm");

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setErrors({});

    const formData = new FormData(e.currentTarget);

    // Create typed object from form data
    const data = {
      workoutId: workout.id,
      name: formData.get('name') as string,
      startedAt: formData.get('startedAt') as string,
    };

    startTransition(async () => {
      try {
        const result = await updateWorkoutAction(data);

        if (result?.error) {
          setErrors({ form: result.error });
        } else if (result?.success && result.workout) {
          // Redirect client-side on success
          router.push(`/dashboard/workout/${result.workout.id}`);
        }
      } catch (error) {
        // Handle validation errors
        setErrors({ form: 'Failed to update workout' });
      }
    });
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Edit Workout</CardTitle>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="space-y-2">
            <Label htmlFor="name">Workout Name</Label>
            <Input
              id="name"
              name="name"
              placeholder="e.g., Upper Body Day"
              defaultValue={workout.name}
              required
              disabled={isPending}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="startedAt">Date</Label>
            <Input
              id="startedAt"
              name="startedAt"
              type="datetime-local"
              defaultValue={formattedDate}
              required
              disabled={isPending}
            />
          </div>

          {errors.form && (
            <div className="text-red-500 text-sm">{errors.form}</div>
          )}

          <div className="flex gap-2">
            <Button type="submit" disabled={isPending} className="flex-1">
              {isPending ? 'Updating...' : 'Update Workout'}
            </Button>
            <Button
              type="button"
              variant="outline"
              onClick={() => router.push(`/dashboard/workout/${workout.id}`)}
              disabled={isPending}
            >
              Cancel
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  );
}
