import { Resend } from 'resend'
import { prisma } from '@/lib/prisma'
import { EmailType, EmailStatus } from '@prisma/client'

const resend = new Resend(process.env.RESEND_API_KEY)

export interface EmailData {
  to: string
  subject: string
  html: string
  text: string
  type: EmailType
  userId: string
}

export interface EmailTemplate {
  subject: string
  html: string
  text: string
}

export async function sendEmail(data: EmailData): Promise<{ success: boolean; messageId?: string; error?: string }> {
  try {
    // Validate required environment variables
    if (!process.env.RESEND_API_KEY) {
      throw new Error('RESEND_API_KEY is not configured')
    }

    if (!process.env.FROM_EMAIL) {
      throw new Error('FROM_EMAIL is not configured')
    }

    // Send email via Resend
    const result = await resend.emails.send({
      from: process.env.FROM_EMAIL,
      to: data.to,
      subject: data.subject,
      html: data.html,
      text: data.text,
    })

    if (result.error) {
      throw new Error(`Resend error: ${result.error.message}`)
    }

    // Log email in database
    await prisma.emailNotification.create({
      data: {
        userId: data.userId,
        type: data.type,
        subject: data.subject,
        body: data.text,
        status: EmailStatus.SENT,
        sentAt: new Date(),
      },
    })

    return {
      success: true,
      messageId: result.data?.id,
    }
  } catch (error) {
    console.error('Email sending failed:', error)

    // Log failed email in database
    await prisma.emailNotification.create({
      data: {
        userId: data.userId,
        type: data.type,
        subject: data.subject,
        body: data.text,
        status: EmailStatus.FAILED,
        sentAt: new Date(),
        errorMessage: error instanceof Error ? error.message : 'Unknown error',
      },
    })

    return {
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error',
    }
  }
}

export async function sendBulkEmails(emails: EmailData[]): Promise<{ success: boolean; results: Array<{ success: boolean; error?: string }> }> {
  const results = await Promise.allSettled(
    emails.map(email => sendEmail(email))
  )

  const processedResults = results.map((result, index) => {
    if (result.status === 'fulfilled') {
      return { success: result.value.success, error: result.value.error }
    } else {
      return { success: false, error: result.reason?.message || 'Unknown error' }
    }
  })

  const successCount = processedResults.filter(r => r.success).length
  const totalCount = processedResults.length

  return {
    success: successCount === totalCount,
    results: processedResults,
  }
}

export async function getEmailStatus(messageId: string): Promise<EmailStatus | null> {
  try {
    const notification = await prisma.emailNotification.findFirst({
      where: {
        // Assuming we store messageId in the database
        // This would need to be added to the schema if not already present
      },
    })

    return notification?.status || null
  } catch (error) {
    console.error('Error getting email status:', error)
    return null
  }
}

export async function updateEmailStatus(messageId: string, status: EmailStatus): Promise<void> {
  try {
    await prisma.emailNotification.updateMany({
      where: {
        // Assuming we store messageId in the database
        // This would need to be added to the schema if not already present
      },
      data: {
        status,
        sentAt: status === EmailStatus.DELIVERED ? new Date() : undefined,
      },
    })
  } catch (error) {
    console.error('Error updating email status:', error)
  }
}

export async function retryFailedEmails(): Promise<{ success: boolean; retried: number; errors: string[] }> {
  try {
    const failedEmails = await prisma.emailNotification.findMany({
      where: {
        status: EmailStatus.FAILED,
        sentAt: {
          gte: new Date(Date.now() - 24 * 60 * 60 * 1000), // Last 24 hours
        },
      },
      include: {
        user: true,
      },
    })

    const errors: string[] = []
    let retried = 0

    for (const email of failedEmails) {
      try {
        const result = await sendEmail({
          to: email.user.email,
          subject: email.subject,
          html: email.body, // Assuming body contains HTML
          text: email.body,
          type: email.type,
          userId: email.userId,
        })

        if (result.success) {
          retried++
        } else {
          errors.push(`Failed to retry email ${email.id}: ${result.error}`)
        }
      } catch (error) {
        errors.push(`Error retrying email ${email.id}: ${error instanceof Error ? error.message : 'Unknown error'}`)
      }
    }

    return {
      success: errors.length === 0,
      retried,
      errors,
    }
  } catch (error) {
    console.error('Error retrying failed emails:', error)
    return {
      success: false,
      retried: 0,
      errors: [error instanceof Error ? error.message : 'Unknown error'],
    }
  }
}

export async function getEmailStats(): Promise<{
  total: number
  sent: number
  failed: number
  delivered: number
  opened: number
  clicked: number
}> {
  try {
    const stats = await prisma.emailNotification.groupBy({
      by: ['status'],
      _count: {
        status: true,
      },
    })

    const result = {
      total: 0,
      sent: 0,
      failed: 0,
      delivered: 0,
      opened: 0,
      clicked: 0,
    }

    stats.forEach(stat => {
      result.total += stat._count.status
      switch (stat.status) {
        case EmailStatus.SENT:
          result.sent = stat._count.status
          break
        case EmailStatus.FAILED:
          result.failed = stat._count.status
          break
        case EmailStatus.DELIVERED:
          result.delivered = stat._count.status
          break
        case EmailStatus.OPENED:
          result.opened = stat._count.status
          break
        case EmailStatus.CLICKED:
          result.clicked = stat._count.status
          break
      }
    })

    return result
  } catch (error) {
    console.error('Error getting email stats:', error)
    return {
      total: 0,
      sent: 0,
      failed: 0,
      delivered: 0,
      opened: 0,
      clicked: 0,
    }
  }
}

export async function validateEmailConfig(): Promise<{ valid: boolean; errors: string[] }> {
  const errors: string[] = []

  if (!process.env.RESEND_API_KEY) {
    errors.push('RESEND_API_KEY is not configured')
  }

  if (!process.env.FROM_EMAIL) {
    errors.push('FROM_EMAIL is not configured')
  }

  if (!process.env.SUPPORT_EMAIL) {
    errors.push('SUPPORT_EMAIL is not configured')
  }

  // Test Resend connection
  if (process.env.RESEND_API_KEY) {
    try {
      // This would be a simple API call to test the connection
      // For now, we'll just check if the key is present
      const keyLength = process.env.RESEND_API_KEY.length
      if (keyLength < 10) {
        errors.push('RESEND_API_KEY appears to be invalid (too short)')
      }
    } catch (error) {
      errors.push(`Resend connection test failed: ${error instanceof Error ? error.message : 'Unknown error'}`)
    }
  }

  return {
    valid: errors.length === 0,
    errors,
  }
}