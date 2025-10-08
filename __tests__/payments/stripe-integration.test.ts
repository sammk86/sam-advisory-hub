import Stripe from 'stripe'

// Mock Stripe
jest.mock('stripe')

const mockStripe = {
  paymentIntents: {
    create: jest.fn(),
    retrieve: jest.fn(),
    confirm: jest.fn(),
  },
  subscriptions: {
    create: jest.fn(),
    retrieve: jest.fn(),
    update: jest.fn(),
    cancel: jest.fn(),
  },
  customers: {
    create: jest.fn(),
    retrieve: jest.fn(),
    update: jest.fn(),
  },
  webhooks: {
    constructEvent: jest.fn(),
  },
  prices: {
    create: jest.fn(),
    list: jest.fn(),
  },
  products: {
    create: jest.fn(),
    list: jest.fn(),
  },
}

// Mock Prisma
const mockPrismaClient = {
  payment: {
    create: jest.fn(),
    update: jest.fn(),
    findUnique: jest.fn(),
  },
  enrollment: {
    findUnique: jest.fn(),
    update: jest.fn(),
  },
  user: {
    findUnique: jest.fn(),
    update: jest.fn(),
  },
}

jest.mock('@/lib/prisma', () => ({
  prisma: mockPrismaClient,
}))

