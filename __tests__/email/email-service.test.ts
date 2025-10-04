import { sendEmail, sendBulkEmails, getEmailStatus, updateEmailStatus, retryFailedEmails, getEmailStats, validateEmailConfig } from '@/lib/email'
import { prisma } from '@/lib/prisma'
import { EmailType, EmailStatus } from '@prisma/client'

// Mock Resend
jest.mock('resend', () => ({
  Resend: jest.fn().mockImplementation(() => ({
    emails: {
      send: jest.fn(),
    },
  })),
}))

// Mock Prisma
jest.mock('@/lib/prisma', () => ({
  prisma: {
    emailNotification: {
      create: jest.fn(),
      findFirst: jest.fn(),
      updateMany: jest.fn(),
      groupBy: jest.fn(),
      findMany: jest.fn(),
    },
  },
}))

// Mock Prisma enums
jest.mock('@prisma/client', () => ({
  EmailType: {
    WELCOME: 'WELCOME',
    ACCOUNT_CONFIRMED: 'ACCOUNT_CONFIRMED',
    ACCOUNT_REJECTED: 'ACCOUNT_REJECTED',
    PASSWORD_RESET: 'PASSWORD_RESET',
    MEETING_REMINDER: 'MEETING_REMINDER',
    CUSTOM: 'CUSTOM',
  },
  EmailStatus: {
    SENT: 'SENT',
    FAILED: 'FAILED',
    DELIVERED: 'DELIVERED',
    OPENED: 'OPENED',
    CLICKED: 'CLICKED',
  },
}))

const mockPrismaClient = {
  emailNotification: {
    create: jest.fn(),
    findFirst: jest.fn(),
    updateMany: jest.fn(),
    groupBy: jest.fn(),
    findMany: jest.fn(),
  },
}

