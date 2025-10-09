'use client'

import { useState, useEffect } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { useSession } from 'next-auth/react'
import { Check, ArrowLeft, ArrowRight } from 'lucide-react'
import ServiceSelection from './steps/ServiceSelection'
import PlanSelection from './steps/PlanSelection'
import ProfileSetup from './steps/ProfileSetup'
import PaymentSetup from './steps/PaymentSetup'
import RegistrationSummary from './steps/RegistrationSummary'
import { Button } from '@/components/ui/Button'

export type ServiceType = 'mentorship' | 'advisory'
export type PlanType = 'starter' | 'pro' | 'package-3' | 'package-6' | 'hourly'

export interface RegistrationData {
  service: ServiceType
  plan: PlanType
  profile: {
    goals: string
    experience: string
    industry: string
    timeCommitment: string
    preferredSchedule: string
  }
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
}

const steps = [
  { id: 'service', title: 'Choose Service', description: 'Select your service type' },
  { id: 'plan', title: 'Select Plan', description: 'Choose your pricing plan' },
  { id: 'profile', title: 'Profile Setup', description: 'Tell us about your goals' },
  { id: 'payment', title: 'Payment', description: 'Complete your enrollment' },
  { id: 'summary', title: 'Summary', description: 'Review and confirm' },
]

