import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session || session.user.role !== 'ADMIN') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { searchParams } = new URL(request.url)
    const page = parseInt(searchParams.get('page') || '1')
    const limit = parseInt(searchParams.get('limit') || '50')

    const skip = (page - 1) * limit

    // Get service assignments with user and service details
    const [assignments, total] = await Promise.all([
      prisma.enrollment.findMany({
        select: {
          id: true,
          userId: true,
          serviceId: true,
          enrolledAt: true,
          expiresAt: true,
          status: true,
          user: {
            select: {
              id: true,
              email: true,
              name: true,
              role: true,
              isConfirmed: true,
              confirmedAt: true,
              confirmedBy: true,
              rejectionReason: true,
              sessionStatus: true,
              sessionActivatedAt: true,
              sessionActivatedBy: true,
              createdAt: true,
              updatedAt: true,
            }
          },
          service: {
            select: {
              id: true,
              name: true,
              description: true,
              type: true,
              status: true,
              oneOffPrice: true,
              hourlyRate: true,
              createdAt: true,
            }
          }
        },
        orderBy: { enrolledAt: 'desc' },
        skip,
        take: limit,
      }),
      prisma.enrollment.count(),
    ])

    return NextResponse.json({
      assignments: assignments.map(assignment => ({
        id: assignment.id,
        userId: assignment.userId,
        serviceId: assignment.serviceId,
        assignedAt: assignment.enrolledAt,
        expiresAt: assignment.expiresAt,
        assignedBy: 'admin', // We can track this better in the future
        status: assignment.status,
        user: assignment.user,
        service: assignment.service
      })),
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit)
      }
    })
  } catch (error) {
    console.error('Get service assignments error:', error)
    return NextResponse.json(
      { error: 'Failed to fetch service assignments' },
      { status: 500 }
    )
  }
}

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session || session.user.role !== 'ADMIN') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const body = await request.json()
    const { userId, serviceId, expiresAt } = body

    if (!userId || !serviceId || !expiresAt) {
      return NextResponse.json(
        { error: 'User ID, Service ID, and Expiry Date are required' },
        { status: 400 }
      )
    }

    // Validate expiry date is in the future
    const expiryDate = new Date(expiresAt)
    const today = new Date()
    today.setHours(0, 0, 0, 0) // Reset time to start of day for comparison
    
    if (expiryDate <= today) {
      return NextResponse.json(
        { error: 'Expiry date must be in the future' },
        { status: 400 }
      )
    }

    // Check if user exists and is confirmed
    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: { id: true, isConfirmed: true, role: true }
    })

    if (!user) {
      return NextResponse.json(
        { error: 'User not found' },
        { status: 404 }
      )
    }

    if (!user.isConfirmed) {
      return NextResponse.json(
        { error: 'User must be confirmed before assigning services' },
        { status: 400 }
      )
    }

    // Check if service exists
    const service = await prisma.service.findUnique({
      where: { id: serviceId },
      select: { id: true, status: true }
    })

    if (!service) {
      return NextResponse.json(
        { error: 'Service not found' },
        { status: 404 }
      )
    }

    if (service.status !== 'PUBLISHED') {
      return NextResponse.json(
        { error: 'Service must be published to be assigned' },
        { status: 400 }
      )
    }

    // Check if enrollment already exists
    const existingEnrollment = await prisma.enrollment.findFirst({
      where: {
        userId,
        serviceId
      }
    })

    if (existingEnrollment) {
      return NextResponse.json(
        { error: 'User is already enrolled in this service' },
        { status: 400 }
      )
    }

    // Create enrollment (service assignment) and automatically activate user session
    const enrollment = await prisma.enrollment.create({
      data: {
        userId,
        serviceId,
        planType: 'SINGLE_SESSION', // Default plan type
        status: 'ACTIVE',
        enrolledAt: new Date(),
        expiresAt: expiryDate, // Set expiry date (required and validated)
        hoursRemaining: 10, // Default hours for assigned services
      },
      include: {
        user: {
          select: {
            id: true,
            email: true,
            name: true,
            role: true,
            isConfirmed: true,
            confirmedAt: true,
            confirmedBy: true,
            rejectionReason: true,
            sessionStatus: true,
            sessionActivatedAt: true,
            sessionActivatedBy: true,
            createdAt: true,
            updatedAt: true,
          }
        },
        service: {
          select: {
            id: true,
            name: true,
            description: true,
            type: true,
            status: true,
            oneOffPrice: true,
            hourlyRate: true,
            createdAt: true,
          }
        }
      }
    })

    // Automatically activate user session when service is assigned
    await prisma.user.update({
      where: { id: userId },
      data: {
        sessionStatus: 'ACTIVE',
        sessionActivatedAt: new Date(),
        sessionActivatedBy: session.user.id
      }
    })

    return NextResponse.json({
      success: true,
      assignment: {
        id: enrollment.id,
        userId: enrollment.userId,
        serviceId: enrollment.serviceId,
        assignedAt: enrollment.enrolledAt,
        expiresAt: enrollment.expiresAt,
        assignedBy: session.user.id,
        status: enrollment.status,
        user: enrollment.user,
        service: enrollment.service
      }
    })
  } catch (error) {
    console.error('Create service assignment error:', error)
    return NextResponse.json(
      { error: 'Failed to assign service' },
      { status: 500 }
    )
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session || session.user.role !== 'ADMIN') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { searchParams } = new URL(request.url)
    const enrollmentId = searchParams.get('enrollmentId')

    if (!enrollmentId) {
      return NextResponse.json(
        { error: 'Enrollment ID is required' },
        { status: 400 }
      )
    }

    // Check if enrollment exists
    const enrollment = await prisma.enrollment.findUnique({
      where: { id: enrollmentId },
      select: { id: true, userId: true, serviceId: true }
    })

    if (!enrollment) {
      return NextResponse.json(
        { error: 'Service assignment not found' },
        { status: 404 }
      )
    }

    // Delete the enrollment (service assignment)
    await prisma.enrollment.delete({
      where: { id: enrollmentId }
    })

    // Check if user has any remaining active enrollments
    const remainingEnrollments = await prisma.enrollment.count({
      where: {
        userId: enrollment.userId,
        status: 'ACTIVE'
      }
    })

    // If no active enrollments remain, deactivate user session
    if (remainingEnrollments === 0) {
      await prisma.user.update({
        where: { id: enrollment.userId },
        data: {
          sessionStatus: 'INACTIVE',
          sessionActivatedAt: null,
          sessionActivatedBy: null
        }
      })
    }

    return NextResponse.json({
      success: true,
      message: 'Service assignment removed successfully'
    })
  } catch (error) {
    console.error('Remove service assignment error:', error)
    return NextResponse.json(
      { error: 'Failed to remove service assignment' },
      { status: 500 }
    )
  }
}
