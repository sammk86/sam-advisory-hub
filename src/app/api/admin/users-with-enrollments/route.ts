import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

// GET /api/admin/users-with-enrollments - Get users with their enrollments for roadmap creation
export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user?.id || session.user.role !== 'ADMIN') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { searchParams } = new URL(request.url)
    const hasEnrollments = searchParams.get('hasEnrollments') === 'true'

    let whereClause: any = {
      role: 'CLIENT' // Only get client users
    }

    // If we want only users with enrollments, add that condition
    if (hasEnrollments) {
      whereClause.enrollments = {
        some: {} // At least one enrollment exists
      }
    }

    const users = await prisma.user.findMany({
      where: whereClause,
      select: {
        id: true,
        name: true,
        email: true,
        isConfirmed: true,
        enrollments: {
          where: {
            status: 'ACTIVE' // Only active enrollments
          },
          select: {
            id: true,
            status: true,
            enrolledAt: true,
            expiresAt: true,
            service: {
              select: {
                id: true,
                name: true,
                type: true,
                description: true
              }
            }
          },
          orderBy: {
            enrolledAt: 'desc'
          }
        }
      },
      orderBy: {
        name: 'asc'
      }
    })

    // Filter out users with no enrollments if requested
    const filteredUsers = hasEnrollments 
      ? users.filter(user => user.enrollments.length > 0)
      : users

    return NextResponse.json({
      success: true,
      data: filteredUsers
    })
  } catch (error) {
    console.error('Get users with enrollments error:', error)
    return NextResponse.json(
      { error: 'Failed to fetch users with enrollments' },
      { status: 500 }
    )
  }
}

