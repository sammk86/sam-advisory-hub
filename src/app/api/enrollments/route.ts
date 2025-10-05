import { NextRequest, NextResponse } from 'next/server'
import { withAuth, withValidation } from '@/lib/auth-middleware'
import { prisma } from '@/lib/prisma'
import { z } from 'zod'

// Validation schema for enrollment creation
const createEnrollmentSchema = z.object({
  serviceId: z.string().min(1, 'Service ID is required'),
  planType: z.enum(['SINGLE_SESSION', 'MONTHLY_PLAN', 'CONSULTATION', 'PACKAGE', 'RETAINER']),
  advisoryPackageId: z.string().optional(),
  stripePaymentIntentId: z.string().min(1, 'Payment confirmation is required'),
})

export async function GET(request: NextRequest) {
  return withAuth(request, async (req) => {
    try {
      const { searchParams } = new URL(request.url)
      const serviceType = searchParams.get('serviceType')
      const status = searchParams.get('status')

      // Build where clause
      const where: any = {
        userId: req.user!.id,
      }

      if (status && ['ACTIVE', 'PAUSED', 'CANCELLED', 'COMPLETED'].includes(status)) {
        where.status = status
      }

      const enrollments = await prisma.enrollment.findMany({
        where,
        include: {
          service: {
            select: {
              id: true,
              name: true,
              description: true,
              type: true,
              singleSessionPrice: true,
              monthlyPlanPrice: true,
              hourlyRate: true,
            },
          },
          advisoryPackage: {
            select: {
              id: true,
              name: true,
              hours: true,
              price: true,
            },
          },
          roadmap: {
            select: {
              id: true,
              title: true,
              description: true,
              milestones: {
                select: {
                  id: true,
                  title: true,
                  status: true,
                  order: true,
                  _count: {
                    select: {
                      tasks: true,
                    },
                  },
                },
                orderBy: { order: 'asc' },
              },
            },
          },
          deliverables: {
            select: {
              id: true,
              title: true,
              type: true,
              status: true,
              dueDate: true,
              completedAt: true,
            },
          },
          _count: {
            select: {
              meetings: true,
              payments: true,
            },
          },
        },
        orderBy: { enrolledAt: 'desc' },
      })

      // Filter by service type if specified
      const filteredEnrollments = serviceType
        ? enrollments.filter(enrollment => enrollment.service.type === serviceType)
        : enrollments

      return NextResponse.json({
        success: true,
        data: { enrollments: filteredEnrollments },
      })
    } catch (error) {
      console.error('Get enrollments error:', error)
      return NextResponse.json(
        {
          success: false,
          error: {
            code: 'DATABASE_ERROR',
            message: 'Failed to fetch enrollments',
          },
        },
        { status: 500 }
      )
    }
  })
}

export async function POST(request: NextRequest) {
  return withValidation(createEnrollmentSchema, request, async (req, validatedData) => {
    try {
      // Check if user is already enrolled in this service
      const existingEnrollment = await prisma.enrollment.findUnique({
        where: {
          userId_serviceId: {
            userId: req.user!.id,
            serviceId: validatedData.serviceId,
          },
        },
      })

      if (existingEnrollment) {
        return NextResponse.json(
          {
            success: false,
            error: {
              code: 'ALREADY_ENROLLED',
              message: 'User is already enrolled in this service',
            },
          },
          { status: 409 }
        )
      }

      // Verify service exists
      const service = await prisma.service.findUnique({
        where: { id: validatedData.serviceId },
        include: {
          advisoryService: {
            include: {
              packages: true,
            },
          },
        },
      })

      if (!service) {
        return NextResponse.json(
          {
            success: false,
            error: {
              code: 'SERVICE_NOT_FOUND',
              message: 'Service not found',
            },
          },
          { status: 404 }
        )
      }

      // Verify advisory package if specified
      let advisoryPackage = null
      if (validatedData.advisoryPackageId) {
        advisoryPackage = await prisma.advisoryPackage.findUnique({
          where: { id: validatedData.advisoryPackageId },
        })

        if (!advisoryPackage) {
          return NextResponse.json(
            {
              success: false,
              error: {
                code: 'PACKAGE_NOT_FOUND',
                message: 'Advisory package not found',
              },
            },
            { status: 404 }
          )
        }
      }

      // Create enrollment
      const enrollment = await prisma.enrollment.create({
        data: {
          userId: req.user!.id,
          serviceId: validatedData.serviceId,
          planType: validatedData.planType,
          status: 'ACTIVE',
          advisoryPackageId: validatedData.advisoryPackageId,
          hoursRemaining: advisoryPackage?.hours,
          // Note: In a real implementation, you'd verify the Stripe payment
          // and set stripeCustomerId and stripeSubscriptionId
        },
        include: {
          service: {
            select: {
              id: true,
              name: true,
              type: true,
            },
          },
          advisoryPackage: {
            select: {
              id: true,
              name: true,
              hours: true,
              price: true,
            },
          },
        },
      })

      // Create default roadmap for mentorship services
      if (service.type === 'MENTORSHIP') {
        await prisma.roadmap.create({
          data: {
            enrollmentId: enrollment.id,
            title: `${service.name} - Learning Path`,
            description: 'Your personalized learning journey',
            milestones: {
              create: [
                {
                  title: 'Getting Started',
                  description: 'Initial assessment and goal setting',
                  order: 1,
                  status: 'NOT_STARTED',
                  tasks: {
                    create: [
                      {
                        title: 'Complete initial assessment',
                        description: 'Evaluate current skills and experience',
                        order: 1,
                        status: 'NOT_STARTED',
                      },
                      {
                        title: 'Define learning goals',
                        description: 'Set specific, measurable objectives',
                        order: 2,
                        status: 'NOT_STARTED',
                      },
                    ],
                  },
                },
              ],
            },
          },
        })
      }

      return NextResponse.json({
        success: true,
        data: { enrollment },
      })
    } catch (error) {
      console.error('Create enrollment error:', error)
      return NextResponse.json(
        {
          success: false,
          error: {
            code: 'DATABASE_ERROR',
            message: 'Failed to create enrollment',
          },
        },
        { status: 500 }
      )
    }
  })
}


