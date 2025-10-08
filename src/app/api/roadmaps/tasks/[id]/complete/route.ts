import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

// POST /api/roadmaps/tasks/[id]/complete - Mark task as completed
export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { id } = await params
    const body = await request.json()
    const { status } = body

    if (!status || !['NOT_STARTED', 'IN_PROGRESS', 'COMPLETED'].includes(status)) {
      return NextResponse.json(
        { error: 'Valid status is required' },
        { status: 400 }
      )
    }

    // Get task with roadmap and enrollment info
    const task = await prisma.task.findUnique({
      where: { id },
      include: {
        milestone: {
          include: {
            roadmap: {
              include: {
                enrollment: {
                  include: {
                    user: {
                      select: {
                        id: true,
                        role: true
                      }
                    }
                  }
                }
              }
            }
          }
        }
      }
    })

    if (!task) {
      return NextResponse.json({ error: 'Task not found' }, { status: 404 })
    }

    // Check if user has access to this task
    if (session.user.role !== 'ADMIN' && task.milestone.roadmap.enrollment.userId !== session.user.id) {
      return NextResponse.json({ error: 'Access denied' }, { status: 403 })
    }

    // Update task status
    const updatedTask = await prisma.task.update({
      where: { id },
      data: {
        status: status as any,
        updatedAt: new Date()
      },
      include: {
        milestone: {
          include: {
            roadmap: {
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
                }
              }
            }
          }
        }
      }
    })

    // Update milestone status based on task completion
    const milestone = updatedTask.milestone
    const allTasks = await prisma.task.findMany({
      where: { milestoneId: milestone.id }
    })

    const completedTasks = allTasks.filter(t => t.status === 'COMPLETED')
    const inProgressTasks = allTasks.filter(t => t.status === 'IN_PROGRESS')

    let milestoneStatus: 'NOT_STARTED' | 'IN_PROGRESS' | 'COMPLETED' = 'NOT_STARTED'
    
    if (completedTasks.length === allTasks.length && allTasks.length > 0) {
      milestoneStatus = 'COMPLETED'
    } else if (inProgressTasks.length > 0 || completedTasks.length > 0) {
      milestoneStatus = 'IN_PROGRESS'
    }

    await prisma.milestone.update({
      where: { id: milestone.id },
      data: { status: milestoneStatus }
    })

    return NextResponse.json({
      success: true,
      data: updatedTask
    })
  } catch (error) {
    console.error('Complete task error:', error)
    return NextResponse.json(
      { error: 'Failed to update task status' },
      { status: 500 }
    )
  }
}

