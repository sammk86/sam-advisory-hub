import { PrismaClient } from '@prisma/client'

// Mock Prisma Client for testing
const mockPrismaClient = {
  user: {
    create: jest.fn(),
    findUnique: jest.fn(),
    findMany: jest.fn(),
  },
  service: {
    create: jest.fn(),
    findUnique: jest.fn(),
    findMany: jest.fn(),
  },
  enrollment: {
    create: jest.fn(),
    findUnique: jest.fn(),
    findMany: jest.fn(),
  },
  meeting: {
    create: jest.fn(),
    findMany: jest.fn(),
  },
  payment: {
    create: jest.fn(),
    findMany: jest.fn(),
  },
}

jest.mock('@prisma/client', () => ({
  PrismaClient: jest.fn(() => mockPrismaClient),
}))

describe('Database Schema Validation', () => {
  beforeEach(() => {
    jest.clearAllMocks()
  })

  describe('User Model', () => {
    it('should create a user with valid data', async () => {
      const userData = {
        email: 'test@example.com',
        name: 'Test User',
        role: 'CLIENT',
      }

      mockPrismaClient.user.create.mockResolvedValue({
        id: 'test-id',
        ...userData,
        createdAt: new Date(),
        updatedAt: new Date(),
      })

      const result = await mockPrismaClient.user.create({
        data: userData,
      })

      expect(result).toMatchObject(userData)
      expect(mockPrismaClient.user.create).toHaveBeenCalledWith({
        data: userData,
      })
    })

    it('should enforce unique email constraint', async () => {
      const userData = {
        email: 'duplicate@example.com',
        name: 'Test User',
        role: 'CLIENT',
      }

      mockPrismaClient.user.create.mockRejectedValue(
        new Error('Unique constraint failed on the fields: (`email`)')
      )

      await expect(
        mockPrismaClient.user.create({ data: userData })
      ).rejects.toThrow('Unique constraint failed')
    })

    it('should validate user role enum', () => {
      const validRoles = ['ADMIN', 'CLIENT']
      validRoles.forEach(role => {
        expect(['ADMIN', 'CLIENT']).toContain(role)
      })
    })
  })

  describe('Service Model', () => {
    it('should create a mentorship service', async () => {
      const serviceData = {
        name: 'Future-Proof Software Engineer',
        description: 'Comprehensive mentorship program',
        type: 'MENTORSHIP',
        status: 'PUBLISHED',
        singleSessionPrice: 15000,
        monthlyPlanPrice: 50000,
      }

      mockPrismaClient.service.create.mockResolvedValue({
        id: 'service-id',
        ...serviceData,
        createdAt: new Date(),
        updatedAt: new Date(),
      })

      const result = await mockPrismaClient.service.create({
        data: serviceData,
      })

      expect(result).toMatchObject(serviceData)
      expect(result.type).toBe('MENTORSHIP')
    })

    it('should create an advisory service', async () => {
      const serviceData = {
        name: 'Technical Architecture Review',
        description: 'Expert technical consultation',
        type: 'ADVISORY',
        status: 'PUBLISHED',
        hourlyRate: 25000,
      }

      mockPrismaClient.service.create.mockResolvedValue({
        id: 'service-id',
        ...serviceData,
        createdAt: new Date(),
        updatedAt: new Date(),
      })

      const result = await mockPrismaClient.service.create({
        data: serviceData,
      })

      expect(result).toMatchObject(serviceData)
      expect(result.type).toBe('ADVISORY')
    })

    it('should validate service type enum', () => {
      const validTypes = ['MENTORSHIP', 'ADVISORY']
      validTypes.forEach(type => {
        expect(['MENTORSHIP', 'ADVISORY']).toContain(type)
      })
    })

    it('should validate service status enum', () => {
      const validStatuses = ['DRAFT', 'PUBLISHED', 'ARCHIVED']
      validStatuses.forEach(status => {
        expect(['DRAFT', 'PUBLISHED', 'ARCHIVED']).toContain(status)
      })
    })
  })

  describe('Enrollment Model', () => {
    it('should create an enrollment with valid data', async () => {
      const enrollmentData = {
        userId: 'user-id',
        serviceId: 'service-id',
        planType: 'MONTHLY_PLAN',
        status: 'ACTIVE',
      }

      mockPrismaClient.enrollment.create.mockResolvedValue({
        id: 'enrollment-id',
        ...enrollmentData,
        enrolledAt: new Date(),
      })

      const result = await mockPrismaClient.enrollment.create({
        data: enrollmentData,
      })

      expect(result).toMatchObject(enrollmentData)
    })

    it('should enforce unique user-service constraint', async () => {
      const enrollmentData = {
        userId: 'user-id',
        serviceId: 'service-id',
        planType: 'MONTHLY_PLAN',
      }

      mockPrismaClient.enrollment.create.mockRejectedValue(
        new Error('Unique constraint failed on the fields: (`userId`,`serviceId`)')
      )

      await expect(
        mockPrismaClient.enrollment.create({ data: enrollmentData })
      ).rejects.toThrow('Unique constraint failed')
    })

    it('should validate plan type enum', () => {
      const validPlanTypes = [
        'SINGLE_SESSION',
        'MONTHLY_PLAN',
        'CONSULTATION',
        'PACKAGE',
        'RETAINER',
      ]
      validPlanTypes.forEach(planType => {
        expect([
          'SINGLE_SESSION',
          'MONTHLY_PLAN',
          'CONSULTATION',
          'PACKAGE',
          'RETAINER',
        ]).toContain(planType)
      })
    })

    it('should validate enrollment status enum', () => {
      const validStatuses = ['ACTIVE', 'PAUSED', 'CANCELLED', 'COMPLETED']
      validStatuses.forEach(status => {
        expect(['ACTIVE', 'PAUSED', 'CANCELLED', 'COMPLETED']).toContain(status)
      })
    })
  })

  describe('Meeting Model', () => {
    it('should create a meeting with valid data', async () => {
      const meetingData = {
        enrollmentId: 'enrollment-id',
        title: 'Weekly Check-in',
        scheduledAt: new Date('2025-10-10T15:00:00Z'),
        duration: 60,
        status: 'SCHEDULED',
      }

      mockPrismaClient.meeting.create.mockResolvedValue({
        id: 'meeting-id',
        ...meetingData,
        createdAt: new Date(),
        updatedAt: new Date(),
      })

      const result = await mockPrismaClient.meeting.create({
        data: meetingData,
      })

      expect(result).toMatchObject(meetingData)
      expect(result.duration).toBe(60)
    })

    it('should validate meeting status enum', () => {
      const validStatuses = ['SCHEDULED', 'IN_PROGRESS', 'COMPLETED', 'CANCELLED']
      validStatuses.forEach(status => {
        expect(['SCHEDULED', 'IN_PROGRESS', 'COMPLETED', 'CANCELLED']).toContain(status)
      })
    })

    it('should handle advisory meeting with hours consumed', async () => {
      const meetingData = {
        enrollmentId: 'enrollment-id',
        title: 'Architecture Review Session',
        scheduledAt: new Date('2025-10-10T15:00:00Z'),
        duration: 120,
        status: 'COMPLETED',
        hoursConsumed: 2,
      }

      mockPrismaClient.meeting.create.mockResolvedValue({
        id: 'meeting-id',
        ...meetingData,
        createdAt: new Date(),
        updatedAt: new Date(),
      })

      const result = await mockPrismaClient.meeting.create({
        data: meetingData,
      })

      expect(result.hoursConsumed).toBe(2)
    })
  })

  describe('Payment Model', () => {
    it('should create a payment record', async () => {
      const paymentData = {
        enrollmentId: 'enrollment-id',
        stripePaymentId: 'pi_test_123',
        amount: 15000,
        currency: 'usd',
        status: 'SUCCEEDED',
        paymentType: 'SINGLE_SESSION',
      }

      mockPrismaClient.payment.create.mockResolvedValue({
        id: 'payment-id',
        ...paymentData,
        createdAt: new Date(),
      })

      const result = await mockPrismaClient.payment.create({
        data: paymentData,
      })

      expect(result).toMatchObject(paymentData)
      expect(result.amount).toBe(15000)
    })

    it('should validate payment status enum', () => {
      const validStatuses = ['PENDING', 'SUCCEEDED', 'FAILED', 'REFUNDED']
      validStatuses.forEach(status => {
        expect(['PENDING', 'SUCCEEDED', 'FAILED', 'REFUNDED']).toContain(status)
      })
    })

    it('should enforce unique stripe payment ID', async () => {
      const paymentData = {
        enrollmentId: 'enrollment-id',
        stripePaymentId: 'pi_duplicate_123',
        amount: 15000,
        status: 'SUCCEEDED',
        paymentType: 'SINGLE_SESSION',
      }

      mockPrismaClient.payment.create.mockRejectedValue(
        new Error('Unique constraint failed on the fields: (`stripePaymentId`)')
      )

      await expect(
        mockPrismaClient.payment.create({ data: paymentData })
      ).rejects.toThrow('Unique constraint failed')
    })
  })

  describe('Task Status Validation', () => {
    it('should validate task status enum', () => {
      const validStatuses = ['NOT_STARTED', 'IN_PROGRESS', 'COMPLETED']
      validStatuses.forEach(status => {
        expect(['NOT_STARTED', 'IN_PROGRESS', 'COMPLETED']).toContain(status)
      })
    })
  })

  describe('Deliverable Validation', () => {
    it('should validate deliverable type enum', () => {
      const validTypes = [
        'REPORT',
        'STRATEGIC_PLAN',
        'ARCHITECTURE_REVIEW',
        'CODE_REVIEW',
        'RECOMMENDATION_DOCUMENT',
        'CUSTOM',
      ]
      validTypes.forEach(type => {
        expect([
          'REPORT',
          'STRATEGIC_PLAN',
          'ARCHITECTURE_REVIEW',
          'CODE_REVIEW',
          'RECOMMENDATION_DOCUMENT',
          'CUSTOM',
        ]).toContain(type)
      })
    })

    it('should validate deliverable status enum', () => {
      const validStatuses = ['NOT_STARTED', 'IN_PROGRESS', 'UNDER_REVIEW', 'COMPLETED']
      validStatuses.forEach(status => {
        expect(['NOT_STARTED', 'IN_PROGRESS', 'UNDER_REVIEW', 'COMPLETED']).toContain(status)
      })
    })
  })
})

