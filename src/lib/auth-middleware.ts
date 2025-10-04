import { NextRequest, NextResponse } from 'next/server'
import { getToken } from 'next-auth/jwt'
import { UserRole } from '@/types'
import { z } from 'zod'

export interface AuthenticatedRequest extends NextRequest {
  user?: {
    id: string
    email: string
    name?: string | null
    role: UserRole
  }
}

/**
 * Middleware to authenticate requests and add user context
 */
export async function withAuth(
  request: NextRequest,
  handler: (req: AuthenticatedRequest) => Promise<NextResponse>
) {
  try {
    const token = await getToken({ 
      req: request,
      secret: process.env.NEXTAUTH_SECRET 
    })

    if (!token) {
      return NextResponse.json(
        {
          success: false,
          error: {
            code: 'UNAUTHORIZED',
            message: 'Authentication required',
          },
        },
        { status: 401 }
      )
    }

    // Add user context to request
    const authenticatedRequest = request as AuthenticatedRequest
    authenticatedRequest.user = {
      id: token.id as string || token.sub as string,
      email: token.email as string,
      name: token.name,
      role: token.role as UserRole,
    }

    return handler(authenticatedRequest)
  } catch (error) {
    console.error('Authentication middleware error:', error)
    return NextResponse.json(
      {
        success: false,
        error: {
          code: 'AUTH_ERROR',
          message: 'Authentication failed',
        },
      },
      { status: 500 }
    )
  }
}

/**
 * Middleware to check if user has required role
 */
export function withRole(
  requiredRole: UserRole | UserRole[],
  handler: (req: AuthenticatedRequest) => Promise<NextResponse>
) {
  return async (request: NextRequest) => {
    return withAuth(request, async (authenticatedRequest) => {
      const userRole = authenticatedRequest.user?.role

      if (!userRole) {
        return NextResponse.json(
          {
            success: false,
            error: {
              code: 'UNAUTHORIZED',
              message: 'User role not found',
            },
          },
          { status: 401 }
        )
      }

      const allowedRoles = Array.isArray(requiredRole) ? requiredRole : [requiredRole]
      
      if (!allowedRoles.includes(userRole)) {
        return NextResponse.json(
          {
            success: false,
            error: {
              code: 'FORBIDDEN',
              message: 'Insufficient permissions',
            },
          },
          { status: 403 }
        )
      }

      return handler(authenticatedRequest)
    })
  }
}

/**
 * Admin-only middleware
 */
export function withAdmin(
  handler: (req: AuthenticatedRequest) => Promise<NextResponse>
) {
  return withRole('ADMIN', handler)
}

/**
 * Client or Admin middleware
 */
export function withClient(
  handler: (req: AuthenticatedRequest) => Promise<NextResponse>
) {
  return withRole(['CLIENT', 'ADMIN'], handler)
}

/**
 * Utility function to check if user owns resource or is admin
 */
export function canAccessResource(
  userRole: UserRole,
  userId: string,
  resourceUserId: string
): boolean {
  return userRole === 'ADMIN' || userId === resourceUserId
}

/**
 * Rate limiting middleware (basic implementation)
 */
const rateLimitMap = new Map<string, { count: number; resetTime: number }>()

export function withRateLimit(
  maxRequests: number = 100,
  windowMs: number = 60 * 60 * 1000, // 1 hour
  handler: (req: AuthenticatedRequest) => Promise<NextResponse>
) {
  return async (request: NextRequest) => {
    return withAuth(request, async (authenticatedRequest) => {
      const userId = authenticatedRequest.user?.id
      if (!userId) {
        return NextResponse.json(
          { success: false, error: { code: 'UNAUTHORIZED', message: 'User ID required' } },
          { status: 401 }
        )
      }

      const now = Date.now()
      const userLimit = rateLimitMap.get(userId)

      if (!userLimit || now > userLimit.resetTime) {
        // Reset or initialize rate limit
        rateLimitMap.set(userId, { count: 1, resetTime: now + windowMs })
      } else if (userLimit.count >= maxRequests) {
        // Rate limit exceeded
        return NextResponse.json(
          {
            success: false,
            error: {
              code: 'RATE_LIMIT_EXCEEDED',
              message: 'Too many requests',
            },
          },
          { status: 429 }
        )
      } else {
        // Increment count
        userLimit.count++
      }

      return handler(authenticatedRequest)
    })
  }
}

/**
 * Validation middleware using Zod schemas
 */
export function withValidation<T>(
  schema: z.ZodSchema<T>,
  request: NextRequest,
  handler: (req: AuthenticatedRequest, validatedData: T) => Promise<NextResponse>
) {
  return withAuth(request, async (authenticatedRequest) => {
    try {
      // Clone the request to avoid consuming the body
      const clonedRequest = request.clone()
      const body = await clonedRequest.json()
      const validatedData = schema.parse(body)
      return handler(authenticatedRequest, validatedData)
    } catch (error) {
      if (error instanceof z.ZodError) {
        console.error('Validation error:', error.errors)
        return NextResponse.json(
          {
            success: false,
            error: {
              code: 'VALIDATION_ERROR',
              message: 'Invalid input data',
              details: error.errors,
            },
          },
          { status: 400 }
        )
      }
      throw error
    }
  })
}