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

    // Get all enrollments for this user (no filtering)
    const allEnrollments = await prisma.enrollment.findMany({
      where: {
        userId: userId
      },
      include: {
        service: {
          select: {
            id: true,
            name: true,
            type: true,
            description: true
          }
        }
      },
      orderBy: { enrolledAt: 'desc' }
    })

    // Get active enrollments with current filtering
    const activeEnrollments = await prisma.enrollment.findMany({
      where: {
        userId: userId,
        status: 'ACTIVE',
        OR: [
          { expiresAt: null },
          { expiresAt: { gt: new Date() } }
        ]
      },
      include: {
        service: {
          select: {
            id: true,
            name: true,
            type: true,
            description: true
          }
        }
      },
      orderBy: { enrolledAt: 'desc' }
    })

    // Get enrollments by status
    const enrollmentsByStatus = await prisma.enrollment.groupBy({
      by: ['status'],
      where: {
        userId: userId
      },
      _count: {
        status: true
      }
    })

    return NextResponse.json({
      success: true,
      debug: {
        userId,
        currentTime: new Date().toISOString(),
        allEnrollmentsCount: allEnrollments.length,
        activeEnrollmentsCount: activeEnrollments.length,
        enrollmentsByStatus,
        allEnrollments: allEnrollments.map(e => ({
          id: e.id,
          serviceName: e.service.name,
          status: e.status,
          enrolledAt: e.enrolledAt,
          expiresAt: e.expiresAt,
          hoursRemaining: e.hoursRemaining,
          isExpired: e.expiresAt ? new Date(e.expiresAt) <= new Date() : false
        })),
        activeEnrollments: activeEnrollments.map(e => ({
          id: e.id,
          serviceName: e.service.name,
          status: e.status,
          enrolledAt: e.enrolledAt,
          expiresAt: e.expiresAt,
          hoursRemaining: e.hoursRemaining
        }))
      }
    })
  } catch (error) {
    console.error('Debug enrollments error:', error)
    return NextResponse.json(
      { error: 'Failed to debug enrollments', details: error.message },
      { status: 500 }
    )
  }
}
