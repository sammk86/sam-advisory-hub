'use client'

import { useState } from 'react'
import { X, Star, Clock, Users, DollarSign, CheckCircle, Heart, Share2 } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { StatusBadge } from '@/components/ui/StatusBadge'

interface ServiceDetailsModalProps {
  service: {
    id: string
    name: string
    description: string
    type: 'MENTORSHIP' | 'ADVISORY'
    singleSessionPrice?: number
    monthlyPlanPrice?: number
    hourlyRate?: number
    mentorshipProgram?: {
      format: 'INDIVIDUAL' | 'GROUP'
      learningOutcomes: string[]
      sampleCurriculum?: string
    }
    advisoryService?: {
      idealClientProfile: string
      scopeOfWork: string
      expectedOutcomes: string[]
      sampleDeliverables: string[]
      packages: Array<{
        id: string
        name: string
        hours: number
        price: number
        description?: string
      }>
    }
  }
  isOpen: boolean
  onClose: () => void
  onEnroll: (serviceId: string) => void
}

export default function ServiceDetailsModal({ service, isOpen, onClose, onEnroll }: ServiceDetailsModalProps) {
  const [isFavorited, setIsFavorited] = useState(false)

  if (!isOpen) return null

  const formatPrice = (price: number) => {
    return `$${(price / 100).toFixed(2)}`
  }

  const getServicePrice = () => {
    if (service.monthlyPlanPrice) {
      return `${formatPrice(service.monthlyPlanPrice)}/month`
    }
    if (service.hourlyRate) {
      return `${formatPrice(service.hourlyRate)}/hour`
    }
    if (service.singleSessionPrice) {
      return `${formatPrice(service.singleSessionPrice)}/session`
    }
    return 'Contact for pricing'
  }

  const handleEnroll = () => {
    onEnroll(service.id)
    onClose()
  }

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto">
      <div className="flex min-h-screen items-center justify-center p-4">
        <div className="fixed inset-0 bg-gray-500 bg-opacity-75" onClick={onClose} />
        
        <div className="relative bg-white rounded-lg shadow-xl max-w-4xl w-full max-h-[90vh] overflow-y-auto">
          {/* Header */}
          <div className="flex items-center justify-between p-6 border-b border-gray-200">
            <div className="flex items-center space-x-3">
              <h2 className="text-2xl font-bold text-gray-900">{service.name}</h2>
              <StatusBadge status={service.type} />
            </div>
            <div className="flex items-center space-x-2">
              <button
                onClick={() => setIsFavorited(!isFavorited)}
                className={`p-2 rounded-full ${
                  isFavorited ? 'text-red-500 bg-red-50' : 'text-gray-400 hover:text-red-500'
                }`}
              >
                <Heart className={`w-5 h-5 ${isFavorited ? 'fill-current' : ''}`} />
              </button>
              <button className="p-2 text-gray-400 hover:text-gray-600 rounded-full">
                <Share2 className="w-5 h-5" />
              </button>
              <button
                onClick={onClose}
                className="p-2 text-gray-400 hover:text-gray-600 rounded-full"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
          </div>

          {/* Content */}
          <div className="p-6">
            <div className="grid lg:grid-cols-3 gap-8">
              {/* Main Content */}
              <div className="lg:col-span-2 space-y-6">
                {/* Description */}
                <div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-3">About This Service</h3>
                  <p className="text-gray-700 leading-relaxed">{service.description}</p>
                </div>

                {/* Mentorship Program Details */}
                {service.mentorshipProgram && (
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900 mb-3">Program Details</h3>
                    <div className="space-y-4">
                      <div>
                        <h4 className="font-medium text-gray-900 mb-2">Format</h4>
                        <div className="flex items-center text-gray-600">
                          <Users className="w-4 h-4 mr-2" />
                          <span>{service.mentorshipProgram.format} Program</span>
                        </div>
                      </div>
                      
                      <div>
                        <h4 className="font-medium text-gray-900 mb-2">Learning Outcomes</h4>
                        <ul className="space-y-2">
                          {service.mentorshipProgram.learningOutcomes.map((outcome, index) => (
                            <li key={index} className="flex items-start">
                              <CheckCircle className="w-5 h-5 text-green-500 mr-2 mt-0.5 flex-shrink-0" />
                              <span className="text-gray-700">{outcome}</span>
                            </li>
                          ))}
                        </ul>
                      </div>

                      {service.mentorshipProgram.sampleCurriculum && (
                        <div>
                          <h4 className="font-medium text-gray-900 mb-2">Sample Curriculum</h4>
                          <p className="text-gray-700">{service.mentorshipProgram.sampleCurriculum}</p>
                        </div>
                      )}
                    </div>
                  </div>
                )}

                {/* Advisory Service Details */}
                {service.advisoryService && (
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900 mb-3">Service Details</h3>
                    <div className="space-y-4">
                      <div>
                        <h4 className="font-medium text-gray-900 mb-2">Ideal Client Profile</h4>
                        <p className="text-gray-700">{service.advisoryService.idealClientProfile}</p>
                      </div>
                      
                      <div>
                        <h4 className="font-medium text-gray-900 mb-2">Scope of Work</h4>
                        <p className="text-gray-700">{service.advisoryService.scopeOfWork}</p>
                      </div>
                      
                      <div>
                        <h4 className="font-medium text-gray-900 mb-2">Expected Outcomes</h4>
                        <ul className="space-y-2">
                          {service.advisoryService.expectedOutcomes.map((outcome, index) => (
                            <li key={index} className="flex items-start">
                              <CheckCircle className="w-5 h-5 text-green-500 mr-2 mt-0.5 flex-shrink-0" />
                              <span className="text-gray-700">{outcome}</span>
                            </li>
                          ))}
                        </ul>
                      </div>
                      
                      <div>
                        <h4 className="font-medium text-gray-900 mb-2">Sample Deliverables</h4>
                        <ul className="space-y-2">
                          {service.advisoryService.sampleDeliverables.map((deliverable, index) => (
                            <li key={index} className="flex items-start">
                              <Star className="w-5 h-5 text-yellow-500 mr-2 mt-0.5 flex-shrink-0" />
                              <span className="text-gray-700">{deliverable}</span>
                            </li>
                          ))}
                        </ul>
                      </div>
                    </div>
                  </div>
                )}
              </div>

              {/* Sidebar */}
              <div className="space-y-6">
                {/* Pricing */}
                <div className="bg-gray-50 rounded-lg p-6">
                  <h3 className="text-lg font-semibold text-gray-900 mb-4">Pricing</h3>
                  <div className="text-center">
                    <div className="text-3xl font-bold text-gray-900 mb-2">
                      {getServicePrice()}
                    </div>
                    {service.advisoryService?.packages && service.advisoryService.packages.length > 0 && (
                      <div className="mt-4">
                        <h4 className="font-medium text-gray-900 mb-3">Available Packages</h4>
                        <div className="space-y-3">
                          {service.advisoryService.packages.map((pkg) => (
                            <div key={pkg.id} className="border border-gray-200 rounded-lg p-3">
                              <div className="font-medium text-gray-900">{pkg.name}</div>
                              <div className="text-sm text-gray-600">
                                {pkg.hours} hours • {formatPrice(pkg.price)}
                              </div>
                              {pkg.description && (
                                <div className="text-xs text-gray-500 mt-1">{pkg.description}</div>
                              )}
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                </div>

                {/* Action Buttons */}
                <div className="space-y-3">
                  <Button onClick={handleEnroll} className="w-full">
                    Enroll Now
                  </Button>
                  <Button variant="outline" className="w-full">
                    Schedule Consultation
                  </Button>
                  <Button variant="outline" className="w-full">
                    Download Brochure
                  </Button>
                </div>

                {/* Additional Info */}
                <div className="text-sm text-gray-600 space-y-2">
                  <div className="flex items-center">
                    <Clock className="w-4 h-4 mr-2" />
                    <span>Flexible scheduling</span>
                  </div>
                  <div className="flex items-center">
                    <CheckCircle className="w-4 h-4 mr-2" />
                    <span>Money-back guarantee</span>
                  </div>
                  <div className="flex items-center">
                    <Star className="w-4 h-4 mr-2" />
                    <span>Expert mentors</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
