# Data Mutations

## ⚠️ CRITICAL: Server Actions Only

**ALL data mutations in this application MUST be done via Server Actions.**

### Strict Rules

1. **Server Actions ONLY**: Data mutations MUST happen via Server Actions in colocated `actions.ts` files
2. **Helper Functions Required**: Server Actions must call helper functions from `/src/data` directory
3. **Typed Parameters**: Server Action parameters MUST be typed (NOT `formData` type)
4. **Zod Validation**: ALL Server Actions MUST validate arguments using Zod
5. **Drizzle ORM**: Helper functions MUST use Drizzle ORM (NEVER raw SQL)
6. **NO Server-Side Redirects**: Server Actions MUST NOT use `redirect()` - redirects MUST be done client-side after the action resolves

## Server Actions Pattern

### Required Structure

All data mutations follow this pattern:

1. Create Server Actions in colocated `actions.ts` files
2. Define Zod schemas for validation
3. Validate all inputs using Zod
4. Call helper functions from `/src/data` directory
5. Helper functions use Drizzle ORM for database operations

### File Colocation

Server Actions MUST be colocated with the features that use them:

```
src/app
  /workouts
    actions.ts          # Server Actions for workouts feature
    /new
      page.tsx          # UI that uses the action
  /exercises
    actions.ts          # Server Actions for exercises feature
```

## Example Implementation

### 1. Define Zod Schema and Server Action

```typescript
// src/app/workouts/actions.ts
'use server';

import { z } from 'zod';
import { createWorkout } from '@/data/workouts';
import { auth } from '@/auth';
import { revalidatePath } from 'next/cache';

// ✅ CORRECT - Define Zod schema for validation
const CreateWorkoutSchema = z.object({
  name: z.string().min(1, 'Workout name is required').max(100),
  date: z.string().refine((date) => !isNaN(Date.parse(date)), {
    message: 'Invalid date format',
  }),
  notes: z.string().max(500).optional(),
});

// ✅ CORRECT - Typed parameters (NOT formData)
export async function createWorkoutAction(data: {
  name: string;
  date: string;
  notes?: string;
}) {
  try {
    // 1. Get authenticated user
    const session = await auth();
    if (!session?.user?.id) {
      return { error: 'Unauthorized' };
    }

    // 2. Validate input with Zod
    const validatedData = CreateWorkoutSchema.parse(data);

    // 3. Call helper function from /data
    const workout = await createWorkout({
      userId: session.user.id,
      name: validatedData.name,
      date: new Date(validatedData.date),
      notes: validatedData.notes,
    });

    // 4. Revalidate
    revalidatePath('/dashboard/workouts');

    // 5. Return success with workout data (redirect happens client-side)
    return { success: true, workout };
  } catch (error) {
    if (error instanceof z.ZodError) {
      return { error: 'Invalid input', details: error.errors };
    }
    console.error('Failed to create workout:', error);
    return { error: 'Failed to create workout' };
  }
}
```

### 2. Create Helper Function in `/src/data`

```typescript
// /src/data/workouts.ts
import { db } from '@/db';
import { workouts } from '@/db/schema';
import { eq, and } from 'drizzle-orm';

// ✅ CORRECT - Helper function using Drizzle ORM
export async function createWorkout(data: {
  userId: string;
  name: string;
  date: Date;
  notes?: string;
}) {
  const [workout] = await db
    .insert(workouts)
    .values({
      userId: data.userId,
      name: data.name,
      date: data.date,
      notes: data.notes,
      createdAt: new Date(),
    })
    .returning();

  return workout;
}

// ✅ CORRECT - Update with userId verification
export async function updateWorkout(
  workoutId: string,
  userId: string,
  data: { name?: string; date?: Date; notes?: string }
) {
  const [workout] = await db
    .update(workouts)
    .set({
      ...data,
      updatedAt: new Date(),
    })
    .where(
      and(
        eq(workouts.id, workoutId),
        eq(workouts.userId, userId) // CRITICAL: Always verify ownership
      )
    )
    .returning();

  return workout;
}

// ✅ CORRECT - Delete with userId verification
export async function deleteWorkout(workoutId: string, userId: string) {
  const [workout] = await db
    .delete(workouts)
    .where(
      and(
        eq(workouts.id, workoutId),
        eq(workouts.userId, userId) // CRITICAL: Always verify ownership
      )
    )
    .returning();

  return workout;
}
```

### 3. Use in Component

