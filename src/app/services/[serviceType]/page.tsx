'use client'

import { useState, useEffect } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { useSession } from 'next-auth/react'
import Header from '@/components/landing/Header'
import Footer from '@/components/landing/Footer'
import { ArrowLeft, Users, Target, CheckCircle, Star, Clock, DollarSign, Loader2, UserCheck, LogIn } from 'lucide-react'
import Link from 'next/link'

interface Service {
  id: string
  name: string
  description: string
  type: 'MENTORSHIP' | 'ADVISORY'
  pricing: {
    oneOff: number | null
    hourly: number | null
  }
  features: string[]
  benefits: string[]
  process: string[]
  testimonials: Array<{
    name: string
    quote: string
    role: string
  }> | null
  createdAt: string
}

export default function ServiceDetailPage() {
  const params = useParams()
  const router = useRouter()
  const { data: session, status } = useSession()
  const serviceType = params?.serviceType as string
  
  const [service, setService] = useState<Service | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const fetchServiceDetails = async () => {
      try {
        setLoading(true)
        setError(null)
        
        const response = await fetch('/api/services')
        if (!response.ok) {
          throw new Error('Failed to fetch service details')
        }
        
        const data = await response.json()
        if (data.success && data.data.services) {
          const servicesOfType = data.data.services.filter((s: Service) => 
            s.type.toLowerCase() === serviceType.toLowerCase()
          )
          
          if (servicesOfType.length > 0) {
            // If multiple services of same type, show the first one for now
            // TODO: Implement service-specific routing with IDs
            const foundService = servicesOfType[0]
            setService(foundService)
            
            // If multiple services of same type, show the first one for now
            // TODO: Implement service-specific routing with IDs
          } else {
            setError(`Service not found. Available services: ${data.data.services.map((s: Service) => s.type.toLowerCase()).join(', ')}`)
          }
        } else {
          throw new Error('Failed to load service details')
        }
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to load service details')
        console.error('Service fetch error:', err)
      } finally {
        setLoading(false)
      }
    }

    if (serviceType) {
      fetchServiceDetails()
    }
  }, [serviceType])

  const formatPrice = (price: number | null) => {
    if (price === null) return null
    return `$${price.toFixed(0)}`
  }

  const getServiceIcon = (type: string) => {
    return type === 'MENTORSHIP' ? Users : Target
  }

  const getServiceGradient = (type: string) => {
    return type === 'MENTORSHIP' 
      ? 'from-primary/10 to-secondary/10 border-primary/20'
      : 'from-secondary/10 to-primary/10 border-secondary/20'
  }

  const getServiceButtonColor = (type: string) => {
    return type === 'MENTORSHIP' 
      ? 'bg-gradient-magenta-cyan hover:opacity-90'
      : 'bg-gradient-cyan-blue hover:opacity-90'
  }

  const getServiceIconBg = (type: string) => {
    return type === 'MENTORSHIP' 
      ? 'bg-primary'
      : 'bg-secondary'
  }

  const getServiceTextColor = (type: string) => {
    return type === 'MENTORSHIP' 
      ? 'text-primary'
      : 'text-secondary'
  }

  const handleRegisterClick = () => {
    // Direct redirect to registration with service type
    router.push(`/auth/signup?service=${serviceType}`)
  }

  if (loading) {
    return (
      <main className="flex min-h-screen flex-col bg-background text-foreground">
        <Header />
        <div className="flex-1 flex items-center justify-center mt-24">
          <div className="text-center">
            <Loader2 className="w-8 h-8 animate-spin text-primary mx-auto mb-4" />
            <p className="text-muted-foreground">Loading service details...</p>
          </div>
        </div>
        <Footer />
      </main>
    )
  }

  if (error || !service) {
    return (
      <main className="flex min-h-screen flex-col bg-background text-foreground">
        <Header />
        <div className="flex-1 flex items-center justify-center mt-24">
          <div className="text-center">
            <p className="text-destructive mb-4">{error || 'Service not found'}</p>
            <Link 
              href="/services"
              className="text-primary hover:text-primary/80 font-medium"
            >
              ← Back to Services
            </Link>
          </div>
        </div>
        <Footer />
      </main>
    )
  }

  const IconComponent = getServiceIcon(service.type)
  const testimonials = service.testimonials || []

  return (
    <main className="flex min-h-screen flex-col bg-background text-foreground">
      <Header />
      
      <div className="container mt-24 mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Back Button */}
        <div className="mb-8">
          <Link 
            href="/services"
            className="inline-flex items-center text-muted-foreground hover:text-foreground transition-colors"
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to Services
          </Link>
        </div>

        {/* Service Header */}
        <div className="text-center mb-12">
          <div className="inline-flex items-center space-x-2 bg-primary/20 px-4 py-2 rounded-full mb-6">
            <IconComponent className="w-5 h-5 text-primary" />
            <span className="text-primary font-medium text-sm">
              {service.type === 'MENTORSHIP' ? 'Mentorship Service' : 'Advisory Service'}
            </span>
          </div>
          
          <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold text-foreground mb-6">
            {service.name}
          </h1>
          <p className="text-xl sm:text-2xl text-muted-foreground max-w-4xl mx-auto leading-relaxed">
            {service.description}
          </p>
        </div>

        {/* Main Content Grid */}
        <div className="grid lg:grid-cols-3 gap-8 lg:gap-12">
          {/* Left Column - Features & Benefits */}
          <div className="lg:col-span-2 space-y-12">
            {/* What's Included */}
            {service.features && service.features.length > 0 && (
              <section>
                <h2 className="text-3xl font-bold text-foreground mb-8">
                  What's Included
                </h2>
                <div className="grid md:grid-cols-2 gap-6">
                  {service.features.map((feature, index) => (
                    <div key={index} className="flex items-start space-x-4">
                      <CheckCircle className="w-6 h-6 text-green-500 flex-shrink-0 mt-1" />
                      <p className="text-card-foreground leading-relaxed">{feature}</p>
                    </div>
                  ))}
                </div>
              </section>
            )}

            {/* Benefits */}
            {service.benefits && service.benefits.length > 0 && (
              <section>
                <h2 className="text-3xl font-bold text-foreground mb-8">
                  Expected Benefits
                </h2>
                <div className="grid md:grid-cols-2 gap-6">
                  {service.benefits.map((benefit, index) => (
                    <div key={index} className="flex items-start space-x-4">
                      <Star className="w-6 h-6 text-yellow-500 flex-shrink-0 mt-1" />
                      <p className="text-card-foreground leading-relaxed">{benefit}</p>
                    </div>
                  ))}
                </div>
              </section>
            )}

            {/* Process Overview */}
            {service.process && service.process.length > 0 && (
              <section>
                <h2 className="text-3xl font-bold text-foreground mb-8">
                  How It Works
                </h2>
                <div className="space-y-6">
                  {service.process.map((step, index) => (
                    <div key={index} className="flex items-start space-x-6">
                      <div className={`w-12 h-12 ${getServiceIconBg(service.type)} rounded-full flex items-center justify-center flex-shrink-0`}>
                        <span className="text-white font-bold text-lg">{index + 1}</span>
                      </div>
                      <div>
                        <p className="text-card-foreground leading-relaxed">{step}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </section>
            )}
          </div>

          {/* Right Column - Pricing & Registration */}
          <div className="lg:col-span-1">
            <div className={`sticky top-24 bg-gradient-to-br ${getServiceGradient(service.type)} rounded-3xl p-8 border`}>
              {/* Pricing */}
              <div className="text-center mb-8">
                <div className="flex items-center justify-center mb-4">
                  {[1, 2, 3, 4, 5].map((i) => (
                    <Star key={i} className="w-5 h-5 text-yellow-400 fill-current" />
                  ))}
                  <span className="text-sm text-muted-foreground ml-3">(4.9/5 rating)</span>
                </div>
                
                <div className="text-4xl font-bold text-card-foreground mb-2">
                  {formatPrice(service.pricing.oneOff || service.pricing.hourly) || 'Contact us'}
                </div>
                <div className="text-muted-foreground">
                  {service.pricing.oneOff ? 'one-time' : service.pricing.hourly ? '/hour' : 'for pricing'}
                </div>
              </div>

              {/* Registration Section */}
              <div className="space-y-6">
                <div className="text-center">
                  <h3 className="text-xl font-semibold text-card-foreground mb-2">
                    Get Started Today
                  </h3>
                  <p className="text-muted-foreground mb-6">
                    Create your account and start your journey with us.
                  </p>
                  
                  <button
                    onClick={handleRegisterClick}
                    className={`w-full ${getServiceButtonColor(service.type)} text-white py-4 px-6 rounded-xl font-semibold transition-all duration-300 shadow-lg hover:shadow-xl`}
                  >
                    Register Now
                  </button>
                </div>

                {/* Contact Alternative */}
                <div className="pt-6 border-t border-border">
                  <p className="text-sm text-muted-foreground text-center mb-4">
                    Need more information or have questions?
                  </p>
                  <a
                    href="mailto:sam.mokhtari87@gmail.com"
                    className="block w-full text-center py-3 px-4 border border-border rounded-xl text-card-foreground hover:bg-card/50 transition-colors"
                  >
                    Contact for Consultation
                  </a>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Testimonials Section */}
        {testimonials.length > 0 && (
          <section className="mt-20">
            <h2 className="text-3xl font-bold text-foreground text-center mb-12">
              What Our Clients Say
            </h2>
            <div className="grid md:grid-cols-3 gap-8">
              {testimonials.map((testimonial, index) => (
                <div key={index} className="bg-card/50 backdrop-blur-sm rounded-2xl p-6 border border-border">
                  <div className="flex items-center mb-4">
                    {[1, 2, 3, 4, 5].map((i) => (
                      <Star key={i} className="w-4 h-4 text-yellow-400 fill-current" />
                    ))}
                  </div>
                  <p className="text-muted-foreground mb-4 italic">
                    "{testimonial.quote}"
                  </p>
                  <p className="text-sm font-semibold text-card-foreground">- {testimonial.name}, {testimonial.role}</p>
                </div>
              ))}
            </div>
          </section>
        )}
      </div>
      
      <Footer />
    </main>
  )
}