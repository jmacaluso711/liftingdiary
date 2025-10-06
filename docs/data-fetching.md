# Data Fetching

## ⚠️ CRITICAL: Server Components Only

**ALL data fetching in this application MUST be done via React Server Components.**

### Strict Rules

1. **Server Components ONLY**: Data fetching MUST happen in Server Components
2. **NO Route Handlers**: Do NOT create API routes for data fetching
3. **NO Client Components**: Do NOT fetch data in Client Components (no `useEffect`, `useSWR`, etc.)
4. **NO Other Methods**: Server Components are the ONLY approved method for data fetching

## Database Queries

### Required Pattern: Helper Functions in `/data`

All database queries MUST follow this pattern:

1. Create helper functions in the `/data` directory
2. Use **Drizzle ORM** for ALL database queries
3. **NEVER use raw SQL**
4. Helper functions must be called from Server Components only

### Example Structure

```typescript
// /data/workouts.ts
import { db } from '@/db';
import { workouts } from '@/db/schema';
import { eq, and } from 'drizzle-orm';

export async function getWorkoutsByUserId(userId: string) {
  return await db
    .select()
    .from(workouts)
    .where(eq(workouts.userId, userId));
}

export async function getWorkoutById(workoutId: string, userId: string) {
  const result = await db
    .select()
    .from(workouts)
    .where(
      and(
        eq(workouts.id, workoutId),
        eq(workouts.userId, userId) // CRITICAL: Always filter by userId
      )
    );

  return result[0] ?? null;
}
```

```typescript
// /app/dashboard/page.tsx (Server Component)
import { getWorkoutsByUserId } from '@/data/workouts';
import { auth } from '@/auth'; // or your auth solution

export default async function DashboardPage() {
  const session = await auth();
  if (!session?.user?.id) {
    redirect('/login');
  }

  const workouts = await getWorkoutsByUserId(session.user.id);

  return (
    <div>
      {/* Render workouts */}
    </div>
  );
}
```

## 🔒 CRITICAL: Data Security

### User Data Isolation

**Every user can ONLY access their own data. This is non-negotiable.**

### Mandatory Security Pattern

✅ **ALWAYS** include user ID filtering in database queries:

```typescript
// ✅ CORRECT - Filters by userId
export async function getUserWorkouts(userId: string) {
  return await db
    .select()
    .from(workouts)
    .where(eq(workouts.userId, userId));
}

// ✅ CORRECT - Double-checks userId even when using workoutId
export async function getWorkout(workoutId: string, userId: string) {
  return await db
    .select()
    .from(workouts)
    .where(
      and(
        eq(workouts.id, workoutId),
        eq(workouts.userId, userId) // ALWAYS verify ownership
      )
    );
}
```

❌ **NEVER** query without user ID filtering:

```typescript
// ❌ WRONG - No userId filter (security vulnerability!)
export async function getWorkout(workoutId: string) {
  return await db
    .select()
    .from(workouts)
    .where(eq(workouts.id, workoutId)); // Missing userId check!
}
```

### Security Checklist

Before writing any data helper function, verify:

- [ ] Does this query filter by `userId`?
- [ ] Can users access ONLY their own data?
- [ ] Are ALL query paths protected by user ID checks?
- [ ] Is the userId obtained from a trusted source (session/auth)?

## Why Server Components Only?

### Benefits

1. **Security**: Data never exposed to client bundle
2. **Performance**: Queries run server-side, closer to database
3. **Simplicity**: No API routes, loading states, or client-side fetching logic
4. **Type Safety**: End-to-end TypeScript from DB to component
5. **Streaming**: Native support for React Suspense and streaming

### Anti-Patterns to Avoid

❌ **NO API Routes for Data**:
```typescript
// ❌ WRONG - Don't do this
// /app/api/workouts/route.ts
export async function GET() {
  const workouts = await getWorkouts();
  return Response.json(workouts);
}
```

❌ **NO Client-Side Fetching**:
```typescript
// ❌ WRONG - Don't do this
'use client';

export default function Workouts() {
  const [workouts, setWorkouts] = useState([]);

  useEffect(() => {
    fetch('/api/workouts')
      .then(res => res.json())
      .then(setWorkouts);
  }, []);
}
```

✅ **YES - Server Component**:
```typescript
// ✅ CORRECT - Do this
import { getWorkoutsByUserId } from '@/data/workouts';

export default async function Workouts({ userId }: { userId: string }) {
  const workouts = await getWorkoutsByUserId(userId);

  return (
    <div>
      {workouts.map(workout => (
        <WorkoutCard key={workout.id} workout={workout} />
      ))}
    </div>
  );
}
```

## Summary

1. **Server Components ONLY** for data fetching
2. **Helper functions in `/data`** using Drizzle ORM
3. **ALWAYS filter by userId** - users can only see their own data
4. **NO raw SQL** - use Drizzle ORM
5. **NO API routes** for data fetching
6. **NO client-side fetching**

These rules ensure security, performance, and maintainability.
