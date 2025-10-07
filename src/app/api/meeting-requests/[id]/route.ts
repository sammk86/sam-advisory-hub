import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { id } = await params

    const meetingRequest = await prisma.meetingRequest.findUnique({
      where: { id },
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
      }
    })

    if (!meetingRequest) {
      return NextResponse.json({ error: 'Meeting request not found' }, { status: 404 })
    }

    // Check if user has access to this request
    if (session.user.role === 'CLIENT' && meetingRequest.userId !== session.user.id) {
      return NextResponse.json({ error: 'Access denied' }, { status: 403 })
    }

    return NextResponse.json({
      success: true,
      data: meetingRequest
    })
  } catch (error) {
    console.error('Get meeting request error:', error)
    return NextResponse.json(
      { error: 'Failed to fetch meeting request' },
      { status: 500 }
    )
  }
}

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user?.id || session.user.role !== 'ADMIN') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { id } = await params
    const body = await request.json()
    const { 
      status, 
      adminNotes, 
      proposedDate, 
      proposedTime,
      meetingLink 
    } = body

    if (!status || !['APPROVED', 'REJECTED', 'PROPOSED_ALTERNATIVE'].includes(status)) {
      return NextResponse.json(
        { error: 'Invalid status' },
        { status: 400 }
      )
    }

    // Get the meeting request
    const meetingRequest = await prisma.meetingRequest.findUnique({
      where: { id },
      include: {
        enrollment: true,
        user: true
      }
    })

    if (!meetingRequest) {
      return NextResponse.json({ error: 'Meeting request not found' }, { status: 404 })
    }

    let meetingId: string | null = null

    // If approved, create a meeting
    if (status === 'APPROVED') {
      const scheduledDate = proposedDate ? new Date(proposedDate) : meetingRequest.requestedDate
      const scheduledTime = proposedTime || meetingRequest.requestedTime
      
      // Combine date and time
      const [hours, minutes] = scheduledTime.split(':').map(Number)
      const scheduledDateTime = new Date(scheduledDate)
      scheduledDateTime.setHours(hours, minutes, 0, 0)

      const meeting = await prisma.meeting.create({
        data: {
          enrollmentId: meetingRequest.enrollmentId,
          meetingRequestId: meetingRequest.id,
          title: meetingRequest.title,
          description: meetingRequest.description,
          scheduledAt: scheduledDateTime,
          duration: meetingRequest.duration,
          status: 'SCHEDULED',
          videoLink: meetingLink || null
        }
      })

      meetingId = meeting.id
    }

    // Update the meeting request
    const updatedRequest = await prisma.meetingRequest.update({
      where: { id },
      data: {
        status,
        adminNotes: adminNotes?.trim(),
        proposedDate: proposedDate ? new Date(proposedDate) : null,
        proposedTime: proposedTime?.trim() || null,
        approvedAt: status === 'APPROVED' ? new Date() : null,
        approvedBy: status === 'APPROVED' ? session.user.id : null,
        meetingId
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
      }
    })

    return NextResponse.json({
      success: true,
      data: updatedRequest
    })
  } catch (error) {
    console.error('Update meeting request error:', error)
    return NextResponse.json(
      { error: 'Failed to update meeting request' },
      { status: 500 }
    )
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { id } = await params

    // Get the meeting request
    const meetingRequest = await prisma.meetingRequest.findUnique({
      where: { id }
    })

    if (!meetingRequest) {
      return NextResponse.json({ error: 'Meeting request not found' }, { status: 404 })
    }

    // Check if user has permission to delete
    if (session.user.role === 'CLIENT' && meetingRequest.userId !== session.user.id) {
      return NextResponse.json({ error: 'Access denied' }, { status: 403 })
    }

    // Only allow deletion if status is PENDING
    if (meetingRequest.status !== 'PENDING') {
      return NextResponse.json(
        { error: 'Cannot delete non-pending meeting request' },
        { status: 400 }
      )
    }

    // Delete the meeting request
    await prisma.meetingRequest.delete({
      where: { id }
    })

    return NextResponse.json({
      success: true,
      message: 'Meeting request deleted successfully'
    })
  } catch (error) {
    console.error('Delete meeting request error:', error)
    return NextResponse.json(
      { error: 'Failed to delete meeting request' },
      { status: 500 }
    )
  }
}
