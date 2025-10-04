# Code Style Guide

## Context

Global code style rules for Agent OS projects.

<conditional-block context-check="general-formatting">
IF this General Formatting section already read in current context:
  SKIP: Re-reading this section
  NOTE: "Using General Formatting rules already in context"
ELSE:
  READ: The following formatting rules

## General Formatting

### Indentation
- Use 2 spaces for indentation (never tabs)
- Maintain consistent indentation throughout files
- Align nested structures for readability

### Naming Conventions
- **Functions and Variables**: Use camelCase (e.g., `userProfile`, `calculateTotal`)
- **Components and Types**: Use PascalCase (e.g., `UserProfile`, `PaymentProcessor`)
- **Constants**: Use UPPER_SNAKE_CASE (e.g., `MAX_RETRY_COUNT`)
- **Files**: Use kebab-case for components (e.g., `user-profile.tsx`)
- **Database Fields**: Use snake_case via Prisma schema (e.g., `user_id`, `created_at`)

### String Formatting
- Use single quotes for strings: `'Hello World'`
- Use backticks for template literals with interpolation: `` `Hello ${name}` ``
- Use double quotes only for JSX attributes when needed

### Code Comments
- Add JSDoc comments above functions and components
- Document complex algorithms or calculations
- Explain the "why" behind implementation choices
- Never remove existing comments unless removing the associated code
- Update comments when modifying code to maintain accuracy
- Keep comments concise and relevant
</conditional-block>

<conditional-block task-condition="typescript-react" context-check="typescript-react-style">
IF current task involves writing or updating TypeScript or React:
  IF typescript-style.md AND react-style.md already in context:
    SKIP: Re-reading these files
    NOTE: "Using TypeScript/React style guides already in context"
  ELSE:
    <context_fetcher_strategy>
      IF current agent is Claude Code AND context-fetcher agent exists:
        USE: @agent:context-fetcher
        REQUEST: "Get TypeScript style rules from code-style/typescript-style.md"
        REQUEST: "Get React/Next.js rules from code-style/react-style.md"
        PROCESS: Returned style rules
      ELSE:
        READ the following style guides (only if not already in context):
        - @.agent-os/standards/code-style/typescript-style.md (if not in context)
        - @.agent-os/standards/code-style/react-style.md (if not in context)

## TypeScript Style Rules

### Type Definitions
- Use `interface` for object shapes, `type` for unions/primitives
- Generate types from Prisma schema using `prisma generate`
- Place custom types in `types/` directory
- Use descriptive type names that reflect business domain

## Theme Usage

- Always import `index.css` as the base stylesheet
- Theme variables are defined in `index.css` from tweakcn.com
- Do not override theme variables without documenting the reason

### Function Types
```typescript
// Prefer function declarations for named functions
function calculateTotal(items: CartItem[]): number {
  return items.reduce((sum, item) => sum + item.price, 0)
}

// Use arrow functions for callbacks and short functions
const filterActiveUsers = (users: User[]) => users.filter(u => u.isActive)
```

### Error Handling
- Use Result pattern for functions that can fail
- Type errors appropriately with discriminated unions
- Implement proper error boundaries in React components

### Import/Export
- Use named exports for utilities and components
- Use default exports only for pages and single-purpose modules
- Group imports: external libraries, internal modules, relative imports
- Use absolute imports with TypeScript path mapping

## React/Next.js Style Rules

### Component Structure
```typescript
// Server Component (default)
interface UserProfileProps {
  userId: string
}

export default async function UserProfile({ userId }: UserProfileProps) {
  const user = await getUserById(userId)
  
  return (
    <div className="space-y-4">
      {/* Component content */}
    </div>
  )
}
```

### Client Components
```typescript
'use client'

import { useState } from 'react'

interface InteractiveButtonProps {
  onSubmit: (data: FormData) => void
  disabled?: boolean
}

export function InteractiveButton({ onSubmit, disabled = false }: InteractiveButtonProps) {
  const [isLoading, setIsLoading] = useState(false)
  
  // Component logic
}
```

### Hooks
- Use custom hooks for shared component logic
- Prefix custom hooks with `use`
- Keep hooks focused on single responsibility
- Place custom hooks in `hooks/` directory

### Event Handlers
- Use descriptive handler names: `handleSubmit`, `handleInputChange`
- Define handlers inside component body for closures
- Use `useCallback` for handlers passed to children when needed
    </context_fetcher_strategy>
ELSE:
  SKIP: TypeScript/React style guides not relevant to current task
</conditional-block>

<conditional-block task-condition="html-css-tailwind" context-check="html-css-style">
IF current task involves writing or updating HTML, CSS, or TailwindCSS:
  IF html-style.md AND css-style.md already in context:
    SKIP: Re-reading these files
    NOTE: "Using HTML/CSS style guides already in context"
  ELSE:
    <context_fetcher_strategy>
      IF current agent is Claude Code AND context-fetcher agent exists:
        USE: @agent:context-fetcher
        REQUEST: "Get HTML formatting rules from code-style/html-style.md"
        REQUEST: "Get CSS and TailwindCSS rules from code-style/css-style.md"
        PROCESS: Returned style rules
      ELSE:
        READ the following style guides (only if not already in context):
        - @.agent-os/standards/code-style/html-style.md (if not in context)
        - @.agent-os/standards/code-style/css-style.md (if not in context)

## HTML/JSX Style Rules

### JSX Structure
- Use semantic HTML elements when possible
- Keep JSX readable with proper indentation
- Use fragments (`<>`) instead of unnecessary divs
- Place props on new lines for complex components

