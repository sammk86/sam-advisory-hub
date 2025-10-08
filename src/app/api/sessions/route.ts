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

    // For now, return mock data since we don't have a sessions table yet
    // In a real implementation, you would query the database for user sessions
    const mockSessions = [
      {
        id: '1',
        title: 'Weekly Check-in',
        type: 'MENTORSHIP',
        scheduledAt: '2024-01-20T15:00:00Z',
        duration: 60,
        status: 'SCHEDULED',
        mentor: {
          name: 'Sarah Johnson',
          title: 'Senior Engineering Manager'
        },
        description: 'Regular weekly check-in to discuss progress and goals',
        meetingUrl: 'https://meet.google.com/abc-def-ghi'
      }
    ]

    return NextResponse.json({
      success: true,
      sessions: mockSessions
    })
  } catch (error) {
    console.error('Get sessions error:', error)
    return NextResponse.json(
      { error: 'Failed to fetch sessions' },
      { status: 500 }
    )
  }
}

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const body = await request.json()
    const { 
      title, 
      type, 
      scheduledAt, 
      duration, 
      description, 
      meetingUrl,
      calendlyEventId,
      calendlyEventTypeId
    } = body

    if (!title || !scheduledAt) {
      return NextResponse.json(
        { error: 'Title and scheduled time are required' },
        { status: 400 }
      )
    }

    // For now, we'll just return success since we don't have a sessions table
    // In a real implementation, you would create a session record in the database
    const newSession = {
      id: `session-${Date.now()}`,
      title,
      type: type || 'MENTORSHIP',
      scheduledAt,
      duration: duration || 60,
      status: 'SCHEDULED',
      description: description || 'Scheduled via Calendly',
      meetingUrl: meetingUrl || '',
      calendlyEventId,
      calendlyEventTypeId,
      userId: session.user.id,
      createdAt: new Date().toISOString()
    }

    // TODO: Save to database when sessions table is created
    // const session = await prisma.session.create({
    //   data: {
    //     title,
    //     type,
    //     scheduledAt: new Date(scheduledAt),
    //     duration,
    //     description,
    //     meetingUrl,
    //     calendlyEventId,
    //     calendlyEventTypeId,
    //     userId: session.user.id,
    //     status: 'SCHEDULED'
    //   }
    // })

    return NextResponse.json({
      success: true,
      data: newSession
    })
  } catch (error) {
    console.error('Create session error:', error)
    return NextResponse.json(
      { error: 'Failed to create session' },
      { status: 500 }
    )
  }
}

