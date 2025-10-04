import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

export async function GET(request: NextRequest) {
  try {
    // Check authentication
    const session = await getServerSession(authOptions)
    
    if (!session || session.user.role !== 'ADMIN') {
      return NextResponse.json({
        success: false,
        message: 'Unauthorized access',
      }, { status: 401 })
    }

    // Parse query parameters
    const { searchParams } = new URL(request.url)
    const page = parseInt(searchParams.get('page') || '1')
    const limit = parseInt(searchParams.get('limit') || '20')
    const search = searchParams.get('search') || ''
    const status = searchParams.get('status') || ''
    const source = searchParams.get('source') || ''

    // Build where clause
    const where: any = {}
    
    if (search) {
      where.OR = [
        { email: { contains: search, mode: 'insensitive' } },
        { firstName: { contains: search, mode: 'insensitive' } },
        { lastName: { contains: search, mode: 'insensitive' } },
      ]
    }
    
    if (status) {
      where.status = status
    }
    
    if (source) {
      where.source = source
    }

    // Get subscribers with pagination
    const [subscribers, total] = await Promise.all([
      prisma.newsletterSubscriber.findMany({
        where,
        skip: (page - 1) * limit,
        take: limit,
        orderBy: { subscribedAt: 'desc' },
      }),
      prisma.newsletterSubscriber.count({ where }),
    ])

    const pages = Math.ceil(total / limit)

    return NextResponse.json({
      success: true,
      data: {
        subscribers,
        pagination: {
          page,
          limit,
          total,
          pages,
        },
      },
    })

  } catch (error) {
    console.error('Subscribers fetch error:', error)

    return NextResponse.json({
      success: false,
      message: 'Failed to fetch subscribers',
      error: error instanceof Error ? error.message : 'Unknown error',
    }, { status: 500 })
  }
}
