'use client'

import { Check, Star, ArrowRight, Clock, Target } from 'lucide-react'
import { Button } from '@/components/ui/Button'
import { ServiceType, PlanType } from '../RegistrationFlow'

interface PlanSelectionProps {
  service: ServiceType
  selectedPlan: PlanType
  onPlanSelect: (plan: PlanType) => void
  onNext: () => void
  onBack: () => void
}

export default function PlanSelection({ service, selectedPlan, onPlanSelect, onNext, onBack }: PlanSelectionProps) {
  const mentorshipPlans = [
    {
      id: 'starter' as PlanType,
      name: 'Mentorship Starter',
      description: 'Perfect for getting started',
      price: 199,
      period: 'month',
      popular: false,
      features: [
        '2 sessions per month (1 hour each)',
        'Basic roadmap and goal setting',
        'Email support between sessions',
        'Resource library access',
      ],
    },
    {
      id: 'pro' as PlanType,
      name: 'Mentorship Pro',
      description: 'For serious growth',
      price: 299,
      period: 'month',
      popular: true,
      features: [
        '4 sessions per month (1 hour each)',
        'Comprehensive roadmap with milestones',
        'Priority email and chat support',
        'Full resource library + exclusive content',
        'Community access and networking',
        'Progress tracking and analytics',
      ],
    },
    {
      id: 'package-3' as PlanType,
      name: '3-Month Package',
      description: 'Save 15% with commitment',
      price: 254,
      originalPrice: 299,
      period: 'month',
      popular: false,
      features: [
        'Everything in Pro plan',
        '15% discount (save $135)',
        'Guaranteed mentor consistency',
        'Quarterly progress review',
        'Extended goal planning session',
      ],
    },
    {
      id: 'package-6' as PlanType,
      name: '6-Month Package',
      description: 'Maximum savings and results',
      price: 239,
      originalPrice: 299,
      period: 'month',
      popular: false,
      features: [
        'Everything in Pro plan',
        '20% discount (save $360)',
        'Guaranteed mentor consistency',
        'Monthly progress reviews',
        'Career transition support',
        'Alumni network access',
      ],
    },
  ]

  const advisoryPlans = [
    {
      id: 'hourly' as PlanType,
      name: 'Advisory Services',
      description: 'Flexible project-based support',
      price: 150,
      period: 'hour',
      popular: true,
      features: [
        'Strategic planning sessions',
        'Custom deliverables and reports',
        'Flexible scheduling',
        'Industry-specific expertise',
        'Follow-up support included',
        'Implementation guidance',
      ],
    },
  ]

  const plans = service === 'mentorship' ? mentorshipPlans : advisoryPlans

  return (
    <div>
      <div className="text-center mb-8">
        <h2 className="text-2xl font-bold text-gray-900 mb-2">
          Choose Your {service === 'mentorship' ? 'Mentorship' : 'Advisory'} Plan
        </h2>
        <p className="text-gray-600">
          Select the plan that best fits your goals and budget
        </p>
      </div>

      <div className={`grid gap-6 mb-8 ${
        service === 'mentorship' ? 'lg:grid-cols-2 xl:grid-cols-4' : 'max-w-md mx-auto'
      }`}>
        {plans.map((plan) => {
          const isSelected = selectedPlan === plan.id
          
          return (
            <div
              key={plan.id}
              className={`relative rounded-2xl p-6 border-2 cursor-pointer transition-all ${
                isSelected
                  ? 'border-blue-500 ring-2 ring-blue-200'
                  : 'border-gray-200 hover:border-blue-300'
              } ${plan.popular ? 'ring-2 ring-blue-100' : ''}`}
              onClick={() => onPlanSelect(plan.id)}
            >
              {plan.popular && (
                <div className="absolute -top-4 left-1/2 transform -translate-x-1/2">
                  <div className="bg-blue-600 text-white px-4 py-1 rounded-full text-sm font-medium flex items-center space-x-1">
                    <Star className="w-4 h-4" />
                    <span>Most Popular</span>
                  </div>
                </div>
              )}

              <div className="text-center mb-6">
                <h3 className="text-xl font-bold text-gray-900 mb-2">{plan.name}</h3>
                <p className="text-gray-600 mb-4">{plan.description}</p>
                
                <div className="mb-4">
                  <div className="flex items-baseline justify-center">
                    {plan.originalPrice && (
                      <span className="text-lg text-gray-400 line-through mr-2">
                        ${plan.originalPrice}
                      </span>
                    )}
                    <span className="text-4xl font-bold text-gray-900">${plan.price}</span>
                    <span className="text-gray-600 ml-1">/{plan.period}</span>
                  </div>
                  {plan.originalPrice && (
                    <div className="text-green-600 text-sm font-medium mt-1">
                      Save ${plan.originalPrice - plan.price}/month
                    </div>
                  )}
                </div>
              </div>

              <ul className="space-y-3 mb-6">
                {plan.features.map((feature, index) => (
                  <li key={index} className="flex items-start space-x-3">
                    <Check className="w-4 h-4 text-green-600 mt-0.5 flex-shrink-0" />
                    <span className="text-sm text-gray-700">{feature}</span>
                  </li>
                ))}
              </ul>

              <Button
                variant={isSelected ? 'primary' : 'outline'}
                className="w-full"
                onClick={(e) => {
                  e.stopPropagation()
                  onPlanSelect(plan.id)
                }}
              >
                {isSelected ? 'Selected' : 'Select Plan'}
              </Button>
            </div>
          )
        })}
      </div>

      {/* Additional Info */}
      <div className="bg-gray-50 rounded-lg p-6 mb-8">
        <div className="grid md:grid-cols-2 gap-6 text-center">
          <div className="flex items-center justify-center space-x-3">
            <Clock className="w-5 h-5 text-blue-600" />
            <div>
              <div className="font-semibold text-gray-900">Flexible Scheduling</div>
              <div className="text-sm text-gray-600">Book sessions at your convenience</div>
            </div>
          </div>
          <div className="flex items-center justify-center space-x-3">
            <Target className="w-5 h-5 text-green-600" />
            <div>
              <div className="font-semibold text-gray-900">Goal-Oriented</div>
              <div className="text-sm text-gray-600">Focused on your specific objectives</div>
            </div>
          </div>
        </div>
      </div>

      <div className="flex justify-between">
        <Button variant="outline" onClick={onBack}>
          Back to Service Selection
        </Button>
        <Button onClick={onNext}>
          Continue to Profile Setup
          <ArrowRight className="w-4 h-4 ml-2" />
        </Button>
      </div>
    </div>
  )
}



