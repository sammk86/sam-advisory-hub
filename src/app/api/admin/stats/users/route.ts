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

    // Get user statistics
    const [
      totalUsers,
      pendingUsers,
      confirmedUsers,
      rejectedUsers,
      recentUsers,
    ] = await Promise.all([
      prisma.user.count(),
      prisma.user.count({
        where: {
          isConfirmed: false,
          rejectionReason: null,
        },
      }),
      prisma.user.count({
        where: {
          isConfirmed: true,
        },
      }),
      prisma.user.count({
        where: {
          isConfirmed: false,
          rejectionReason: { not: null },
        },
      }),
      prisma.user.count({
        where: {
          createdAt: {
            gte: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000), // Last 30 days
          },
        },
      }),
    ])

    // Get user growth over time (last 7 days)
    const userGrowth = await prisma.user.groupBy({
      by: ['createdAt'],
      where: {
        createdAt: {
          gte: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000),
        },
      },
      _count: {
        id: true,
      },
      orderBy: {
        createdAt: 'asc',
      },
    })

    // Get role distribution
    const roleDistribution = await prisma.user.groupBy({
      by: ['role'],
      _count: {
        role: true,
      },
    })

    return NextResponse.json({
      totalUsers,
      pendingUsers,
      confirmedUsers,
      rejectedUsers,
      recentUsers,
      userGrowth: userGrowth.map(item => ({
        date: item.createdAt.toISOString().split('T')[0],
        count: item._count.id,
      })),
      roleDistribution: roleDistribution.reduce((acc, item) => {
        acc[item.role] = item._count.role
        return acc
      }, {} as Record<string, number>),
    })
  } catch (error) {
    console.error('Error fetching user stats:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}



