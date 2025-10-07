import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Check if user is admin
    if (session.user.role !== 'ADMIN') {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
    }

    const { id } = await params
    const body = await request.json()
    const { sessionStatus } = body

    // Validate session status
    if (!['ACTIVE', 'INACTIVE', 'SUSPENDED'].includes(sessionStatus)) {
      return NextResponse.json(
        { error: 'Invalid session status' },
        { status: 400 }
      )
    }

    // Update user session status
    const updatedUser = await prisma.user.update({
      where: { id },
      data: {
        sessionStatus,
        sessionActivatedAt: sessionStatus === 'ACTIVE' ? new Date() : null,
        sessionActivatedBy: sessionStatus === 'ACTIVE' ? session.user.id : null,
      },
      select: {
        id: true,
        email: true,
        name: true,
        role: true,
        isConfirmed: true,
        sessionStatus: true,
        sessionActivatedAt: true,
        sessionActivatedBy: true,
        createdAt: true,
        updatedAt: true,
      }
    })

    return NextResponse.json({
      success: true,
      data: updatedUser
    })
  } catch (error) {
    console.error('Update session status error:', error)
    return NextResponse.json(
      { error: 'Failed to update session status' },
      { status: 500 }
    )
  }
}
