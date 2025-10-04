import { NextRequest, NextResponse } from 'next/server'
import { withAdmin, withValidation } from '@/lib/auth-middleware'
import { prisma } from '@/lib/prisma'
import { z } from 'zod'

// Validation schema for service creation
const createServiceSchema = z.object({
  name: z.string().min(2, 'Name must be at least 2 characters'),
  description: z.string().min(10, 'Description must be at least 10 characters'),
  type: z.enum(['MENTORSHIP', 'ADVISORY'], {
    errorMap: () => ({ message: 'Type must be MENTORSHIP or ADVISORY' }),
  }),
  singleSessionPrice: z.number().positive().optional(),
  monthlyPlanPrice: z.number().positive().optional(),
  hourlyRate: z.number().positive().optional(),
  // Mentorship-specific fields
  format: z.enum(['INDIVIDUAL', 'GROUP']).optional(),
  learningOutcomes: z.array(z.string()).optional(),
  sampleCurriculum: z.string().optional(),
  // Advisory-specific fields
  idealClientProfile: z.string().optional(),
  scopeOfWork: z.string().optional(),
  expectedOutcomes: z.array(z.string()).optional(),
  sampleDeliverables: z.array(z.string()).optional(),
  packages: z.array(z.object({
    name: z.string(),
    hours: z.number().positive(),
    price: z.number().positive(),
    description: z.string().optional(),
  })).optional(),
})

export async function GET(request: NextRequest) {
  return withAdmin(async (req) => {
    try {
      const { searchParams } = new URL(request.url)
      const type = searchParams.get('type')
      const status = searchParams.get('status')

      // Build where clause
      const where: any = {}

      if (type && ['MENTORSHIP', 'ADVISORY'].includes(type)) {
        where.type = type
      }

      if (status && ['DRAFT', 'PUBLISHED', 'ARCHIVED'].includes(status)) {
        where.status = status
      }

      const services = await prisma.service.findMany({
        where,
        include: {
          mentorshipProgram: true,
          advisoryService: {
            include: {
              packages: true,
            },
          },
          _count: {
            select: {
              enrollments: true,
            },
          },
        },
        orderBy: { createdAt: 'desc' },
      })

      return NextResponse.json({
        success: true,
        data: { services },
      })
    } catch (error) {
      console.error('Get admin services error:', error)
      return NextResponse.json(
        {
          success: false,
          error: {
            code: 'DATABASE_ERROR',
            message: 'Failed to fetch services',
          },
        },
        { status: 500 }
      )
    }
  })
}

export async function POST(request: NextRequest) {
  return withValidation(createServiceSchema, request, async (req, validatedData) => {
    try {
      const { type, ...serviceData } = validatedData

      // Create service with type-specific data
      const service = await prisma.service.create({
        data: {
          name: serviceData.name,
          description: serviceData.description,
          type,
          singleSessionPrice: serviceData.singleSessionPrice,
          monthlyPlanPrice: serviceData.monthlyPlanPrice,
          hourlyRate: serviceData.hourlyRate,
          status: 'DRAFT',
          ...(type === 'MENTORSHIP' && {
            mentorshipProgram: {
              create: {
                format: serviceData.format || 'INDIVIDUAL',
                learningOutcomes: serviceData.learningOutcomes || [],
                sampleCurriculum: serviceData.sampleCurriculum,
              },
            },
          }),
          ...(type === 'ADVISORY' && {
            advisoryService: {
              create: {
                idealClientProfile: serviceData.idealClientProfile || '',
                scopeOfWork: serviceData.scopeOfWork || '',
                expectedOutcomes: serviceData.expectedOutcomes || [],
                sampleDeliverables: serviceData.sampleDeliverables || [],
                ...(serviceData.packages && {
                  packages: {
                    create: serviceData.packages,
                  },
                }),
              },
            },
          }),
        },
        include: {
          mentorshipProgram: true,
          advisoryService: {
            include: {
              packages: true,
            },
          },
        },
      })

      return NextResponse.json({
        success: true,
        data: { service },
      })
    } catch (error) {
      console.error('Create service error:', error)
      return NextResponse.json(
        {
          success: false,
          error: {
            code: 'DATABASE_ERROR',
            message: 'Failed to create service',
          },
        },
        { status: 500 }
      )
    }
  })
}
