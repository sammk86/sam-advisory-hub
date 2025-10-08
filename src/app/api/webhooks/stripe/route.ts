import { NextRequest, NextResponse } from 'next/server'
import { headers } from 'next/headers'
import { prisma } from '@/lib/prisma'
import { StripeWebhookService, StripeErrorHandler } from '@/lib/stripe'
import Stripe from 'stripe'

export async function POST(request: NextRequest) {
  try {
    const body = await request.text()
    const headersList = headers()
    const signature = headersList.get('stripe-signature')

    if (!signature) {
      console.error('Missing Stripe signature')
      return NextResponse.json(
        { error: 'Missing Stripe signature' },
        { status: 400 }
      )
    }

    // Construct and verify the webhook event
    let event: Stripe.Event
    try {
      event = StripeWebhookService.constructEvent(body, signature)
    } catch (error) {
      console.error('Webhook signature verification failed:', error)
      return NextResponse.json(
        { error: 'Invalid signature' },
        { status: 400 }
      )
    }

    console.log(`Received webhook: ${event.type}`)

    // Only process relevant events
    if (!StripeWebhookService.isRelevantEvent(event)) {
      console.log(`Ignoring irrelevant event: ${event.type}`)
      return NextResponse.json({ received: true })
    }

    // Handle different event types
    switch (event.type) {
      case 'payment_intent.succeeded':
        await handlePaymentIntentSucceeded(event.data.object as Stripe.PaymentIntent)
        break

      case 'payment_intent.payment_failed':
        await handlePaymentIntentFailed(event.data.object as Stripe.PaymentIntent)
        break

      case 'invoice.payment_succeeded':
        await handleInvoicePaymentSucceeded(event.data.object as Stripe.Invoice)
        break

      case 'invoice.payment_failed':
        await handleInvoicePaymentFailed(event.data.object as Stripe.Invoice)
        break

      case 'customer.subscription.created':
        await handleSubscriptionCreated(event.data.object as Stripe.Subscription)
        break

      case 'customer.subscription.updated':
        await handleSubscriptionUpdated(event.data.object as Stripe.Subscription)
        break

      case 'customer.subscription.deleted':
        await handleSubscriptionDeleted(event.data.object as Stripe.Subscription)
        break

      case 'customer.subscription.trial_will_end':
        await handleSubscriptionTrialWillEnd(event.data.object as Stripe.Subscription)
        break

      default:
        console.log(`Unhandled event type: ${event.type}`)
    }

    return NextResponse.json({ received: true })

  } catch (error) {
    console.error('Webhook processing error:', error)
    return NextResponse.json(
      { error: 'Webhook processing failed' },
      { status: 500 }
    )
  }
}

// Handle successful payment intent
async function handlePaymentIntentSucceeded(paymentIntent: Stripe.PaymentIntent) {
  try {
    const metadata = paymentIntent.metadata
    const { userId, serviceId, planType, advisoryPackageId, enrollmentId } = metadata

    console.log(`Payment succeeded: ${paymentIntent.id} for user ${userId}`)

    // Create or update enrollment if not exists
    let enrollment
    if (enrollmentId) {
      enrollment = await prisma.enrollment.findUnique({
        where: { id: enrollmentId },
      })
    } else {
      // Create new enrollment
      enrollment = await prisma.enrollment.create({
        data: {
          userId,
          serviceId,
          planType: planType as any,
          status: 'ACTIVE',
          advisoryPackageId: advisoryPackageId || null,
          hoursRemaining: advisoryPackageId ? await getPackageHours(advisoryPackageId) : null,
          stripeCustomerId: paymentIntent.customer as string,
        },
      })
    }

    // Create payment record
    await prisma.payment.create({
      data: {
        enrollmentId: enrollment.id,
        stripePaymentId: paymentIntent.id,
        amount: paymentIntent.amount,
        currency: paymentIntent.currency,
        status: 'SUCCEEDED',
        paymentType: planType as any,
        description: paymentIntent.description || `Payment for ${planType}`,
        paidAt: new Date(),
      },
    })

    // Create default roadmap for mentorship enrollments
    if (planType === 'SINGLE_SESSION' || planType === 'MONTHLY_PLAN') {
      const existingRoadmap = await prisma.roadmap.findUnique({
        where: { enrollmentId: enrollment.id },
      })

      if (!existingRoadmap) {
        await createDefaultRoadmap(enrollment.id, serviceId)
      }
    }

    console.log(`Successfully processed payment: ${paymentIntent.id}`)

  } catch (error) {
    console.error('Error handling payment_intent.succeeded:', error)
    throw error
  }
}

