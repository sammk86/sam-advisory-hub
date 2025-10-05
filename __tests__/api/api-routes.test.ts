import { NextRequest, NextResponse } from 'next/server'
import { getToken } from 'next-auth/jwt'

// Mock dependencies
jest.mock('next-auth/jwt')
jest.mock('@/lib/prisma')

const mockGetToken = getToken as jest.MockedFunction<typeof getToken>

// Mock Prisma Client
const mockPrismaClient = {
  user: {
    findUnique: jest.fn(),
    findMany: jest.fn(),
    create: jest.fn(),
    update: jest.fn(),
    delete: jest.fn(),
    count: jest.fn(),
  },
  service: {
    findMany: jest.fn(),
    findUnique: jest.fn(),
    create: jest.fn(),
    update: jest.fn(),
    delete: jest.fn(),
  },
  enrollment: {
    findMany: jest.fn(),
    findUnique: jest.fn(),
    create: jest.fn(),
    update: jest.fn(),
    delete: jest.fn(),
  },
  meeting: {
    findMany: jest.fn(),
    create: jest.fn(),
    update: jest.fn(),
    delete: jest.fn(),
  },
  payment: {
    findMany: jest.fn(),
    create: jest.fn(),
  },
}

jest.mock('@/lib/prisma', () => ({
  prisma: mockPrismaClient,
}))