```typescript
// src/app/workouts/new/page.tsx
'use client';

import { createWorkoutAction } from '../actions';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { useState, useTransition } from 'react';
import { useRouter } from 'next/navigation';

export default function NewWorkoutPage() {
  const [isPending, startTransition] = useTransition();
  const [errors, setErrors] = useState<Record<string, string>>({});
  const router = useRouter();

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);

    // ✅ CORRECT - Create typed object from form data
    const data = {
      name: formData.get('name') as string,
      date: formData.get('date') as string,
      notes: formData.get('notes') as string,
    };

    startTransition(async () => {
      try {
        const result = await createWorkoutAction(data);

        if (result?.error) {
          setErrors({ form: result.error });
        } else if (result?.success && result.workout) {
          // ✅ CORRECT - Redirect client-side after successful action
          router.push(`/dashboard/workouts/${result.workout.id}`);
        }
      } catch (error) {
        // Handle validation errors
        setErrors({ form: 'Failed to create workout' });
      }
    });
  }

  return (
    <form onSubmit={handleSubmit}>
      <Input name="name" placeholder="Workout name" required />
      <Input name="date" type="date" required />
      <Input name="notes" placeholder="Notes (optional)" />
      <Button type="submit" disabled={isPending}>
        {isPending ? 'Creating...' : 'Create Workout'}
      </Button>
    </form>
  );
}
```

## 🔒 CRITICAL: Security and Validation

### Always Validate with Zod

**Every Server Action MUST validate all inputs using Zod.**

✅ **CORRECT**:
```typescript
'use server';

import { z } from 'zod';

const UpdateWorkoutSchema = z.object({
  workoutId: z.string().uuid(),
  name: z.string().min(1).max(100),
  date: z.string().refine((date) => !isNaN(Date.parse(date))),
});

export async function updateWorkoutAction(data: {
  workoutId: string;
  name: string;
  date: string;
}) {
  // ✅ Validate with Zod
  const validatedData = UpdateWorkoutSchema.parse(data);

  const session = await auth();
  if (!session?.user?.id) {
    throw new Error('Unauthorized');
  }

  return await updateWorkout(
    validatedData.workoutId,
    session.user.id,
    {
      name: validatedData.name,
      date: new Date(validatedData.date),
    }
  );
}
```

❌ **WRONG - No Zod Validation**:
```typescript
'use server';

// ❌ WRONG - No validation!
export async function updateWorkoutAction(data: {
  workoutId: string;
  name: string;
  date: string;
}) {
  const session = await auth();

  // Directly using unvalidated data - SECURITY RISK!
  return await updateWorkout(data.workoutId, session.user.id, data);
}
```

### Always Verify User Ownership

**All mutations MUST verify the user owns the resource being modified.**

✅ **CORRECT**:
```typescript
'use server';

export async function deleteWorkoutAction(workoutId: string) {
  const session = await auth();
  if (!session?.user?.id) {
    throw new Error('Unauthorized');
  }

  // ✅ Passes userId to verify ownership
  await deleteWorkout(workoutId, session.user.id);

  revalidatePath('/dashboard/workouts');
}
```

❌ **WRONG - No Ownership Check**:
```typescript
'use server';

// ❌ WRONG - Doesn't verify ownership!
export async function deleteWorkoutAction(workoutId: string) {
  await db.delete(workouts).where(eq(workouts.id, workoutId));
}
```

## Parameter Typing Rules

### ✅ CORRECT - Typed Object Parameters

```typescript
'use server';

// ✅ Use typed object parameters
export async function createWorkoutAction(data: {
  name: string;
  date: string;
  notes?: string;
}) {
  const validatedData = CreateWorkoutSchema.parse(data);
  // ...
}

// ✅ Multiple parameters with explicit types
export async function updateWorkoutAction(
  workoutId: string,
  data: { name: string; date: string }
) {
  // ...
}
```

### ❌ WRONG - FormData Type

```typescript
'use server';

// ❌ WRONG - Don't use FormData as parameter type
export async function createWorkoutAction(formData: FormData) {
  const name = formData.get('name');
  // ...
}

// ❌ WRONG - Any type
export async function createWorkoutAction(data: any) {
  // ...
}

// ❌ WRONG - Untyped
export async function createWorkoutAction(data) {
  // ...
}
```

## Error Handling

### Proper Error Handling Pattern

```typescript
'use server';

import { z } from 'zod';

export async function createWorkoutAction(data: {
  name: string;
  date: string;
}) {
  try {
    // 1. Authenticate
    const session = await auth();
    if (!session?.user?.id) {
      return { error: 'Unauthorized' };
    }

    // 2. Validate
    const validatedData = CreateWorkoutSchema.parse(data);

    // 3. Mutate
    const workout = await createWorkout({
      userId: session.user.id,
      ...validatedData,
    });

    // 4. Revalidate
    revalidatePath('/dashboard/workouts');

    // 5. Return success
    return { success: true, workout };

  } catch (error) {
    // Handle Zod validation errors
    if (error instanceof z.ZodError) {
      return { error: 'Invalid input', details: error.errors };
    }

    // Handle other errors
    console.error('Failed to create workout:', error);
    return { error: 'Failed to create workout' };
  }
}
```

## Revalidation

