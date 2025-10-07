import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { id } = await params

    const roadmap = await prisma.roadmap.findUnique({
      where: { id },
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
                type: true,
                description: true
              }
            }
          }
        },
        milestones: {
          include: {
            tasks: {
              orderBy: { order: 'asc' }
            }
          },
          orderBy: { order: 'asc' }
        }
      }
    })

    if (!roadmap) {
      return NextResponse.json({ error: 'Roadmap not found' }, { status: 404 })
    }

    // Check if user has access to this roadmap
    if (session.user.role === 'CLIENT' && roadmap.enrollment.userId !== session.user.id) {
      return NextResponse.json({ error: 'Access denied' }, { status: 403 })
    }

    return NextResponse.json({
      success: true,
      data: roadmap
    })
  } catch (error) {
    console.error('Get roadmap error:', error)
    return NextResponse.json(
      { error: 'Failed to fetch roadmap' },
      { status: 500 }
    )
  }
}

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user?.id || session.user.role !== 'ADMIN') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { id } = await params
    const body = await request.json()
    const { title, description, milestones } = body

    if (!title || title.trim().length === 0) {
      return NextResponse.json(
        { error: 'Title is required' },
        { status: 400 }
      )
    }

    // Check if roadmap exists
    const existingRoadmap = await prisma.roadmap.findUnique({
      where: { id },
      include: { milestones: true }
    })

    if (!existingRoadmap) {
      return NextResponse.json({ error: 'Roadmap not found' }, { status: 404 })
    }

    // Update roadmap
    const updatedRoadmap = await prisma.roadmap.update({
      where: { id },
      data: {
        title: title.trim(),
        description: description?.trim() || null
      }
    })

    // Update milestones and tasks
    if (milestones && Array.isArray(milestones)) {
      // Delete existing milestones and tasks
      await prisma.milestone.deleteMany({
        where: { roadmapId: id }
      })

      // Create new milestones and tasks
      for (const [milestoneIndex, milestone] of milestones.entries()) {
        const createdMilestone = await prisma.milestone.create({
          data: {
            roadmapId: id,
            title: milestone.title.trim(),
            description: milestone.description?.trim() || null,
            status: milestone.status || 'NOT_STARTED',
            order: milestoneIndex
          }
        })

        // Create tasks for this milestone
        if (milestone.tasks && Array.isArray(milestone.tasks)) {
          for (const [taskIndex, task] of milestone.tasks.entries()) {
            await prisma.task.create({
              data: {
                milestoneId: createdMilestone.id,
                title: task.title.trim(),
                description: task.description?.trim() || null,
                resources: task.resources || [],
                dueDate: task.dueDate ? new Date(task.dueDate) : null,
                status: task.status || 'NOT_STARTED',
                order: taskIndex
              }
            })
          }
        }
      }
    }

    // Fetch updated roadmap with all relations
    const updatedRoadmapWithRelations = await prisma.roadmap.findUnique({
      where: { id },
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
                type: true,
                description: true
              }
            }
          }
        },
        milestones: {
          include: {
            tasks: {
              orderBy: { order: 'asc' }
            }
          },
          orderBy: { order: 'asc' }
        }
      }
    })

    return NextResponse.json({
      success: true,
      data: updatedRoadmapWithRelations
    })
  } catch (error) {
    console.error('Update roadmap error:', error)
    return NextResponse.json(
      { error: 'Failed to update roadmap' },
      { status: 500 }
    )
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user?.id || session.user.role !== 'ADMIN') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { id } = await params

    // Check if roadmap exists
    const roadmap = await prisma.roadmap.findUnique({
      where: { id }
    })

    if (!roadmap) {
      return NextResponse.json({ error: 'Roadmap not found' }, { status: 404 })
    }

    // Delete roadmap (cascade will handle milestones and tasks)
    await prisma.roadmap.delete({
      where: { id }
    })

    return NextResponse.json({
      success: true,
      message: 'Roadmap deleted successfully'
    })
  } catch (error) {
    console.error('Delete roadmap error:', error)
    return NextResponse.json(
      { error: 'Failed to delete roadmap' },
      { status: 500 }
    )
  }
}