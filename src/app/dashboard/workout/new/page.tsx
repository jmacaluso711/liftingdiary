'use client';

import { createWorkoutAction } from '../actions';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { useState, useTransition } from 'react';
import { useRouter } from 'next/navigation';
import { format } from 'date-fns';

export default function NewWorkoutPage() {
  const [isPending, startTransition] = useTransition();
  const [errors, setErrors] = useState<Record<string, string>>({});
  const router = useRouter();
  const today = format(new Date(), 'yyyy-MM-dd');

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setErrors({});

    const formData = new FormData(e.currentTarget);

    // Create typed object from form data
    const data = {
      name: formData.get('name') as string,
      startedAt: formData.get('startedAt') as string,
    };

    startTransition(async () => {
      try {
        const result = await createWorkoutAction(data);

        if (result?.error) {
          setErrors({ form: result.error });
        } else if (result?.success && result.workout) {
          // Redirect client-side on success
          router.push(`/dashboard`);
        }
      } catch (error) {
        // Handle validation errors
        setErrors({ form: 'Failed to create workout' });
      }
    });
  }

  return (
    <div className="container mx-auto py-8 max-w-2xl">
      <Card>
        <CardHeader>
          <CardTitle>Create New Workout</CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="space-y-2">
              <Label htmlFor="name">Workout Name</Label>
              <Input
                id="name"
                name="name"
                placeholder="e.g., Upper Body Day"
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
                defaultValue={today + 'T' + format(new Date(), 'HH:mm')}
                required
                disabled={isPending}
              />
            </div>

            {errors.form && (
              <div className="text-red-500 text-sm">{errors.form}</div>
            )}

            <Button type="submit" disabled={isPending} className="w-full">
              {isPending ? 'Creating...' : 'Create Workout'}
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
