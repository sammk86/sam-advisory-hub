'use client'

import { useState } from 'react'
import { useStripe, useElements, PaymentElement } from '@stripe/react-stripe-js'
import { ArrowRight, AlertCircle } from 'lucide-react'
import { Button } from '@/components/ui/Button'

interface PaymentFormProps {
  onSuccess: (paymentMethodId: string) => void
  onError: (error: string) => void
  isLoading?: boolean
}

export default function PaymentForm({ onSuccess, onError, isLoading }: PaymentFormProps) {
  const stripe = useStripe()
  const elements = useElements()
  const [isProcessing, setIsProcessing] = useState(false)
  const [errorMessage, setErrorMessage] = useState('')

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault()

    if (!stripe || !elements) {
      return
    }

    setIsProcessing(true)
    setErrorMessage('')

    try {
      const { error, paymentMethod } = await stripe.createPaymentMethod({
        elements,
      })

      if (error) {
        setErrorMessage(error.message || 'An error occurred while processing your payment method.')
        onError(error.message || 'Payment method creation failed')
      } else if (paymentMethod) {
        onSuccess(paymentMethod.id)
      }
    } catch (err) {
      const message = err instanceof Error ? err.message : 'An unexpected error occurred'
      setErrorMessage(message)
      onError(message)
    } finally {
      setIsProcessing(false)
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {/* Error Message */}
      {errorMessage && (
        <div className="bg-red-50 border border-red-200 rounded-md p-4">
          <div className="flex">
            <AlertCircle className="h-5 w-5 text-red-400" />
            <div className="ml-3">
              <p className="text-sm text-red-800">{errorMessage}</p>
            </div>
          </div>
        </div>
      )}

      {/* Stripe Payment Element */}
      <div className="p-4 border border-gray-300 rounded-md bg-white">
        <PaymentElement 
          options={{
            layout: 'tabs',
            paymentMethodOrder: ['card', 'apple_pay', 'google_pay'],
          }}
        />
      </div>

      {/* Submit Button */}
      <Button
        type="submit"
        disabled={!stripe || isLoading || isProcessing}
        isLoading={isProcessing}
        className="w-full"
        size="lg"
      >
        {isProcessing ? 'Processing...' : (
          <>
            Save Payment Method
            <ArrowRight className="w-4 h-4 ml-2" />
          </>
        )}
      </Button>

      {/* Security Notice */}
      <div className="text-xs text-gray-500 text-center">
        <p>Your payment information is encrypted and secure.</p>
        <p>We use Stripe to process payments securely.</p>
      </div>
    </form>
  )
}



