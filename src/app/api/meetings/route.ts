import { NextRequest, NextResponse } from 'next/server'
import { withAuth, withValidation } from '@/lib/auth-middleware'
import { prisma } from '@/lib/prisma'
import { z } from 'zod'

// Validation schema for meeting creation
const createMeetingSchema = z.object({
  enrollmentId: z.string().min(1, 'Enrollment ID is required'),
  title: z.string().min(1, 'Title is required'),
  description: z.string().optional(),
  scheduledAt: z.string().datetime('Invalid date format'),
  duration: z.number().positive('Duration must be positive'),
  videoLink: z.string().url().optional(),
  agenda: z.string().optional(),
  hoursConsumed: z.number().positive().optional(),
})

export async function GET(request: NextRequest) {
  return withAuth(request, async (req) => {
    try {
      const { searchParams } = new URL(request.url)
      const enrollmentId = searchParams.get('enrollmentId')
      const status = searchParams.get('status')
      const limit = parseInt(searchParams.get('limit') || '50')

      // Build where clause
      const where: any = {}

      // For non-admin users, only show their own meetings
      if (req.user!.role !== 'ADMIN') {
        where.enrollment = {
          userId: req.user!.id,
        }
      }

      if (enrollmentId) {
        where.enrollmentId = enrollmentId
      }

      if (status && ['SCHEDULED', 'IN_PROGRESS', 'COMPLETED', 'CANCELLED'].includes(status)) {
        where.status = status
      }

      const meetings = await prisma.meeting.findMany({
        where,
        include: {
          enrollment: {
            select: {
              id: true,
              userId: true,
              planType: true,
              hoursRemaining: true,
              user: {
                select: {
                  id: true,
                  name: true,
                  email: true,
                },
              },
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
        orderBy: { scheduledAt: 'desc' },
        take: limit,
      })

      return NextResponse.json({
        success: true,
        data: { meetings },
      })
    } catch (error) {
      console.error('Get meetings error:', error)
      return NextResponse.json(
        {
          success: false,
          error: {
            code: 'DATABASE_ERROR',
            message: 'Failed to fetch meetings',
          },
        },
        { status: 500 }
      )
    }
  })
}

export async function POST(request: NextRequest) {
  return withValidation(createMeetingSchema, request, async (req, validatedData) => {
    try {
      // Verify enrollment exists and user has access
      const enrollment = await prisma.enrollment.findUnique({
        where: { id: validatedData.enrollmentId },
        include: {
          service: {
            select: {
              type: true,
            },
          },
        },
      })

      if (!enrollment) {
        return NextResponse.json(
          {
            success: false,
            error: {
              code: 'ENROLLMENT_NOT_FOUND',
              message: 'Enrollment not found',
            },
          },
          { status: 404 }
        )
      }

      // Check if user has access to this enrollment
      if (req.user!.role !== 'ADMIN' && enrollment.userId !== req.user!.id) {
        return NextResponse.json(
          {
            success: false,
            error: {
              code: 'FORBIDDEN',
              message: 'Access denied to this enrollment',
            },
          },
          { status: 403 }
        )
      }

      // For advisory services, check if there are enough hours remaining
      if (enrollment.service.type === 'ADVISORY' && validatedData.hoursConsumed) {
        if (!enrollment.hoursRemaining || enrollment.hoursRemaining < validatedData.hoursConsumed) {
          return NextResponse.json(
            {
              success: false,
              error: {
                code: 'INSUFFICIENT_HOURS',
                message: 'Not enough hours remaining in package',
              },
            },
            { status: 400 }
          )
        }
      }

      // Create meeting
      const meeting = await prisma.meeting.create({
        data: {
          enrollmentId: validatedData.enrollmentId,
          title: validatedData.title,
          description: validatedData.description,
          scheduledAt: new Date(validatedData.scheduledAt),
          duration: validatedData.duration,
          videoLink: validatedData.videoLink,
          agenda: validatedData.agenda,
          hoursConsumed: validatedData.hoursConsumed,
          status: 'SCHEDULED',
        },
        include: {
          enrollment: {
            select: {
              id: true,
              service: {
                select: {
                  name: true,
                  type: true,
                },
              },
            },
          },
        },
      })

      // If this is an advisory meeting with hours consumed, update the remaining hours
      if (enrollment.service.type === 'ADVISORY' && validatedData.hoursConsumed) {
        await prisma.enrollment.update({
          where: { id: validatedData.enrollmentId },
          data: {
            hoursRemaining: {
              decrement: validatedData.hoursConsumed,
            },
          },
        })
      }

      return NextResponse.json({
        success: true,
        data: { meeting },
      })
    } catch (error) {
      console.error('Create meeting error:', error)
      return NextResponse.json(
        {
          success: false,
          error: {
            code: 'DATABASE_ERROR',
            message: 'Failed to create meeting',
          },
        },
        { status: 500 }
      )
    }
  })
}
