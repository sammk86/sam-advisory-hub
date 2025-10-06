import * as brevo from '@getbrevo/brevo'
import { prisma } from '@/lib/prisma'
import { EmailType, EmailStatus } from '@prisma/client'

const brevoApi = new brevo.TransactionalEmailsApi()
brevoApi.setApiKey(brevo.TransactionalEmailsApiApiKeys.apiKey, process.env.BREVO_API_KEY || '')

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
    if (!process.env.BREVO_API_KEY) {
      throw new Error('BREVO_API_KEY is not configured')
    }

    if (!process.env.FROM_EMAIL) {
      throw new Error('FROM_EMAIL is not configured')
    }

    // Prepare Brevo email data
    const sender = new brevo.SendSmtpEmailSender()
    sender.email = process.env.FROM_EMAIL
    sender.name = process.env.FROM_NAME || 'SamAdvisoryHub'

          const toRecipients = [{}]
          toRecipients[0].email = data.to

    const emailData = new brevo.SendSmtpEmail()
    emailData.sender = sender
    emailData.to = toRecipients
    emailData.subject = data.subject
    emailData.htmlContent = data.html
    emailData.textContent = data.text

    // Send email via Brevo
    const result = await brevoApi.sendTransacEmail(emailData)

    // Log email in database
    await prisma.emailNotification.create({
      data: {
        userId: data.userId,
        type: data.type,
        status: EmailStatus.SENT,
        sentAt: new Date(),
      },
    })

    return {
      success: true,
      messageId: result.messageId,
    }
  } catch (error) {
    console.error('Email sending failed:', error)

    // Log failed email in database
    await prisma.emailNotification.create({
      data: {
        userId: data.userId,
        type: data.type,
        status: EmailStatus.BOUNCED,
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
        status: EmailStatus.BOUNCED,
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
        case EmailStatus.BOUNCED:
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

  if (!process.env.BREVO_API_KEY) {
    errors.push('BREVO_API_KEY is not configured')
  }

  if (!process.env.FROM_EMAIL) {
    errors.push('FROM_EMAIL is not configured')
  }

  if (!process.env.SUPPORT_EMAIL) {
    errors.push('SUPPORT_EMAIL is not configured')
  }

  // Test Brevo connection
  if (process.env.BREVO_API_KEY) {
    try {
      // Test the API key by making a simple API call
      const keyLength = process.env.BREVO_API_KEY.length
      if (keyLength < 10) {
        errors.push('BREVO_API_KEY appears to be invalid (too short)')
      }
      
      // Try to get account info to validate the key
      const accountApi = new brevo.AccountApi()
      accountApi.setApiKey(brevo.AccountApiApiKeys.apiKey, process.env.BREVO_API_KEY)
      await accountApi.getAccount()
    } catch (error) {
      errors.push(`Brevo connection test failed: ${error instanceof Error ? error.message : 'Unknown error'}`)
    }
  }

  return {
    valid: errors.length === 0,
    errors,
  }
}

// Newsletter-specific email functions
export async function sendNewsletterEmail(
  campaignId: string,
  subscriberId: string,
  email: string,
  subject: string,
  htmlContent: string,
  textContent: string
): Promise<{ success: boolean; messageId?: string; error?: string }> {
  try {
    // Validate required environment variables
    if (!process.env.BREVO_API_KEY) {
      throw new Error('BREVO_API_KEY is not configured')
    }

    if (!process.env.FROM_EMAIL) {
      throw new Error('FROM_EMAIL is not configured')
    }

    // Prepare Brevo email data
    const sender = new brevo.SendSmtpEmailSender()
    sender.email = process.env.FROM_EMAIL
    sender.name = process.env.FROM_NAME || 'SamAdvisoryHub'

    const toRecipients = [{}]
    toRecipients[0].email = email

    const emailData = new brevo.SendSmtpEmail()
    emailData.sender = sender
    emailData.to = toRecipients
    emailData.subject = subject
    emailData.htmlContent = htmlContent
    emailData.textContent = textContent

    // Send email via Brevo
    const result = await brevoApi.sendTransacEmail(emailData)

    // Create email tracking record
    await prisma.emailTracking.create({
      data: {
        campaignId,
        subscriberId,
        email,
        messageId: result.messageId,
        status: 'SENT',
      },
    })

    // Update subscriber email count
    await prisma.newsletterSubscriber.update({
      where: { id: subscriberId },
      data: {
        totalEmailsReceived: {
          increment: 1,
        },
      },
    })

    return {
      success: true,
      messageId: result.messageId,
    }
  } catch (error) {
    console.error('Newsletter email sending failed:', error)

    // Create failed tracking record
    await prisma.emailTracking.create({
      data: {
        campaignId,
        subscriberId,
        email,
        status: 'BOUNCED',
        bouncedAt: new Date(),
      },
    })

    return {
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error',
    }
  }
}

export async function sendBulkNewsletterEmails(
  campaignId: string,
  subscribers: Array<{
    id: string
    email: string
    firstName?: string
  }>,
  subject: string,
  htmlContent: string,
  textContent: string
): Promise<{ success: boolean; sent: number; failed: number; errors: string[] }> {
  const results = await Promise.allSettled(
    subscribers.map(subscriber => 
      sendNewsletterEmail(
        campaignId,
        subscriber.id,
        subscriber.email,
        subject,
        htmlContent,
        textContent
      )
    )
  )

  const processedResults = results.map((result, index) => {
    if (result.status === 'fulfilled') {
      return { success: result.value.success, error: result.value.error }
    } else {
      return { success: false, error: result.reason?.message || 'Unknown error' }
    }
  })

  const successCount = processedResults.filter(r => r.success).length
  const failedCount = processedResults.filter(r => !r.success).length
  const errors = processedResults.filter(r => !r.success).map(r => r.error).filter(Boolean) as string[]

  return {
    success: failedCount === 0,
    sent: successCount,
    failed: failedCount,
    errors,
  }
}

export async function updateEmailTrackingStatus(
  messageId: string,
  status: 'DELIVERED' | 'OPENED' | 'CLICKED' | 'BOUNCED' | 'COMPLAINED' | 'UNSUBSCRIBED'
): Promise<void> {
  try {
    const updateData: any = { status }
    
    switch (status) {
      case 'OPENED':
        updateData.openedAt = new Date()
        break
      case 'CLICKED':
        updateData.clickedAt = new Date()
        break
      case 'BOUNCED':
        updateData.bouncedAt = new Date()
        break
      case 'COMPLAINED':
        updateData.complainedAt = new Date()
        break
    }

    await prisma.emailTracking.updateMany({
      where: { messageId },
      data: updateData,
    })

    // Update campaign analytics
    if (status === 'OPENED') {
      await prisma.newsletterCampaign.updateMany({
        where: {
          emailTracking: {
            some: { messageId }
          }
        },
        data: {
          totalOpened: { increment: 1 }
        }
      })

      // Update subscriber engagement
      await prisma.newsletterSubscriber.updateMany({
        where: {
          emailTracking: {
            some: { messageId }
          }
        },
        data: {
          totalEmailsOpened: { increment: 1 },
          lastEngagement: new Date()
        }
      })
    }

    if (status === 'CLICKED') {
      await prisma.newsletterCampaign.updateMany({
        where: {
          emailTracking: {
            some: { messageId }
          }
        },
        data: {
          totalClicked: { increment: 1 }
        }
      })

      // Update subscriber engagement
      await prisma.newsletterSubscriber.updateMany({
        where: {
          emailTracking: {
            some: { messageId }
          }
        },
        data: {
          totalEmailsClicked: { increment: 1 },
          lastEngagement: new Date()
        }
      })
    }

    if (status === 'BOUNCED') {
      await prisma.newsletterCampaign.updateMany({
        where: {
          emailTracking: {
            some: { messageId }
          }
        },
        data: {
          totalBounced: { increment: 1 }
        }
      })

      // Update subscriber status
      await prisma.newsletterSubscriber.updateMany({
        where: {
          emailTracking: {
            some: { messageId }
          }
        },
        data: {
          status: 'BOUNCED'
        }
      })
    }

    if (status === 'UNSUBSCRIBED') {
      await prisma.newsletterCampaign.updateMany({
        where: {
          emailTracking: {
            some: { messageId }
          }
        },
        data: {
          totalUnsubscribed: { increment: 1 }
        }
      })

      // Update subscriber status
      await prisma.newsletterSubscriber.updateMany({
        where: {
          emailTracking: {
            some: { messageId }
          }
        },
        data: {
          status: 'UNSUBSCRIBED',
          unsubscribedAt: new Date()
        }
      })
    }

  } catch (error) {
    console.error('Error updating email tracking status:', error)
  }
}

export async function getNewsletterAnalytics(): Promise<{
  totalSubscribers: number
  activeSubscribers: number
  unsubscribedCount: number
  totalCampaigns: number
  averageOpenRate: number
  averageClickRate: number
  recentCampaigns: Array<{
    id: string
    title: string
    sentAt: string
    openRate: number
    clickRate: number
  }>
}> {
  try {
    // Get subscriber counts
    const subscriberStats = await prisma.newsletterSubscriber.groupBy({
      by: ['status'],
      _count: { status: true }
    })

    const totalSubscribers = subscriberStats.reduce((sum, stat) => sum + stat._count.status, 0)
    const activeSubscribers = subscriberStats.find(s => s.status === 'ACTIVE')?._count.status || 0
    const unsubscribedCount = subscriberStats.find(s => s.status === 'UNSUBSCRIBED')?._count.status || 0

    // Get campaign stats
    const totalCampaigns = await prisma.newsletterCampaign.count()

    // Get recent campaigns with analytics
    const recentCampaigns = await prisma.newsletterCampaign.findMany({
      where: {
        status: 'SENT',
        sentAt: { not: null }
      },
      orderBy: { sentAt: 'desc' },
      take: 5,
      select: {
        id: true,
        title: true,
        sentAt: true,
        totalSent: true,
        totalOpened: true,
        totalClicked: true
      }
    })

    const campaignsWithRates = recentCampaigns.map(campaign => {
      const openRate = campaign.totalSent > 0 ? (campaign.totalOpened / campaign.totalSent) * 100 : 0
      const clickRate = campaign.totalSent > 0 ? (campaign.totalClicked / campaign.totalSent) * 100 : 0
      
      return {
        id: campaign.id,
        title: campaign.title,
        sentAt: campaign.sentAt?.toISOString() || '',
        openRate: isNaN(openRate) ? 0 : openRate,
        clickRate: isNaN(clickRate) ? 0 : clickRate
      }
    })

    // Calculate average rates
    const averageOpenRate = campaignsWithRates.length > 0 
      ? campaignsWithRates.reduce((sum, c) => sum + c.openRate, 0) / campaignsWithRates.length 
      : 0

    const averageClickRate = campaignsWithRates.length > 0 
      ? campaignsWithRates.reduce((sum, c) => sum + c.clickRate, 0) / campaignsWithRates.length 
      : 0

    // Ensure we have valid numbers
    const safeAverageOpenRate = isNaN(averageOpenRate) ? 0 : averageOpenRate
    const safeAverageClickRate = isNaN(averageClickRate) ? 0 : averageClickRate

    return {
      totalSubscribers,
      activeSubscribers,
      unsubscribedCount,
      totalCampaigns,
      averageOpenRate: safeAverageOpenRate,
      averageClickRate: safeAverageClickRate,
      recentCampaigns: campaignsWithRates
    }

  } catch (error) {
    console.error('Error getting newsletter analytics:', error)
    return {
      totalSubscribers: 0,
      activeSubscribers: 0,
      unsubscribedCount: 0,
      totalCampaigns: 0,
      averageOpenRate: 0,
      averageClickRate: 0,
      recentCampaigns: []
    }
  }
}