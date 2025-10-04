'use client'

import { useState, useEffect } from 'react'
import { ArrowRight, CreditCard, Shield } from 'lucide-react'
import Button from '@/components/ui/Button'
import Input from '@/components/ui/Input'
import StripeProvider from '@/components/payment/StripeProvider'
import PaymentForm from '@/components/payment/PaymentForm'
import { ServiceType, PlanType } from '../RegistrationFlow'

interface PaymentSetupProps {
  service: ServiceType
  plan: PlanType
  payment: {
    paymentMethodId?: string
    billingAddress?: {
      name: string
      email: string
      address: string
      city: string
      state: string
      zipCode: string
      country: string
    }
  }
  onPaymentUpdate: (payment: any) => void
  onNext: () => void
  onBack: () => void
}

export default function PaymentSetup({ service, plan, payment, onPaymentUpdate, onNext, onBack }: PaymentSetupProps) {
  const [isProcessing, setIsProcessing] = useState(false)
  const [clientSecret, setClientSecret] = useState<string>('')
  const [error, setError] = useState('')
  const [billingAddress, setBillingAddress] = useState(payment.billingAddress || {
    name: '',
    email: '',
    address: '',
    city: '',
    state: '',
    zipCode: '',
    country: 'US',
  })

  // Mock pricing data - in real app this would come from your pricing API
  const getPlanDetails = () => {
    const plans = {
      mentorship: {
        starter: { price: 199, name: 'Mentorship Starter' },
        pro: { price: 299, name: 'Mentorship Pro' },
        'package-3': { price: 254, name: '3-Month Package', originalPrice: 299 },
        'package-6': { price: 239, name: '6-Month Package', originalPrice: 299 },
      },
      advisory: {
        hourly: { price: 150, name: 'Advisory Services', unit: 'hour' },
      },
    }
    
    return plans[service][plan] || { price: 0, name: 'Unknown Plan' }
  }

  const planDetails = getPlanDetails()

  // Create setup intent when component mounts
  useEffect(() => {
    const createSetupIntent = async () => {
      try {
        const response = await fetch('/api/payments/create-setup-intent', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            service,
            plan,
            amount: planDetails.price * 100, // Convert to cents
          }),
        })

        if (!response.ok) {
          throw new Error('Failed to create setup intent')
        }

        const { clientSecret } = await response.json()
        setClientSecret(clientSecret)
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to initialize payment')
      }
    }

    createSetupIntent()
  }, [service, plan, planDetails.price])

  const handleBillingAddressChange = (field: string, value: string) => {
    const updatedAddress = { ...billingAddress, [field]: value }
    setBillingAddress(updatedAddress)
    onPaymentUpdate({
      ...payment,
      billingAddress: updatedAddress,
    })
  }

  const handlePaymentSuccess = (paymentMethodId: string) => {
    onPaymentUpdate({
      ...payment,
      paymentMethodId,
      billingAddress,
    })
    onNext()
  }

  const handlePaymentError = (errorMessage: string) => {
    setError(errorMessage)
  }

  return (
    <div>
      <div className="text-center mb-8">
        <h2 className="text-2xl font-bold text-gray-900 mb-2">
          Complete Your Payment
        </h2>
        <p className="text-gray-600">
          Secure payment processing powered by Stripe
        </p>
      </div>

      <div className="grid lg:grid-cols-2 gap-8">
        {/* Payment Form */}
        <div className="space-y-6">
          <div>
            <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
              <CreditCard className="w-5 h-5 mr-2" />
              Payment Information
            </h3>
            
            {/* Error Message */}
            {error && (
              <div className="mb-4 bg-red-50 border border-red-200 rounded-md p-4">
                <p className="text-sm text-red-800">{error}</p>
              </div>
            )}
            
            {/* Stripe Payment Form */}
            {clientSecret ? (
              <StripeProvider clientSecret={clientSecret}>
                <PaymentForm
                  onSuccess={handlePaymentSuccess}
                  onError={handlePaymentError}
                  isLoading={isProcessing}
                />
              </StripeProvider>
            ) : (
              <div className="p-8 border border-gray-300 rounded-md bg-gray-50 text-center">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-4"></div>
                <p className="text-gray-600">Initializing secure payment...</p>
              </div>
            )}
          </div>

          <div>
            <h3 className="text-lg font-semibold text-gray-900 mb-4">
              Billing Address
            </h3>
            
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <Input
                  label="Full Name"
                  value={billingAddress.name}
                  onChange={(e) => handleBillingAddressChange('name', e.target.value)}
                  placeholder="John Doe"
                />
                <Input
                  label="Email"
                  type="email"
                  value={billingAddress.email}
                  onChange={(e) => handleBillingAddressChange('email', e.target.value)}
                  placeholder="john@example.com"
                />
              </div>
              
              <Input
                label="Address"
                value={billingAddress.address}
                onChange={(e) => handleBillingAddressChange('address', e.target.value)}
                placeholder="123 Main Street"
              />
              
              <div className="grid grid-cols-3 gap-4">
                <Input
                  label="City"
                  value={billingAddress.city}
                  onChange={(e) => handleBillingAddressChange('city', e.target.value)}
                  placeholder="New York"
                />
                <Input
                  label="State"
                  value={billingAddress.state}
                  onChange={(e) => handleBillingAddressChange('state', e.target.value)}
                  placeholder="NY"
                />
                <Input
                  label="ZIP Code"
                  value={billingAddress.zipCode}
                  onChange={(e) => handleBillingAddressChange('zipCode', e.target.value)}
                  placeholder="10001"
                />
              </div>
            </div>
          </div>
        </div>

        {/* Order Summary */}
        <div className="lg:pl-8">
          <div className="bg-gray-50 rounded-lg p-6 sticky top-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">
              Order Summary
            </h3>
            
            <div className="space-y-3 mb-4">
              <div className="flex justify-between">
                <span className="text-gray-600">Service</span>
                <span className="font-medium">{service === 'mentorship' ? 'Mentorship' : 'Advisory'}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Plan</span>
                <span className="font-medium">{planDetails.name}</span>
              </div>
              {planDetails.originalPrice && (
                <div className="flex justify-between text-sm">
                  <span className="text-gray-500">Regular Price</span>
                  <span className="text-gray-500 line-through">
                    ${planDetails.originalPrice}/{planDetails.unit || 'month'}
                  </span>
                </div>
              )}
              <div className="flex justify-between text-lg font-semibold pt-3 border-t">
                <span>Total</span>
                <span>${planDetails.price}/{planDetails.unit || 'month'}</span>
              </div>
            </div>

            {planDetails.originalPrice && (
              <div className="bg-green-50 border border-green-200 rounded-md p-3 mb-4">
                <div className="text-green-800 text-sm font-medium">
                  You're saving ${planDetails.originalPrice - planDetails.price}/month!
                </div>
              </div>
            )}

            <div className="flex items-center text-sm text-gray-500 mb-4">
              <Shield className="w-4 h-4 mr-2" />
              Secured by Stripe. Your payment information is encrypted and secure.
            </div>

            <div className="text-xs text-gray-500 space-y-1">
              <p>• Cancel anytime with 30-day notice</p>
              <p>• 30-day money-back guarantee</p>
              <p>• Billing starts after your first session</p>
            </div>
          </div>
        </div>
      </div>

      <div className="flex justify-between pt-8">
        <Button variant="outline" onClick={onBack}>
          Back to Profile Setup
        </Button>
        <div className="text-sm text-gray-500">
          Complete the payment form above to continue
        </div>
      </div>
    </div>
  )
}