### Accessibility
- Always include `alt` attributes for images
- Use proper heading hierarchy (h1 → h6)
- Include `aria-label` for icon buttons
- Ensure proper focus management

## TailwindCSS Style Rules

### Class Organization
- Group related classes together
- Use consistent ordering: layout → spacing → typography → colors → effects
- Extract repeated patterns to components
- Use Tailwind's arbitrary value syntax sparingly

### Responsive Design
- Mobile-first approach: base classes for mobile, prefixes for larger screens
- Use consistent breakpoints across project
- Group responsive classes together

### Example
```jsx
<button 
  className="
    inline-flex items-center justify-center
    px-4 py-2 
    text-sm font-medium 
    text-white bg-blue-600 hover:bg-blue-700
    border border-transparent rounded-md
    focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2
    disabled:opacity-50 disabled:cursor-not-allowed
  "
>
  Submit
</button>
```
    </context_fetcher_strategy>
ELSE:
  SKIP: HTML/CSS style guides not relevant to current task
</conditional-block>

<conditional-block task-condition="prisma-database" context-check="prisma-style">
IF current task involves writing or updating Prisma schema or database code:
  IF prisma-style.md already in context:
    SKIP: Re-reading this file
    NOTE: "Using Prisma style guide already in context"
  ELSE:
    <context_fetcher_strategy>
      IF current agent is Claude Code AND context-fetcher agent exists:
        USE: @agent:context-fetcher
        REQUEST: "Get Prisma style rules from code-style/prisma-style.md"
        PROCESS: Returned style rules
      ELSE:
        READ the following style guide (only if not already in context):
        - @.agent-os/standards/code-style/prisma-style.md (if not in context)

## Prisma Style Rules

### Schema Organization
```prisma
// Group related models together
// Place enums before models that use them
// Use consistent field ordering: id, required fields, optional fields, relations, metadata

enum UserRole {
  ADMIN
  USER
  MODERATOR
}

model User {
  id        String   @id @default(cuid())
  email     String   @unique
  name      String?
  role      UserRole @default(USER)
  
  // Relations
  posts     Post[]
  profile   Profile?
  
  // Metadata
  createdAt DateTime @default(now()) @map("created_at")
  updatedAt DateTime @updatedAt @map("updated_at")
  
  @@map("users")
}
```

### Naming Conventions
- Use PascalCase for model names
- Use camelCase for field names
- Use snake_case for database table/column names with `@map`
- Use descriptive relation field names

### Queries
```typescript
// Use select for performance
const user = await prisma.user.findUnique({
  where: { id: userId },
  select: {
    id: true,
    name: true,
    email: true,
  }
})

// Use transactions for multi-step operations
const result = await prisma.$transaction(async (tx) => {
  await tx.user.update({ where: { id }, data: { credits: { decrement: cost } } })
  return tx.purchase.create({ data: { userId: id, amount: cost } })
})
```
    </context_fetcher_strategy>
ELSE:
  SKIP: Prisma style guide not relevant to current task
</conditional-block>

<conditional-block task-condition="nextauth" context-check="nextauth-style">
IF current task involves writing or updating authentication code:
  IF nextauth-style.md already in context:
    SKIP: Re-reading this file
    NOTE: "Using NextAuth style guide already in context"
  ELSE:
    <context_fetcher_strategy>
      IF current agent is Claude Code AND context-fetcher agent exists:
        USE: @agent:context-fetcher
        REQUEST: "Get NextAuth style rules from code-style/nextauth-style.md"
        PROCESS: Returned style rules
      ELSE:
        READ the following style guide (only if not already in context):
        - @.agent-os/standards/code-style/nextauth-style.md (if not in context)

## NextAuth.js Style Rules

### Configuration Structure
```typescript
// auth.config.ts
import type { NextAuthConfig } from 'next-auth'
import Google from 'next-auth/providers/google'

export const authConfig = {
  providers: [
    Google({
      clientId: process.env.GOOGLE_CLIENT_ID,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET,
    })
  ],
  callbacks: {
    jwt({ token, user }) {
      if (user) {
        token.role = user.role
      }
      return token
    },
    session({ session, token }) {
      session.user.id = token.sub!
      session.user.role = token.role
      return session
    },
  },
} satisfies NextAuthConfig
```

### Route Protection
```typescript
// middleware.ts
import { auth } from '@/auth'
import { NextResponse } from 'next/server'

export default auth((req) => {
  const { nextUrl } = req
  const isLoggedIn = !!req.auth
  
  const isAuthPage = nextUrl.pathname.startsWith('/auth')
  const isProtectedPage = nextUrl.pathname.startsWith('/dashboard')
  
  if (isProtectedPage && !isLoggedIn) {
    return NextResponse.redirect(new URL('/auth/signin', nextUrl))
  }
  
  if (isAuthPage && isLoggedIn) {
    return NextResponse.redirect(new URL('/dashboard', nextUrl))
  }
})

export const config = {
  matcher: ['/((?!api|_next/static|_next/image|favicon.ico).*)']
}
```

### Session Usage
```typescript
// In Server Components
import { auth } from '@/auth'

export default async function ProtectedPage() {
  const session = await auth()
  
  if (!session?.user) {
    redirect('/auth/signin')
  }
  
  return <div>Hello {session.user.name}</div>
}

// In Client Components
'use client'
import { useSession } from 'next-auth/react'

export function ClientComponent() {
  const { data: session, status } = useSession()
  
  if (status === 'loading') return <div>Loading...</div>
  if (!session) return <div>Please sign in</div>
  
  return <div>Hello {session.user?.name}</div>
}
```
    </context_fetcher_strategy>
ELSE:
  SKIP: NextAuth style guide not relevant to current task
</conditional-block>