import Header from '@/components/landing/Header'
import Footer from '@/components/landing/Footer'
import FeedbackGrid from '@/components/ui/FeedbackGrid'
import Link from 'next/link'
import { ArrowRight, Users, Target, Clock, CheckCircle, Star, Zap, DollarSign } from 'lucide-react'
import { PrismaClient } from '@prisma/client'

interface Service {
  id: string
  name: string
  description: string
  type: 'MENTORSHIP' | 'ADVISORY'
  pricing: {
    oneOff: number | null
    hourly: number | null
  }
  createdAt: string
}

const prisma = new PrismaClient()

export default async function ServicesPage() {
  let services: Service[] = []
  let error: string | null = null

  try {
    const dbServices = await prisma.service.findMany({
      where: { status: 'PUBLISHED' },
      orderBy: { createdAt: 'desc' },
      select: {
        id: true,
        name: true,
        description: true,
        type: true,
        oneOffPrice: true,
        hourlyRate: true,
        createdAt: true,
      }
    })

    services = dbServices.map(service => ({
      id: service.id,
      name: service.name,
      description: service.description,
      type: service.type,
      pricing: {
        oneOff: service.oneOffPrice ? service.oneOffPrice / 100 : null,
        hourly: service.hourlyRate ? service.hourlyRate / 100 : null,
      },
      createdAt: service.createdAt.toISOString(),
    }))
  } catch (err) {
    console.error('Error fetching services:', err)
    error = 'Failed to load services'
  }

  const formatPrice = (price: number | null) => {
    if (price === null) return null
    return `$${price.toFixed(0)}+`
  }

  const getServiceIcon = (type: string) => {
    return type === 'MENTORSHIP' ? Users : Target
  }

  const getServiceGradient = (type: string) => {
    return type === 'MENTORSHIP' 
      ? 'from-primary/10 to-secondary/10 border-primary/20 hover:border-primary/40'
      : 'from-secondary/10 to-primary/10 border-secondary/20 hover:border-secondary/40'
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

  const mentorshipFeatures = [
    "Personalized 1-on-1 sessions",
    "Custom learning roadmap",
    "Progress tracking & feedback",
    "Industry expert mentors",
    "Flexible scheduling"
  ]

  const advisoryFeatures = [
    "Strategic business guidance",
    "Project-specific consulting",
    "Expert industry insights",
    "Actionable recommendations",
    "Results-driven approach"
  ]

  return (
    <main className="flex min-h-screen flex-col bg-background text-foreground">
      <Header />
      
      <div className="container mt-24 mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Page Header */}
        <div className="text-center mb-12 sm:mb-16">
          <div className="inline-flex items-center space-x-2 bg-primary/20 px-4 py-2 rounded-full mb-6">
            <Zap className="w-4 h-4 text-primary" />
            <span className="text-primary font-medium text-sm">Our Services</span>
          </div>
          
          <h1 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-foreground mb-4 sm:mb-6">
            Choose Your Path to
            <span className="block text-gradient-magenta-cyan">
              Professional Growth
            </span>
          </h1>
          <p className="text-lg sm:text-xl text-muted-foreground max-w-3xl mx-auto">
            Whether you need ongoing mentorship or strategic advisory support, 
            we have the perfect solution to accelerate your career.
          </p>
        </div>

        {/* Services Grid */}
        <div className="grid lg:grid-cols-2 gap-6 sm:gap-8 lg:gap-12">
          {error ? (
            <div className="lg:col-span-2 flex items-center justify-center py-12">
              <div className="text-center">
                <p className="text-destructive mb-4">Failed to load services</p>
                <p className="text-muted-foreground text-sm">Please try refreshing the page</p>
              </div>
            </div>
          ) : services.length === 0 ? (
            <div className="lg:col-span-2 flex items-center justify-center py-12">
              <div className="text-center">
                <p className="text-muted-foreground">No services available at the moment</p>
              </div>
            </div>
          ) : (
            services.map((service, index) => {
              const IconComponent = getServiceIcon(service.type)
              const features = service.type === 'MENTORSHIP' ? mentorshipFeatures : advisoryFeatures
              const isPopular = index === 0 // First service is marked as popular
              
              return (
                <div 
                  key={service.id}
                  className={`group relative bg-gradient-to-br ${getServiceGradient(service.type)} rounded-2xl sm:rounded-3xl p-6 sm:p-8 lg:p-10 border transition-all duration-300 hover:-translate-y-2`}
                >
                  {/* Popular Badge */}
                  {isPopular && (
                    <div className={`absolute -top-3 sm:-top-4 left-6 sm:left-8 ${getServiceIconBg(service.type)} text-white px-3 sm:px-4 py-2 rounded-full text-xs sm:text-sm font-semibold shadow-lg`}>
                      Most Popular
                    </div>
                  )}

                  <div className="flex items-center mb-6">
                    <div className={`w-12 h-12 sm:w-16 sm:h-16 ${getServiceIconBg(service.type)} rounded-2xl flex items-center justify-center mr-4 group-hover:scale-110 transition-transform duration-300`}>
                      <IconComponent className="w-6 h-6 sm:w-8 sm:h-8 text-white" />
                    </div>
                    <div>
                      <h3 className="text-xl sm:text-2xl font-bold text-card-foreground">{service.name}</h3>
                      <p className={`${getServiceTextColor(service.type)} font-medium text-sm sm:text-base`}>
                        {service.type === 'MENTORSHIP' ? 'Long-term Growth Partnership' : 'Strategic Project Support'}
                      </p>
                    </div>
                  </div>

                  <p className="text-muted-foreground mb-6 sm:mb-8 text-base sm:text-lg leading-relaxed">
                    {service.description}
                  </p>

                  {/* Features */}
                  <div className="space-y-3 sm:space-y-4 mb-6 sm:mb-8">
                    {features.map((feature, featureIndex) => (
                      <div key={featureIndex} className="flex items-center space-x-3">
                        <CheckCircle className="w-4 h-4 sm:w-5 sm:h-5 text-green-500 flex-shrink-0" />
                        <span className="text-card-foreground text-sm sm:text-base">{feature}</span>
                      </div>
                    ))}
                  </div>

                  {/* Pricing Preview */}
                  <div className="bg-card/80 backdrop-blur-sm rounded-2xl p-4 sm:p-6 mb-6 sm:mb-8 border border-border">
                    <div className="flex items-center justify-between mb-4">
                      <span className="text-muted-foreground text-sm sm:text-base">
                        Starting from
                      </span>
                      <div className="flex items-center space-x-1">
                        {[1, 2, 3, 4, 5].map((i) => (
                          <Star key={i} className="w-3 h-3 sm:w-4 sm:h-4 text-yellow-400 fill-current" />
                        ))}
                        <span className="text-xs sm:text-sm text-muted-foreground ml-2">(4.9/5)</span>
                      </div>
                    </div>
                    <div className="flex items-baseline space-x-2">
                      <span className="text-2xl sm:text-3xl font-bold text-card-foreground">
                        {formatPrice(service.pricing.oneOff || service.pricing.hourly) || 'Contact us'}
                      </span>
                      <span className="text-muted-foreground">
                        {service.pricing.oneOff ? '' : service.pricing.hourly ? '/hour' : ''}
                      </span>
                    </div>
                    <div className="text-center mt-2">
                      <span className="text-xs text-muted-foreground">*Pricing varies based on specific needs</span>
                    </div>
                  </div>

                  <Link
                    href={`/services/${service.id}`}
                    className={`group w-full ${getServiceButtonColor(service.type)} text-white py-3 sm:py-4 px-6 rounded-xl font-semibold transition-all duration-300 flex items-center justify-center space-x-2 shadow-lg hover:shadow-xl`}
                  >
                    <span>
                      {service.type === 'MENTORSHIP' ? 'Learn More & Register' : 'Learn More & Register'}
                    </span>
                    <ArrowRight className="w-4 h-4 sm:w-5 sm:h-5" />
                  </Link>
                </div>
              )
            })
          )}
        </div>

        {/* Bottom CTA */}
        <div className="text-center mt-12 sm:mt-16">
          <div className="inline-flex flex-col sm:flex-row items-center space-y-4 sm:space-y-0 sm:space-x-4 bg-gradient-to-r from-primary/10 to-secondary/10 px-6 sm:px-8 py-6 rounded-2xl border border-border max-w-2xl mx-auto">
            <div className="text-center sm:text-left">
              <div className="font-semibold text-card-foreground">Not sure which service fits you?</div>
              <div className="text-muted-foreground text-sm">Get a free consultation to find your perfect match</div>
            </div>
            <Link
              href="/contact"
              className="bg-gradient-magenta-cyan text-white px-6 py-3 rounded-xl font-semibold hover:opacity-90 transition-all duration-300 whitespace-nowrap"
            >
              Contact for Consultation
            </Link>
          </div>
        </div>
      </div>

      {/* Success Stories Section */}
      <FeedbackGrid 
        maxItems={6}
        showHeader={true}
        backgroundClass="bg-gray-900"
        className="text-white"
      />
      
      <Footer />
    </main>
  )
}
