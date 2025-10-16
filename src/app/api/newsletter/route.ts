import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function GET(request: NextRequest) {
  try {
    // Parse query parameters
    const { searchParams } = new URL(request.url)
    const page = parseInt(searchParams.get('page') || '1')
    const limit = parseInt(searchParams.get('limit') || '12')

    // Get all newsletters regardless of status
    const where = {}

    // Get newsletters with pagination
    const [newsletters, total] = await Promise.all([
      prisma.newsletterCampaign.findMany({
        where,
        skip: (page - 1) * limit,
        take: limit,
        orderBy: [
          { sentAt: { sort: 'desc', nulls: 'last' } },
          { createdAt: 'desc' }
        ],
        select: {
          id: true,
          title: true,
          subject: true,
          content: true,
          textContent: true,
          status: true,
          sentAt: true,
          totalSent: true,
          createdAt: true,
        },
      }),
      prisma.newsletterCampaign.count({ where }),
    ])

    const pages = Math.ceil(total / limit)

    return NextResponse.json({
      success: true,
      data: {
        newsletters,
        pagination: {
          page,
          limit,
          total,
          pages,
        },
      },
    })

  } catch (error) {
    console.error('Newsletters fetch error:', error)

    return NextResponse.json({
      success: false,
      message: 'Failed to fetch newsletters',
      error: error instanceof Error ? error.message : 'Unknown error',
    }, { status: 500 })
  }
}
