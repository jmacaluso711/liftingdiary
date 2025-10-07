# Authentication Coding Standards

## Authentication Provider

**CRITICAL RULE**: This project uses **Clerk** for authentication.

- ✅ **DO**: Use Clerk for all authentication and user management
- ✅ **DO**: Use Clerk's React hooks and components
- ❌ **DO NOT**: Implement custom authentication logic
- ❌ **DO NOT**: Use any other authentication libraries

All authentication must be handled through [Clerk](https://clerk.com/). This includes sign-in, sign-up, user management, session handling, and authorization.

## Installation

```bash
npm install @clerk/nextjs
```

## Environment Variables

Required environment variables in `.env.local`:

```env
NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=pk_test_...
CLERK_SECRET_KEY=sk_test_...
```

Optional routing configuration:

```env
NEXT_PUBLIC_CLERK_SIGN_IN_URL=/sign-in
NEXT_PUBLIC_CLERK_SIGN_UP_URL=/sign-up
NEXT_PUBLIC_CLERK_AFTER_SIGN_IN_URL=/
NEXT_PUBLIC_CLERK_AFTER_SIGN_UP_URL=/
```

## Setup

### Root Layout Configuration

Wrap your application with `ClerkProvider` in `app/layout.tsx`:

```typescript
import { ClerkProvider } from '@clerk/nextjs';

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <ClerkProvider>
      <html lang="en">
        <body>{children}</body>
      </html>
    </ClerkProvider>
  );
}
```

## Client Components

### Getting Current User

Use the `useUser` hook in client components:

```typescript
'use client';

import { useUser } from '@clerk/nextjs';

export function ProfileComponent() {
  const { isLoaded, isSignedIn, user } = useUser();

  if (!isLoaded) {
    return <div>Loading...</div>;
  }

  if (!isSignedIn) {
    return <div>Please sign in</div>;
  }

  return <div>Hello, {user.firstName}!</div>;
}
```

### Authentication UI Components

Use Clerk's pre-built UI components:

```typescript
'use client';

import { SignIn, SignUp, UserButton } from '@clerk/nextjs';

// Sign In Page
export function SignInPage() {
  return <SignIn />;
}

// Sign Up Page
export function SignUpPage() {
  return <SignUp />;
}

// User Menu Button
export function Header() {
  return (
    <header>
      <UserButton />
    </header>
  );
}
```

## Server Components

### Getting Current User

Use `auth()` or `currentUser()` in server components and route handlers:

```typescript
import { auth, currentUser } from '@clerk/nextjs/server';

// Get user ID and session claims
export default async function Page() {
  const { userId } = await auth();

  if (!userId) {
    return <div>Not signed in</div>;
  }

  return <div>User ID: {userId}</div>;
}

// Get full user object
export default async function ProfilePage() {
  const user = await currentUser();

  if (!user) {
    return <div>Not signed in</div>;
  }

  return <div>Email: {user.emailAddresses[0].emailAddress}</div>;
}
```

## Route Protection

### Middleware Protection

Create `middleware.ts` in the root directory to protect routes:

```typescript
import { clerkMiddleware, createRouteMatcher } from '@clerk/nextjs/server';

const isProtectedRoute = createRouteMatcher([
  '/dashboard(.*)',
  '/workouts(.*)',
]);

export default clerkMiddleware(async (auth, req) => {
  if (isProtectedRoute(req)) {
    await auth.protect();
  }
});

export const config = {
  matcher: [
    '/((?!_next|[^?]*\\.(?:html?|css|js(?!on)|jpe?g|webp|png|gif|svg|ttf|woff2?|ico|csv|docx?|xlsx?|zip|webmanifest)).*)',
    '/(api|trpc)(.*)',
  ],
};
```

### Component-Level Protection

For protecting specific pages:

```typescript
import { auth } from '@clerk/nextjs/server';
import { redirect } from 'next/navigation';

export default async function ProtectedPage() {
  const { userId } = await auth();

  if (!userId) {
    redirect('/sign-in');
  }

  // Protected content
  return <div>Protected Content</div>;
}
```

## API Routes

### Protecting API Routes

```typescript
import { auth } from '@clerk/nextjs/server';
import { NextResponse } from 'next/server';

export async function GET() {
  const { userId } = await auth();

  if (!userId) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  // API logic
  return NextResponse.json({ data: 'Protected data' });
}
```

## User Metadata

### Accessing User Data

```typescript
import { currentUser } from '@clerk/nextjs/server';

export default async function Page() {
  const user = await currentUser();

  if (!user) return null;

  // Basic user info
  const email = user.emailAddresses[0].emailAddress;
  const firstName = user.firstName;
  const lastName = user.lastName;
  const imageUrl = user.imageUrl;

  // User metadata (custom data)
  const publicMetadata = user.publicMetadata;
  const privateMetadata = user.privateMetadata;

  return <div>{/* Use user data */}</div>;
}
```

## Best Practices

### DO

- ✅ Always check `isLoaded` before checking `isSignedIn` in client components
- ✅ Use `auth()` for simple user ID checks in server components
- ✅ Use `currentUser()` when you need full user information
- ✅ Protect routes using middleware for better performance
- ✅ Handle loading and unauthenticated states gracefully
- ✅ Use Clerk's pre-built components for auth UI

### DO NOT

- ❌ Store sensitive data in `publicMetadata` (use `privateMetadata` instead)
- ❌ Make authentication decisions on the client side only
- ❌ Assume user data is available without checking
- ❌ Create custom sign-in/sign-up forms (use Clerk's components)
- ❌ Store JWTs or session tokens manually (Clerk handles this)

## Organization & User Management

### User IDs

Clerk user IDs follow the format `user_xxxxxxxxxxxxx`. Always use this ID for:

- Database foreign keys
- API authorization checks
- User-specific data queries

### Session Management

Sessions are automatically managed by Clerk. No manual token handling required.

## Testing

When testing authenticated flows:

1. Use Clerk's testing tokens for development
2. Configure separate Clerk instances for development/staging/production
3. Never commit Clerk secret keys to version control

## Resources

- [Clerk Next.js Documentation](https://clerk.com/docs/quickstarts/nextjs)
- [Clerk Dashboard](https://dashboard.clerk.com/)
- [Clerk Community Discord](https://clerk.com/discord)