describe('Email Service Tests', () => {
  beforeEach(() => {
    jest.clearAllMocks()
    process.env.RESEND_API_KEY = 'test-resend-key'
    process.env.FROM_EMAIL = 'test@mentorshiphub.com'
    process.env.SUPPORT_EMAIL = 'support@mentorshiphub.com'
  })

  describe('sendEmail', () => {
    it('should send email successfully', async () => {
      const mockResend = require('resend')
      mockResend.Resend.mockImplementation(() => ({
        emails: {
          send: jest.fn().mockResolvedValue({
            data: { id: 'email-123' },
            error: null,
          }),
        },
      }))

      mockPrismaClient.emailNotification.create.mockResolvedValue({
        id: 'notification-123',
        userId: 'user-123',
        type: EmailType.WELCOME,
        subject: 'Welcome',
        body: 'Welcome message',
        status: EmailStatus.SENT,
        sentAt: new Date(),
      })

      const emailData = {
        to: 'user@example.com',
        subject: 'Welcome',
        html: '<h1>Welcome</h1>',
        text: 'Welcome',
        type: EmailType.WELCOME,
        userId: 'user-123',
      }

      const result = await sendEmail(emailData)

      expect(result.success).toBe(true)
      expect(result.messageId).toBe('email-123')
      expect(mockPrismaClient.emailNotification.create).toHaveBeenCalledWith({
        data: {
          userId: emailData.userId,
          type: emailData.type,
          subject: emailData.subject,
          body: emailData.text,
          status: EmailStatus.SENT,
          sentAt: expect.any(Date),
        },
      })
    })

    it('should handle email sending failure', async () => {
      const mockResend = require('resend')
      mockResend.Resend.mockImplementation(() => ({
        emails: {
          send: jest.fn().mockResolvedValue({
            data: null,
            error: { message: 'SMTP error' },
          }),
        },
      }))

      mockPrismaClient.emailNotification.create.mockResolvedValue({
        id: 'notification-123',
        userId: 'user-123',
        type: EmailType.WELCOME,
        subject: 'Welcome',
        body: 'Welcome message',
        status: EmailStatus.FAILED,
        sentAt: new Date(),
        errorMessage: 'SMTP error',
      })

      const emailData = {
        to: 'user@example.com',
        subject: 'Welcome',
        html: '<h1>Welcome</h1>',
        text: 'Welcome',
        type: EmailType.WELCOME,
        userId: 'user-123',
      }

      const result = await sendEmail(emailData)

      expect(result.success).toBe(false)
      expect(result.error).toBe('SMTP error')
      expect(mockPrismaClient.emailNotification.create).toHaveBeenCalledWith({
        data: {
          userId: emailData.userId,
          type: emailData.type,
          subject: emailData.subject,
          body: emailData.text,
          status: EmailStatus.FAILED,
          sentAt: expect.any(Date),
          errorMessage: 'SMTP error',
        },
      })
    })

    it('should handle missing environment variables', async () => {
      delete process.env.RESEND_API_KEY

      const emailData = {
        to: 'user@example.com',
        subject: 'Welcome',
        html: '<h1>Welcome</h1>',
        text: 'Welcome',
        type: EmailType.WELCOME,
        userId: 'user-123',
      }

      const result = await sendEmail(emailData)

      expect(result.success).toBe(false)
      expect(result.error).toBe('RESEND_API_KEY is not configured')
    })

    it('should handle Resend API errors', async () => {
      const mockResend = require('resend')
      mockResend.Resend.mockImplementation(() => ({
        emails: {
          send: jest.fn().mockRejectedValue(new Error('Network error')),
        },
      }))

      mockPrismaClient.emailNotification.create.mockResolvedValue({
        id: 'notification-123',
        userId: 'user-123',
        type: EmailType.WELCOME,
        subject: 'Welcome',
        body: 'Welcome message',
        status: EmailStatus.FAILED,
        sentAt: new Date(),
        errorMessage: 'Network error',
      })

      const emailData = {
        to: 'user@example.com',
        subject: 'Welcome',
        html: '<h1>Welcome</h1>',
        text: 'Welcome',
        type: EmailType.WELCOME,
        userId: 'user-123',
      }

      const result = await sendEmail(emailData)

      expect(result.success).toBe(false)
      expect(result.error).toBe('Network error')
    })
  })

  describe('sendBulkEmails', () => {
    it('should send multiple emails successfully', async () => {
      const mockResend = require('resend')
      mockResend.Resend.mockImplementation(() => ({
        emails: {
          send: jest.fn().mockResolvedValue({
            data: { id: 'email-123' },
            error: null,
          }),
        },
      }))

      mockPrismaClient.emailNotification.create.mockResolvedValue({
        id: 'notification-123',
        userId: 'user-123',
        type: EmailType.WELCOME,
        subject: 'Welcome',
        body: 'Welcome message',
        status: EmailStatus.SENT,
        sentAt: new Date(),
      })

      const emails = [
        {
          to: 'user1@example.com',
          subject: 'Welcome',
          html: '<h1>Welcome</h1>',
          text: 'Welcome',
          type: EmailType.WELCOME,
          userId: 'user-1',
        },
        {
          to: 'user2@example.com',
          subject: 'Welcome',
          html: '<h1>Welcome</h1>',
          text: 'Welcome',
          type: EmailType.WELCOME,
          userId: 'user-2',
        },
      ]

      const result = await sendBulkEmails(emails)

      expect(result.success).toBe(true)
      expect(result.results).toHaveLength(2)
      expect(result.results.every(r => r.success)).toBe(true)
    })

    it('should handle partial failures in bulk emails', async () => {
      const mockResend = require('resend')
      mockResend.Resend.mockImplementation(() => ({
        emails: {
          send: jest.fn()
            .mockResolvedValueOnce({
              data: { id: 'email-123' },
              error: null,
            })
            .mockRejectedValueOnce(new Error('Network error')),
        },
      }))

      mockPrismaClient.emailNotification.create
        .mockResolvedValueOnce({
          id: 'notification-123',
          userId: 'user-1',
          type: EmailType.WELCOME,
          subject: 'Welcome',
          body: 'Welcome message',
          status: EmailStatus.SENT,
          sentAt: new Date(),
        })
        .mockResolvedValueOnce({
          id: 'notification-124',
          userId: 'user-2',
          type: EmailType.WELCOME,
          subject: 'Welcome',
          body: 'Welcome message',
          status: EmailStatus.FAILED,
          sentAt: new Date(),
          errorMessage: 'Network error',
        })

      const emails = [
        {
          to: 'user1@example.com',
          subject: 'Welcome',
          html: '<h1>Welcome</h1>',
          text: 'Welcome',
          type: EmailType.WELCOME,
          userId: 'user-1',
        },
        {
          to: 'user2@example.com',
          subject: 'Welcome',
          html: '<h1>Welcome</h1>',
          text: 'Welcome',
          type: EmailType.WELCOME,
          userId: 'user-2',
        },
      ]

      const result = await sendBulkEmails(emails)

      expect(result.success).toBe(false)
      expect(result.results).toHaveLength(2)
      expect(result.results[0].success).toBe(true)
      expect(result.results[1].success).toBe(false)
    })
  })

  describe('getEmailStatus', () => {
    it('should return email status', async () => {
      mockPrismaClient.emailNotification.findFirst.mockResolvedValue({
        status: EmailStatus.DELIVERED,
      })

      const status = await getEmailStatus('email-123')

      expect(status).toBe(EmailStatus.DELIVERED)
      expect(mockPrismaClient.emailNotification.findFirst).toHaveBeenCalledWith({
        where: {},
      })
    })

    it('should return null if email not found', async () => {
      mockPrismaClient.emailNotification.findFirst.mockResolvedValue(null)

      const status = await getEmailStatus('email-123')

      expect(status).toBeNull()
    })

    it('should handle database errors', async () => {
      mockPrismaClient.emailNotification.findFirst.mockRejectedValue(new Error('Database error'))

      const status = await getEmailStatus('email-123')

      expect(status).toBeNull()
    })
  })

  describe('updateEmailStatus', () => {
    it('should update email status successfully', async () => {
      mockPrismaClient.emailNotification.updateMany.mockResolvedValue({
        count: 1,
      })

      await updateEmailStatus('email-123', EmailStatus.DELIVERED)

      expect(mockPrismaClient.emailNotification.updateMany).toHaveBeenCalledWith({
        where: {},
        data: {
          status: EmailStatus.DELIVERED,
          sentAt: expect.any(Date),
        },
      })
    })

    it('should handle database errors', async () => {
      mockPrismaClient.emailNotification.updateMany.mockRejectedValue(new Error('Database error'))

      await expect(updateEmailStatus('email-123', EmailStatus.DELIVERED)).resolves.not.toThrow()
    })
  })

  describe('retryFailedEmails', () => {
    it('should retry failed emails successfully', async () => {
      const mockResend = require('resend')
      mockResend.Resend.mockImplementation(() => ({
        emails: {
          send: jest.fn().mockResolvedValue({
            data: { id: 'email-123' },
            error: null,
          }),
        },
      }))

      mockPrismaClient.emailNotification.findMany.mockResolvedValue([
        {
          id: 'notification-123',
          userId: 'user-123',
          type: EmailType.WELCOME,
          subject: 'Welcome',
          body: 'Welcome message',
          status: EmailStatus.FAILED,
          sentAt: new Date(Date.now() - 2 * 60 * 60 * 1000), // 2 hours ago
          user: {
            email: 'user@example.com',
            name: 'Test User',
          },
        },
      ])

      mockPrismaClient.emailNotification.create.mockResolvedValue({
        id: 'notification-124',
        userId: 'user-123',
        type: EmailType.WELCOME,
        subject: 'Welcome',
        body: 'Welcome message',
        status: EmailStatus.SENT,
        sentAt: new Date(),
      })

      const result = await retryFailedEmails()

      expect(result.success).toBe(true)
      expect(result.retried).toBe(1)
      expect(result.errors).toHaveLength(0)
    })

    it('should handle retry errors', async () => {
      mockPrismaClient.emailNotification.findMany.mockResolvedValue([
        {
          id: 'notification-123',
          userId: 'user-123',
          type: EmailType.WELCOME,
          subject: 'Welcome',
          body: 'Welcome message',
          status: EmailStatus.FAILED,
          sentAt: new Date(Date.now() - 2 * 60 * 60 * 1000),
          user: {
            email: 'user@example.com',
            name: 'Test User',
          },
        },
      ])

      mockPrismaClient.emailNotification.create.mockRejectedValue(new Error('Database error'))

      const result = await retryFailedEmails()

      expect(result.success).toBe(false)
      expect(result.retried).toBe(0)
      expect(result.errors).toHaveLength(1)
      expect(result.errors[0]).toContain('Database error')
    })
  })

  describe('getEmailStats', () => {
    it('should return email statistics', async () => {
      mockPrismaClient.emailNotification.groupBy.mockResolvedValue([
        { status: EmailStatus.SENT, _count: { status: 10 } },
        { status: EmailStatus.DELIVERED, _count: { status: 8 } },
        { status: EmailStatus.FAILED, _count: { status: 2 } },
        { status: EmailStatus.OPENED, _count: { status: 5 } },
        { status: EmailStatus.CLICKED, _count: { status: 3 } },
      ])

      const stats = await getEmailStats()

      expect(stats.total).toBe(28)
      expect(stats.sent).toBe(10)
      expect(stats.delivered).toBe(8)
      expect(stats.failed).toBe(2)
      expect(stats.opened).toBe(5)
      expect(stats.clicked).toBe(3)
    })

    it('should handle database errors', async () => {
      mockPrismaClient.emailNotification.groupBy.mockRejectedValue(new Error('Database error'))

      const stats = await getEmailStats()

      expect(stats.total).toBe(0)
      expect(stats.sent).toBe(0)
      expect(stats.delivered).toBe(0)
      expect(stats.failed).toBe(0)
      expect(stats.opened).toBe(0)
      expect(stats.clicked).toBe(0)
    })
  })

  describe('validateEmailConfig', () => {
    it('should validate email configuration successfully', async () => {
      const result = await validateEmailConfig()

      expect(result.valid).toBe(true)
      expect(result.errors).toHaveLength(0)
    })

    it('should detect missing environment variables', async () => {
      delete process.env.RESEND_API_KEY
      delete process.env.FROM_EMAIL
      delete process.env.SUPPORT_EMAIL

      const result = await validateEmailConfig()

      expect(result.valid).toBe(false)
      expect(result.errors).toContain('RESEND_API_KEY is not configured')
      expect(result.errors).toContain('FROM_EMAIL is not configured')
      expect(result.errors).toContain('SUPPORT_EMAIL is not configured')
    })

    it('should detect invalid API key', async () => {
      process.env.RESEND_API_KEY = 'short'

      const result = await validateEmailConfig()

      expect(result.valid).toBe(false)
      expect(result.errors).toContain('RESEND_API_KEY appears to be invalid (too short)')
    })
  })
})
