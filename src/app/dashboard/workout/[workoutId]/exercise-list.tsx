'use client';

import { useState, useTransition } from 'react';
import { removeExerciseFromWorkoutAction, deleteSetAction } from './actions';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Separator } from '@/components/ui/separator';
import { SetForm } from './set-form';

interface Set {
  id: number;
  setNumber: number;
  reps: number;
  weight: string;
}

interface WorkoutExercise {
  id: number;
  exerciseName: string;
  sets: Set[];
}

interface ExerciseListProps {
  exercises: WorkoutExercise[];
}

export function ExerciseList({ exercises }: ExerciseListProps) {
  const [isPending, startTransition] = useTransition();
  const [error, setError] = useState<string>('');
  const [editingSetId, setEditingSetId] = useState<number | null>(null);

  async function handleRemoveExercise(workoutExerciseId: number) {
    if (!confirm('Are you sure you want to remove this exercise?')) {
      return;
    }

    setError('');

    startTransition(async () => {
      try {
        const result = await removeExerciseFromWorkoutAction({
          workoutExerciseId,
        });

        if (result?.error) {
          setError(result.error);
        }
      } catch (error) {
        setError('Failed to remove exercise');
      }
    });
  }

  async function handleDeleteSet(setId: number) {
    if (!confirm('Are you sure you want to delete this set?')) {
      return;
    }

    setError('');

    startTransition(async () => {
      try {
        const result = await deleteSetAction({ setId });

        if (result?.error) {
          setError(result.error);
        }
      } catch (error) {
        setError('Failed to delete set');
      }
    });
  }

  if (exercises.length === 0) {
    return (
      <Card>
        <CardContent className="py-8 text-center text-muted-foreground">
          No exercises added yet. Add an exercise to get started!
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-4">
      {error && (
        <div className="text-red-500 text-sm bg-red-50 p-3 rounded">{error}</div>
      )}

      {exercises.map((exercise) => (
        <Card key={exercise.id}>
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle>{exercise.exerciseName}</CardTitle>
              <Button
                variant="outline"
                size="sm"
                onClick={() => handleRemoveExercise(exercise.id)}
                disabled={isPending}
              >
                Remove
              </Button>
            </div>
          </CardHeader>
          <CardContent className="space-y-4">
            {/* Sets Table */}
            {exercise.sets.length > 0 && (
              <div>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead className="w-16">Set</TableHead>
                      <TableHead>Reps</TableHead>
                      <TableHead>Weight (lbs)</TableHead>
                      <TableHead className="w-20"></TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {exercise.sets.map((set) => (
                      <TableRow key={set.id}>
                        {editingSetId === set.id ? (
                          <TableCell colSpan={4} className="p-4">
                            <SetForm
                              workoutExerciseId={exercise.id}
                              existingSet={set}
                              onSuccess={() => setEditingSetId(null)}
                            />
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => setEditingSetId(null)}
                              className="mt-2"
                            >
                              Cancel
                            </Button>
                          </TableCell>
                        ) : (
                          <>
                            <TableCell className="font-medium">{set.setNumber}</TableCell>
                            <TableCell>{set.reps}</TableCell>
                            <TableCell>{set.weight}</TableCell>
                            <TableCell>
                              <div className="flex gap-1">
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  onClick={() => setEditingSetId(set.id)}
                                  disabled={isPending}
                                >
                                  Edit
                                </Button>
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  onClick={() => handleDeleteSet(set.id)}
                                  disabled={isPending}
                                >
                                  Delete
                                </Button>
                              </div>
                            </TableCell>
                          </>
                        )}
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            )}

            {/* Separator */}
            <Separator />

            {/* Add Set Form */}
            <div>
              <h4 className="text-sm font-semibold mb-2">Add Set</h4>
              <SetForm workoutExerciseId={exercise.id} />
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}
