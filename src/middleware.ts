import { withAuth } from 'next-auth/middleware'
import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

export default withAuth(
  function middleware(req) {
    const { pathname } = req.nextUrl
    const token = req.nextauth.token

    // Check if user confirmation check should be skipped for this route
    const skipConfirmationRoutes = [
      '/auth/signin',
      '/auth/signup', 
      '/auth/forgot-password',
      '/pending',
      '/rejected',
      '/test-users',
      '/about',
      '/blogs',
      '/videos',
      '/insights',
      '/calendar',
      '/contact',
    ]

    if (skipConfirmationRoutes.includes(pathname)) {
      return NextResponse.next()
    }

    // Apply user confirmation middleware
    if (token && !token.isConfirmed) {
      if (token.rejectionReason) {
        return NextResponse.redirect(new URL('/rejected', req.url))
      } else {
        return NextResponse.redirect(new URL('/pending', req.url))
      }
    }

    // Admin-only routes
    if (pathname.startsWith('/admin')) {
      if (token?.role !== 'ADMIN') {
        return NextResponse.redirect(new URL('/unauthorized', req.url))
      }
    }

    // Handle dashboard routing based on user role
    if (pathname === '/dashboard') {
      if (token?.role === 'ADMIN') {
        return NextResponse.redirect(new URL('/admin/dashboard', req.url))
      }
      // For regular users, allow access to /dashboard
      return NextResponse.next()
    }

    return NextResponse.next()
  },
  {
    callbacks: {
      authorized: ({ token, req }) => {
        const { pathname } = req.nextUrl
        
        // Public routes that don't require authentication
        const publicRoutes = [
          '/',
          '/about',
          '/blogs',
          '/videos',
          '/insights',
          '/calendar',
          '/services',
          '/pricing',
          '/contact',
          '/auth/signin',
          '/auth/signup',
          '/auth/forgot-password',
          '/pending',
          '/rejected',
          '/test-users',
        ]

        // Allow access to static files in public folder
        if (pathname.startsWith('/animations/') || 
            pathname.startsWith('/data/') || 
            pathname.startsWith('/images/') ||
            pathname.startsWith('/icons/')) {
          return true
        }

        if (publicRoutes.includes(pathname)) {
          return true
        }

        // All other routes require authentication
        return !!token
      },
    },
  }
)

export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - api (API routes)
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * - public folder
     */
    '/((?!api|_next/static|_next/image|favicon.ico|public).*)',
  ],
}