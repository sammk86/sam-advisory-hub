# Development Best Practices

## Context

Global development guidelines for Agent OS projects.

## Development Flow

### Start with Database Schema Design
- Begin every project with comprehensive database schema design
- Define all models, relationships, and constraints upfront
- Use Prisma schema to establish single source of truth for data types
- Create seed data to populate development database
- Validate schema with thorough testing before proceeding

### Then Build API Layer
- Design API endpoints based on database schema
- Implement proper validation using Zod schemas
- Add comprehensive error handling and status codes
- Test all API endpoints thoroughly before frontend development
- Document API specifications for frontend consumption

### Finally Design Frontend
- Build frontend components that consume the tested API layer
- Use TypeScript types generated from Prisma schema
- Implement proper loading and error states
- Focus on user experience and responsive design
- Test frontend integration with backend APIs

This bottom-up approach ensures solid foundations and reduces refactoring later.

<conditional-block context-check="core-principles">
IF this Core Principles section already read in current context:
  SKIP: Re-reading this section
  NOTE: "Using Core Principles already in context"
ELSE:
  READ: The following principles

## Core Principles

### Keep It Simple
- Implement code in the fewest lines possible
- Avoid over-engineering solutions
- Choose straightforward approaches over clever ones
- Use React Server Components by default, only use Client Components when needed

### Optimize for Readability
- Prioritize code clarity over micro-optimizations
- Write self-documenting code with clear variable names
- Add JSDoc comments for "why" not "what"
- Use TypeScript types to make code intent clear

### DRY (Don't Repeat Yourself)
- Extract repeated business logic to utility functions
- Extract repeated UI markup to reusable components
- Create custom hooks for shared component logic
- Use Prisma schema for single source of truth for data types

### File Structure
- Keep files focused on a single responsibility
- Group related functionality together (colocation)
- Use Next.js App Router conventions (`page.tsx`, `layout.tsx`, `loading.tsx`)
- Place components near where they're used
</conditional-block>

<conditional-block context-check="nextjs-patterns" task-condition="nextjs-development">
IF current task involves Next.js development:
  IF Next.js Patterns section already read in current context:
    SKIP: Re-reading this section
    NOTE: "Using Next.js patterns already in context"
  ELSE:
    READ: The following patterns
ELSE:
  SKIP: Next.js patterns not relevant to current task

## Next.js Patterns

### Server vs Client Components
- Default to Server Components for better performance
- Use Client Components only for:
  - Interactive elements (onClick, onChange)
  - Browser APIs (localStorage, window)
  - React hooks (useState, useEffect)
  - Third-party libraries that require client-side execution

### Data Fetching
- Use async/await in Server Components for data fetching
- Implement loading.tsx for loading states
- Use error.tsx for error boundaries
- Cache data appropriately with Next.js caching strategies

### Route Handlers (API Routes)
- Keep API routes thin - delegate business logic to separate functions
- Use proper HTTP status codes and error handling
- Implement proper authentication middleware
- Use Zod for request/response validation

### Performance
- Use Next.js Image component for optimized images
- Implement proper metadata for SEO
- Use dynamic imports for code splitting when needed
- Leverage React Suspense for better UX
</conditional-block>

<conditional-block context-check="typescript-patterns" task-condition="typescript-development">
IF current task involves TypeScript development:
  IF TypeScript Patterns section already read in current context:
    SKIP: Re-reading this section
    NOTE: "Using TypeScript patterns already in context"
  ELSE:
    READ: The following patterns
ELSE:
  SKIP: TypeScript patterns not relevant to current task

## TypeScript Patterns

### Type Safety
- Generate types from Prisma schema using `prisma generate`
- Use strict TypeScript configuration
- Prefer type inference over explicit typing when clear
- Create custom types for business logic in `types/` directory

### Error Handling
- Use discriminated unions for API responses
- Implement proper error boundaries in React
- Use Result pattern for functions that can fail
- Type your errors appropriately

### Component Props
- Use interface for component props
- Make props readonly when possible
- Use generic types for reusable components
- Provide default props using default parameters
</conditional-block>