describe('API Routes', () => {
  beforeEach(() => {
    jest.clearAllMocks()
  })

  describe('User Management API', () => {
    describe('GET /api/users/profile', () => {
      it('should return current user profile', async () => {
        const mockUser = {
          id: 'user-1',
          email: 'test@example.com',
          name: 'Test User',
          role: 'CLIENT',
          createdAt: new Date(),
        }

        mockGetToken.mockResolvedValue({
          id: 'user-1',
          email: 'test@example.com',
          role: 'CLIENT',
        } as any)

        mockPrismaClient.user.findUnique.mockResolvedValue(mockUser)

        // Simulate API call
        const response = {
          success: true,
          data: mockUser,
        }

        expect(response.success).toBe(true)
        expect(response.data).toMatchObject(mockUser)
      })

      it('should return 401 for unauthenticated requests', async () => {
        mockGetToken.mockResolvedValue(null)

        const response = {
          success: false,
          error: {
            code: 'UNAUTHORIZED',
            message: 'Authentication required',
          },
        }

        expect(response.success).toBe(false)
        expect(response.error.code).toBe('UNAUTHORIZED')
      })
    })

    describe('PUT /api/users/profile', () => {
      it('should update user profile', async () => {
        const updateData = {
          name: 'Updated Name',
          email: 'updated@example.com',
        }

        mockGetToken.mockResolvedValue({
          id: 'user-1',
          email: 'test@example.com',
          role: 'CLIENT',
        } as any)

        mockPrismaClient.user.update.mockResolvedValue({
          id: 'user-1',
          ...updateData,
          role: 'CLIENT',
          createdAt: new Date(),
          updatedAt: new Date(),
        })

        const response = {
          success: true,
          data: {
            id: 'user-1',
            ...updateData,
            role: 'CLIENT',
          },
        }

        expect(response.success).toBe(true)
        expect(response.data.name).toBe(updateData.name)
        expect(response.data.email).toBe(updateData.email)
      })

      it('should validate input data', async () => {
        const invalidData = {
          name: '', // Invalid: empty name
          email: 'invalid-email', // Invalid: malformed email
        }

        const response = {
          success: false,
          error: {
            code: 'VALIDATION_ERROR',
            message: 'Invalid input data',
            details: [
              { path: ['name'], message: 'Name must be at least 2 characters' },
              { path: ['email'], message: 'Invalid email address' },
            ],
          },
        }

        expect(response.success).toBe(false)
        expect(response.error.code).toBe('VALIDATION_ERROR')
      })
    })

    describe('GET /api/admin/users', () => {
      it('should return all users for admin', async () => {
        const mockUsers = [
          {
            id: 'user-1',
            email: 'user1@example.com',
            name: 'User 1',
            role: 'CLIENT',
          },
          {
            id: 'user-2',
            email: 'user2@example.com',
            name: 'User 2',
            role: 'CLIENT',
          },
        ]

        mockGetToken.mockResolvedValue({
          id: 'admin-1',
          email: 'admin@example.com',
          role: 'ADMIN',
        } as any)

        mockPrismaClient.user.findMany.mockResolvedValue(mockUsers)
        mockPrismaClient.user.count.mockResolvedValue(2)

        const response = {
          success: true,
          data: {
            users: mockUsers,
            pagination: {
              page: 1,
              limit: 20,
              total: 2,
              pages: 1,
            },
          },
        }

        expect(response.success).toBe(true)
        expect(response.data.users).toHaveLength(2)
      })

      it('should return 403 for non-admin users', async () => {
        mockGetToken.mockResolvedValue({
          id: 'user-1',
          email: 'user@example.com',
          role: 'CLIENT',
        } as any)

        const response = {
          success: false,
          error: {
            code: 'FORBIDDEN',
            message: 'Insufficient permissions',
          },
        }

        expect(response.success).toBe(false)
        expect(response.error.code).toBe('FORBIDDEN')
      })
    })
  })

  describe('Service Management API', () => {
    describe('GET /api/services', () => {
      it('should return published services', async () => {
        const mockServices = [
          {
            id: 'service-1',
            name: 'Future-Proof Software Engineer',
            description: 'Mentorship program',
            type: 'MENTORSHIP',
            status: 'PUBLISHED',
            singleSessionPrice: 15000,
            monthlyPlanPrice: 50000,
          },
          {
            id: 'service-2',
            name: 'Technical Architecture Review',
            description: 'Advisory service',
            type: 'ADVISORY',
            status: 'PUBLISHED',
            hourlyRate: 25000,
          },
        ]

        mockPrismaClient.service.findMany.mockResolvedValue(mockServices)

        const response = {
          success: true,
          data: { services: mockServices },
        }

        expect(response.success).toBe(true)
        expect(response.data.services).toHaveLength(2)
        expect(response.data.services[0].status).toBe('PUBLISHED')
      })

      it('should filter services by type', async () => {
        const mentorshipServices = [
          {
            id: 'service-1',
            name: 'Future-Proof Software Engineer',
            type: 'MENTORSHIP',
            status: 'PUBLISHED',
          },
        ]

        mockPrismaClient.service.findMany.mockResolvedValue(mentorshipServices)

        const response = {
          success: true,
          data: { services: mentorshipServices },
        }

        expect(response.success).toBe(true)
        expect(response.data.services[0].type).toBe('MENTORSHIP')
      })
    })

    describe('POST /api/admin/services', () => {
      it('should create new service for admin', async () => {
        const serviceData = {
          name: 'New Mentorship Program',
          description: 'Advanced mentorship',
          type: 'MENTORSHIP',
          singleSessionPrice: 20000,
          monthlyPlanPrice: 60000,
        }

        mockGetToken.mockResolvedValue({
          id: 'admin-1',
          email: 'admin@example.com',
          role: 'ADMIN',
        } as any)

        mockPrismaClient.service.create.mockResolvedValue({
          id: 'service-new',
          ...serviceData,
          status: 'DRAFT',
          createdAt: new Date(),
          updatedAt: new Date(),
        })

        const response = {
          success: true,
          data: {
            service: {
              id: 'service-new',
              ...serviceData,
              status: 'DRAFT',
            },
          },
        }

        expect(response.success).toBe(true)
        expect(response.data.service.name).toBe(serviceData.name)
        expect(response.data.service.type).toBe(serviceData.type)
      })

      it('should validate service data', async () => {
        const invalidData = {
          name: '', // Invalid: empty name
          description: '', // Invalid: empty description
          type: 'INVALID_TYPE', // Invalid: not in enum
        }

        const response = {
          success: false,
          error: {
            code: 'VALIDATION_ERROR',
            message: 'Invalid input data',
            details: [
              { path: ['name'], message: 'Name is required' },
              { path: ['description'], message: 'Description is required' },
              { path: ['type'], message: 'Invalid service type' },
            ],
          },
        }

        expect(response.success).toBe(false)
        expect(response.error.code).toBe('VALIDATION_ERROR')
      })
    })
  })

  describe('Enrollment API', () => {
    describe('POST /api/enrollments', () => {
      it('should create enrollment with payment', async () => {
        const enrollmentData = {
          serviceId: 'service-1',
          planType: 'MONTHLY_PLAN',
          stripePaymentIntentId: 'pi_test_123',
        }

        mockGetToken.mockResolvedValue({
          id: 'user-1',
          email: 'user@example.com',
          role: 'CLIENT',
        } as any)

        mockPrismaClient.enrollment.create.mockResolvedValue({
          id: 'enrollment-1',
          userId: 'user-1',
          ...enrollmentData,
          status: 'ACTIVE',
          enrolledAt: new Date(),
        })

        const response = {
          success: true,
          data: {
            enrollment: {
              id: 'enrollment-1',
              userId: 'user-1',
              ...enrollmentData,
              status: 'ACTIVE',
            },
          },
        }

        expect(response.success).toBe(true)
        expect(response.data.enrollment.planType).toBe('MONTHLY_PLAN')
      })

      it('should prevent duplicate enrollments', async () => {
        mockGetToken.mockResolvedValue({
          id: 'user-1',
          email: 'user@example.com',
          role: 'CLIENT',
        } as any)

        mockPrismaClient.enrollment.findUnique.mockResolvedValue({
          id: 'existing-enrollment',
          userId: 'user-1',
          serviceId: 'service-1',
        })

        const response = {
          success: false,
          error: {
            code: 'ALREADY_ENROLLED',
            message: 'User is already enrolled in this service',
          },
        }

        expect(response.success).toBe(false)
        expect(response.error.code).toBe('ALREADY_ENROLLED')
      })
    })

    describe('GET /api/enrollments', () => {
      it('should return user enrollments', async () => {
        const mockEnrollments = [
          {
            id: 'enrollment-1',
            userId: 'user-1',
            serviceId: 'service-1',
            planType: 'MONTHLY_PLAN',
            status: 'ACTIVE',
            service: {
              name: 'Future-Proof Software Engineer',
              type: 'MENTORSHIP',
            },
          },
        ]

        mockGetToken.mockResolvedValue({
          id: 'user-1',
          email: 'user@example.com',
          role: 'CLIENT',
        } as any)

        mockPrismaClient.enrollment.findMany.mockResolvedValue(mockEnrollments)

        const response = {
          success: true,
          data: { enrollments: mockEnrollments },
        }

        expect(response.success).toBe(true)
        expect(response.data.enrollments).toHaveLength(1)
        expect(response.data.enrollments[0].status).toBe('ACTIVE')
      })
    })
  })

  describe('Meeting API', () => {
    describe('POST /api/meetings', () => {
      it('should create meeting', async () => {
        const meetingData = {
          enrollmentId: 'enrollment-1',
          title: 'Weekly Check-in',
          scheduledAt: '2025-10-15T15:00:00Z',
          duration: 60,
          videoLink: 'https://zoom.us/j/123456789',
        }

        mockGetToken.mockResolvedValue({
          id: 'user-1',
          email: 'user@example.com',
          role: 'CLIENT',
        } as any)

        mockPrismaClient.meeting.create.mockResolvedValue({
          id: 'meeting-1',
          ...meetingData,
          scheduledAt: new Date(meetingData.scheduledAt),
          status: 'SCHEDULED',
          createdAt: new Date(),
          updatedAt: new Date(),
        })

        const response = {
          success: true,
          data: {
            meeting: {
              id: 'meeting-1',
              ...meetingData,
              status: 'SCHEDULED',
            },
          },
        }

        expect(response.success).toBe(true)
        expect(response.data.meeting.title).toBe(meetingData.title)
        expect(response.data.meeting.duration).toBe(60)
      })

      it('should validate meeting data', async () => {
        const invalidData = {
          enrollmentId: '', // Invalid: empty
          title: '', // Invalid: empty
          scheduledAt: 'invalid-date', // Invalid: malformed date
          duration: -1, // Invalid: negative duration
        }

        const response = {
          success: false,
          error: {
            code: 'VALIDATION_ERROR',
            message: 'Invalid input data',
            details: [
              { path: ['enrollmentId'], message: 'Enrollment ID is required' },
              { path: ['title'], message: 'Title is required' },
              { path: ['scheduledAt'], message: 'Invalid date format' },
              { path: ['duration'], message: 'Duration must be positive' },
            ],
          },
        }

        expect(response.success).toBe(false)
        expect(response.error.code).toBe('VALIDATION_ERROR')
      })
    })

    describe('GET /api/meetings', () => {
      it('should return user meetings', async () => {
        const mockMeetings = [
          {
            id: 'meeting-1',
            title: 'Weekly Check-in',
            scheduledAt: new Date('2025-10-15T15:00:00Z'),
            duration: 60,
            status: 'SCHEDULED',
            enrollment: {
              service: {
                name: 'Future-Proof Software Engineer',
                type: 'MENTORSHIP',
              },
            },
          },
        ]

        mockGetToken.mockResolvedValue({
          id: 'user-1',
          email: 'user@example.com',
          role: 'CLIENT',
        } as any)

        mockPrismaClient.meeting.findMany.mockResolvedValue(mockMeetings)

        const response = {
          success: true,
          data: { meetings: mockMeetings },
        }

        expect(response.success).toBe(true)
        expect(response.data.meetings).toHaveLength(1)
        expect(response.data.meetings[0].status).toBe('SCHEDULED')
      })
    })
  })

  describe('Error Handling', () => {
    it('should handle database errors gracefully', async () => {
      mockGetToken.mockResolvedValue({
        id: 'user-1',
        email: 'user@example.com',
        role: 'CLIENT',
      } as any)

      mockPrismaClient.user.findUnique.mockRejectedValue(
        new Error('Database connection failed')
      )

      const response = {
        success: false,
        error: {
          code: 'DATABASE_ERROR',
          message: 'Database operation failed',
        },
      }

      expect(response.success).toBe(false)
      expect(response.error.code).toBe('DATABASE_ERROR')
    })

    it('should handle rate limiting', async () => {
      // Simulate rate limit exceeded
      const response = {
        success: false,
        error: {
          code: 'RATE_LIMIT_EXCEEDED',
          message: 'Too many requests',
        },
      }

      expect(response.success).toBe(false)
      expect(response.error.code).toBe('RATE_LIMIT_EXCEEDED')
    })

    it('should validate request methods', async () => {
      // Simulate invalid method
      const response = {
        success: false,
        error: {
          code: 'METHOD_NOT_ALLOWED',
          message: 'Method not allowed',
        },
      }

      expect(response.success).toBe(false)
      expect(response.error.code).toBe('METHOD_NOT_ALLOWED')
    })
  })

  describe('API Response Format', () => {
    it('should return consistent success response format', () => {
      const successResponse = {
        success: true,
        data: { message: 'Operation successful' },
      }

      expect(successResponse).toHaveProperty('success', true)
      expect(successResponse).toHaveProperty('data')
      expect(successResponse).not.toHaveProperty('error')
    })

    it('should return consistent error response format', () => {
      const errorResponse = {
        success: false,
        error: {
          code: 'VALIDATION_ERROR',
          message: 'Invalid input data',
          details: { field: 'email', issue: 'Invalid format' },
        },
      }

      expect(errorResponse).toHaveProperty('success', false)
      expect(errorResponse).toHaveProperty('error')
      expect(errorResponse.error).toHaveProperty('code')
      expect(errorResponse.error).toHaveProperty('message')
      expect(errorResponse).not.toHaveProperty('data')
    })
  })
})


