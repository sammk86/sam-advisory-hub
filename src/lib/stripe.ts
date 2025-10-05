import Stripe from 'stripe'

if (!process.env.STRIPE_SECRET_KEY) {
  throw new Error('STRIPE_SECRET_KEY is not set in environment variables')
}

// Initialize Stripe with secret key
export const stripe = new Stripe(process.env.STRIPE_SECRET_KEY, {
  apiVersion: '2024-06-20',
  typescript: true,
})

// Stripe configuration constants
export const STRIPE_CONFIG = {
  publishableKey: process.env.STRIPE_PUBLISHABLE_KEY || '',
  webhookSecret: process.env.STRIPE_WEBHOOK_SECRET || '',
  currency: 'usd',
  country: 'US',
} as const

// Payment amount helpers (convert dollars to cents)
export const toCents = (dollars: number): number => Math.round(dollars * 100)
export const toDollars = (cents: number): number => cents / 100

// Stripe customer utilities
export class StripeCustomerService {
  static async createCustomer(params: {
    email: string
    name?: string
    userId: string
  }): Promise<Stripe.Customer> {
    return stripe.customers.create({
      email: params.email,
      name: params.name,
      metadata: {
        userId: params.userId,
      },
    })
  }

  static async getCustomer(customerId: string): Promise<Stripe.Customer> {
    const customer = await stripe.customers.retrieve(customerId)
    if (customer.deleted) {
      throw new Error('Customer has been deleted')
    }
    return customer as Stripe.Customer
  }

  static async updateCustomer(
    customerId: string,
    params: {
      email?: string
      name?: string
    }
  ): Promise<Stripe.Customer> {
    return stripe.customers.update(customerId, params)
  }

  static async deleteCustomer(customerId: string): Promise<Stripe.DeletedCustomer> {
    return stripe.customers.del(customerId)
  }
}

// Payment Intent utilities
export class StripePaymentService {
  static async createPaymentIntent(params: {
    amount: number
    currency?: string
    customerId?: string
    metadata?: Record<string, string>
    description?: string
  }): Promise<Stripe.PaymentIntent> {
    return stripe.paymentIntents.create({
      amount: params.amount,
      currency: params.currency || STRIPE_CONFIG.currency,
      customer: params.customerId,
      metadata: params.metadata || {},
      description: params.description,
      automatic_payment_methods: {
        enabled: true,
      },
    })
  }

  static async getPaymentIntent(paymentIntentId: string): Promise<Stripe.PaymentIntent> {
    return stripe.paymentIntents.retrieve(paymentIntentId)
  }

  static async confirmPaymentIntent(
    paymentIntentId: string,
    params?: {
      payment_method?: string
      return_url?: string
    }
  ): Promise<Stripe.PaymentIntent> {
    return stripe.paymentIntents.confirm(paymentIntentId, params)
  }

  static async cancelPaymentIntent(paymentIntentId: string): Promise<Stripe.PaymentIntent> {
    return stripe.paymentIntents.cancel(paymentIntentId)
  }
}

// Subscription utilities
export class StripeSubscriptionService {
  static async createSubscription(params: {
    customerId: string
    priceId: string
    metadata?: Record<string, string>
    trialPeriodDays?: number
  }): Promise<Stripe.Subscription> {
    return stripe.subscriptions.create({
      customer: params.customerId,
      items: [{ price: params.priceId }],
      metadata: params.metadata || {},
      trial_period_days: params.trialPeriodDays,
      expand: ['latest_invoice.payment_intent'],
    })
  }

  static async getSubscription(subscriptionId: string): Promise<Stripe.Subscription> {
    return stripe.subscriptions.retrieve(subscriptionId, {
      expand: ['latest_invoice.payment_intent'],
    })
  }

  static async updateSubscription(
    subscriptionId: string,
    params: {
      priceId?: string
      metadata?: Record<string, string>
      proration_behavior?: 'create_prorations' | 'none' | 'always_invoice'
    }
  ): Promise<Stripe.Subscription> {
    const updateData: Stripe.SubscriptionUpdateParams = {
      metadata: params.metadata,
      proration_behavior: params.proration_behavior || 'create_prorations',
    }

    if (params.priceId) {
      // Get current subscription to update items
      const subscription = await stripe.subscriptions.retrieve(subscriptionId)
      updateData.items = [
        {
          id: subscription.items.data[0].id,
          price: params.priceId,
        },
      ]
    }

    return stripe.subscriptions.update(subscriptionId, updateData)
  }

  static async cancelSubscription(
    subscriptionId: string,
    params?: {
      at_period_end?: boolean
      prorate?: boolean
    }
  ): Promise<Stripe.Subscription> {
    return stripe.subscriptions.cancel(subscriptionId, {
      prorate: params?.prorate ?? true,
    })
  }

  static async pauseSubscription(subscriptionId: string): Promise<Stripe.Subscription> {
    return stripe.subscriptions.update(subscriptionId, {
      pause_collection: {
        behavior: 'keep_as_draft',
      },
    })
  }

  static async resumeSubscription(subscriptionId: string): Promise<Stripe.Subscription> {
    return stripe.subscriptions.update(subscriptionId, {
      pause_collection: null,
    })
  }
}

// Product and Price utilities
export class StripeProductService {
  static async createProduct(params: {
    name: string
    description?: string
    metadata?: Record<string, string>
  }): Promise<Stripe.Product> {
    return stripe.products.create({
      name: params.name,
      description: params.description,
      metadata: params.metadata || {},
    })
  }

