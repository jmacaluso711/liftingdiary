# Routing Standards

## Overview

This document outlines the routing standards and conventions for the lifting diary application. All application routes are protected and accessed through the `/dashboard` base path.

## Route Structure

### Base Path
- **All application routes MUST be prefixed with `/dashboard`**
- The root `/` path should redirect or display a landing/login page
- Example valid routes:
  - `/dashboard` - Main dashboard
  - `/dashboard/workout` - Workout listing
  - `/dashboard/workout/[workoutId]` - Individual workout page
  - `/dashboard/settings` - User settings

### File Organization
Routes are organized using Next.js 15 App Router conventions:
```
src/app/
├── layout.tsx          # Root layout
├── page.tsx            # Landing/login page
└── dashboard/
    ├── layout.tsx      # Dashboard layout (applied to all dashboard routes)
    ├── page.tsx        # Dashboard home page
    └── [feature]/      # Feature-specific routes
        ├── page.tsx
        └── [id]/
            └── page.tsx
```

## Route Protection

### Middleware-Based Authentication
**All `/dashboard` routes and sub-routes MUST be protected using Next.js middleware.**

#### Implementation Requirements

1. **Middleware Location**: `src/middleware.ts` (or `src/middleware.js`)

2. **Protection Pattern**:
```typescript
import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

export function middleware(request: NextRequest) {
  // Check authentication status
  const isAuthenticated = checkAuth(request) // Implement based on auth strategy

  // Protect all /dashboard routes
  if (request.nextUrl.pathname.startsWith('/dashboard')) {
    if (!isAuthenticated) {
      // Redirect to login
      return NextResponse.redirect(new URL('/', request.url))
    }
  }

  return NextResponse.next()
}

// Configure which routes the middleware runs on
export const config = {
  matcher: [
    '/dashboard/:path*',  // Matches /dashboard and all sub-routes
  ]
}
```

3. **Matcher Configuration**:
   - Use the `matcher` config to specify which routes trigger the middleware
   - The pattern `/dashboard/:path*` ensures ALL dashboard routes are protected
   - Avoid running middleware on static assets (`/_next/static`, `/_next/image`, `/favicon.ico`)

4. **Authentication Check**:
   - Implement authentication verification based on your auth strategy (JWT, session cookies, etc.)
   - Check for valid session/token in cookies or headers
   - Verify token/session validity before granting access

5. **Redirect Behavior**:
   - Unauthenticated users accessing `/dashboard/*` should be redirected to `/` (or `/login` if separate)
   - Consider preserving the intended destination URL for post-login redirect:
     ```typescript
     const loginUrl = new URL('/', request.url)
     loginUrl.searchParams.set('redirect', request.nextUrl.pathname)
     return NextResponse.redirect(loginUrl)
     ```

### Additional Protection Layers

While middleware provides the primary protection layer, consider these supplementary measures:

1. **Server Component Checks**: Verify authentication in dashboard layout or individual pages for defense in depth
2. **API Route Protection**: If you have API routes under `/dashboard/api`, ensure they also verify authentication
3. **Client-Side Navigation Guards**: Optionally show loading states or redirect on client-side navigation

## Route Conventions

### Naming
- Use lowercase, hyphenated names: `/dashboard/my-workouts` (not `/dashboard/myWorkouts`)
- Use descriptive, RESTful-style paths: `/dashboard/workout/123/edit`
- Avoid deeply nested routes (3-4 levels maximum)

### Dynamic Routes
- Use square brackets for dynamic segments: `[workoutId]`, `[exerciseId]`
- Use descriptive names for route parameters (not `[id]` if more specific name exists)
- Validate route parameters in the page component

### Route Groups
- Use route groups `(groupName)` for organization without affecting URL structure
- Example: `dashboard/(authenticated)/` to group authenticated routes without adding to path

## Navigation

### Link Components
Always use Next.js `<Link>` component for internal navigation:
```tsx
import Link from 'next/link'

<Link href="/dashboard/workout">Workouts</Link>
```

### Programmatic Navigation
Use `useRouter` from `next/navigation` for programmatic navigation:
```tsx
'use client'
import { useRouter } from 'next/navigation'

const router = useRouter()
router.push('/dashboard/workout')
```

### Server-Side Redirects
Use `redirect` from `next/navigation` in Server Components:
```tsx
import { redirect } from 'next/navigation'

if (!authorized) {
  redirect('/dashboard')
}
```

## Best Practices

1. **Consistent Prefixing**: Never create routes that bypass the `/dashboard` prefix for authenticated features
2. **Middleware First**: Always implement route protection in middleware before server component checks
3. **Clear Separation**: Keep public routes (landing, login) separate from protected dashboard routes
4. **Loading States**: Implement loading.tsx files for better UX during navigation
5. **Error Handling**: Add error.tsx files to handle route-level errors gracefully
6. **Layouts**: Use nested layouts to share UI across related routes (e.g., dashboard layout for all dashboard pages)

## Security Considerations

- **Never rely solely on client-side protection** - always validate on server
- **Validate authentication tokens** on every protected route access
- **Implement CSRF protection** for forms and mutations
- **Use secure, httpOnly cookies** for session storage when possible
- **Rate limit** authentication attempts and API calls
- **Log security events** (failed auth attempts, suspicious access patterns)
