# Server Components

## ⚠️ CRITICAL: Next.js 15 Params Are Promises

**In Next.js 15, `params` is ALWAYS a Promise and MUST be awaited.**

### Strict Rules

1. **Always Await Params**: `params` must be awaited before accessing any properties
2. **Always Await SearchParams**: `searchParams` must be awaited before accessing any properties
3. **TypeScript Types**: Use `Promise<{ paramName: string }>` for params type definitions
4. **No Direct Access**: Never access `params.id` directly - always await first

## Params Access Pattern

### ✅ CORRECT - Await Params

```typescript
// app/dashboard/workout/[workoutId]/page.tsx

interface WorkoutPageProps {
  params: Promise<{
    workoutId: string;
  }>;
}

export default async function WorkoutPage({ params }: WorkoutPageProps) {
  // ✅ CORRECT - Await params before accessing properties
  const { workoutId } = await params;

  // Now you can use workoutId
  const workout = await getWorkoutById(parseInt(workoutId, 10), userId);

  return <div>{workout.name}</div>;
}
```

### ❌ WRONG - Direct Access

```typescript
// ❌ WRONG - Don't access params directly
interface WorkoutPageProps {
  params: {
    workoutId: string;
  };
}

export default async function WorkoutPage({ params }: WorkoutPageProps) {
  // ❌ WRONG - This will cause a runtime error in Next.js 15
  const workoutId = params.workoutId;

  return <div>...</div>;
}
```

## SearchParams Access Pattern

### ✅ CORRECT - Await SearchParams

```typescript
// app/dashboard/page.tsx

interface DashboardPageProps {
  searchParams: Promise<{
    date?: string;
    filter?: string;
  }>;
}

export default async function DashboardPage({ searchParams }: DashboardPageProps) {
  // ✅ CORRECT - Await searchParams before accessing properties
  const { date, filter } = await searchParams;

  // Now you can use the search params
  const workouts = await getWorkoutsByDate(date);

  return <div>...</div>;
}
```

### ❌ WRONG - Direct SearchParams Access

```typescript
// ❌ WRONG - Don't access searchParams directly
interface DashboardPageProps {
  searchParams: {
    date?: string;
  };
}

export default async function DashboardPage({ searchParams }: DashboardPageProps) {
  // ❌ WRONG - This will cause a runtime error
  const date = searchParams.date;

  return <div>...</div>;
}
```

## Complete Example with Both Params and SearchParams

```typescript
// app/posts/[postId]/page.tsx

interface PostPageProps {
  params: Promise<{
    postId: string;
  }>;
  searchParams: Promise<{
    sort?: string;
    view?: string;
  }>;
}

export default async function PostPage({
  params,
  searchParams
}: PostPageProps) {
  // ✅ CORRECT - Await both params and searchParams
  const { postId } = await params;
  const { sort, view } = await searchParams;

  // Use the values
  const post = await getPostById(postId);
  const comments = await getComments(postId, { sort });

  return (
    <div>
      <h1>{post.title}</h1>
      <Comments data={comments} view={view} />
    </div>
  );
}
```

## Parallel Awaiting (Optional Optimization)

For better performance, you can await params and searchParams in parallel:

```typescript
export default async function Page({ params, searchParams }: PageProps) {
  // ✅ CORRECT - Await in parallel for better performance
  const [{ postId }, { sort, view }] = await Promise.all([
    params,
    searchParams,
  ]);

  // Use the values
  const post = await getPostById(postId);

  return <div>{post.title}</div>;
}
```

However, sequential awaiting is perfectly fine and more readable:

```typescript
export default async function Page({ params, searchParams }: PageProps) {
  // ✅ Also CORRECT - Sequential is fine and more readable
  const { postId } = await params;
  const { sort } = await searchParams;

  return <div>...</div>;
}
```

## Dynamic Routes with Multiple Params

```typescript
// app/blog/[category]/[postId]/page.tsx

interface BlogPostPageProps {
  params: Promise<{
    category: string;
    postId: string;
  }>;
}

export default async function BlogPostPage({ params }: BlogPostPageProps) {
  // ✅ CORRECT - Await and destructure multiple params
  const { category, postId } = await params;

  const post = await getPostByCategoryAndId(category, postId);

  return <div>{post.title}</div>;
}
```

## Catch-All Routes

```typescript
// app/docs/[...slug]/page.tsx

interface DocsPageProps {
  params: Promise<{
    slug: string[];
  }>;
}

export default async function DocsPage({ params }: DocsPageProps) {
  // ✅ CORRECT - Await catch-all params
  const { slug } = await params;

  // slug is an array of path segments
  const path = slug.join('/');
  const content = await getDocsByPath(path);

  return <div>{content}</div>;
}
```

## Common Mistakes to Avoid

### ❌ Forgetting to Await

```typescript
// ❌ WRONG
export default async function Page({ params }: PageProps) {
  const id = params.id; // Runtime error - params is a Promise!
  return <div>{id}</div>;
}
```

### ❌ Wrong Type Definition

```typescript
// ❌ WRONG - params should be Promise<{...}>
interface PageProps {
  params: {
    id: string;
  };
}
```

### ❌ Using .then() Instead of Await

```typescript
// ❌ WRONG - Don't use .then(), use await
export default async function Page({ params }: PageProps) {
  const id = params.then(p => p.id); // This is incorrect
  return <div>...</div>;
}
```

## Type Safety Checklist

Before deploying any Server Component with dynamic routes:

- [ ] Is `params` typed as `Promise<{ ... }>`?
- [ ] Is `searchParams` typed as `Promise<{ ... }>`?
- [ ] Are you awaiting `params` before accessing properties?
- [ ] Are you awaiting `searchParams` before accessing properties?
- [ ] Are you using `async` on the component function?

## Why This Change in Next.js 15?

Next.js 15 made `params` and `searchParams` asynchronous to:

1. **Enable Partial Prerendering (PPR)**: Allows for streaming and better performance
2. **Support Dynamic Rendering**: Better control over when components render
3. **Improve Type Safety**: Makes async behavior explicit in the type system
4. **Future-Proof**: Prepares for upcoming React and Next.js features

## Migration from Next.js 14

If you're upgrading from Next.js 14:

```typescript
// Next.js 14 (OLD)
export default function Page({ params }: { params: { id: string } }) {
  const id = params.id; // Direct access
  return <div>{id}</div>;
}

// Next.js 15 (NEW)
export default async function Page({
  params
}: {
  params: Promise<{ id: string }>
}) {
  const { id } = await params; // Must await
  return <div>{id}</div>;
}
```

## Summary

1. **Always await `params`** - It's a Promise in Next.js 15
2. **Always await `searchParams`** - Also a Promise in Next.js 15
3. **Type as `Promise<{ ... }>`** - Use correct TypeScript types
4. **Use `async` component functions** - Required for awaiting
5. **No direct property access** - Always await first

These rules ensure your Server Components work correctly with Next.js 15's async params behavior.