### Always Revalidate After Mutations

After data mutations, you MUST revalidate affected paths:

```typescript
'use server';

import { revalidatePath } from 'next/cache';

export async function createWorkoutAction(data: { name: string }) {
  // ... mutation logic ...

  // ✅ Revalidate the list page
  revalidatePath('/dashboard/workouts');

  // ✅ Revalidate specific workout page if applicable
  revalidatePath(`/dashboard/workouts/${workout.id}`);

  return { success: true };
}
```

## Anti-Patterns to Avoid

### ❌ NO Server-Side Redirects

```typescript
// ❌ WRONG - Don't use redirect() in server actions
'use server';

import { redirect } from 'next/navigation';

export async function createWorkoutAction(data: { name: string }) {
  const session = await auth();
  const workout = await createWorkout({ userId: session.user.id, ...data });

  revalidatePath('/dashboard/workouts');
  redirect(`/dashboard/workouts/${workout.id}`); // ❌ WRONG!
}
```

✅ **CORRECT - Return data and redirect client-side**:
```typescript
// ✅ CORRECT - Server action returns data
'use server';

export async function createWorkoutAction(data: { name: string }) {
  const session = await auth();
  const workout = await createWorkout({ userId: session.user.id, ...data });

  revalidatePath('/dashboard/workouts');
  return { success: true, workout }; // ✅ Return data
}

// ✅ CORRECT - Client component handles redirect
'use client';

import { useRouter } from 'next/navigation';

export function WorkoutForm() {
  const router = useRouter();

  async function handleSubmit(data) {
    const result = await createWorkoutAction(data);
    if (result?.success && result.workout) {
      router.push(`/dashboard/workouts/${result.workout.id}`); // ✅ Client-side redirect
    }
  }
}
```

### ❌ NO API Routes for Mutations

```typescript
// ❌ WRONG - Don't create API routes for mutations
// /app/api/workouts/route.ts
export async function POST(request: Request) {
  const body = await request.json();
  await createWorkout(body);
  return Response.json({ success: true });
}
```

### ❌ NO Direct DB Calls in Server Actions

```typescript
// ❌ WRONG - Don't call DB directly in actions
'use server';

export async function createWorkoutAction(data: { name: string }) {
  // ❌ Direct DB call in action
  const [workout] = await db.insert(workouts).values(data).returning();
  return workout;
}
```

### ❌ NO Client-Side Mutations

```typescript
// ❌ WRONG - Don't mutate data on client
'use client';

export function WorkoutForm() {
  async function handleSubmit() {
    // ❌ Direct DB call from client (won't work)
    await db.insert(workouts).values({ name: 'Test' });
  }
}
```

## Complete Example: Update Workout

### src/app/workouts/actions.ts
```typescript
'use server';

import { z } from 'zod';
import { updateWorkout } from '@/data/workouts';
import { auth } from '@/auth';
import { revalidatePath } from 'next/cache';

const UpdateWorkoutSchema = z.object({
  workoutId: z.string().uuid(),
  name: z.string().min(1).max(100).optional(),
  date: z.string().refine((date) => !isNaN(Date.parse(date))).optional(),
  notes: z.string().max(500).optional(),
});

export async function updateWorkoutAction(data: {
  workoutId: string;
  name?: string;
  date?: string;
  notes?: string;
}) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return { error: 'Unauthorized' };
    }

    const validatedData = UpdateWorkoutSchema.parse(data);

    const workout = await updateWorkout(
      validatedData.workoutId,
      session.user.id,
      {
        name: validatedData.name,
        date: validatedData.date ? new Date(validatedData.date) : undefined,
        notes: validatedData.notes,
      }
    );

    if (!workout) {
      return { error: 'Workout not found or unauthorized' };
    }

    revalidatePath('/dashboard/workouts');
    revalidatePath(`/dashboard/workouts/${workout.id}`);

    return { success: true, workout };
  } catch (error) {
    if (error instanceof z.ZodError) {
      return { error: 'Invalid input', details: error.errors };
    }
    console.error('Failed to update workout:', error);
    return { error: 'Failed to update workout' };
  }
}
```

## Summary

1. **Server Actions ONLY** in colocated `actions.ts` files (e.g., `src/app/workouts/actions.ts`, `src/app/exercises/actions.ts`)
2. **Typed parameters** - NEVER use `FormData` type
3. **Zod validation** for ALL inputs - no exceptions
4. **Helper functions in `/src/data`** using Drizzle ORM
5. **Always verify userId** - users can only mutate their own data
6. **NO raw SQL** - use Drizzle ORM exclusively
7. **NO API routes** for mutations
8. **NO server-side redirects** - use `router.push()` client-side instead
9. **Revalidate paths** after successful mutations
10. **Proper error handling** with try/catch and typed returns

These rules ensure security, type safety, and maintainability for all data mutations.
