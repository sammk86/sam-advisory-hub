import { NextRequest, NextResponse } from 'next/server'
import { getToken } from 'next-auth/jwt'

export async function userConfirmationMiddleware(req: NextRequest) {
  const { pathname } = req.nextUrl

  // Skip middleware for public routes
  const publicRoutes = [
    '/',
    '/about',
    '/services',
    '/pricing',
    '/contact',
    '/auth/signin',
    '/auth/signup',
    '/auth/forgot-password',
    '/pending',
    '/rejected',
    '/api/auth',
  ]

  const isPublicRoute = publicRoutes.some(route => 
    pathname === route || pathname.startsWith(route)
  )

  if (isPublicRoute) {
    return null
  }

  try {
    // Get the JWT token
    const token = await getToken({ 
      req, 
      secret: process.env.NEXTAUTH_SECRET 
    })

    if (!token) {
      // No token, redirect to signin
      const signInUrl = new URL('/auth/signin', req.url)
      signInUrl.searchParams.set('callbackUrl', req.url)
      return NextResponse.redirect(signInUrl)
    }

    // Check user confirmation status
    const isConfirmed = token.isConfirmed
    const rejectionReason = token.rejectionReason

    // If user is not confirmed
    if (isConfirmed === false) {
      // If user has rejection reason, redirect to rejected page
      if (rejectionReason) {
        return NextResponse.redirect(new URL('/rejected', req.url))
      }
      
      // Otherwise, redirect to pending page
      return NextResponse.redirect(new URL('/pending', req.url))
    }

    // If user is confirmed, allow access
    return null

  } catch (error) {
    console.error('User confirmation middleware error:', error)
    
    // On error, redirect to signin to be safe
    const signInUrl = new URL('/auth/signin', req.url)
    signInUrl.searchParams.set('callbackUrl', req.url)
    return NextResponse.redirect(signInUrl)
  }
}

export function shouldSkipConfirmationCheck(pathname: string): boolean {
  const skipRoutes = [
    '/',
    '/about',
    '/services',
    '/pricing',
    '/contact',
    '/auth/signin',
    '/auth/signup',
    '/auth/forgot-password',
    '/pending',
    '/rejected',
    '/api/auth',
    '/_next',
    '/favicon.ico',
  ]

  return skipRoutes.some(route => 
    pathname === route || pathname.startsWith(route)
  )
}

export function getUserStatusRedirect(
  isConfirmed: boolean | null,
  rejectionReason: string | null,
  currentPath: string
): string | null {
  // If user is confirmed, no redirect needed
  if (isConfirmed === true) {
    return null
  }

  // If user is not confirmed
  if (isConfirmed === false) {
    // If user has rejection reason, redirect to rejected page
    if (rejectionReason) {
      return '/rejected'
    }
    
    // Otherwise, redirect to pending page
    return '/pending'
  }

  // If confirmation status is null/undefined, redirect to signin
  return '/auth/signin'
}