import { NextRequest, NextResponse } from 'next/server'
import { withAuth, withValidation } from '@/lib/auth-middleware'
import { prisma } from '@/lib/prisma'
import { z } from 'zod'

// Validation schema for profile updates
const updateProfileSchema = z.object({
  name: z.string().min(1, 'Name must be at least 1 character').optional(),
  email: z.string().email('Invalid email address').optional(),
}).refine((data) => data.name || data.email, {
  message: "At least one field (name or email) must be provided",
  path: ["name", "email"]
})

export async function GET(request: NextRequest) {
  return withAuth(request, async (req) => {
    try {
      if (!req.user?.id) {
        return NextResponse.json(
          {
            success: false,
            error: {
              code: 'UNAUTHORIZED',
              message: 'User ID not found in token',
            },
          },
          { status: 401 }
        )
      }

      const user = await prisma.user.findUnique({
        where: { id: req.user.id },
        select: {
          id: true,
          email: true,
          name: true,
          image: true,
          role: true,
          emailVerified: true,
          createdAt: true,
          updatedAt: true,
          enrollments: {
            include: {
              service: {
                select: {
                  id: true,
                  name: true,
                  type: true,
                },
              },
            },
          },
        },
      })

      if (!user) {
        return NextResponse.json(
          {
            success: false,
            error: {
              code: 'USER_NOT_FOUND',
              message: 'User not found',
            },
          },
          { status: 404 }
        )
      }

      return NextResponse.json({
        success: true,
        data: { profile: user },
      })
    } catch (error) {
      console.error('Get profile error:', error)
      return NextResponse.json(
        {
          success: false,
          error: {
            code: 'DATABASE_ERROR',
            message: 'Failed to fetch user profile',
          },
        },
        { status: 500 }
      )
    }
  })
}

export async function PUT(request: NextRequest) {
  return withValidation(updateProfileSchema, request, async (req, validatedData) => {
    try {
      console.log('Profile update request:', validatedData)
      if (!req.user?.id) {
        return NextResponse.json(
          {
            success: false,
            error: {
              code: 'UNAUTHORIZED',
              message: 'User ID not found in token',
            },
          },
          { status: 401 }
        )
      }

      // Check if email is being updated and if it's already taken
      if (validatedData.email) {
        const existingUser = await prisma.user.findUnique({
          where: { email: validatedData.email },
        })

        if (existingUser && existingUser.id !== req.user.id) {
          return NextResponse.json(
            {
              success: false,
              error: {
                code: 'EMAIL_TAKEN',
                message: 'Email address is already in use',
              },
            },
            { status: 409 }
          )
        }
      }

      const updatedUser = await prisma.user.update({
        where: { id: req.user.id },
        data: {
          ...(validatedData.name && { name: validatedData.name }),
          ...(validatedData.email && { email: validatedData.email }),
        },
        select: {
          id: true,
          email: true,
          name: true,
          image: true,
          role: true,
          emailVerified: true,
          updatedAt: true,
        },
      })

      return NextResponse.json({
        success: true,
        data: { user: updatedUser },
      })
    } catch (error) {
      console.error('Update profile error:', error)
      return NextResponse.json(
        {
          success: false,
          error: {
            code: 'DATABASE_ERROR',
            message: 'Failed to update user profile',
          },
        },
        { status: 500 }
      )
    }
  })
}
