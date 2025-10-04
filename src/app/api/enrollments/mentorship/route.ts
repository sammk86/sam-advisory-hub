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

    // Find mentorship enrollments for the user
    const enrollments = await prisma.enrollment.findMany({
      where: {
        userId: session.user.id,
        service: {
          type: 'MENTORSHIP'
        }
      },
      include: {
        service: {
          include: {
            mentorshipProgram: {
              include: {
                mentor: {
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

    const enrollment = enrollments[0] // Get first mentorship enrollment
    
    return NextResponse.json({
      enrollment: {
        id: enrollment.id,
        planType: enrollment.planType,
        status: enrollment.status,
        goals: enrollment.goals,
        experience: enrollment.experience,
        industry: enrollment.industry,
        createdAt: enrollment.createdAt,
        mentor: enrollment.service?.mentorshipProgram?.mentor ? {
          id: enrollment.service.mentorshipProgram.mentor.id,
          name: enrollment.service.mentorshipProgram.mentor.name,
          title: 'Industry Expert', // Would come from mentor profile
        } : null,
        roadmap: {
          id: 'roadmap-1',
          title: 'Professional Development Track',
          progress: 35,
          milestones: [
            {
              id: '1',
              title: 'Complete Initial Assessment',
              status: 'COMPLETED',
              dueDate: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString(),
            },
            {
              id: '2',
              title: 'Set 90-day Goals',
              status: 'IN_PROGRESS',
              dueDate: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000).toISOString(),
            },
            {
              id: '3',
              title: 'Complete Skill Development Plan',
              status: 'PENDING',
              dueDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(),
            },
          ],
        },
        upcomingMeetings: enrollment.meetings.map(meeting => ({
          id: meeting.id,
          scheduledAt: meeting.scheduledAt,
          duration: meeting.duration,
          type: meeting.type || 'Regular Check-in',
        }))
      }
    })
  } catch (error) {
    console.error('Error fetching mentorship data:', error)
    return NextResponse.json(
      { error: 'Failed to fetch mentorship data' },
      { status: 500 }
    )
  }
}
