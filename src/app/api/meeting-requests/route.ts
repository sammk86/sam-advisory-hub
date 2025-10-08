import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { searchParams } = new URL(request.url)
    const status = searchParams.get('status')
    const enrollmentId = searchParams.get('enrollmentId')

    // Build where clause
    const where: any = {}
    
    if (session.user.role === 'ADMIN') {
      // Admin can see all meeting requests
    } else {
      // Users can only see their own requests
      where.userId = session.user.id
    }

    if (status && ['PENDING', 'APPROVED', 'REJECTED', 'PROPOSED_ALTERNATIVE'].includes(status)) {
      where.status = status
    }

    if (enrollmentId) {
      where.enrollmentId = enrollmentId
    }

    const meetingRequests = await prisma.meetingRequest.findMany({
      where,
      include: {
        user: {
          select: {
            id: true,
            name: true,
            email: true
          }
        },
        enrollment: {
          include: {
            service: {
              select: {
                id: true,
                name: true,
                type: true
              }
            }
          }
        },
        approver: {
          select: {
            id: true,
            name: true,
            email: true
          }
        },
        meeting: {
          select: {
            id: true,
            title: true,
            scheduledAt: true,
            status: true
          }
        }
      },
      orderBy: { createdAt: 'desc' }
    })

    return NextResponse.json({
      success: true,
      data: { meetingRequests }
    })
  } catch (error) {
    console.error('Get meeting requests error:', error)
    return NextResponse.json(
      { error: 'Failed to fetch meeting requests' },
      { status: 500 }
    )
  }
}

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user?.id || session.user.role !== 'CLIENT') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const body = await request.json()
    const { 
      enrollmentId, 
      title, 
      description, 
      requestedDate, 
      requestedTime, 
      timezone, 
      duration = 60 
    } = body

    if (!enrollmentId || !title || !requestedDate || !requestedTime || !timezone) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      )
    }

    // Verify the enrollment belongs to the user and is active
    const enrollment = await prisma.enrollment.findFirst({
      where: {
        id: enrollmentId,
        userId: session.user.id,
        status: 'ACTIVE'
      }
    })

    if (!enrollment) {
      return NextResponse.json(
        { error: 'Invalid or inactive enrollment' },
        { status: 400 }
      )
    }

    // Check if enrollment is expired (if it has an expiry date)
    if (enrollment.expiresAt && new Date(enrollment.expiresAt) <= new Date()) {
      return NextResponse.json(
        { error: 'Enrollment has expired' },
        { status: 400 }
      )
    }

    // Check if user has hours remaining (if applicable)
    if (enrollment.hoursRemaining !== null && enrollment.hoursRemaining <= 0) {
      return NextResponse.json(
        { error: 'No hours remaining for this service' },
        { status: 400 }
      )
    }

    // Create meeting request
    const meetingRequest = await prisma.meetingRequest.create({
      data: {
        enrollmentId,
        userId: session.user.id,
        title: title.trim(),
        description: description?.trim(),
        requestedDate: new Date(requestedDate),
        requestedTime: requestedTime.trim(),
        timezone: timezone.trim(),
        duration: parseInt(duration.toString()),
        status: 'PENDING'
      },
      include: {
        user: {
          select: {
            id: true,
            name: true,
            email: true
          }
        },
        enrollment: {
          include: {
            service: {
              select: {
                id: true,
                name: true,
                type: true
              }
            }
          }
        }
      }
    })

    return NextResponse.json({
      success: true,
      data: meetingRequest
    })
  } catch (error) {
    console.error('Create meeting request error:', error)
    return NextResponse.json(
      { error: 'Failed to create meeting request' },
      { status: 500 }
    )
  }
}

