'use client'

import { CheckCircle, User, CreditCard, Target, Calendar } from 'lucide-react'
import Button from '@/components/ui/Button'
import { RegistrationData } from '../RegistrationFlow'

interface RegistrationSummaryProps {
  registrationData: RegistrationData
  onComplete: () => void
  onBack: () => void
  isLoading: boolean
}

export default function RegistrationSummary({ 
  registrationData, 
  onComplete, 
  onBack, 
  isLoading 
}: RegistrationSummaryProps) {
  const { service, plan, profile, payment } = registrationData

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

  const getExperienceLabel = (value: string) => {
    const labels = {
      'entry': 'Entry Level (0-2 years)',
      'mid': 'Mid Level (3-5 years)',
      'senior': 'Senior Level (6-10 years)',
      'executive': 'Executive Level (10+ years)',
      'entrepreneur': 'Entrepreneur/Founder',
      'career-change': 'Career Changer',
    }
    return labels[value] || value
  }

  const getIndustryLabel = (value: string) => {
    const labels = {
      'technology': 'Technology',
      'finance': 'Finance & Banking',
      'healthcare': 'Healthcare',
      'consulting': 'Consulting',
      'marketing': 'Marketing & Advertising',
      'sales': 'Sales',
      'education': 'Education',
      'nonprofit': 'Non-profit',
      'retail': 'Retail & E-commerce',
      'manufacturing': 'Manufacturing',
      'media': 'Media & Entertainment',
      'other': 'Other',
    }
    return labels[value] || value
  }

  const getScheduleLabel = (value: string) => {
    const labels = {
      'morning': 'Morning (9 AM - 12 PM)',
      'afternoon': 'Afternoon (12 PM - 5 PM)',
      'evening': 'Evening (5 PM - 8 PM)',
      'flexible': 'Flexible',
    }
    return labels[value] || value
  }

  return (
    <div>
      <div className="text-center mb-8">
        <CheckCircle className="w-16 h-16 text-green-600 mx-auto mb-4" />
        <h2 className="text-2xl font-bold text-gray-900 mb-2">
          Almost There!
        </h2>
        <p className="text-gray-600">
          Review your information and complete your registration
        </p>
      </div>

      <div className="grid lg:grid-cols-2 gap-8 mb-8">
        {/* Registration Details */}
        <div className="space-y-6">
          {/* Service & Plan */}
          <div className="bg-gray-50 rounded-lg p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
              <Target className="w-5 h-5 mr-2" />
              Service & Plan
            </h3>
            <div className="space-y-3">
              <div className="flex justify-between">
                <span className="text-gray-600">Service Type</span>
                <span className="font-medium capitalize">{service}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Plan</span>
                <span className="font-medium">{planDetails.name}</span>
              </div>
              <div className="flex justify-between text-lg font-semibold pt-3 border-t">
                <span>Monthly Cost</span>
                <span>${planDetails.price}/{planDetails.unit || 'month'}</span>
              </div>
            </div>
          </div>

          {/* Profile Information */}
          <div className="bg-gray-50 rounded-lg p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
              <User className="w-5 h-5 mr-2" />
              Profile Information
            </h3>
            <div className="space-y-3">
              <div>
                <span className="text-gray-600 block text-sm">Experience Level</span>
                <span className="font-medium">{getExperienceLabel(profile.experience)}</span>
              </div>
              <div>
                <span className="text-gray-600 block text-sm">Industry</span>
                <span className="font-medium">{getIndustryLabel(profile.industry)}</span>
              </div>
              <div>
                <span className="text-gray-600 block text-sm">Time Commitment</span>
                <span className="font-medium">{profile.timeCommitment} hours {service === 'mentorship' ? 'per month' : 'per project'}</span>
              </div>
              <div>
                <span className="text-gray-600 block text-sm">Preferred Schedule</span>
                <span className="font-medium">{getScheduleLabel(profile.preferredSchedule)}</span>
              </div>
            </div>
          </div>

          {/* Goals */}
          <div className="bg-gray-50 rounded-lg p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
              <Calendar className="w-5 h-5 mr-2" />
              Your Goals
            </h3>
            <p className="text-gray-700 leading-relaxed">{profile.goals}</p>
          </div>
        </div>

        {/* Payment & Next Steps */}
        <div className="space-y-6">
          {/* Payment Information */}
          <div className="bg-gray-50 rounded-lg p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
              <CreditCard className="w-5 h-5 mr-2" />
              Payment Information
            </h3>
            {payment.billingAddress && (
              <div className="space-y-2 text-sm">
                <div className="font-medium">{payment.billingAddress.name}</div>
                <div className="text-gray-600">{payment.billingAddress.email}</div>
                <div className="text-gray-600">
                  {payment.billingAddress.address}<br />
                  {payment.billingAddress.city}, {payment.billingAddress.state} {payment.billingAddress.zipCode}
                </div>
              </div>
            )}
            <div className="mt-4 p-3 bg-green-50 border border-green-200 rounded-md">
              <div className="text-green-800 text-sm">
                ✓ Payment method configured securely
              </div>
            </div>
          </div>

          {/* What Happens Next */}
          <div className="bg-blue-50 rounded-lg p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">
              What Happens Next?
            </h3>
            <div className="space-y-3 text-sm">
              <div className="flex items-start space-x-3">
                <div className="w-6 h-6 bg-blue-600 text-white rounded-full flex items-center justify-center text-xs font-medium">1</div>
                <div>
                  <div className="font-medium">Enrollment Confirmation</div>
                  <div className="text-gray-600">You'll receive a confirmation email with your enrollment details</div>
                </div>
              </div>
              <div className="flex items-start space-x-3">
                <div className="w-6 h-6 bg-blue-600 text-white rounded-full flex items-center justify-center text-xs font-medium">2</div>
                <div>
                  <div className="font-medium">{service === 'mentorship' ? 'Mentor' : 'Advisor'} Matching</div>
                  <div className="text-gray-600">We'll match you with the perfect {service === 'mentorship' ? 'mentor' : 'advisor'} within 24-48 hours</div>
                </div>
              </div>
              <div className="flex items-start space-x-3">
                <div className="w-6 h-6 bg-blue-600 text-white rounded-full flex items-center justify-center text-xs font-medium">3</div>
                <div>
                  <div className="font-medium">First Session</div>
                  <div className="text-gray-600">Schedule your first session and begin your journey</div>
                </div>
              </div>
            </div>
          </div>

          {/* Guarantee */}
          <div className="bg-green-50 rounded-lg p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-2">
              30-Day Money-Back Guarantee
            </h3>
            <p className="text-sm text-gray-600">
              If you're not completely satisfied with your experience in the first 30 days, 
              we'll provide a full refund, no questions asked.
            </p>
          </div>
        </div>
      </div>

      <div className="flex justify-between">
        <Button variant="outline" onClick={onBack} disabled={isLoading}>
          Back to Payment
        </Button>
        <Button 
          onClick={onComplete}
          isLoading={isLoading}
          size="lg"
          className="px-8"
        >
          {isLoading ? 'Creating Your Enrollment...' : 'Complete Registration'}
        </Button>
      </div>
    </div>
  )
}
