import { prisma } from '@/lib/prisma'
import { sendEmail, EmailData } from '@/lib/email'
import { EmailType, EmailStatus } from '@prisma/client'

export interface QueuedEmail {
  id: string
  userId: string
  type: EmailType
  subject: string
  body: string
  attempts: number
  maxAttempts: number
  scheduledAt: Date
  createdAt: Date
  updatedAt: Date
}

export interface EmailQueueConfig {
  maxAttempts: number
  retryDelay: number // in milliseconds
  batchSize: number
  processingInterval: number // in milliseconds
}

const defaultConfig: EmailQueueConfig = {
  maxAttempts: 3,
  retryDelay: 5 * 60 * 1000, // 5 minutes
  batchSize: 10,
  processingInterval: 30 * 1000, // 30 seconds
}

export class EmailQueue {
  private config: EmailQueueConfig
  private isProcessing: boolean = false
  private processingInterval: NodeJS.Timeout | null = null

  constructor(config: Partial<EmailQueueConfig> = {}) {
    this.config = { ...defaultConfig, ...config }
  }

  async addEmail(emailData: EmailData, scheduledAt?: Date): Promise<string> {
    try {
      const queuedEmail = await prisma.emailNotification.create({
        data: {
          userId: emailData.userId,
          type: emailData.type,
          subject: emailData.subject,
          body: emailData.text,
          status: EmailStatus.SENT, // Will be updated when actually sent
          sentAt: scheduledAt || new Date(),
        },
      })

      return queuedEmail.id
    } catch (error) {
      console.error('Error adding email to queue:', error)
      throw error
    }
  }

  async addBulkEmails(emails: EmailData[], scheduledAt?: Date): Promise<string[]> {
    try {
      const emailRecords = emails.map(email => ({
        userId: email.userId,
        type: email.type,
        subject: email.subject,
        body: email.text,
        status: EmailStatus.SENT,
        sentAt: scheduledAt || new Date(),
      }))

      const result = await prisma.emailNotification.createMany({
        data: emailRecords,
      })

      // Return the IDs of created records
      const createdEmails = await prisma.emailNotification.findMany({
        where: {
          userId: { in: emails.map(e => e.userId) },
          type: { in: emails.map(e => e.type) },
          subject: { in: emails.map(e => e.subject) },
        },
        select: { id: true },
        orderBy: { sentAt: 'desc' },
        take: emails.length,
      })

      return createdEmails.map(e => e.id)
    } catch (error) {
      console.error('Error adding bulk emails to queue:', error)
      throw error
    }
  }

  async processQueue(): Promise<{ processed: number; successful: number; failed: number }> {
    if (this.isProcessing) {
      return { processed: 0, successful: 0, failed: 0 }
    }

    this.isProcessing = true

    try {
      const emailsToProcess = await this.getPendingEmails()
      let processed = 0
      let successful = 0
      let failed = 0

      for (const email of emailsToProcess) {
        try {
          const result = await this.processEmail(email)
          processed++

          if (result.success) {
            successful++
          } else {
            failed++
          }
        } catch (error) {
          console.error(`Error processing email ${email.id}:`, error)
          failed++
          processed++
        }
      }

      return { processed, successful, failed }
    } finally {
      this.isProcessing = false
    }
  }

  private async getPendingEmails(): Promise<QueuedEmail[]> {
    try {
      const emails = await prisma.emailNotification.findMany({
        where: {
          status: EmailStatus.SENT,
          sentAt: {
            lte: new Date(),
          },
        },
        take: this.config.batchSize,
        orderBy: {
          sentAt: 'asc',
        },
      })

      return emails.map(email => ({
        id: email.id,
        userId: email.userId,
        type: email.type,
        subject: email.subject,
        body: email.body,
        attempts: 0, // This would need to be tracked in the database
        maxAttempts: this.config.maxAttempts,
        scheduledAt: email.sentAt,
        createdAt: email.sentAt,
        updatedAt: email.sentAt,
      }))
    } catch (error) {
      console.error('Error getting pending emails:', error)
      return []
    }
  }