  static async createPrice(params: {
    productId: string
    unitAmount: number
    currency?: string
    recurring?: {
      interval: 'month' | 'year'
      interval_count?: number
    }
    metadata?: Record<string, string>
  }): Promise<Stripe.Price> {
    return stripe.prices.create({
      product: params.productId,
      unit_amount: params.unitAmount,
      currency: params.currency || STRIPE_CONFIG.currency,
      recurring: params.recurring,
      metadata: params.metadata || {},
    })
  }

  static async getProduct(productId: string): Promise<Stripe.Product> {
    return stripe.products.retrieve(productId)
  }

  static async getPrice(priceId: string): Promise<Stripe.Price> {
    return stripe.prices.retrieve(priceId)
  }

  static async listPrices(params?: {
    product?: string
    active?: boolean
    limit?: number
  }): Promise<Stripe.ApiList<Stripe.Price>> {
    return stripe.prices.list({
      product: params?.product,
      active: params?.active,
      limit: params?.limit || 10,
    })
  }
}

// Webhook utilities
export class StripeWebhookService {
  static constructEvent(
    payload: string | Buffer,
    signature: string,
    secret?: string
  ): Stripe.Event {
    const webhookSecret = secret || STRIPE_CONFIG.webhookSecret
    if (!webhookSecret) {
      throw new Error('Webhook secret is not configured')
    }

    return stripe.webhooks.constructEvent(payload, signature, webhookSecret)
  }

  static isRelevantEvent(event: Stripe.Event): boolean {
    const relevantEvents = [
      'payment_intent.succeeded',
      'payment_intent.payment_failed',
      'invoice.payment_succeeded',
      'invoice.payment_failed',
      'customer.subscription.created',
      'customer.subscription.updated',
      'customer.subscription.deleted',
      'customer.subscription.trial_will_end',
    ]

    return relevantEvents.includes(event.type)
  }
}

// Error handling utilities
export class StripeErrorHandler {
  static handleError(error: any): {
    code: string
    message: string
    type: string
  } {
    if (error.type) {
      // This is a Stripe error
      switch (error.type) {
        case 'StripeCardError':
          return {
            code: 'CARD_DECLINED',
            message: error.message || 'Your card was declined.',
            type: 'card_error',
          }
        case 'StripeRateLimitError':
          return {
            code: 'RATE_LIMIT_EXCEEDED',
            message: 'Too many requests made to the API too quickly.',
            type: 'rate_limit_error',
          }
        case 'StripeInvalidRequestError':
          return {
            code: 'INVALID_REQUEST',
            message: error.message || 'Invalid parameters were supplied to Stripe.',
            type: 'invalid_request_error',
          }
        case 'StripeAPIError':
          return {
            code: 'API_ERROR',
            message: 'An error occurred with our API.',
            type: 'api_error',
          }
        case 'StripeConnectionError':
          return {
            code: 'CONNECTION_ERROR',
            message: 'A network error occurred.',
            type: 'connection_error',
          }
        case 'StripeAuthenticationError':
          return {
            code: 'AUTHENTICATION_ERROR',
            message: 'Authentication with Stripe failed.',
            type: 'authentication_error',
          }
        default:
          return {
            code: 'STRIPE_ERROR',
            message: error.message || 'An unknown Stripe error occurred.',
            type: 'stripe_error',
          }
      }
    }

    // Generic error
    return {
      code: 'UNKNOWN_ERROR',
      message: error.message || 'An unknown error occurred.',
      type: 'unknown_error',
    }
  }
}

// Type definitions for our application
export interface PaymentIntentMetadata {
  userId: string
  serviceId: string
  planType: 'SINGLE_SESSION' | 'MONTHLY_PLAN' | 'CONSULTATION' | 'PACKAGE' | 'RETAINER'
  advisoryPackageId?: string
  enrollmentId?: string
}

export interface SubscriptionMetadata {
  userId: string
  serviceId: string
  planType: 'MONTHLY_PLAN' | 'RETAINER'
  enrollmentId: string
}

// Utility functions for our specific use cases
export const createMentorshipPaymentIntent = async (params: {
  userId: string
  serviceId: string
  planType: 'SINGLE_SESSION' | 'MONTHLY_PLAN'
  amount: number
  customerId?: string
  description?: string
}): Promise<Stripe.PaymentIntent> => {
  return StripePaymentService.createPaymentIntent({
    amount: params.amount,
    customerId: params.customerId,
    description: params.description,
    metadata: {
      userId: params.userId,
      serviceId: params.serviceId,
      planType: params.planType,
    },
  })
}

export const createAdvisoryPaymentIntent = async (params: {
  userId: string
  serviceId: string
  planType: 'CONSULTATION' | 'PACKAGE' | 'RETAINER'
  amount: number
  advisoryPackageId?: string
  customerId?: string
  description?: string
}): Promise<Stripe.PaymentIntent> => {
  return StripePaymentService.createPaymentIntent({
    amount: params.amount,
    customerId: params.customerId,
    description: params.description,
    metadata: {
      userId: params.userId,
      serviceId: params.serviceId,
      planType: params.planType,
      ...(params.advisoryPackageId && { advisoryPackageId: params.advisoryPackageId }),
    },
  })
}


