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
    const status = searchParams.get('status') || ''
    const type = searchParams.get('type') || ''

    // Build where clause
    const where: any = {}
    
    if (status) {
      where.status = status
    }
    
    if (type) {
      where.type = type
    }

    // Get services with pagination
    const [services, total] = await Promise.all([
      prisma.service.findMany({
        where,
        skip: (page - 1) * limit,
        take: limit,
        orderBy: { createdAt: 'desc' },
      }),
      prisma.service.count({ where }),
    ])

    const pages = Math.ceil(total / limit)

    return NextResponse.json({
      success: true,
      data: {
        services,
        pagination: {
          page,
          limit,
          total,
          pages,
        },
      },
    })

  } catch (error) {
    console.error('Services fetch error:', error)

    return NextResponse.json({
      success: false,
      message: 'Failed to fetch services',
      error: error instanceof Error ? error.message : 'Unknown error',
    }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    // Check authentication
    const session = await getServerSession(authOptions)
    
    if (!session || session.user.role !== 'ADMIN') {
      return NextResponse.json({
        success: false,
        message: 'Unauthorized access',
      }, { status: 401 })
    }

    const body = await request.json()
    const { 
      name, 
      description, 
      type, 
      status, 
      singleSessionPrice, 
      monthlyPlanPrice, 
      hourlyRate 
    } = body

    // Validate required fields
    if (!name || !description || !type) {
      return NextResponse.json({
        success: false,
        message: 'Name, description, and type are required',
      }, { status: 400 })
    }

    // Create service
    const service = await prisma.service.create({
      data: {
        name,
        description,
        type,
        status: status || 'DRAFT',
        singleSessionPrice: singleSessionPrice ? Math.round(singleSessionPrice * 100) : null,
        monthlyPlanPrice: monthlyPlanPrice ? Math.round(monthlyPlanPrice * 100) : null,
        hourlyRate: hourlyRate ? Math.round(hourlyRate * 100) : null,
      },
    })

    return NextResponse.json({
      success: true,
      message: 'Service created successfully',
      data: { service },
    })

  } catch (error) {
    console.error('Service creation error:', error)

    return NextResponse.json({
      success: false,
      message: 'Failed to create service',
      error: error instanceof Error ? error.message : 'Unknown error',
    }, { status: 500 })
  }
}