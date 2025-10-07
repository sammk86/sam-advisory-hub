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

    const enrollments = await prisma.enrollment.findMany({
      where: {
        userId: session.user.id
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

    return NextResponse.json({
      success: true,
      data: {
        enrollments,
        user: {
          id: session.user.id,
          email: session.user.email,
          name: session.user.name
        }
      }
    })
  } catch (error) {
    console.error('Test enrollments error:', error)
    return NextResponse.json(
      { error: 'Failed to fetch enrollments' },
      { status: 500 }
    )
  }
}