  private async processEmail(email: QueuedEmail): Promise<{ success: boolean; error?: string }> {
    try {
      // Get user information
      const user = await prisma.user.findUnique({
        where: { id: email.userId },
        select: { email: true, name: true },
      })

      if (!user) {
        throw new Error(`User not found: ${email.userId}`)
      }

      // Send email
      const result = await sendEmail({
        to: user.email,
        subject: email.subject,
        html: email.body,
        text: email.body,
        type: email.type,
        userId: email.userId,
      })

      if (result.success) {
        // Update email status to delivered
        await prisma.emailNotification.update({
          where: { id: email.id },
          data: {
            status: EmailStatus.DELIVERED,
            sentAt: new Date(),
          },
        })
      } else {
        // Update email status to failed
        await prisma.emailNotification.update({
          where: { id: email.id },
          data: {
            status: EmailStatus.FAILED,
            errorMessage: result.error,
          },
        })
      }

      return result
    } catch (error) {
      console.error(`Error processing email ${email.id}:`, error)

      // Update email status to failed
      await prisma.emailNotification.update({
        where: { id: email.id },
        data: {
          status: EmailStatus.FAILED,
          errorMessage: error instanceof Error ? error.message : 'Unknown error',
        },
      })

      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error',
      }
    }
  }

  startProcessing(): void {
    if (this.processingInterval) {
      return
    }

    this.processingInterval = setInterval(async () => {
      try {
        await this.processQueue()
      } catch (error) {
        console.error('Error in email queue processing:', error)
      }
    }, this.config.processingInterval)
  }

  stopProcessing(): void {
    if (this.processingInterval) {
      clearInterval(this.processingInterval)
      this.processingInterval = null
    }
  }

  async getQueueStats(): Promise<{
    pending: number
    processing: number
    successful: number
    failed: number
    total: number
  }> {
    try {
      const stats = await prisma.emailNotification.groupBy({
        by: ['status'],
        _count: {
          status: true,
        },
      })

      const result = {
        pending: 0,
        processing: 0,
        successful: 0,
        failed: 0,
        total: 0,
      }

      stats.forEach(stat => {
        result.total += stat._count.status
        switch (stat.status) {
          case EmailStatus.SENT:
            result.pending = stat._count.status
            break
          case EmailStatus.DELIVERED:
            result.successful = stat._count.status
            break
          case EmailStatus.FAILED:
            result.failed = stat._count.status
            break
        }
      })

      return result
    } catch (error) {
      console.error('Error getting queue stats:', error)
      return {
        pending: 0,
        processing: 0,
        successful: 0,
        failed: 0,
        total: 0,
      }
    }
  }

  async retryFailedEmails(): Promise<{ retried: number; errors: string[] }> {
    try {
      const failedEmails = await prisma.emailNotification.findMany({
        where: {
          status: EmailStatus.FAILED,
          sentAt: {
            gte: new Date(Date.now() - 24 * 60 * 60 * 1000), // Last 24 hours
          },
        },
      })

      const errors: string[] = []
      let retried = 0

      for (const email of failedEmails) {
        try {
          // Reset status to SENT for retry
          await prisma.emailNotification.update({
            where: { id: email.id },
            data: {
              status: EmailStatus.SENT,
              sentAt: new Date(),
            },
          })

          retried++
        } catch (error) {
          errors.push(`Error retrying email ${email.id}: ${error instanceof Error ? error.message : 'Unknown error'}`)
        }
      }

      return { retried, errors }
    } catch (error) {
      console.error('Error retrying failed emails:', error)
      return {
        retried: 0,
        errors: [error instanceof Error ? error.message : 'Unknown error'],
      }
    }
  }

  async clearOldEmails(olderThanDays: number = 30): Promise<{ deleted: number }> {
    try {
      const cutoffDate = new Date(Date.now() - olderThanDays * 24 * 60 * 60 * 1000)

      const result = await prisma.emailNotification.deleteMany({
        where: {
          sentAt: {
            lt: cutoffDate,
          },
          status: {
            in: [EmailStatus.DELIVERED, EmailStatus.FAILED],
          },
        },
      })

      return { deleted: result.count }
    } catch (error) {
      console.error('Error clearing old emails:', error)
      return { deleted: 0 }
    }
  }
}

// Global email queue instance
export const emailQueue = new EmailQueue()

// Auto-start processing in production
if (process.env.NODE_ENV === 'production') {
  emailQueue.startProcessing()
}