// Handle failed payment intent
async function handlePaymentIntentFailed(paymentIntent: Stripe.PaymentIntent) {
  try {
    const metadata = paymentIntent.metadata
    const { enrollmentId } = metadata

    console.log(`Payment failed: ${paymentIntent.id}`)

    // Update payment record if exists
    const existingPayment = await prisma.payment.findUnique({
      where: { stripePaymentId: paymentIntent.id },
    })

    if (existingPayment) {
      await prisma.payment.update({
        where: { stripePaymentId: paymentIntent.id },
        data: {
          status: 'FAILED',
        },
      })
    }

    // Update enrollment status if exists
    if (enrollmentId) {
      await prisma.enrollment.update({
        where: { id: enrollmentId },
        data: {
          status: 'CANCELLED',
        },
      })
    }

    console.log(`Successfully processed failed payment: ${paymentIntent.id}`)

  } catch (error) {
    console.error('Error handling payment_intent.payment_failed:', error)
    throw error
  }
}

// Handle successful invoice payment (for subscriptions)
async function handleInvoicePaymentSucceeded(invoice: Stripe.Invoice) {
  try {
    console.log(`Invoice payment succeeded: ${invoice.id}`)

    if (!invoice.subscription) {
      console.log('Invoice not associated with subscription, skipping')
      return
    }

    // Find enrollment by subscription ID
    const enrollment = await prisma.enrollment.findFirst({
      where: {
        stripeSubscriptionId: invoice.subscription as string,
      },
    })

    if (!enrollment) {
      console.log(`No enrollment found for subscription: ${invoice.subscription}`)
      return
    }

    // Create payment record for subscription payment
    await prisma.payment.create({
      data: {
        enrollmentId: enrollment.id,
        stripePaymentId: invoice.payment_intent as string || invoice.id,
        amount: invoice.amount_paid,
        currency: invoice.currency,
        status: 'SUCCEEDED',
        paymentType: enrollment.planType,
        description: `Subscription payment - ${invoice.billing_reason}`,
        paidAt: new Date(invoice.status_transitions.paid_at! * 1000),
      },
    })

    // Ensure enrollment is active
    if (enrollment.status !== 'ACTIVE') {
      await prisma.enrollment.update({
        where: { id: enrollment.id },
        data: { status: 'ACTIVE' },
      })
    }

    console.log(`Successfully processed invoice payment: ${invoice.id}`)

  } catch (error) {
    console.error('Error handling invoice.payment_succeeded:', error)
    throw error
  }
}

// Handle failed invoice payment
async function handleInvoicePaymentFailed(invoice: Stripe.Invoice) {
  try {
    console.log(`Invoice payment failed: ${invoice.id}`)

    if (!invoice.subscription) {
      return
    }

    // Find enrollment by subscription ID
    const enrollment = await prisma.enrollment.findFirst({
      where: {
        stripeSubscriptionId: invoice.subscription as string,
      },
    })

    if (!enrollment) {
      console.log(`No enrollment found for subscription: ${invoice.subscription}`)
      return
    }

    // Update enrollment status to paused after failed payment
    await prisma.enrollment.update({
      where: { id: enrollment.id },
      data: { status: 'PAUSED' },
    })

    console.log(`Successfully processed failed invoice payment: ${invoice.id}`)

  } catch (error) {
    console.error('Error handling invoice.payment_failed:', error)
    throw error
  }
}

// Handle subscription creation
async function handleSubscriptionCreated(subscription: Stripe.Subscription) {
  try {
    console.log(`Subscription created: ${subscription.id}`)

    const metadata = subscription.metadata
    const { userId, serviceId, planType, enrollmentId } = metadata

    if (enrollmentId) {
      // Update existing enrollment with subscription ID
      await prisma.enrollment.update({
        where: { id: enrollmentId },
        data: {
          stripeSubscriptionId: subscription.id,
          status: 'ACTIVE',
        },
      })
    }

    console.log(`Successfully processed subscription creation: ${subscription.id}`)

  } catch (error) {
    console.error('Error handling customer.subscription.created:', error)
    throw error
  }
}

