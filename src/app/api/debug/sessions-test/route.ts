import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

export async function GET() {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const userId = session.user.id

    // Test the exact same query as dashboard API
    const enrollments = await prisma.enrollment.findMany({
      where: { 
        userId,
        status: 'ACTIVE',
        OR: [
          { expiresAt: null }, // No expiry date
          { expiresAt: { gt: new Date() } } // Not expired
        ]
      },
      include: {
        service: {
          select: {
            id: true,
            name: true,
            description: true,
            type: true,
          }
        },
        roadmap: {
          include: {
            milestones: {
              include: {
                tasks: {
                  orderBy: { order: 'asc' }
                }
              },
              orderBy: { order: 'asc' }
            }
          }
        }
      }
    })

    // Create assigned services list (same as dashboard API)
    const assignedServices = enrollments.map(enrollment => ({
      id: enrollment.id,
      name: enrollment.service.name,
      description: enrollment.service.description,
      type: enrollment.service.type,
      status: enrollment.status,
      enrolledAt: enrollment.enrolledAt,
      expiresAt: enrollment.expiresAt,
      hoursRemaining: enrollment.hoursRemaining,
      hasRoadmap: !!enrollment.roadmap
    }))

    return NextResponse.json({
      success: true,
      debug: {
        userId,
        currentTime: new Date().toISOString(),
        enrollmentsCount: enrollments.length,
        assignedServicesCount: assignedServices.length,
        enrollments: enrollments.map(e => ({
          id: e.id,
          serviceName: e.service.name,
          status: e.status,
          expiresAt: e.expiresAt,
          hoursRemaining: e.hoursRemaining,
          hasRoadmap: !!e.roadmap
        })),
        assignedServices
      }
    })
  } catch (error) {
    console.error('Debug sessions test error:', error)
    return NextResponse.json(
      { error: 'Failed to debug sessions test', details: error.message },
      { status: 500 }
    )
  }
}
