import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    // Check authentication
    const session = await getServerSession(authOptions)
    
    if (!session || session.user.role !== 'ADMIN') {
      return NextResponse.json({
        success: false,
        message: 'Unauthorized access',
      }, { status: 401 })
    }

    const { id: serviceId } = await params

    // Get service details
    const service = await prisma.service.findUnique({
      where: { id: serviceId },
    })

    if (!service) {
      return NextResponse.json({
        success: false,
        message: 'Service not found',
      }, { status: 404 })
    }

    return NextResponse.json({
      success: true,
      data: { service },
    })

  } catch (error) {
    console.error('Service fetch error:', error)

    return NextResponse.json({
      success: false,
      message: 'Failed to fetch service',
      error: error instanceof Error ? error.message : 'Unknown error',
    }, { status: 500 })
  }
}

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    // Check authentication
    const session = await getServerSession(authOptions)
    
    if (!session || session.user.role !== 'ADMIN') {
      return NextResponse.json({
        success: false,
        message: 'Unauthorized access',
      }, { status: 401 })
    }

    const { id: serviceId } = await params
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

    // Check if service exists
    const existingService = await prisma.service.findUnique({
      where: { id: serviceId },
    })

    if (!existingService) {
      return NextResponse.json({
        success: false,
        message: 'Service not found',
      }, { status: 404 })
    }

    // Update service
    const service = await prisma.service.update({
      where: { id: serviceId },
      data: {
        name,
        description,
        type,
        status,
        singleSessionPrice: singleSessionPrice ? Math.round(singleSessionPrice * 100) : null,
        monthlyPlanPrice: monthlyPlanPrice ? Math.round(monthlyPlanPrice * 100) : null,
        hourlyRate: hourlyRate ? Math.round(hourlyRate * 100) : null,
      },
    })

    return NextResponse.json({
      success: true,
      message: 'Service updated successfully',
      data: { service },
    })

  } catch (error) {
    console.error('Service update error:', error)

    return NextResponse.json({
      success: false,
      message: 'Failed to update service',
      error: error instanceof Error ? error.message : 'Unknown error',
    }, { status: 500 })
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    // Check authentication
    const session = await getServerSession(authOptions)
    
    if (!session || session.user.role !== 'ADMIN') {
      return NextResponse.json({
        success: false,
        message: 'Unauthorized access',
      }, { status: 401 })
    }

    const { id: serviceId } = await params

    // Check if service exists
    const service = await prisma.service.findUnique({
      where: { id: serviceId },
    })

    if (!service) {
      return NextResponse.json({
        success: false,
        message: 'Service not found',
      }, { status: 404 })
    }

    // Check if service has enrollments
    const enrollments = await prisma.enrollment.count({
      where: { serviceId },
    })

    if (enrollments > 0) {
      return NextResponse.json({
        success: false,
        message: 'Cannot delete service with active enrollments',
      }, { status: 400 })
    }

    // Delete the service
    await prisma.service.delete({
      where: { id: serviceId },
    })

    return NextResponse.json({
      success: true,
      message: 'Service deleted successfully',
    })

  } catch (error) {
    console.error('Service deletion error:', error)

    return NextResponse.json({
      success: false,
      message: 'Failed to delete service',
      error: error instanceof Error ? error.message : 'Unknown error',
    }, { status: 500 })
  }
}
