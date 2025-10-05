import { NextRequest, NextResponse } from 'next/server'
import { withAuth } from '@/lib/auth-middleware'
import { prisma } from '@/lib/prisma'
import { z } from 'zod'

// Validation schema for preferences updates
const updatePreferencesSchema = z.object({
  emailNotifications: z.boolean().optional(),
  smsNotifications: z.boolean().optional(),
  marketingEmails: z.boolean().optional(),
  sessionReminders: z.boolean().optional(),
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

      // For now, return mock preferences since we don't have a preferences table
      const preferences = {
        emailNotifications: true,
        smsNotifications: false,
        marketingEmails: true,
        sessionReminders: true,
      }

      return NextResponse.json({
        success: true,
        data: { preferences },
      })
    } catch (error) {
      console.error('Get preferences error:', error)
      return NextResponse.json(
        {
          success: false,
          error: {
            code: 'DATABASE_ERROR',
            message: 'Failed to fetch user preferences',
          },
        },
        { status: 500 }
      )
    }
  })
}

export async function PUT(request: NextRequest) {
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

      const body = await request.json()
      const validatedData = updatePreferencesSchema.parse(body)

      // For now, just return success since we don't have a preferences table
      // In a real app, you would update the preferences in the database
      console.log('Preferences update request:', validatedData)

      return NextResponse.json({
        success: true,
        data: { message: 'Preferences updated successfully' },
      })
    } catch (error) {
      console.error('Update preferences error:', error)
      if (error instanceof z.ZodError) {
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
      return NextResponse.json(
        {
          success: false,
          error: {
            code: 'DATABASE_ERROR',
            message: 'Failed to update user preferences',
          },
        },
        { status: 500 }
      )
    }
  })
}