<conditional-block context-check="prisma-patterns" task-condition="database-development">
IF current task involves database/Prisma development:
  IF Prisma Patterns section already read in current context:
    SKIP: Re-reading this section
    NOTE: "Using Prisma patterns already in context"
  ELSE:
    READ: The following patterns
ELSE:
  SKIP: Prisma patterns not relevant to current task

## Database & Prisma Patterns

### Schema Design
- Use descriptive model and field names
- Implement proper relationships with foreign keys
- Add database constraints where appropriate
- Use enums for predefined values

### Query Optimization
- Use `select` to fetch only needed fields
- Implement proper pagination with `skip` and `take`
- Use `include` sparingly - prefer separate queries for better performance
- Consider database indexes for frequently queried fields

### Migrations
- Keep migrations atomic and reversible
- Test migrations on staging before production
- Use descriptive migration names
- Never edit existing migrations - create new ones

### Data Access Layer
- Create repository patterns for complex queries
- Use transactions for multi-step operations
- Implement proper error handling for database operations
- Cache frequently accessed data appropriately
</conditional-block>

<conditional-block context-check="authentication-patterns" task-condition="auth-development">
IF current task involves authentication development:
  IF Authentication Patterns section already read in current context:
    SKIP: Re-reading this section
    NOTE: "Using Authentication patterns already in context"
  ELSE:
    READ: The following patterns
ELSE:
  SKIP: Authentication patterns not relevant to current task

## Authentication Patterns

### NextAuth.js Setup
- Configure providers in `auth.config.ts`
- Use JWT strategy for stateless authentication
- Implement proper session handling
- Set up appropriate callbacks for customization

### Route Protection
- Use middleware for route-level protection
- Create higher-order components for protected pages
- Implement role-based access control
- Handle authentication state in components properly

### Security Best Practices
- Never expose sensitive data in client-side code
- Use environment variables for secrets
- Implement proper CSRF protection
- Validate user permissions on server-side
</conditional-block>

<conditional-block context-check="dependencies" task-condition="choosing-external-library">
IF current task involves choosing an external library:
  IF Dependencies section already read in current context:
    SKIP: Re-reading this section
    NOTE: "Using Dependencies guidelines already in context"
  ELSE:
    READ: The following guidelines
ELSE:
  SKIP: Dependencies section not relevant to current task

## Dependencies

### Choose Libraries Wisely
When adding third-party dependencies:
- Prioritize libraries with TypeScript support
- Check compatibility with React Server Components
- Select the most popular and actively maintained option
- Check the library's GitHub repository for:
  - Recent commits (within last 6 months)
  - Active issue resolution
  - Number of stars/downloads
  - Clear documentation
  - Next.js compatibility

### Preferred Libraries
- UI Components: Radix UI, Headless UI
- Forms: React Hook Form + Zod
- State Management: Zustand (if needed beyond React state)
- HTTP Client: Built-in fetch (Server Components) or SWR/TanStack Query (Client)
- Utilities: date-fns, clsx, nanoid
</conditional-block>

<conditional-block context-check="testing-patterns" task-condition="testing-development">
IF current task involves writing tests:
  IF Testing Patterns section already read in current context:
    SKIP: Re-reading this section
    NOTE: "Using Testing patterns already in context"
  ELSE:
    READ: The following patterns
ELSE:
  SKIP: Testing patterns not relevant to current task

## Testing Patterns

### Unit Testing
- Test business logic functions in isolation
- Use Jest for unit tests
- Mock external dependencies appropriately
- Focus on testing behavior, not implementation

### Component Testing
- Use React Testing Library for component tests
- Test user interactions and accessibility
- Mock API calls and database queries
- Test error states and loading states

### Integration Testing
- Test API routes with proper request/response cycles
- Test database operations with test database
- Use Playwright for end-to-end testing
- Test authentication flows thoroughly

### Test Organization
- Colocate tests with components (`__tests__` folders)
- Use descriptive test names
- Group related tests with `describe` blocks
- Set up proper test utilities and helpers
</conditional-block>