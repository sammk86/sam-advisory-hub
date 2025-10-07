import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function GET(request: NextRequest) {
  try {
    // Parse query parameters
    const { searchParams } = new URL(request.url)
    const type = searchParams.get('type') || ''
    const limit = parseInt(searchParams.get('limit') || '10')

    // Build where clause - only published services
    const where: any = {
      status: 'PUBLISHED'
    }
    
    if (type) {
      where.type = type
    }

    // Get published services
    const services = await prisma.service.findMany({
      where,
      take: limit,
      orderBy: { createdAt: 'desc' },
      select: {
        id: true,
        name: true,
        description: true,
        type: true,
        oneOffPrice: true,
        hourlyRate: true,
        features: true,
        benefits: true,
        process: true,
        testimonials: true,
        createdAt: true,
      }
    })

    // Format services for public display
    const formattedServices = services.map(service => ({
      id: service.id,
      name: service.name,
      description: service.description,
      type: service.type,
      pricing: {
        oneOff: service.oneOffPrice ? service.oneOffPrice / 100 : null,
        hourly: service.hourlyRate ? service.hourlyRate / 100 : null,
      },
      features: service.features,
      benefits: service.benefits,
      process: service.process,
      testimonials: service.testimonials,
      createdAt: service.createdAt,
    }))

    return NextResponse.json({
      success: true,
      data: {
        services: formattedServices,
        total: services.length,
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