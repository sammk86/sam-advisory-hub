import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    console.log('🔍 Debug Roadmaps API - User ID:', session.user.id)
    console.log('🔍 User Role:', session.user.role)

    // Get user's enrollments
    const enrollments = await prisma.enrollment.findMany({
      where: {
        userId: session.user.id,
        status: 'ACTIVE',
        OR: [
          { expiresAt: null },
          { expiresAt: { gt: new Date() } }
        ]
      },
      include: {
        service: {
          select: {
            id: true,
            name: true,
            type: true
          }
        },
        roadmap: {
          include: {
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
        }
      }
    })

    console.log('🔍 Found Enrollments:', enrollments.length)
    enrollments.forEach((enrollment, index) => {
      console.log(`  Enrollment ${index + 1}:`)
      console.log(`    - Service: ${enrollment.service.name}`)
      console.log(`    - Has Roadmap: ${!!enrollment.roadmap}`)
      if (enrollment.roadmap) {
        console.log(`    - Roadmap ID: ${enrollment.roadmap.id}`)
        console.log(`    - Roadmap Title: ${enrollment.roadmap.title}`)
        console.log(`    - Milestones: ${enrollment.roadmap.milestones.length}`)
      }
    })

    // Get roadmaps directly
    const roadmaps = await prisma.roadmap.findMany({
      where: {
        enrollment: {
          userId: session.user.id
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

    console.log('🔍 Found Roadmaps:', roadmaps.length)
    roadmaps.forEach((roadmap, index) => {
      console.log(`  Roadmap ${index + 1}:`)
      console.log(`    - ID: ${roadmap.id}`)
      console.log(`    - Title: ${roadmap.title}`)
      console.log(`    - Service: ${roadmap.enrollment.service.name}`)
      console.log(`    - Milestones: ${roadmap.milestones.length}`)
    })

    return NextResponse.json({
      success: true,
      debug: {
        userId: session.user.id,
        userRole: session.user.role,
        enrollmentsCount: enrollments.length,
        roadmapsCount: roadmaps.length,
        enrollments: enrollments.map(e => ({
          id: e.id,
          serviceName: e.service.name,
          serviceType: e.service.type,
          hasRoadmap: !!e.roadmap,
          roadmapId: e.roadmap?.id || null,
          roadmapTitle: e.roadmap?.title || null
        })),
        roadmaps: roadmaps.map(r => ({
          id: r.id,
          title: r.title,
          serviceName: r.enrollment.service.name,
          milestonesCount: r.milestones.length
        }))
      }
    })
  } catch (error) {
    console.error('Debug roadmaps error:', error)
    return NextResponse.json(
      { error: 'Failed to debug roadmaps', details: error.message },
      { status: 500 }
    )
  }
}
