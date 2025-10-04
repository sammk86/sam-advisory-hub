'use client'

import { Users, Target, CheckCircle, ArrowRight } from 'lucide-react'
import Button from '@/components/ui/Button'
import { ServiceType } from '../RegistrationFlow'

interface ServiceSelectionProps {
  selectedService: ServiceType
  onServiceSelect: (service: ServiceType) => void
  onNext: () => void
}

export default function ServiceSelection({ selectedService, onServiceSelect, onNext }: ServiceSelectionProps) {
  const services = [
    {
      id: 'mentorship' as ServiceType,
      title: 'Mentorship Program',
      subtitle: 'Long-term Growth Partnership',
      description: 'Comprehensive 3-6 month programs designed for sustained professional development with personalized roadmaps, regular check-ins, and milestone tracking.',
      icon: Users,
      features: [
        'Personalized learning roadmap with clear milestones',
        'Weekly 1-on-1 sessions with industry experts',
        'Progress tracking and goal adjustment',
        'Resource library and learning materials',
        'Community access and peer networking',
      ],
      pricing: 'Starting at $199/month',
      color: 'blue',
    },
    {
      id: 'advisory' as ServiceType,
      title: 'Advisory Services',
      subtitle: 'Strategic Project Support',
      description: 'Focused consulting for specific projects, challenges, or decisions. Get expert insights and actionable recommendations when you need them most.',
      icon: Target,
      features: [
        'Strategic planning and problem-solving sessions',
        'Custom deliverables and action plans',
        'Flexible scheduling and project scope',
        'Industry-specific expertise and insights',
        'Follow-up support and implementation guidance',
      ],
      pricing: 'Starting at $150/hour',
      color: 'purple',
    },
  ]

  return (
    <div>
      <div className="text-center mb-8">
        <h2 className="text-2xl font-bold text-gray-900 mb-2">
          Choose Your Service Type
        </h2>
        <p className="text-gray-600">
          Select the service that best fits your professional development needs
        </p>
      </div>

      <div className="grid lg:grid-cols-2 gap-6 mb-8">
        {services.map((service) => {
          const Icon = service.icon
          const isSelected = selectedService === service.id
          const colorClasses = {
            blue: {
              border: isSelected ? 'border-blue-500 ring-2 ring-blue-200' : 'border-gray-200 hover:border-blue-300',
              icon: 'bg-blue-600',
              button: 'bg-blue-600 hover:bg-blue-700',
            },
            purple: {
              border: isSelected ? 'border-purple-500 ring-2 ring-purple-200' : 'border-gray-200 hover:border-purple-300',
              icon: 'bg-purple-600',
              button: 'bg-purple-600 hover:bg-purple-700',
            },
          }

          return (
            <div
              key={service.id}
              className={`relative rounded-2xl p-6 border-2 cursor-pointer transition-all ${
                colorClasses[service.color].border
              }`}
              onClick={() => onServiceSelect(service.id)}
            >
              {isSelected && (
                <div className="absolute top-4 right-4">
                  <CheckCircle className="w-6 h-6 text-green-600" />
                </div>
              )}

              <div className="flex items-center mb-4">
                <div className={`w-12 h-12 ${colorClasses[service.color].icon} rounded-lg flex items-center justify-center`}>
                  <Icon className="w-6 h-6 text-white" />
                </div>
                <div className="ml-4">
                  <h3 className="text-xl font-bold text-gray-900">{service.title}</h3>
                  <p className={`text-sm font-medium ${
                    service.color === 'blue' ? 'text-blue-600' : 'text-purple-600'
                  }`}>
                    {service.subtitle}
                  </p>
                </div>
              </div>

              <p className="text-gray-700 mb-6 leading-relaxed">
                {service.description}
              </p>

              <div className="space-y-3 mb-6">
                {service.features.map((feature, index) => (
                  <div key={index} className="flex items-start space-x-3">
                    <CheckCircle className="w-4 h-4 text-green-600 mt-0.5 flex-shrink-0" />
                    <span className="text-sm text-gray-700">{feature}</span>
                  </div>
                ))}
              </div>

              <div className="flex items-center justify-between">
                <div className="text-lg font-semibold text-gray-900">
                  {service.pricing}
                </div>
                <Button
                  size="sm"
                  className={`${colorClasses[service.color].button} ${
                    isSelected ? 'opacity-100' : 'opacity-75'
                  }`}
                  onClick={(e) => {
                    e.stopPropagation()
                    onServiceSelect(service.id)
                  }}
                >
                  {isSelected ? 'Selected' : 'Select'}
                </Button>
              </div>
            </div>
          )
        })}
      </div>

      <div className="text-center">
        <Button
          onClick={onNext}
          size="lg"
          className="px-8"
        >
          Continue to Plan Selection
          <ArrowRight className="w-4 h-4 ml-2" />
        </Button>
      </div>
    </div>
  )
}

