# Tech Stack

## Context

Global tech stack defaults for Agent OS projects, overridable in project-specific .agent-os/product/tech-stack.md.

App Framework: Next.js 14+ (App Router)
Language: TypeScript 5.0+
Runtime: Node.js 22 LTS
Primary Database: PostgreSQL 17+
ORM: Prisma 5.0+
Database Client: Prisma Client
JavaScript Framework: React 18+ (built into Next.js)
Build Tool: Next.js built-in (Turbopack/Webpack)
Import Strategy: ES modules
Package Manager: npm
CSS Framework: TailwindCSS 3.4+
UI Components: Headless UI / Radix UI
Authentication: NextAuth.js v4+ with JWT strategy
Session Storage: JWT tokens
Font Provider: Next.js Font Optimization (Google Fonts)
Font Loading: Automatic optimization via next/font
Icons: Lucide React components
API Routes: Next.js API Routes (App Router)
API Documentation: OpenAPI 3.0+ (Swagger)
Event Documentation: AsyncAPI 2.0+
State Management: React Server Components + Client state
Form Handling: React Hook Form + Zod validation
Application Hosting: Vercel / Digital Ocean App Platform
Hosting Region: Primary region based on user base
Database Hosting: Digital Ocean Managed PostgreSQL / Supabase
Database Migrations: Prisma Migrate
Database Backups: Daily automated
Asset Storage: Amazon S3 / Vercel Blob
CDN: Vercel Edge Network / CloudFront
Asset Access: Private with signed URLs
CI/CD Platform: GitHub Actions / Vercel Git Integration
CI/CD Trigger: Push to main/staging branches
Tests: Jest + React Testing Library
E2E Tests: Playwright
Production Environment: main branch
Staging Environment: staging branch
Environment Variables: .env.local (local) / Platform secrets (production)
Code Quality: ESLint + Prettier + TypeScript
Git Hooks: Husky + lint-staged
