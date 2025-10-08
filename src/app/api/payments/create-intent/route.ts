import { NextRequest, NextResponse } from 'next/server'
import { withAuth, withValidation } from '@/lib/auth-middleware'
import { prisma } from '@/lib/prisma'
import { 
  createMentorshipPaymentIntent, 
  createAdvisoryPaymentIntent,
  StripeCustomerService,
  StripeErrorHandler 
} from '@/lib/stripe'
import { z } from 'zod'

// Validation schema for payment intent creation
const createPaymentIntentSchema = z.object({
  serviceId: z.string().min(1, 'Service ID is required'),
  planType: z.enum(['SINGLE_SESSION', 'MONTHLY_PLAN', 'CONSULTATION', 'PACKAGE', 'RETAINER']),
  advisoryPackageId: z.string().optional(),
})

export async function POST(request: NextRequest) {
  return withValidation(createPaymentIntentSchema, request, async (req, validatedData) => {
    try {
      const userId = req.user!.id

      // Get service details
      const service = await prisma.service.findUnique({
        where: { id: validatedData.serviceId },
        include: {
          advisoryService: {
            include: {
              packages: true,
            },
          },
        },
      })

      if (!service) {
        return NextResponse.json(
          {
            success: false,
            error: {
              code: 'SERVICE_NOT_FOUND',
              message: 'Service not found',
            },
          },
          { status: 404 }
        )
      }

      // Get or create Stripe customer
      let user = await prisma.user.findUnique({
        where: { id: userId },
        select: {
          id: true,
          email: true,
          name: true,
          stripeCustomerId: true,
        },
      })

      if (!user) {
        return NextResponse.json(
          {
            success: false,
            error: {
              code: 'USER_NOT_FOUND',
              message: 'User not found',
            },
          },
          { status: 404 }
        )
      }

      let stripeCustomerId = user.stripeCustomerId

      // Create Stripe customer if doesn't exist
      if (!stripeCustomerId) {
        const stripeCustomer = await StripeCustomerService.createCustomer({
          email: user.email,
          name: user.name || undefined,
          userId: user.id,
        })

        stripeCustomerId = stripeCustomer.id

        // Update user with Stripe customer ID
        await prisma.user.update({
          where: { id: userId },
          data: { stripeCustomerId },
        })
      }

      // Calculate amount based on service type and plan
      let amount: number
      let description: string

      if (service.type === 'MENTORSHIP') {
        switch (validatedData.planType) {
          case 'SINGLE_SESSION':
            if (!service.singleSessionPrice) {
              return NextResponse.json(
                {
                  success: false,
                  error: {
                    code: 'PRICE_NOT_AVAILABLE',
                    message: 'Single session price not available for this service',
                  },
                },
                { status: 400 }
              )
            }
            amount = service.singleSessionPrice
            description = `Single session - ${service.name}`
            break

          case 'MONTHLY_PLAN':
            if (!service.monthlyPlanPrice) {
              return NextResponse.json(
                {
                  success: false,
                  error: {
                    code: 'PRICE_NOT_AVAILABLE',
                    message: 'Monthly plan price not available for this service',
                  },
                },
                { status: 400 }
              )
            }
            amount = service.monthlyPlanPrice
            description = `Monthly plan - ${service.name}`
            break

          default:
            return NextResponse.json(
              {
                success: false,
                error: {
                  code: 'INVALID_PLAN_TYPE',
                  message: 'Invalid plan type for mentorship service',
                },
              },
              { status: 400 }
            )
        }

        // Create payment intent for mentorship
        const paymentIntent = await createMentorshipPaymentIntent({
          userId,
          serviceId: service.id,
          planType: validatedData.planType as 'SINGLE_SESSION' | 'MONTHLY_PLAN',
          amount,
          customerId: stripeCustomerId,
          description,
        })

        return NextResponse.json({
          success: true,
          data: {
            clientSecret: paymentIntent.client_secret,
            paymentIntentId: paymentIntent.id,
            amount,
            currency: paymentIntent.currency,
            description,
          },
        })

      } else if (service.type === 'ADVISORY') {
        switch (validatedData.planType) {
          case 'CONSULTATION':
            if (!service.hourlyRate) {
              return NextResponse.json(
                {
                  success: false,
                  error: {
                    code: 'PRICE_NOT_AVAILABLE',
                    message: 'Hourly rate not available for this service',
                  },
                },
                { status: 400 }
              )
            }
            // Default to 1 hour consultation
            amount = service.hourlyRate
            description = `1-hour consultation - ${service.name}`
            break

          case 'PACKAGE':
            if (!validatedData.advisoryPackageId) {
              return NextResponse.json(
                {
                  success: false,
                  error: {
                    code: 'PACKAGE_ID_REQUIRED',
                    message: 'Advisory package ID is required for package purchases',
                  },
                },
                { status: 400 }
              )
            }

            const advisoryPackage = service.advisoryService?.packages.find(
              pkg => pkg.id === validatedData.advisoryPackageId
            )

            if (!advisoryPackage) {
              return NextResponse.json(
                {
                  success: false,
                  error: {
                    code: 'PACKAGE_NOT_FOUND',
                    message: 'Advisory package not found',
                  },
                },
                { status: 404 }
              )
            }

            amount = advisoryPackage.price
            description = `${advisoryPackage.name} - ${service.name}`
            break

          case 'RETAINER':
            // For retainer, we'll use a default monthly amount
            // In a real implementation, this would be configurable per service
            amount = service.hourlyRate ? service.hourlyRate * 4 : 100000 // 4 hours worth or $1000 default
            description = `Monthly retainer - ${service.name}`
            break

          default:
            return NextResponse.json(
              {
                success: false,
                error: {
                  code: 'INVALID_PLAN_TYPE',
                  message: 'Invalid plan type for advisory service',
                },
              },
              { status: 400 }
            )
        }

        // Create payment intent for advisory
        const paymentIntent = await createAdvisoryPaymentIntent({
          userId,
          serviceId: service.id,
          planType: validatedData.planType as 'CONSULTATION' | 'PACKAGE' | 'RETAINER',
          amount,
          advisoryPackageId: validatedData.advisoryPackageId,
          customerId: stripeCustomerId,
          description,
        })

        return NextResponse.json({
          success: true,
          data: {
            clientSecret: paymentIntent.client_secret,
            paymentIntentId: paymentIntent.id,
            amount,
            currency: paymentIntent.currency,
            description,
            ...(validatedData.advisoryPackageId && {
              advisoryPackage: {
                id: validatedData.advisoryPackageId,
                name: service.advisoryService?.packages.find(
                  pkg => pkg.id === validatedData.advisoryPackageId
                )?.name,
              },
            }),
          },
        })
      }

      return NextResponse.json(
        {
          success: false,
          error: {
            code: 'INVALID_SERVICE_TYPE',
            message: 'Invalid service type',
          },
        },
        { status: 400 }
      )

    } catch (error) {
      console.error('Create payment intent error:', error)

      // Handle Stripe-specific errors
      const stripeError = StripeErrorHandler.handleError(error)
      
      return NextResponse.json(
        {
          success: false,
          error: {
            code: stripeError.code,
            message: stripeError.message,
          },
        },
        { status: 500 }
      )
    }
  })
}



