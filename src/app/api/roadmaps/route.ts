import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

// GET /api/roadmaps - Get roadmaps for current user or all roadmaps for admin
export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { searchParams } = new URL(request.url)
    const userId = searchParams.get('userId')

    let whereClause: any = {}

    if (session.user.role === 'ADMIN') {
      // Admin can view all roadmaps or filter by specific user
      if (userId) {
        whereClause = {
          enrollment: {
            userId: userId
          }
        }
      }
    } else {
      // Regular users can only see their own roadmaps
      whereClause = {
        enrollment: {
          userId: session.user.id
        }
      }
    }

    const roadmaps = await prisma.roadmap.findMany({
      where: whereClause,
      include: {
        enrollment: {
          include: {
            user: {
              select: {
                id: true,
                name: true,
                email: true
              }
            },
            service: {
              select: {
                id: true,
                name: true,
                type: true
              }
            }
          }
        },
        milestones: {
          include: {
            tasks: {
              orderBy: {
                order: 'asc'
              }
            }
          },
          orderBy: {
            order: 'asc'
          }
        }
      },
      orderBy: {
        createdAt: 'desc'
      }
    })

    return NextResponse.json({
      success: true,
      data: roadmaps
    })
  } catch (error) {
    console.error('Get roadmaps error:', error)
    return NextResponse.json(
      { error: 'Failed to fetch roadmaps' },
      { status: 500 }
    )
  }
}

// POST /api/roadmaps - Create a new roadmap
export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user?.id || session.user.role !== 'ADMIN') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const body = await request.json()
    const { enrollmentId, title, description, milestones } = body

    if (!enrollmentId || !title) {
      return NextResponse.json(
        { error: 'Enrollment ID and title are required' },
        { status: 400 }
      )
    }

    // Check if enrollment exists and belongs to a client
    const enrollment = await prisma.enrollment.findUnique({
      where: { id: enrollmentId },
      include: {
        user: {
          select: {
            id: true,
            role: true
          }
        }
      }
    })

    if (!enrollment) {
      return NextResponse.json(
        { error: 'Enrollment not found' },
        { status: 404 }
      )
    }

    if (enrollment.user.role !== 'CLIENT') {
      return NextResponse.json(
        { error: 'Can only create roadmaps for client users' },
        { status: 400 }
      )
    }

    // Check if roadmap already exists for this enrollment
    const existingRoadmap = await prisma.roadmap.findUnique({
      where: { enrollmentId }
    })

    if (existingRoadmap) {
      return NextResponse.json(
        { error: 'Roadmap already exists for this enrollment' },
        { status: 400 }
      )
    }

    // Create roadmap with milestones and tasks
    const roadmap = await prisma.roadmap.create({
      data: {
        enrollmentId,
        title,
        description,
        milestones: {
          create: milestones?.map((milestone: any, milestoneIndex: number) => ({
            title: milestone.title,
            description: milestone.description,
            order: milestoneIndex,
            status: milestone.status || 'NOT_STARTED',
            tasks: {
              create: milestone.tasks?.map((task: any, taskIndex: number) => ({
                title: task.title,
                description: task.description,
                resources: task.resources || [],
                dueDate: task.dueDate ? new Date(task.dueDate) : null,
                order: taskIndex,
                status: task.status || 'NOT_STARTED'
              })) || []
            }
          })) || []
        }
      },
      include: {
        enrollment: {
          include: {
            user: {
              select: {
                id: true,
                name: true,
                email: true
              }
            },
            service: {
              select: {
                id: true,
                name: true,
                type: true
              }
            }
          }
        },
        milestones: {
          include: {
            tasks: {
              orderBy: {
                order: 'asc'
              }
            }
          },
          orderBy: {
            order: 'asc'
          }
        }
      }
    })

    return NextResponse.json({
      success: true,
      data: roadmap
    })
  } catch (error) {
    console.error('Create roadmap error:', error)
    return NextResponse.json(
      { error: 'Failed to create roadmap' },
      { status: 500 }
    )
  }
}

