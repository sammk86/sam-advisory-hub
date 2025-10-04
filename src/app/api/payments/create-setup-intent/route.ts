import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { StripeService } from '@/lib/stripe'

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { service, plan, amount } = await request.json()

    if (!service || !plan || !amount) {
      return NextResponse.json(
        { error: 'Missing required fields: service, plan, amount' },
        { status: 400 }
      )
    }

    const stripeService = new StripeService()
    
    // Create or get Stripe customer
    let customer = await stripeService.getCustomerByEmail(session.user.email!)
    if (!customer) {
      customer = await stripeService.createCustomer({
        email: session.user.email!,
        name: session.user.name!,
        metadata: {
          userId: session.user.id,
        },
      })
    }

    // Create setup intent for future payments
    const setupIntent = await stripeService.createSetupIntent({
      customer: customer.id,
      payment_method_types: ['card'],
      usage: 'off_session',
      metadata: {
        userId: session.user.id,
        service,
        plan,
        amount: amount.toString(),
      },
    })

    return NextResponse.json({
      clientSecret: setupIntent.client_secret,
      customerId: customer.id,
    })
  } catch (error) {
    console.error('Setup intent creation error:', error)
    return NextResponse.json(
      { error: 'Failed to create setup intent' },
      { status: 500 }
    )
  }
}