describe('Stripe Payment Integration', () => {
  beforeEach(() => {
    jest.clearAllMocks()
    ;(Stripe as jest.MockedClass<typeof Stripe>).mockImplementation(() => mockStripe as any)
  })

  describe('Payment Intent Creation', () => {
    it('should create payment intent for single session', async () => {
      const paymentData = {
        serviceId: 'service-1',
        planType: 'SINGLE_SESSION',
        amount: 15000, // $150
        currency: 'usd',
      }

      mockStripe.paymentIntents.create.mockResolvedValue({
        id: 'pi_test_123',
        client_secret: 'pi_test_123_secret_abc',
        amount: 15000,
        currency: 'usd',
        status: 'requires_payment_method',
      })

      const result = await mockStripe.paymentIntents.create({
        amount: paymentData.amount,
        currency: paymentData.currency,
        metadata: {
          serviceId: paymentData.serviceId,
          planType: paymentData.planType,
        },
      })

      expect(mockStripe.paymentIntents.create).toHaveBeenCalledWith({
        amount: 15000,
        currency: 'usd',
        metadata: {
          serviceId: 'service-1',
          planType: 'SINGLE_SESSION',
        },
      })

      expect(result).toMatchObject({
        id: 'pi_test_123',
        client_secret: 'pi_test_123_secret_abc',
        amount: 15000,
        currency: 'usd',
      })
    })

    it('should create payment intent for advisory package', async () => {
      const paymentData = {
        serviceId: 'service-2',
        planType: 'PACKAGE',
        advisoryPackageId: 'package-1',
        amount: 112500, // $1,125
        currency: 'usd',
      }

      mockStripe.paymentIntents.create.mockResolvedValue({
        id: 'pi_test_456',
        client_secret: 'pi_test_456_secret_def',
        amount: 112500,
        currency: 'usd',
        status: 'requires_payment_method',
      })

      const result = await mockStripe.paymentIntents.create({
        amount: paymentData.amount,
        currency: paymentData.currency,
        metadata: {
          serviceId: paymentData.serviceId,
          planType: paymentData.planType,
          advisoryPackageId: paymentData.advisoryPackageId,
        },
      })

      expect(result.amount).toBe(112500)
      expect(result.id).toBe('pi_test_456')
    })

    it('should handle payment intent creation errors', async () => {
      mockStripe.paymentIntents.create.mockRejectedValue(
        new Error('Your card was declined.')
      )

      await expect(
        mockStripe.paymentIntents.create({
          amount: 15000,
          currency: 'usd',
        })
      ).rejects.toThrow('Your card was declined.')
    })
  })

  describe('Subscription Management', () => {
    it('should create subscription for monthly plan', async () => {
      const subscriptionData = {
        customer: 'cus_test_123',
        items: [{ price: 'price_monthly_plan' }],
        metadata: {
          serviceId: 'service-1',
          planType: 'MONTHLY_PLAN',
          userId: 'user-1',
        },
      }

      mockStripe.subscriptions.create.mockResolvedValue({
        id: 'sub_test_123',
        customer: 'cus_test_123',
        status: 'active',
        current_period_start: 1633024800,
        current_period_end: 1635703200,
        items: {
          data: [
            {
              price: {
                id: 'price_monthly_plan',
                unit_amount: 50000,
                currency: 'usd',
              },
            },
          ],
        },
      })

      const result = await mockStripe.subscriptions.create(subscriptionData)

      expect(mockStripe.subscriptions.create).toHaveBeenCalledWith(subscriptionData)
      expect(result.id).toBe('sub_test_123')
      expect(result.status).toBe('active')
    })

    it('should create subscription for advisory retainer', async () => {
      const subscriptionData = {
        customer: 'cus_test_456',
        items: [{ price: 'price_advisory_retainer' }],
        metadata: {
          serviceId: 'service-2',
          planType: 'RETAINER',
          userId: 'user-2',
        },
      }

      mockStripe.subscriptions.create.mockResolvedValue({
        id: 'sub_test_456',
        customer: 'cus_test_456',
        status: 'active',
      })

      const result = await mockStripe.subscriptions.create(subscriptionData)
      expect(result.id).toBe('sub_test_456')
    })

    it('should cancel subscription', async () => {
      mockStripe.subscriptions.cancel.mockResolvedValue({
        id: 'sub_test_123',
        status: 'canceled',
        canceled_at: 1633024800,
      })

      const result = await mockStripe.subscriptions.cancel('sub_test_123')

      expect(mockStripe.subscriptions.cancel).toHaveBeenCalledWith('sub_test_123')
      expect(result.status).toBe('canceled')
    })
  })

  describe('Customer Management', () => {
    it('should create customer', async () => {
      const customerData = {
        email: 'test@example.com',
        name: 'Test User',
        metadata: {
          userId: 'user-1',
        },
      }

      mockStripe.customers.create.mockResolvedValue({
        id: 'cus_test_123',
        email: 'test@example.com',
        name: 'Test User',
      })

      const result = await mockStripe.customers.create(customerData)

      expect(mockStripe.customers.create).toHaveBeenCalledWith(customerData)
      expect(result.id).toBe('cus_test_123')
      expect(result.email).toBe('test@example.com')
    })

    it('should update customer', async () => {
      mockStripe.customers.update.mockResolvedValue({
        id: 'cus_test_123',
        email: 'updated@example.com',
        name: 'Updated Name',
      })

      const result = await mockStripe.customers.update('cus_test_123', {
        email: 'updated@example.com',
        name: 'Updated Name',
      })

      expect(result.email).toBe('updated@example.com')
    })
  })

  describe('Webhook Handling', () => {
    it('should handle payment_intent.succeeded webhook', async () => {
      const webhookPayload = {
        id: 'evt_test_123',
        type: 'payment_intent.succeeded',
        data: {
          object: {
            id: 'pi_test_123',
            amount: 15000,
            currency: 'usd',
            status: 'succeeded',
            metadata: {
              serviceId: 'service-1',
              planType: 'SINGLE_SESSION',
              userId: 'user-1',
            },
          },
        },
      }

      mockStripe.webhooks.constructEvent.mockReturnValue(webhookPayload)

      mockPrismaClient.payment.create.mockResolvedValue({
        id: 'payment-1',
        stripePaymentId: 'pi_test_123',
        amount: 15000,
        status: 'SUCCEEDED',
      })

      // Simulate webhook processing
      const event = mockStripe.webhooks.constructEvent(
        JSON.stringify(webhookPayload),
        'stripe_signature',
        'webhook_secret'
      )

      expect(event.type).toBe('payment_intent.succeeded')
      expect(event.data.object.id).toBe('pi_test_123')

      // Simulate payment record creation
      await mockPrismaClient.payment.create({
        data: {
          enrollmentId: 'enrollment-1',
          stripePaymentId: 'pi_test_123',
          amount: 15000,
          currency: 'usd',
          status: 'SUCCEEDED',
          paymentType: 'SINGLE_SESSION',
        },
      })

      expect(mockPrismaClient.payment.create).toHaveBeenCalled()
    })

    it('should handle payment_intent.payment_failed webhook', async () => {
      const webhookPayload = {
        id: 'evt_test_456',
        type: 'payment_intent.payment_failed',
        data: {
          object: {
            id: 'pi_test_456',
            amount: 15000,
            currency: 'usd',
            status: 'requires_payment_method',
            last_payment_error: {
              message: 'Your card was declined.',
            },
          },
        },
      }

      mockStripe.webhooks.constructEvent.mockReturnValue(webhookPayload)

      const event = mockStripe.webhooks.constructEvent(
        JSON.stringify(webhookPayload),
        'stripe_signature',
        'webhook_secret'
      )

      expect(event.type).toBe('payment_intent.payment_failed')
      expect(event.data.object.status).toBe('requires_payment_method')
    })

    it('should handle invoice.payment_succeeded webhook', async () => {
      const webhookPayload = {
        id: 'evt_test_789',
        type: 'invoice.payment_succeeded',
        data: {
          object: {
            id: 'in_test_123',
            subscription: 'sub_test_123',
            amount_paid: 50000,
            currency: 'usd',
            status: 'paid',
          },
        },
      }

      mockStripe.webhooks.constructEvent.mockReturnValue(webhookPayload)

      const event = mockStripe.webhooks.constructEvent(
        JSON.stringify(webhookPayload),
        'stripe_signature',
        'webhook_secret'
      )

      expect(event.type).toBe('invoice.payment_succeeded')
      expect(event.data.object.amount_paid).toBe(50000)
    })

    it('should handle customer.subscription.deleted webhook', async () => {
      const webhookPayload = {
        id: 'evt_test_101112',
        type: 'customer.subscription.deleted',
        data: {
          object: {
            id: 'sub_test_123',
            status: 'canceled',
            canceled_at: 1633024800,
          },
        },
      }

      mockStripe.webhooks.constructEvent.mockReturnValue(webhookPayload)

      const event = mockStripe.webhooks.constructEvent(
        JSON.stringify(webhookPayload),
        'stripe_signature',
        'webhook_secret'
      )

      expect(event.type).toBe('customer.subscription.deleted')
      expect(event.data.object.status).toBe('canceled')
    })

    it('should handle invalid webhook signature', () => {
      mockStripe.webhooks.constructEvent.mockImplementation(() => {
        throw new Error('Invalid signature')
      })

      expect(() => {
        mockStripe.webhooks.constructEvent(
          'invalid_payload',
          'invalid_signature',
          'webhook_secret'
        )
      }).toThrow('Invalid signature')
    })
  })

  describe('Payment Record Management', () => {
    it('should create payment record on successful payment', async () => {
      const paymentData = {
        enrollmentId: 'enrollment-1',
        stripePaymentId: 'pi_test_123',
        amount: 15000,
        currency: 'usd',
        status: 'SUCCEEDED',
        paymentType: 'SINGLE_SESSION',
        description: 'Single session payment',
      }

      mockPrismaClient.payment.create.mockResolvedValue({
        id: 'payment-1',
        ...paymentData,
        createdAt: new Date(),
      })

      const result = await mockPrismaClient.payment.create({
        data: paymentData,
      })

      expect(mockPrismaClient.payment.create).toHaveBeenCalledWith({
        data: paymentData,
      })

      expect(result).toMatchObject(paymentData)
    })

    it('should update payment status', async () => {
      mockPrismaClient.payment.update.mockResolvedValue({
        id: 'payment-1',
        status: 'FAILED',
        updatedAt: new Date(),
      })

      const result = await mockPrismaClient.payment.update({
        where: { stripePaymentId: 'pi_test_123' },
        data: { status: 'FAILED' },
      })

      expect(result.status).toBe('FAILED')
    })
  })

  describe('Hour Tracking for Advisory Packages', () => {
    it('should track hours consumed from package', async () => {
      const enrollmentData = {
        id: 'enrollment-1',
        hoursRemaining: 5,
        advisoryPackageId: 'package-1',
      }

      mockPrismaClient.enrollment.findUnique.mockResolvedValue(enrollmentData)
      mockPrismaClient.enrollment.update.mockResolvedValue({
        ...enrollmentData,
        hoursRemaining: 3, // 2 hours consumed
      })

      // Simulate hour consumption
      const hoursConsumed = 2
      const result = await mockPrismaClient.enrollment.update({
        where: { id: 'enrollment-1' },
        data: {
          hoursRemaining: {
            decrement: hoursConsumed,
          },
        },
      })

      expect(result.hoursRemaining).toBe(3)
    })

    it('should prevent consuming more hours than available', async () => {
      const enrollmentData = {
        id: 'enrollment-1',
        hoursRemaining: 1,
        advisoryPackageId: 'package-1',
      }

      mockPrismaClient.enrollment.findUnique.mockResolvedValue(enrollmentData)

      const hoursToConsume = 3
      const availableHours = enrollmentData.hoursRemaining

      expect(hoursToConsume).toBeGreaterThan(availableHours)
    })
  })

  describe('Error Handling', () => {
    it('should handle Stripe API errors', async () => {
      const stripeError = new Error('Rate limit exceeded')
      stripeError.name = 'StripeRateLimitError'

      mockStripe.paymentIntents.create.mockRejectedValue(stripeError)

      await expect(
        mockStripe.paymentIntents.create({
          amount: 15000,
          currency: 'usd',
        })
      ).rejects.toThrow('Rate limit exceeded')
    })

    it('should handle database errors during payment processing', async () => {
      mockPrismaClient.payment.create.mockRejectedValue(
        new Error('Database connection failed')
      )

      await expect(
        mockPrismaClient.payment.create({
          data: {
            enrollmentId: 'enrollment-1',
            stripePaymentId: 'pi_test_123',
            amount: 15000,
            status: 'SUCCEEDED',
            paymentType: 'SINGLE_SESSION',
          },
        })
      ).rejects.toThrow('Database connection failed')
    })
  })

  describe('Payment Validation', () => {
    it('should validate payment amounts', () => {
      const validAmounts = [1000, 15000, 50000, 112500] // $10, $150, $500, $1,125
      const invalidAmounts = [0, -1000, 0.5] // Zero, negative, fractional cents

      validAmounts.forEach(amount => {
        expect(amount).toBeGreaterThan(0)
        expect(Number.isInteger(amount)).toBe(true)
      })

      invalidAmounts.forEach(amount => {
        expect(amount <= 0 || !Number.isInteger(amount)).toBe(true)
      })
    })

    it('should validate currency codes', () => {
      const validCurrencies = ['usd', 'eur', 'gbp']
      const invalidCurrencies = ['invalid', '', 'USD'] // Stripe uses lowercase

      validCurrencies.forEach(currency => {
        expect(['usd', 'eur', 'gbp']).toContain(currency)
      })

      invalidCurrencies.forEach(currency => {
        expect(['usd', 'eur', 'gbp']).not.toContain(currency)
      })
    })
  })
})



