# Technical Stack

## Application Framework
- **Framework:** Next.js 14+ (App Router)
- **Language:** TypeScript 5.0+
- **Runtime:** Node.js 22 LTS

## Database & ORM
- **Primary Database:** PostgreSQL 17+
- **ORM:** Prisma 5.0+
- **Database Client:** Prisma Client
- **Database Hosting:** Digital Ocean Managed PostgreSQL
- **Database Migrations:** Prisma Migrate
- **Database Backups:** Daily automated

## Frontend Technologies
- **JavaScript Framework:** React 18+ (built into Next.js)
- **Build Tool:** Next.js built-in (Turbopack/Webpack)
- **Import Strategy:** ES modules
- **Package Manager:** npm
- **CSS Framework:** TailwindCSS 3.4+
- **UI Components:** Headless UI / Radix UI
- **State Management:** React Server Components + Client state
- **Form Handling:** React Hook Form + Zod validation

## Authentication & Security
- **Authentication:** NextAuth.js v4+ with JWT strategy
- **Session Storage:** JWT tokens
- **Authorization:** Role-based access control (Admin, Mentee, Advisory Client)

## API & Documentation
- **API Routes:** Next.js API Routes (App Router)
- **API Documentation:** OpenAPI 3.0+ (Swagger)
- **Event Documentation:** AsyncAPI 2.0+

## Third-Party Integrations
- **Payment Processing:** Stripe (subscriptions, one-time payments, invoicing)
- **Email Service:** SendGrid / AWS SES
- **Newsletter Service:** ConvertKit / Mailchimp
- **File Storage:** Amazon S3 / Vercel Blob
- **Video Conferencing:** External (Zoom, Google Meet links)

## Hosting & Deployment
- **Application Hosting:** Vercel
- **Hosting Region:** Primary region based on user base
- **CDN:** Vercel Edge Network
- **Asset Access:** Private with signed URLs
- **CI/CD Platform:** GitHub Actions / Vercel Git Integration
- **CI/CD Trigger:** Push to main/staging branches

## Development Tools
- **Font Provider:** Next.js Font Optimization (Google Fonts)
- **Font Loading:** Automatic optimization via next/font
- **Icons:** Lucide React components
- **Tests:** Jest + React Testing Library
- **E2E Tests:** Playwright
- **Code Quality:** ESLint + Prettier + TypeScript
- **Git Hooks:** Husky + lint-staged

## Environments
- **Production Environment:** main branch
- **Staging Environment:** staging branch
- **Environment Variables:** .env.local (local) / Platform secrets (production)

## Code Repository
- **Repository URL:** https://github.com/[username]/mentorship-advisory-platform

