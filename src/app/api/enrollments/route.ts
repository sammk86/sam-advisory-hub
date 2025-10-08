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

    console.log('🔍 Enrollments API Debug:')
    console.log('User ID:', session.user.id)
    console.log('Current time:', new Date().toISOString())

    const enrollments = await prisma.enrollment.findMany({
      where: {
        userId: session.user.id,
        status: 'ACTIVE', // Only get active enrollments
        OR: [
          { expiresAt: null }, // No expiry date
          { expiresAt: { gt: new Date() } } // Not expired
        ]
      },
      select: {
        id: true,
        userId: true,
        serviceId: true,
        planType: true,
        status: true,
        enrolledAt: true,
        expiresAt: true,
        hoursRemaining: true,
        service: {
          select: {
            id: true,
            name: true,
            description: true,
            type: true,
          },
        },
      },
      orderBy: { enrolledAt: 'desc' },
    })

    console.log('Found enrollments:', enrollments.length)
    console.log('Enrollments:', enrollments.map(e => ({
      id: e.id,
      serviceName: e.service?.name,
      status: e.status,
      expiresAt: e.expiresAt
    })))

    // Create assigned services list (same format as dashboard API)
    const assignedServices = enrollments.map(enrollment => ({
      id: enrollment.id,
      name: enrollment.service.name,
      description: enrollment.service.description,
      type: enrollment.service.type,
      status: enrollment.status,
      enrolledAt: enrollment.enrolledAt,
      expiresAt: enrollment.expiresAt,
      hoursRemaining: enrollment.hoursRemaining,
      hasRoadmap: false // We don't include roadmap in enrollments API
    }))

    return NextResponse.json({
      success: true,
      data: {
        enrollments,
        assignedServices, // Add assignedServices in same format as dashboard
        user: {
          id: session.user.id,
          email: session.user.email,
          name: session.user.name
        }
      }
    })
  } catch (error) {
    console.error('Get enrollments error:', error)
    return NextResponse.json(
      { error: 'Failed to fetch enrollments' },
      { status: 500 }
    )
  }
}