export default function RegistrationFlow() {
  const [currentStep, setCurrentStep] = useState(0)
  const [registrationData, setRegistrationData] = useState<RegistrationData>({
    service: 'mentorship',
    plan: 'starter',
    profile: {
      goals: '',
      experience: '',
      industry: '',
      timeCommitment: '',
      preferredSchedule: '',
    },
    payment: {},
  })
  const [isLoading, setIsLoading] = useState(false)

  const router = useRouter()
  // const searchParams = useSearchParams()
  const { data: session, status } = useSession()

  // Initialize from URL parameters
  useEffect(() => {
    const service = 'MENTORSHIP' as ServiceType // searchParams.get('service') as ServiceType
    const plan = 'STARTER' as PlanType // searchParams.get('plan') as PlanType

    if (service) {
      setRegistrationData(prev => ({ ...prev, service }))
    }
    if (plan) {
      setRegistrationData(prev => ({ ...prev, plan }))
    }
  }, [searchParams])

  // Redirect if not authenticated
  useEffect(() => {
    if (status === 'loading') return
    if (!session) {
      const currentUrl = window.location.pathname + window.location.search
      router.push(`/auth/signin?callbackUrl=${encodeURIComponent(currentUrl)}`)
    }
  }, [session, status, router])

  const updateRegistrationData = (updates: Partial<RegistrationData>) => {
    setRegistrationData(prev => ({ ...prev, ...updates }))
  }

  const nextStep = () => {
    if (currentStep < steps.length - 1) {
      setCurrentStep(currentStep + 1)
    }
  }

  const prevStep = () => {
    if (currentStep > 0) {
      setCurrentStep(currentStep - 1)
    }
  }

  const goToStep = (stepIndex: number) => {
    setCurrentStep(stepIndex)
  }

  const handleComplete = async () => {
    setIsLoading(true)
    try {
      // Create enrollment with payment processing
      const response = await fetch('/api/enrollments/create-with-payment', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          serviceType: registrationData.service.toUpperCase(),
          planType: registrationData.plan.toUpperCase(),
          goals: registrationData.profile.goals,
          experience: registrationData.profile.experience,
          industry: registrationData.profile.industry,
          timeCommitment: registrationData.profile.timeCommitment,
          preferredSchedule: registrationData.profile.preferredSchedule,
          paymentMethodId: registrationData.payment.paymentMethodId,
          billingAddress: registrationData.payment.billingAddress,
        }),
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.error || 'Failed to create enrollment')
      }

      const { enrollment, subscription } = await response.json()
      
      // Redirect to dashboard with success message
      router.push(`/dashboard?enrollment=${enrollment.id}&subscription=${subscription?.id}&success=true`)
    } catch (error) {
      console.error('Registration error:', error)
      // TODO: Show error message to user
      alert(error instanceof Error ? error.message : 'Registration failed. Please try again.')
    } finally {
      setIsLoading(false)
    }
  }

  if (status === 'loading') {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    )
  }

  if (!session) {
    return null // Will redirect to signin
  }

  const renderStep = () => {
    switch (currentStep) {
      case 0:
        return (
          <ServiceSelection
            selectedService={registrationData.service}
            onServiceSelect={(service) => updateRegistrationData({ service })}
            onNext={nextStep}
          />
        )
      case 1:
        return (
          <PlanSelection
            service={registrationData.service}
            selectedPlan={registrationData.plan}
            onPlanSelect={(plan) => updateRegistrationData({ plan })}
            onNext={nextStep}
            onBack={prevStep}
          />
        )
      case 2:
        return (
          <ProfileSetup
            service={registrationData.service}
            profile={registrationData.profile}
            onProfileUpdate={(profile) => updateRegistrationData({ profile })}
            onNext={nextStep}
            onBack={prevStep}
          />
        )
      case 3:
        return (
          <PaymentSetup
            service={registrationData.service}
            plan={registrationData.plan}
            payment={registrationData.payment}
            onPaymentUpdate={(payment) => updateRegistrationData({ payment })}
            onNext={nextStep}
            onBack={prevStep}
          />
        )
      case 4:
        return (
          <RegistrationSummary
            registrationData={registrationData}
            onComplete={handleComplete}
            onBack={prevStep}
            isLoading={isLoading}
          />
        )
      default:
        return null
    }
  }

  return (
    <div className="min-h-screen bg-gray-50 py-12">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            Complete Your Registration
          </h1>
          <p className="text-gray-600">
            Just a few steps to get started with your {registrationData.service} journey
          </p>
        </div>

        {/* Progress Steps */}
        <div className="mb-8">
          <div className="flex items-center justify-between">
            {steps.map((step, index) => (
              <div key={step.id} className="flex items-center">
                <div className="flex items-center">
                  <div
                    className={`w-10 h-10 rounded-full flex items-center justify-center text-sm font-medium ${
                      index < currentStep
                        ? 'bg-green-600 text-white'
                        : index === currentStep
                        ? 'bg-blue-600 text-white'
                        : 'bg-gray-200 text-gray-600'
                    }`}
                  >
                    {index < currentStep ? (
                      <Check className="w-5 h-5" />
                    ) : (
                      index + 1
                    )}
                  </div>
                  <div className="ml-3 hidden sm:block">
                    <p className={`text-sm font-medium ${
                      index <= currentStep ? 'text-gray-900' : 'text-gray-500'
                    }`}>
                      {step.title}
                    </p>
                    <p className="text-xs text-gray-500">{step.description}</p>
                  </div>
                </div>
                {index < steps.length - 1 && (
                  <div className={`hidden sm:block w-16 h-0.5 mx-4 ${
                    index < currentStep ? 'bg-green-600' : 'bg-gray-200'
                  }`} />
                )}
              </div>
            ))}
          </div>
        </div>

        {/* Step Content */}
        <div className="bg-white rounded-lg shadow-sm p-6 mb-6">
          {renderStep()}
        </div>

        {/* Navigation */}
        <div className="flex justify-between">
          <Button
            variant="outline"
            onClick={prevStep}
            disabled={currentStep === 0}
            className="flex items-center"
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back
          </Button>
          
          <div className="text-sm text-gray-500">
            Step {currentStep + 1} of {steps.length}
          </div>
          
          <div className="w-20"> {/* Spacer for alignment */}
            {currentStep === steps.length - 1 ? (
              <Button
                onClick={handleComplete}
                isLoading={isLoading}
                className="flex items-center"
              >
                Complete
                <ArrowRight className="w-4 h-4 ml-2" />
              </Button>
            ) : null}
          </div>
        </div>
      </div>
    </div>
  )
}
