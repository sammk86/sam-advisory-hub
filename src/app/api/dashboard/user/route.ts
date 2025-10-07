import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

export async function GET() {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const userId = session.user.id

    // Fetch user's enrollments with roadmaps
    const enrollments = await prisma.enrollment.findMany({
      where: { 
        userId,
        expiresAt: {
          gt: new Date() // Only active enrollments
        }
      },
      include: {
        service: {
          select: {
            id: true,
            name: true,
            type: true,
            description: true
          }
        },
        roadmap: {
          include: {
            milestones: {
              include: {
                tasks: {
                  orderBy: { order: 'asc' }
                }
              },
              orderBy: { order: 'asc' }
            }
          }
        }
      }
    })

    // Fetch latest messages from admin
    const latestMessages = await prisma.message.findMany({
      where: {
        conversation: {
          participants: {
            some: {
              userId: userId
            }
          }
        },
        sender: {
          role: 'ADMIN'
        }
      },
      include: {
        sender: {
          select: {
            id: true,
            name: true,
            email: true,
            image: true
          }
        },
        conversation: {
          include: {
            participants: {
              include: {
                user: {
                  select: {
                    id: true,
                    name: true,
                    email: true
                  }
                }
              }
            }
          }
        }
      },
      orderBy: { createdAt: 'desc' },
      take: 5
    })

    // Fetch upcoming sessions (if you have a sessions table)
    // For now, we'll create a placeholder structure
    const upcomingSessions = [] // This would be populated from a sessions table

    // Calculate roadmap progress
    const roadmapProgress = enrollments.map(enrollment => {
      if (!enrollment.roadmap) {
        return {
          enrollmentId: enrollment.id,
          serviceName: enrollment.service.name,
          serviceType: enrollment.service.type,
          progress: 0,
          totalTasks: 0,
          completedTasks: 0,
          milestones: [],
          hasRoadmap: false
        }
      }

      const allTasks = enrollment.roadmap.milestones.flatMap(m => m.tasks)
      const completedTasks = allTasks.filter(t => t.status === 'COMPLETED')
      const progress = allTasks.length > 0 ? Math.round((completedTasks.length / allTasks.length) * 100) : 0

      return {
        enrollmentId: enrollment.id,
        serviceName: enrollment.service.name,
        serviceType: enrollment.service.type,
        progress,
        totalTasks: allTasks.length,
        completedTasks: completedTasks.length,
        milestones: enrollment.roadmap.milestones.map(milestone => ({
          id: milestone.id,
          title: milestone.title,
          status: milestone.status,
          totalTasks: milestone.tasks.length,
          completedTasks: milestone.tasks.filter(t => t.status === 'COMPLETED').length
        })),
        hasRoadmap: true,
        roadmapId: enrollment.roadmap.id
      }
    })

    // Calculate overall progress
    const allTasks = enrollments.flatMap(e => e.roadmap?.milestones.flatMap(m => m.tasks) || [])
    const allCompletedTasks = allTasks.filter(t => t.status === 'COMPLETED')
    const overallProgress = allTasks.length > 0 ? Math.round((allCompletedTasks.length / allTasks.length) * 100) : 0

    // Get overdue tasks
    const now = new Date()
    const overdueTasks = allTasks.filter(task => {
      if (!task.dueDate || task.status === 'COMPLETED') return false
      return new Date(task.dueDate) < now
    })

    // Get tasks due soon (next 7 days)
    const nextWeek = new Date()
    nextWeek.setDate(nextWeek.getDate() + 7)
    const tasksDueSoon = allTasks.filter(task => {
      if (!task.dueDate || task.status === 'COMPLETED') return false
      const dueDate = new Date(task.dueDate)
      return dueDate >= now && dueDate <= nextWeek
    })

    return NextResponse.json({
      success: true,
      data: {
        user: {
          id: session.user.id,
          name: session.user.name,
          email: session.user.email,
          role: session.user.role
        },
        roadmapProgress,
        overallProgress,
        stats: {
          totalEnrollments: enrollments.length,
          totalTasks: allTasks.length,
          completedTasks: allCompletedTasks.length,
          overdueTasks: overdueTasks.length,
          tasksDueSoon: tasksDueSoon.length
        },
        latestMessages: latestMessages.map(message => ({
          id: message.id,
          content: message.content,
          createdAt: message.createdAt,
          sender: message.sender,
          conversationId: message.conversationId
        })),
        upcomingSessions,
        overdueTasks: overdueTasks.map(task => {
          // Find which enrollment this task belongs to
          const taskEnrollment = enrollments.find(e => 
            e.roadmap?.milestones.some(m => m.tasks.some(t => t.id === task.id))
          )
          return {
            id: task.id,
            title: task.title,
            dueDate: task.dueDate,
            milestone: {
              title: taskEnrollment?.roadmap?.milestones.find(m => m.tasks.some(t => t.id === task.id))?.title || 'Unknown'
            }
          }
        }),
        tasksDueSoon: tasksDueSoon.map(task => {
          // Find which enrollment this task belongs to
          const taskEnrollment = enrollments.find(e => 
            e.roadmap?.milestones.some(m => m.tasks.some(t => t.id === task.id))
          )
          return {
            id: task.id,
            title: task.title,
            dueDate: task.dueDate,
            milestone: {
              title: taskEnrollment?.roadmap?.milestones.find(m => m.tasks.some(t => t.id === task.id))?.title || 'Unknown'
            }
          }
        })
      }
    })
  } catch (error) {
    console.error('Dashboard data fetch error:', error)
    return NextResponse.json(
      { error: 'Failed to fetch dashboard data' },
      { status: 500 }
    )
  }
}
