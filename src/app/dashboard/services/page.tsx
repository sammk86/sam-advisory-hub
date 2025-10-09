'use client'

export const dynamic = 'force-dynamic'

import { useEffect, useState } from 'react'
import { useSearchParams } from 'next/navigation'
import { Search, Filter, Grid, List, Heart, Star, Clock, Users, DollarSign, ChevronDown, X } from 'lucide-react'
import { Button } from '@/components/ui/Button'
import DashboardLayout from '@/components/dashboard/DashboardLayout'
import DashboardCard from '@/components/dashboard/DashboardCard'
import { StatusBadge } from '@/components/ui/StatusBadge'
import ServiceDetailsModal from '@/components/services/ServiceDetailsModal'
import ClientOnly from '@/components/ui/ClientOnly'
import FeedbackGrid from '@/components/ui/FeedbackGrid'

interface Service {
  id: string
  name: string
  description: string
  type: 'MENTORSHIP' | 'ADVISORY'
  status: 'DRAFT' | 'PUBLISHED' | 'ARCHIVED'
  singleSessionPrice?: number
  monthlyPlanPrice?: number
  hourlyRate?: number
  createdAt: string
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

interface ServiceFilters {
  type: 'ALL' | 'MENTORSHIP' | 'ADVISORY'
  category: string[]
  priceRange: [number, number]
  format: string[]
  search: string
}

export default function ServicesPage() {
  // const searchParams = useSearchParams()
  const [services, setServices] = useState<Service[]>([])
  const [filteredServices, setFilteredServices] = useState<Service[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid')
  const [showFilters, setShowFilters] = useState(false)
  const [favorites, setFavorites] = useState<string[]>([])
  const [selectedServices, setSelectedServices] = useState<string[]>([])
  const [selectedService, setSelectedService] = useState<Service | null>(null)
  const [showModal, setShowModal] = useState(false)

  const [filters, setFilters] = useState<ServiceFilters>({
    type: 'ALL',
    category: [],
    priceRange: [0, 10000],
    format: [],
    search: ''
  })

  useEffect(() => {
    fetchServices()
  }, [])

  useEffect(() => {
    applyFilters()
  }, [services, filters])

  useEffect(() => {
    // Initialize filters from URL params
    const type = null as 'MENTORSHIP' | 'ADVISORY' | null // searchParams.get('type') as 'MENTORSHIP' | 'ADVISORY' | null
    const search = '' // searchParams.get('search') || ''
    
    if (type) {
      setFilters(prev => ({ ...prev, type: type || 'ALL', search }))
    }
  }, []) // [searchParams])

  const fetchServices = async () => {
    try {
      setIsLoading(true)
      const response = await fetch('/api/services')
      if (!response.ok) {
        throw new Error('Failed to fetch services')
      }
      const data = await response.json()
      setServices(data.data?.services || [])
    } catch (error) {
      console.error('Error fetching services:', error)
      setError('Failed to load services. Please try again.')
      // Mock data for development
      setServices([
        {
          id: '1',
          name: 'Future-Proof Software Engineer',
          description: 'A comprehensive mentorship program to become a future-proof software engineer with modern technologies and best practices.',
          type: 'MENTORSHIP',
          status: 'PUBLISHED',
          monthlyPlanPrice: 99999, // $999.99 in cents
          createdAt: '2024-01-01T00:00:00Z',
          mentorshipProgram: {
            format: 'INDIVIDUAL',
            learningOutcomes: [
              'Master modern JavaScript frameworks',
              'Learn system design principles',
              'Develop leadership skills',
              'Build a professional network'
            ],
            sampleCurriculum: '12-week structured program covering fundamentals to advanced topics'
          }
        },
        {
          id: '2',
          name: 'Technical Architecture Review',
          description: 'Expert review and guidance on your project\'s technical architecture with actionable recommendations.',
          type: 'ADVISORY',
          status: 'PUBLISHED',
          hourlyRate: 49999, // $499.99 in cents
          createdAt: '2024-01-02T00:00:00Z',
          advisoryService: {
            idealClientProfile: 'CTOs, Engineering Managers, and Senior Developers',
            scopeOfWork: 'Comprehensive architecture review including scalability, security, and performance analysis',
            expectedOutcomes: [
              'Detailed architecture assessment report',
              'Scalability recommendations',
              'Security audit findings',
              'Performance optimization plan'
            ],
            sampleDeliverables: [
              'Architecture diagrams',
              'Technical recommendations',
              'Implementation roadmap',
              'Best practices guide'
            ],
            packages: [
              {
                id: 'pkg-1',
                name: 'Standard Review',
                hours: 4,
                price: 199999, // $1999.99
                description: '4-hour comprehensive architecture review'
              }
            ]
          }
        },
        {
          id: '3',
          name: 'Product Management Mastery',
          description: 'Learn product management from industry experts with hands-on experience and real-world projects.',
          type: 'MENTORSHIP',
          status: 'PUBLISHED',
          monthlyPlanPrice: 79999, // $799.99 in cents
          createdAt: '2024-01-03T00:00:00Z',
          mentorshipProgram: {
            format: 'GROUP',
            learningOutcomes: [
              'Master product strategy and roadmap planning',
              'Learn user research and analytics',
              'Develop stakeholder management skills',
              'Build and launch products'
            ]
          }
        }
      ])
    } finally {
      setIsLoading(false)
    }
  }

  const applyFilters = () => {
    let filtered = [...services]

    // Filter by type
    if (filters.type !== 'ALL') {
      filtered = filtered.filter(service => service.type === filters.type)
    }

    // Filter by search
    if (filters.search) {
      const searchLower = filters.search.toLowerCase()
      filtered = filtered.filter(service =>
        service.name.toLowerCase().includes(searchLower) ||
        service.description.toLowerCase().includes(searchLower)
      )
    }

    // Filter by price range
    filtered = filtered.filter(service => {
      const price = service.monthlyPlanPrice || service.hourlyRate || service.singleSessionPrice || 0
      return price >= filters.priceRange[0] && price <= filters.priceRange[1]
    })

    setFilteredServices(filtered)
  }

  const handleFilterChange = (key: keyof ServiceFilters, value: any) => {
    setFilters(prev => ({ ...prev, [key]: value }))
  }

  const handleSearch = (query: string) => {
    handleFilterChange('search', query)
  }

  const toggleFavorite = (serviceId: string) => {
    setFavorites(prev =>
      prev.includes(serviceId)
        ? prev.filter(id => id !== serviceId)
        : [...prev, serviceId]
    )
  }

  const toggleCompare = (serviceId: string) => {
    setSelectedServices(prev =>
      prev.includes(serviceId)
        ? prev.filter(id => id !== serviceId)
        : [...prev, serviceId]
    )
  }

  const handleLearnMore = (service: Service) => {
    setSelectedService(service)
    setShowModal(true)
  }

  const handleEnroll = (serviceId: string) => {
    // Redirect to enrollment flow
    window.location.href = `/enroll/${serviceId}`
  }

  const formatPrice = (price: number) => {
    return `$${(price / 100).toFixed(2)}`
  }

  const getServicePrice = (service: Service) => {
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

  if (isLoading) {
    return (
      <DashboardLayout title="Services" description="Discover mentorship and advisory services">
        <div className="flex items-center justify-center py-12">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
        </div>
      </DashboardLayout>
    )
  }

  if (error) {
    return (
      <DashboardLayout title="Services" description="Discover mentorship and advisory services">
        <div className="text-center py-12">
          <h2 className="text-xl font-semibold text-gray-900 mb-2">Error Loading Services</h2>
          <p className="text-gray-600 mb-4">{error}</p>
          <Button onClick={fetchServices}>Try Again</Button>
        </div>
      </DashboardLayout>
    )
  }

  return (
    <DashboardLayout 
      title="Services" 
      description="Discover mentorship and advisory services tailored to your professional growth"
      actions={
        <div className="flex items-center space-x-2">
          <Button
            variant={viewMode === 'grid' ? 'default' : 'outline'}
            size="sm"
            onClick={() => setViewMode('grid')}
          >
            <Grid className="w-4 h-4" />
          </Button>
          <Button
            variant={viewMode === 'list' ? 'default' : 'outline'}
            size="sm"
            onClick={() => setViewMode('list')}
          >
            <List className="w-4 h-4" />
          </Button>
        </div>
      }
    >
      <div className="space-y-6">
        {/* Search and Filters */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <div className="grid lg:grid-cols-4 gap-6">
            {/* Search */}
            <div className="lg:col-span-2">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                <input
                  type="text"
                  placeholder="Search services..."
                  value={filters.search}
                  onChange={(e) => handleSearch(e.target.value)}
                  className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                />
              </div>
            </div>

            {/* Service Type Filter */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Service Type</label>
              <select
                value={filters.type}
                onChange={(e) => handleFilterChange('type', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              >
                <option value="ALL">All Services</option>
                <option value="MENTORSHIP">Mentorship</option>
                <option value="ADVISORY">Advisory</option>
              </select>
            </div>

            {/* Price Range */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Max Price</label>
              <select
                value={filters.priceRange[1]}
                onChange={(e) => handleFilterChange('priceRange', [filters.priceRange[0], parseInt(e.target.value)])}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              >
                <option value="1000">Under $10</option>
                <option value="5000">Under $50</option>
                <option value="10000">Under $100</option>
                <option value="50000">Under $500</option>
                <option value="100000">All Prices</option>
              </select>
            </div>
          </div>
        </div>

        {/* Results Header */}
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-lg font-semibold text-gray-900">
              {filteredServices.length} Services Found
            </h2>
            {filters.search && (
              <p className="text-sm text-gray-600">
                Results for "{filters.search}"
              </p>
            )}
          </div>
          
          <Button
            variant="outline"
            onClick={() => setFilters({
              type: 'ALL',
              category: [],
              priceRange: [0, 10000],
              format: [],
              search: ''
            })}
          >
            Clear Filters
          </Button>
        </div>

        {/* Services Grid */}
        {filteredServices.length > 0 ? (
          <div className={`grid gap-6 ${
            viewMode === 'grid' 
              ? 'grid-cols-1 md:grid-cols-2 xl:grid-cols-3' 
              : 'grid-cols-1'
          }`}>
            {filteredServices.map((service) => (
              <DashboardCard key={service.id} className="hover:shadow-lg transition-shadow">
                <div className="flex items-start justify-between mb-4">
                  <div className="flex-1">
                    <div className="flex items-center space-x-2 mb-2">
                      <h3 className="text-lg font-semibold text-gray-900">{service.name}</h3>
                      <StatusBadge status={service.type} />
                    </div>
                    <p className="text-gray-600 text-sm mb-3">{service.description}</p>
                  </div>
                  <ClientOnly>
                    <button
                      onClick={() => toggleFavorite(service.id)}
                      className={`p-2 rounded-full ${
                        favorites.includes(service.id)
                          ? 'text-red-500 bg-red-50'
                          : 'text-gray-400 hover:text-red-500'
                      }`}
                    >
                      <Heart className={`w-5 h-5 ${
                        favorites.includes(service.id) ? 'fill-current' : ''
                      }`} />
                    </button>
                  </ClientOnly>
                </div>

                {/* Service Details */}
                <div className="space-y-3 mb-4">
                  <div className="flex items-center text-sm text-gray-600">
                    <DollarSign className="w-4 h-4 mr-2" />
                    <span className="font-medium">{getServicePrice(service)}</span>
                  </div>
                  
                  {service.mentorshipProgram && (
                    <div className="flex items-center text-sm text-gray-600">
                      <Users className="w-4 h-4 mr-2" />
                      <span>{service.mentorshipProgram.format} Program</span>
                    </div>
                  )}
                  
                  {service.advisoryService && (
                    <div className="flex items-center text-sm text-gray-600">
                      <Clock className="w-4 h-4 mr-2" />
                      <span>Project-based</span>
                    </div>
                  )}
                </div>

                {/* Key Features */}
                <div className="mb-4">
                  <h4 className="font-medium text-gray-900 mb-2">Key Features:</h4>
                  <ul className="text-sm text-gray-600 space-y-1">
                    {service.mentorshipProgram?.learningOutcomes.slice(0, 3).map((outcome, index) => (
                      <li key={index} className="flex items-start">
                        <Star className="w-3 h-3 text-yellow-500 mr-2 mt-0.5 flex-shrink-0" />
                        {outcome}
                      </li>
                    ))}
                    {service.advisoryService?.expectedOutcomes.slice(0, 3).map((outcome, index) => (
                      <li key={index} className="flex items-start">
                        <Star className="w-3 h-3 text-yellow-500 mr-2 mt-0.5 flex-shrink-0" />
                        {outcome}
                      </li>
                    ))}
                  </ul>
                </div>

                {/* Actions */}
                <div className="flex space-x-2">
                  <Button 
                    className="flex-1"
                    onClick={() => handleLearnMore(service)}
                  >
                    Learn More
                  </Button>
                  <Button
                    variant="outline"
                    onClick={() => toggleCompare(service.id)}
                    className={selectedServices.includes(service.id) ? 'bg-blue-50 text-blue-700' : ''}
                  >
                    {selectedServices.includes(service.id) ? 'Added' : 'Compare'}
                  </Button>
                </div>
              </DashboardCard>
            ))}
          </div>
        ) : (
          <DashboardCard>
            <div className="text-center py-12">
              <Search className="w-12 h-12 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">No Services Found</h3>
              <p className="text-gray-600 mb-4">
                {filters.search 
                  ? `No services match your search for "${filters.search}"`
                  : 'No services match your current filters'
                }
              </p>
              <Button onClick={() => setFilters({
                type: 'ALL',
                category: [],
                priceRange: [0, 10000],
                format: [],
                search: ''
              })}>
                Clear Filters
              </Button>
            </div>
          </DashboardCard>
        )}
      </div>

      {/* Feedback Section */}
      <div className="mt-16">
        <FeedbackGrid 
          maxItems={6}
          showHeader={true}
          backgroundClass="bg-white"
          className="border-t border-gray-200"
        />
      </div>

      {/* Service Details Modal */}
      <ClientOnly>
        {selectedService && (
          <ServiceDetailsModal
            service={selectedService}
            isOpen={showModal}
            onClose={() => {
              setShowModal(false)
              setSelectedService(null)
            }}
            onEnroll={handleEnroll}
          />
        )}
      </ClientOnly>
    </DashboardLayout>
  )
}
