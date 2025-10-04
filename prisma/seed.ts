import { PrismaClient } from '@prisma/client'
import bcrypt from 'bcryptjs'

const prisma = new PrismaClient()

async function main() {
  console.log('🌱 Starting database seeding...')

  // Create admin user (pre-confirmed)
  const hashedPassword = await bcrypt.hash('admin123', 12)
  
  const admin = await prisma.user.upsert({
    where: { email: 'admin@mentorshiphub.com' },
    update: {
      password: hashedPassword,
    },
    create: {
      email: 'admin@mentorshiphub.com',
      name: 'Dr. Sam Mokhtari',
      password: hashedPassword,
      role: 'ADMIN',
      emailVerified: new Date(),
      isConfirmed: true,
      confirmedAt: new Date(),
      confirmedBy: 'system',
    },
  })

  console.log('✅ Created admin user:', admin.email)

  // Create confirmed client users
  const clientPassword = await bcrypt.hash('client123', 12)
  
  const menteeUser = await prisma.user.upsert({
    where: { email: 'sarah.mentee@example.com' },
    update: {
      password: clientPassword,
    },
    create: {
      email: 'sarah.mentee@example.com',
      name: 'Sarah Johnson',
      password: clientPassword,
      role: 'CLIENT',
      emailVerified: new Date(),
      isConfirmed: true,
      confirmedAt: new Date('2025-09-15T10:00:00Z'),
      confirmedBy: admin.id,
    },
  })

  const advisoryUser = await prisma.user.upsert({
    where: { email: 'marcus.cto@example.com' },
    update: {
      password: clientPassword,
    },
    create: {
      email: 'marcus.cto@example.com',
      name: 'Marcus Chen',
      password: clientPassword,
      role: 'CLIENT',
      emailVerified: new Date(),
      isConfirmed: true,
      confirmedAt: new Date('2025-09-20T14:30:00Z'),
      confirmedBy: admin.id,
    },
  })

  // Create pending users (unconfirmed)
  const pendingPassword = await bcrypt.hash('pending123', 12)
  
  const pendingUser1 = await prisma.user.upsert({
    where: { email: 'alex.pending@example.com' },
    update: {
      password: pendingPassword,
    },
    create: {
      email: 'alex.pending@example.com',
      name: 'Alex Rodriguez',
      password: pendingPassword,
      role: 'CLIENT',
      emailVerified: new Date(),
      isConfirmed: false,
      confirmedAt: null,
      confirmedBy: null,
      rejectionReason: null,
    },
  })

  const pendingUser2 = await prisma.user.upsert({
    where: { email: 'jessica.pending@example.com' },
    update: {
      password: pendingPassword,
    },
    create: {
      email: 'jessica.pending@example.com',
      name: 'Jessica Wang',
      password: pendingPassword,
      role: 'CLIENT',
      emailVerified: new Date(),
      isConfirmed: false,
      confirmedAt: null,
      confirmedBy: null,
      rejectionReason: null,
    },
  })

  // Create a rejected user
  const rejectedPassword = await bcrypt.hash('rejected123', 12)
  
  const rejectedUser = await prisma.user.upsert({
    where: { email: 'rejected.user@example.com' },
    update: {
      password: rejectedPassword,
    },
    create: {
      email: 'rejected.user@example.com',
      name: 'John Smith',
      password: rejectedPassword,
      role: 'CLIENT',
      emailVerified: new Date(),
      isConfirmed: false,
      confirmedAt: null,
      confirmedBy: null,
      rejectionReason: 'Incomplete profile information and unclear career goals',
    },
  })

  console.log('✅ Created sample client users')

  // Create mentorship program
  const mentorshipService = await prisma.service.upsert({
    where: { id: 'mentorship-service-1' },
    update: {},
    create: {
      id: 'mentorship-service-1',
      name: 'Future-Proof Software Engineer',
      description: 'Comprehensive mentorship program designed to accelerate your career growth and technical expertise in software engineering.',
      type: 'MENTORSHIP',
      status: 'PUBLISHED',
      singleSessionPrice: 15000, // $150
      monthlyPlanPrice: 50000,   // $500
      mentorshipProgram: {
        create: {
          format: 'INDIVIDUAL',
          learningOutcomes: [
            'Master advanced software engineering principles',
            'Develop leadership and communication skills',
            'Build a strong professional network',
            'Create a personalized career roadmap',
            'Learn industry best practices and emerging technologies'
          ],
          sampleCurriculum: 'Phase 1: Foundation Assessment\nPhase 2: Technical Skills Development\nPhase 3: Leadership & Communication\nPhase 4: Career Strategy & Networking',
          defaultRoadmap: {
            title: 'Software Engineering Excellence',
            milestones: [
              {
                title: 'Foundation Assessment',
                description: 'Evaluate current skills and define growth areas',
                tasks: [
                  'Complete technical skills assessment',
                  'Define career goals and objectives',
                  'Create learning plan'
                ]
              },
              {
                title: 'Technical Mastery',
                description: 'Deepen technical expertise and best practices',
                tasks: [
                  'Master system design principles',
                  'Learn advanced programming patterns',
                  'Practice code review and mentoring'
                ]
              }
            ]
          }
        }
      }
    },
    include: {
      mentorshipProgram: true
    }
  })

  console.log('✅ Created mentorship service:', mentorshipService.name)

  // Create advisory service
  const advisoryService = await prisma.service.upsert({
    where: { id: 'advisory-service-1' },
    update: {},
    create: {
      id: 'advisory-service-1',
      name: 'Technical Architecture Review',
      description: 'Expert consultation on technical architecture, system design, and engineering team scaling strategies.',
      type: 'ADVISORY',
      status: 'PUBLISHED',
      hourlyRate: 25000, // $250/hour
      advisoryService: {
        create: {
          idealClientProfile: 'CTOs and engineering leaders at startups and scale-ups (10-500 employees) facing technical scaling challenges',
          scopeOfWork: 'Architecture review, system design consultation, team scaling strategies, technology stack recommendations',
          expectedOutcomes: [
            'Comprehensive architecture assessment report',
            'Scalability recommendations and roadmap',
            'Team structure and hiring guidance',
            'Technology stack optimization plan'
          ],
          sampleDeliverables: [
            'Technical Architecture Assessment Report (20-30 pages)',
            'System Scalability Roadmap',
            'Engineering Team Structure Recommendations',
            'Technology Stack Migration Plan'
          ],
          packages: {
            create: [
              {
                name: '5-Hour Consultation Package',
                hours: 5,
                price: 112500, // $1,125 (10% discount)
                description: 'Perfect for focused architecture review or specific technical challenge'
              },
              {
                name: '10-Hour Deep Dive Package',
                hours: 10,
                price: 200000, // $2,000 (20% discount)
                description: 'Comprehensive review with detailed recommendations and implementation guidance'
              },
              {
                name: '20-Hour Strategic Package',
                hours: 20,
                price: 375000, // $3,750 (25% discount)
                description: 'Full strategic assessment with ongoing support and team training'
              }
            ]
          }
        }
      }
    },
    include: {
      advisoryService: {
        include: {
          packages: true
        }
      }
    }
  })

  console.log('✅ Created advisory service:', advisoryService.name)

  // Create sample enrollments
  const mentorshipEnrollment = await prisma.enrollment.upsert({
    where: { 
      userId_serviceId: {
        userId: menteeUser.id,
        serviceId: mentorshipService.id
      }
    },
    update: {},
    create: {
      userId: menteeUser.id,
      serviceId: mentorshipService.id,
      planType: 'MONTHLY_PLAN',
      status: 'ACTIVE',
      stripeCustomerId: 'cus_test_mentee_123',
      stripeSubscriptionId: 'sub_test_mentee_123',
    }
  })

  const advisoryPackage = advisoryService.advisoryService?.packages[0]
  let advisoryEnrollment = null
  if (advisoryPackage) {
    advisoryEnrollment = await prisma.enrollment.upsert({
      where: { 
        userId_serviceId: {
          userId: advisoryUser.id,
          serviceId: advisoryService.id
        }
      },
      update: {},
      create: {
        userId: advisoryUser.id,
        serviceId: advisoryService.id,
        planType: 'PACKAGE',
        status: 'ACTIVE',
        advisoryPackageId: advisoryPackage.id,
        hoursRemaining: 5,
        stripeCustomerId: 'cus_test_advisory_123',
      }
    })

    console.log('✅ Created advisory enrollment with package')
  }

  // Create sample roadmap for mentorship
  const roadmap = await prisma.roadmap.upsert({
    where: { enrollmentId: mentorshipEnrollment.id },
    update: {},
    create: {
      enrollmentId: mentorshipEnrollment.id,
      title: 'Software Engineering Excellence Journey',
      description: 'Personalized roadmap to advance from mid-level to senior software engineer',
      milestones: {
        create: [
          {
            title: 'Foundation Assessment & Goal Setting',
            description: 'Evaluate current skills and define clear career objectives',
            order: 1,
            status: 'COMPLETED',
            tasks: {
              create: [
                {
                  title: 'Complete technical skills assessment',
                  description: 'Comprehensive evaluation of current technical capabilities',
                  order: 1,
                  status: 'COMPLETED',
                  resources: ['https://example.com/assessment']
                },
                {
                  title: 'Define 6-month and 1-year career goals',
                  description: 'Set specific, measurable career advancement objectives',
                  order: 2,
                  status: 'COMPLETED'
                },
                {
                  title: 'Create personalized learning plan',
                  description: 'Design curriculum based on goals and current skill gaps',
                  order: 3,
                  status: 'IN_PROGRESS'
                }
              ]
            }
          },
          {
            title: 'Technical Mastery Development',
            description: 'Deepen technical expertise in core areas',
            order: 2,
            status: 'IN_PROGRESS',
            tasks: {
              create: [
                {
                  title: 'Master system design principles',
                  description: 'Learn to design scalable, maintainable systems',
                  order: 1,
                  status: 'IN_PROGRESS',
                  resources: [
                    'https://example.com/system-design',
                    'https://example.com/scalability-patterns'
                  ],
                  dueDate: new Date('2025-11-01')
                },
                {
                  title: 'Advanced programming patterns',
                  description: 'Study and implement advanced design patterns',
                  order: 2,
                  status: 'NOT_STARTED',
                  dueDate: new Date('2025-11-15')
                }
              ]
            }
          }
        ]
      }
    }
  })

  console.log('✅ Created sample roadmap for mentorship enrollment')

  // Create sample meetings
  const mentorshipMeeting = await prisma.meeting.create({
    data: {
      enrollmentId: mentorshipEnrollment.id,
      title: 'Monthly Progress Review',
      description: 'Review progress on current milestones and plan next steps',
      scheduledAt: new Date('2025-10-15T15:00:00Z'),
      duration: 60,
      status: 'SCHEDULED',
      videoLink: 'https://zoom.us/j/123456789',
      agenda: '1. Review completed tasks\n2. Discuss current challenges\n3. Plan next milestone\n4. Q&A session'
    }
  })

  if (advisoryPackage) {
    const advisoryMeeting = await prisma.meeting.create({
      data: {
        enrollmentId: advisoryEnrollment.id,
        title: 'Architecture Review Session',
        description: 'Deep dive into current system architecture and scalability challenges',
        scheduledAt: new Date('2025-10-12T14:00:00Z'),
        duration: 120,
        status: 'COMPLETED',
        videoLink: 'https://zoom.us/j/987654321',
        hoursConsumed: 2,
        notes: 'Reviewed current microservices architecture. Identified bottlenecks in user service. Recommended implementing CQRS pattern for better scalability.'
      }
    })

    console.log('✅ Created sample meetings')

    // Create sample deliverable for advisory
    const deliverable = await prisma.deliverable.create({
      data: {
        enrollmentId: advisoryEnrollment.id,
        title: 'System Architecture Assessment Report',
        description: 'Comprehensive analysis of current architecture with scalability recommendations',
        type: 'ARCHITECTURE_REVIEW',
        status: 'IN_PROGRESS',
        dueDate: new Date('2025-10-20T00:00:00Z'),
        files: {
          create: [
            {
              fileName: 'architecture-assessment-draft.pdf',
              fileUrl: '/uploads/deliverables/architecture-assessment-draft.pdf',
              fileSize: 2048576, // 2MB
              mimeType: 'application/pdf',
              version: 1
            }
          ]
        }
      }
    })

    console.log('✅ Created sample deliverable')
  }

  // Create sample payments
  await prisma.payment.upsert({
    where: { stripePaymentId: 'pi_test_mentorship_123' },
    update: {},
    create: {
      enrollmentId: mentorshipEnrollment.id,
      stripePaymentId: 'pi_test_mentorship_123',
      amount: 50000,
      currency: 'usd',
      status: 'SUCCEEDED',
      paymentType: 'MONTHLY_PLAN',
      description: 'Monthly mentorship plan - October 2025',
      paidAt: new Date('2025-10-01T10:00:00Z')
    }
  })

  if (advisoryPackage) {
    await prisma.payment.upsert({
      where: { stripePaymentId: 'pi_test_advisory_123' },
      update: {},
      create: {
        enrollmentId: advisoryEnrollment.id,
        stripePaymentId: 'pi_test_advisory_123',
        amount: 112500,
        currency: 'usd',
        status: 'SUCCEEDED',
        paymentType: 'PACKAGE',
        description: '5-Hour Consultation Package',
        paidAt: new Date('2025-10-01T09:00:00Z')
      }
    })
  }

  console.log('✅ Created sample payments')

  // Create email notifications for user confirmation workflow
  await prisma.emailNotification.createMany({
    data: [
      // Welcome emails for confirmed users
      {
        userId: menteeUser.id,
        type: 'welcome',
        sentAt: new Date('2025-09-15T10:05:00Z'),
        status: 'sent',
      },
      {
        userId: menteeUser.id,
        type: 'confirmation',
        sentAt: new Date('2025-09-15T10:00:00Z'),
        status: 'sent',
      },
      {
        userId: advisoryUser.id,
        type: 'welcome',
        sentAt: new Date('2025-09-20T14:35:00Z'),
        status: 'sent',
      },
      {
        userId: advisoryUser.id,
        type: 'confirmation',
        sentAt: new Date('2025-09-20T14:30:00Z'),
        status: 'sent',
      },
      // Welcome emails for pending users
      {
        userId: pendingUser1.id,
        type: 'welcome',
        sentAt: new Date('2025-10-01T09:00:00Z'),
        status: 'sent',
      },
      {
        userId: pendingUser2.id,
        type: 'welcome',
        sentAt: new Date('2025-10-02T11:30:00Z'),
        status: 'sent',
      },
      // Rejection email for rejected user
      {
        userId: rejectedUser.id,
        type: 'welcome',
        sentAt: new Date('2025-09-25T08:00:00Z'),
        status: 'sent',
      },
      {
        userId: rejectedUser.id,
        type: 'rejection',
        sentAt: new Date('2025-09-25T08:05:00Z'),
        status: 'sent',
      },
      // Failed email notification example
      {
        userId: pendingUser1.id,
        type: 'confirmation',
        sentAt: new Date('2025-10-01T09:05:00Z'),
        status: 'failed',
        errorMessage: 'SMTP connection timeout - will retry',
      },
    ],
  })

  console.log('✅ Created email notification records')

  console.log('🎉 Database seeding completed successfully!')
  console.log('\n📊 Summary:')
  console.log(`- Users: ${await prisma.user.count()}`)
  console.log(`- Services: ${await prisma.service.count()}`)
  console.log(`- Enrollments: ${await prisma.enrollment.count()}`)
  console.log(`- Meetings: ${await prisma.meeting.count()}`)
  console.log(`- Payments: ${await prisma.payment.count()}`)
  console.log(`- Roadmaps: ${await prisma.roadmap.count()}`)
  console.log(`- Deliverables: ${await prisma.deliverable.count()}`)
  console.log(`- Email Notifications: ${await prisma.emailNotification.count()}`)
  console.log('\n👥 User Status Summary:')
  console.log(`- Confirmed Users: ${await prisma.user.count({ where: { isConfirmed: true } })}`)
  console.log(`- Pending Users: ${await prisma.user.count({ where: { isConfirmed: false, rejectionReason: null } })}`)
  console.log(`- Rejected Users: ${await prisma.user.count({ where: { isConfirmed: false, rejectionReason: { not: null } } })}`)
}

main()
  .then(async () => {
    await prisma.$disconnect()
  })
  .catch(async (e) => {
    console.error('❌ Seeding failed:', e)
    await prisma.$disconnect()
    process.exit(1)
  })
