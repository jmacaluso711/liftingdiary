'use client';

import { useState, useTransition } from 'react';
import { addExerciseToWorkoutAction } from './actions';
import { Button } from '@/components/ui/button';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

interface Exercise {
  id: number;
  name: string;
}

interface AddExerciseFormProps {
  workoutId: number;
  exercises: Exercise[];
}

export function AddExerciseForm({ workoutId, exercises }: AddExerciseFormProps) {
  const [selectedExerciseId, setSelectedExerciseId] = useState<string>('');
  const [isPending, startTransition] = useTransition();
  const [error, setError] = useState<string>('');

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError('');

    if (!selectedExerciseId) {
      setError('Please select an exercise');
      return;
    }

    startTransition(async () => {
      try {
        const result = await addExerciseToWorkoutAction({
          workoutId,
          exerciseId: parseInt(selectedExerciseId, 10),
        });

        if (result?.error) {
          setError(result.error);
        } else if (result?.success) {
          // Reset form
          setSelectedExerciseId('');
        }
      } catch (error) {
        setError('Failed to add exercise');
      }
    });
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Add Exercise</CardTitle>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-4">
          <Select
            value={selectedExerciseId}
            onValueChange={setSelectedExerciseId}
            disabled={isPending}
          >
            <SelectTrigger>
              <SelectValue placeholder="Select an exercise" />
            </SelectTrigger>
            <SelectContent>
              {exercises.map((exercise) => (
                <SelectItem key={exercise.id} value={exercise.id.toString()}>
                  {exercise.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>

          {error && <div className="text-red-500 text-sm">{error}</div>}

          <Button type="submit" disabled={isPending || !selectedExerciseId} className="w-full">
            {isPending ? 'Adding...' : 'Add Exercise'}
          </Button>
        </form>
      </CardContent>
    </Card>
  );
}