// Handle subscription updates
async function handleSubscriptionUpdated(subscription: Stripe.Subscription) {
  try {
    console.log(`Subscription updated: ${subscription.id}`)

    // Find enrollment by subscription ID
    const enrollment = await prisma.enrollment.findFirst({
      where: {
        stripeSubscriptionId: subscription.id,
      },
    })

    if (!enrollment) {
      console.log(`No enrollment found for subscription: ${subscription.id}`)
      return
    }

    // Update enrollment status based on subscription status
    let enrollmentStatus: 'ACTIVE' | 'PAUSED' | 'CANCELLED'
    switch (subscription.status) {
      case 'active':
        enrollmentStatus = 'ACTIVE'
        break
      case 'past_due':
      case 'unpaid':
        enrollmentStatus = 'PAUSED'
        break
      case 'canceled':
      case 'incomplete_expired':
        enrollmentStatus = 'CANCELLED'
        break
      default:
        enrollmentStatus = 'PAUSED'
    }

    await prisma.enrollment.update({
      where: { id: enrollment.id },
      data: { status: enrollmentStatus },
    })

    console.log(`Successfully processed subscription update: ${subscription.id}`)

  } catch (error) {
    console.error('Error handling customer.subscription.updated:', error)
    throw error
  }
}

// Handle subscription deletion
async function handleSubscriptionDeleted(subscription: Stripe.Subscription) {
  try {
    console.log(`Subscription deleted: ${subscription.id}`)

    // Find enrollment by subscription ID
    const enrollment = await prisma.enrollment.findFirst({
      where: {
        stripeSubscriptionId: subscription.id,
      },
    })

    if (!enrollment) {
      console.log(`No enrollment found for subscription: ${subscription.id}`)
      return
    }

    // Update enrollment status to cancelled
    await prisma.enrollment.update({
      where: { id: enrollment.id },
      data: { status: 'CANCELLED' },
    })

    console.log(`Successfully processed subscription deletion: ${subscription.id}`)

  } catch (error) {
    console.error('Error handling customer.subscription.deleted:', error)
    throw error
  }
}

// Handle subscription trial ending soon
async function handleSubscriptionTrialWillEnd(subscription: Stripe.Subscription) {
  try {
    console.log(`Subscription trial will end: ${subscription.id}`)

    // Find enrollment by subscription ID
    const enrollment = await prisma.enrollment.findFirst({
      where: {
        stripeSubscriptionId: subscription.id,
      },
      include: {
        user: {
          select: {
            email: true,
            name: true,
          },
        },
        service: {
          select: {
            name: true,
          },
        },
      },
    })

    if (!enrollment) {
      console.log(`No enrollment found for subscription: ${subscription.id}`)
      return
    }

    // Here you would typically send a notification email
    // For now, we'll just log it
    console.log(`Trial ending for user ${enrollment.user.email} on service ${enrollment.service.name}`)

  } catch (error) {
    console.error('Error handling customer.subscription.trial_will_end:', error)
    throw error
  }
}

// Helper function to get package hours
async function getPackageHours(packageId: string): Promise<number | null> {
  try {
    const advisoryPackage = await prisma.advisoryPackage.findUnique({
      where: { id: packageId },
      select: { hours: true },
    })
    return advisoryPackage?.hours || null
  } catch (error) {
    console.error('Error getting package hours:', error)
    return null
  }
}

// Helper function to create default roadmap
async function createDefaultRoadmap(enrollmentId: string, serviceId: string) {
  try {
    const service = await prisma.service.findUnique({
      where: { id: serviceId },
      select: { name: true },
    })

    await prisma.roadmap.create({
      data: {
        enrollmentId,
        title: `${service?.name || 'Service'} - Learning Path`,
        description: 'Your personalized learning journey',
        milestones: {
          create: [
            {
              title: 'Getting Started',
              description: 'Initial assessment and goal setting',
              order: 1,
              status: 'NOT_STARTED',
              tasks: {
                create: [
                  {
                    title: 'Complete initial assessment',
                    description: 'Evaluate current skills and experience',
                    order: 1,
                    status: 'NOT_STARTED',
                  },
                  {
                    title: 'Define learning goals',
                    description: 'Set specific, measurable objectives',
                    order: 2,
                    status: 'NOT_STARTED',
                  },
                ],
              },
            },
          ],
        },
      },
    })

    console.log(`Created default roadmap for enrollment: ${enrollmentId}`)
  } catch (error) {
    console.error('Error creating default roadmap:', error)
  }
}



