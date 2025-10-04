import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { StripeService } from '@/lib/stripe'
import { z } from 'zod'

const createEnrollmentSchema = z.object({
  serviceType: z.enum(['MENTORSHIP', 'ADVISORY']),
  planType: z.enum(['STARTER', 'PRO', 'PACKAGE-3', 'PACKAGE-6', 'HOURLY']),
  goals: z.string().min(1),
  experience: z.string().min(1),
  industry: z.string().min(1),
  timeCommitment: z.string().min(1),
  preferredSchedule: z.string().min(1),
  paymentMethodId: z.string().min(1),
  billingAddress: z.object({
    name: z.string().min(1),
    email: z.string().email(),
    address: z.string().min(1),
    city: z.string().min(1),
    state: z.string().min(1),
    zipCode: z.string().min(1),
    country: z.string().min(1),
  }),
})

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const body = await request.json()
    const validatedData = createEnrollmentSchema.parse(body)

    const stripeService = new StripeService()

    // Get pricing information
    const pricingMap = {
      MENTORSHIP: {
        STARTER: { amount: 19900, interval: 'month' }, // $199
        PRO: { amount: 29900, interval: 'month' }, // $299
        'PACKAGE-3': { amount: 25400, interval: 'month' }, // $254
        'PACKAGE-6': { amount: 23900, interval: 'month' }, // $239
      },
      ADVISORY: {
        HOURLY: { amount: 15000, interval: null }, // $150/hour - no subscription
      },
    }

    const pricing = pricingMap[validatedData.serviceType]?.[validatedData.planType]
    if (!pricing) {
      return NextResponse.json({ error: 'Invalid service or plan type' }, { status: 400 })
    }

    // Get or create Stripe customer
    let customer = await stripeService.getCustomerByEmail(session.user.email!)
    if (!customer) {
      customer = await stripeService.createCustomer({
        email: session.user.email!,
        name: session.user.name!,
        metadata: {
          userId: session.user.id,
        },
      })

      // Update user with Stripe customer ID
      await prisma.user.update({
        where: { id: session.user.id },
        data: { stripeCustomerId: customer.id },
      })
    }

    // Attach payment method to customer
    await stripeService.attachPaymentMethodToCustomer(
      validatedData.paymentMethodId,
      customer.id
    )

    let subscription = null
    let paymentRecord = null

    // Create subscription for recurring plans
    if (pricing.interval) {
      subscription = await stripeService.createSubscription({
        customer: customer.id,
        paymentMethod: validatedData.paymentMethodId,
        priceData: {
          currency: 'usd',
          product_data: {
            name: `${validatedData.serviceType} - ${validatedData.planType}`,
          },
          unit_amount: pricing.amount,
          recurring: {
            interval: pricing.interval as 'month',
          },
        },
        metadata: {
          userId: session.user.id,
          serviceType: validatedData.serviceType,
          planType: validatedData.planType,
        },
      })

      // Create payment record
      paymentRecord = await prisma.payment.create({
        data: {
          userId: session.user.id,
          stripePaymentId: subscription.latest_invoice as string,
          amount: pricing.amount,
          currency: 'USD',
          status: 'COMPLETED',
          paymentType: 'SUBSCRIPTION',
        },
      })
    }

    // Create enrollment
    const enrollment = await prisma.enrollment.create({
      data: {
        userId: session.user.id,
        serviceId: null, // Will be assigned when matched with mentor/advisor
        planType: validatedData.planType as any,
        status: 'ACTIVE',
        goals: validatedData.goals,
        experience: validatedData.experience,
        industry: validatedData.industry,
        timeCommitment: validatedData.timeCommitment,
        preferredSchedule: validatedData.preferredSchedule,
        stripeSubscriptionId: subscription?.id,
        paymentId: paymentRecord?.id,
      },
    })

    // Create service record based on type
    let service
    if (validatedData.serviceType === 'MENTORSHIP') {
      service = await prisma.mentorshipProgram.create({
        data: {
          title: `${validatedData.planType} Mentorship Program`,
          description: `Personalized mentorship program for ${validatedData.industry} professional`,
          duration: validatedData.planType.includes('PACKAGE') ? 
            (validatedData.planType === 'PACKAGE-3' ? 3 : 6) : null,
          sessionsPerMonth: validatedData.planType === 'STARTER' ? 2 : 4,
          price: pricing.amount / 100,
          currency: 'USD',
          status: 'PUBLISHED',
          mentorId: null, // Will be assigned during matching
        },
      })
    } else {
      service = await prisma.advisoryService.create({
        data: {
          title: 'Advisory Consultation',
          description: `Strategic advisory services for ${validatedData.industry} challenges`,
          hourlyRate: pricing.amount / 100,
          currency: 'USD',
          status: 'PUBLISHED',
          advisorId: null, // Will be assigned during matching
        },
      })
    }

    // Update enrollment with service ID
    await prisma.enrollment.update({
      where: { id: enrollment.id },
      data: { serviceId: service.id },
    })

    return NextResponse.json({
      enrollment: {
        id: enrollment.id,
        serviceType: validatedData.serviceType,
        planType: validatedData.planType,
        status: enrollment.status,
      },
      subscription: subscription ? {
        id: subscription.id,
        status: subscription.status,
      } : null,
      service: {
        id: service.id,
        type: validatedData.serviceType,
      },
    })
  } catch (error) {
    console.error('Enrollment creation error:', error)
    
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'Invalid request data', details: error.errors },
        { status: 400 }
      )
    }

    return NextResponse.json(
      { error: 'Failed to create enrollment' },
      { status: 500 }
    )
  }
}
