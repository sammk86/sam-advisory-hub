import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Find advisory enrollments for the user
    const enrollments = await prisma.enrollment.findMany({
      where: {
        userId: session.user.id,
        service: {
          type: 'ADVISORY'
        }
      },
      include: {
        service: {
          include: {
            advisoryService: {
              include: {
                advisor: {
                  select: {
                    id: true,
                    name: true,
                    email: true,
                  }
                }
              }
            }
          }
        },
        meetings: {
          where: {
            scheduledAt: {
              gte: new Date()
            }
          },
          orderBy: {
            scheduledAt: 'asc'
          }
        }
      }
    })

    // For demo purposes, return mock data if no enrollments found
    if (enrollments.length === 0) {
      return NextResponse.json({
        enrollment: null
      })
    }

    const enrollment = enrollments[0] // Get first advisory enrollment
    
    return NextResponse.json({
      enrollment: {
        id: enrollment.id,
        planType: enrollment.planType,
        status: enrollment.status,
        goals: enrollment.goals,
        experience: enrollment.experience,
        industry: enrollment.industry,
        createdAt: enrollment.createdAt,
        advisor: enrollment.service?.advisoryService?.advisor ? {
          id: enrollment.service.advisoryService.advisor.id,
          name: enrollment.service.advisoryService.advisor.name,
          title: 'Strategic Advisor', // Would come from advisor profile
        } : null,
        projects: [
          {
            id: 'project-1',
            title: 'Strategic Planning Initiative',
            description: enrollment.goals,
            status: 'IN_PROGRESS',
            hoursAllocated: 20,
            hoursUsed: 8,
            deliverables: [
              {
                id: 'del-1',
                title: 'Initial Assessment Report',
                type: 'DOCUMENT',
                status: 'COMPLETED',
                dueDate: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString(),
              },
              {
                id: 'del-2',
                title: 'Strategic Recommendations',
                type: 'DOCUMENT',
                status: 'IN_PROGRESS',
                dueDate: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000).toISOString(),
              },
              {
                id: 'del-3',
                title: 'Implementation Roadmap',
                type: 'DOCUMENT',
                status: 'PENDING',
                dueDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(),
              },
            ],
          },
        ],
        upcomingMeetings: enrollment.meetings.map(meeting => ({
          id: meeting.id,
          scheduledAt: meeting.scheduledAt,
          duration: meeting.duration,
          type: meeting.type || 'Advisory Session',
        }))
      }
    })
  } catch (error) {
    console.error('Error fetching advisory data:', error)
    return NextResponse.json(
      { error: 'Failed to fetch advisory data' },
      { status: 500 }
    )
  }
}

