import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const type = searchParams.get('type')

    // Build where clause
    const where: any = {
      status: 'PUBLISHED', // Only return published services
    }

    if (type && ['MENTORSHIP', 'ADVISORY'].includes(type)) {
      where.type = type
    }

    const services = await prisma.service.findMany({
      where,
      select: {
        id: true,
        name: true,
        description: true,
        type: true,
        status: true,
        singleSessionPrice: true,
        monthlyPlanPrice: true,
        hourlyRate: true,
        createdAt: true,
        mentorshipProgram: {
          select: {
            format: true,
            learningOutcomes: true,
            sampleCurriculum: true,
          },
        },
        advisoryService: {
          select: {
            idealClientProfile: true,
            scopeOfWork: true,
            expectedOutcomes: true,
            sampleDeliverables: true,
            packages: {
              select: {
                id: true,
                name: true,
                hours: true,
                price: true,
                description: true,
              },
            },
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
    console.error('Get services error:', error)
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
}
