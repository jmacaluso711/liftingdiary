'use client';

import { useState, useTransition } from 'react';
import { createSetAction, updateSetAction } from './actions';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';

interface SetFormProps {
  workoutExerciseId: number;
  existingSet?: {
    id: number;
    reps: number;
    weight: string;
  };
  onSuccess?: () => void;
}

export function SetForm({ workoutExerciseId, existingSet, onSuccess }: SetFormProps) {
  const [reps, setReps] = useState<string>(existingSet?.reps.toString() ?? '');
  const [weight, setWeight] = useState<string>(existingSet?.weight ?? '');
  const [isPending, startTransition] = useTransition();
  const [error, setError] = useState<string>('');

  const isEditing = !!existingSet;

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError('');

    const repsNum = parseInt(reps, 10);

    if (isNaN(repsNum) || repsNum <= 0) {
      setError('Please enter valid reps');
      return;
    }

    if (!weight || isNaN(parseFloat(weight)) || parseFloat(weight) < 0) {
      setError('Please enter valid weight');
      return;
    }

    startTransition(async () => {
      try {
        const result = isEditing
          ? await updateSetAction({
              setId: existingSet.id,
              reps: repsNum,
              weight,
            })
          : await createSetAction({
              workoutExerciseId,
              reps: repsNum,
              weight,
            });

        if (result?.error) {
          setError(result.error);
        } else if (result?.success) {
          // Reset form for new sets
          if (!isEditing) {
            setReps('');
            setWeight('');
          }
          onSuccess?.();
        }
      } catch (error) {
        setError(isEditing ? 'Failed to update set' : 'Failed to add set');
      }
    });
  }

  return (
    <form onSubmit={handleSubmit} className="flex gap-2 items-end">
      <div className="flex-1">
        <Label htmlFor="reps" className="text-xs">
          Reps
        </Label>
        <Input
          id="reps"
          type="number"
          min="1"
          value={reps}
          onChange={(e) => setReps(e.target.value)}
          placeholder="10"
          disabled={isPending}
          required
        />
      </div>

      <div className="flex-1">
        <Label htmlFor="weight" className="text-xs">
          Weight (lbs)
        </Label>
        <Input
          id="weight"
          type="number"
          step="0.01"
          min="0"
          value={weight}
          onChange={(e) => setWeight(e.target.value)}
          placeholder="135"
          disabled={isPending}
          required
        />
      </div>

      <Button type="submit" disabled={isPending} size="sm">
        {isPending ? (isEditing ? 'Updating...' : 'Adding...') : isEditing ? 'Update' : 'Add Set'}
      </Button>

      {error && (
        <div className="text-red-500 text-xs col-span-full">{error}</div>
      )}
    </form>
  );
}
