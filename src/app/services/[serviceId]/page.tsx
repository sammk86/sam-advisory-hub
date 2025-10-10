import { notFound } from 'next/navigation'
import { Metadata } from 'next'
import Header from '@/components/landing/Header'
import Footer from '@/components/landing/Footer'
import { ArrowLeft, Users, Target, CheckCircle, Star } from 'lucide-react'
import Link from 'next/link'
import { prisma } from '@/lib/prisma'
import { getBaseUrlFromEnv } from '@/lib/utils'

interface Service {
  id: string
  name: string
  description: string
  type: string
  oneOffPrice?: number | null
  hourlyRate?: number | null
  features?: string[]
  benefits?: string[]
  process?: string[]
  testimonials?: Array<{
    name: string
    role: string
    quote: string
  }>
}

async function getService(serviceId: string): Promise<Service | null> {
  try {
    // First try to find by ID
    let service = await prisma.service.findFirst({
      where: {
        id: serviceId,
        status: 'PUBLISHED'
      }
    })
    
    // If not found by ID, try to find by service type (for backward compatibility)
    if (!service) {
      const servicesOfType = await prisma.service.findMany({
        where: {
          type: {
            equals: serviceId.toUpperCase(),
            mode: 'insensitive'
          },
          status: 'PUBLISHED'
        },
        take: 1
      })
      service = servicesOfType[0] || null
    }
    
    if (!service) {
      return null
    }
    
    // Format the service data to match the expected interface
    return {
      id: service.id,
      name: service.name,
      description: service.description,
      type: service.type,
      oneOffPrice: service.oneOffPrice,
      hourlyRate: service.hourlyRate,
      features: service.features || [],
      benefits: service.benefits || [],
      process: service.process || [],
      testimonials: service.testimonials || []
    }
  } catch (error) {
    console.error('Error fetching service:', error)
    return null
  }
}

// Generate metadata for social media previews
export async function generateMetadata({
  params
}: {
  params: Promise<{ serviceId: string }>
}): Promise<Metadata> {
  const { serviceId } = await params
  const service = await getService(serviceId)
  
  if (!service) {
    return {
      title: 'Service Not Found | SamAdvisoryHub',
      description: 'The requested service could not be found.'
    }
  }

  const baseUrl = getBaseUrlFromEnv()
  const formatPrice = (price: number | null) => {
    if (price === null) return null
    const priceInDollars = price / 100
    return `$${priceInDollars.toFixed(0)}+`
  }

  const price = formatPrice(service.oneOffPrice || service.hourlyRate)
  const priceText = price ? `Starting from ${price}` : 'Contact for pricing'
  const serviceTypeText = service.type === 'MENTORSHIP' ? 'Mentorship Program' : 'Advisory Service'
  
  const title = `${service.name} | ${serviceTypeText} - SamAdvisoryHub`
  const description = `${service.description} ${priceText}. Expert ${serviceTypeText.toLowerCase()} by Dr. Sam Mokhtari.`
  
  // Create a service-specific image URL (you can customize this)
  const imageUrl = `${baseUrl}/api/og/service?title=${encodeURIComponent(service.name)}&type=${encodeURIComponent(serviceTypeText)}&price=${encodeURIComponent(price || 'Contact')}`

  return {
    title,
    description,
    keywords: [
      service.name,
      serviceTypeText,
      'Dr. Sam Mokhtari',
      'Data & AI Expert',
      'Mentorship',
      'Advisory',
      'Career Growth',
      'Professional Development'
    ],
    authors: [{ name: 'Dr. Sam Mokhtari' }],
    creator: 'Dr. Sam Mokhtari',
    publisher: 'SamAdvisoryHub',
    
    // Open Graph
    openGraph: {
      type: 'website',
      locale: 'en_US',
      url: `${baseUrl}/services/${serviceId}`,
      siteName: 'SamAdvisoryHub',
      title,
      description,
      images: [
        {
          url: imageUrl,
          width: 1200,
          height: 630,
          alt: `${service.name} - ${serviceTypeText}`,
        },
      ],
    },
    
    // Twitter Card
    twitter: {
      card: 'summary_large_image',
      site: '@SamMokhtari87', // Replace with actual Twitter handle if available
      creator: '@SamMokhtari87',
      title,
      description,
      images: [imageUrl],
    },
    
    // Additional meta tags
    robots: {
      index: true,
      follow: true,
      googleBot: {
        index: true,
        follow: true,
        'max-video-preview': -1,
        'max-image-preview': 'large',
        'max-snippet': -1,
      },
    },
    
    // Canonical URL
    alternates: {
      canonical: `${baseUrl}/services/${serviceId}`,
    },
  }
}

export default async function ServiceDetailPage({
  params
}: {
  params: Promise<{ serviceId: string }>
}) {
  const { serviceId } = await params
  const service = await getService(serviceId)
  
  if (!service) {
    notFound()
  }

  const formatPrice = (price: number | null) => {
    if (price === null) return null
    // Convert from cents to dollars
    const priceInDollars = price / 100
    return `$${priceInDollars.toFixed(0)}+`
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
              {service.type === 'MENTORSHIP' ? 'Mentorship Program' : 'Advisory Service'}
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
            <section>
              <h2 className="text-3xl font-bold text-foreground mb-8">
                What's Included
              </h2>
              <div className="grid md:grid-cols-2 gap-6">
                {(service.features || []).map((feature: string, index: number) => (
                  <div key={index} className="flex items-start space-x-4">
                    <CheckCircle className="w-6 h-6 text-green-500 flex-shrink-0 mt-1" />
                    <p className="text-card-foreground leading-relaxed">{feature}</p>
                  </div>
                ))}
              </div>
            </section>

            {/* Benefits */}
            <section>
              <h2 className="text-3xl font-bold text-foreground mb-8">
                Expected Benefits
              </h2>
              <div className="grid md:grid-cols-2 gap-6">
                {(service.benefits || []).map((benefit: string, index: number) => (
                  <div key={index} className="flex items-start space-x-4">
                    <Star className="w-6 h-6 text-yellow-500 flex-shrink-0 mt-1" />
                    <p className="text-card-foreground leading-relaxed">{benefit}</p>
                  </div>
                ))}
              </div>
            </section>

            {/* Process Overview */}
            <section>
              <h2 className="text-3xl font-bold text-foreground mb-8">
                How It Works
              </h2>
              <div className="space-y-6">
                {(service.process || []).map((step: string, index: number) => (
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
                  <span className="text-sm text-muted-foreground ml-3">(5/5 rating)</span>
                </div>
                
                <div className="text-center mb-2">
                  <span className="text-sm text-muted-foreground">Starting from</span>
                </div>
                <div className="text-4xl font-bold text-card-foreground mb-2">
                  {formatPrice(service.oneOffPrice || service.hourlyRate) || 'Contact us'}
                </div>
                <div className="text-muted-foreground">
                  {service.oneOffPrice ? 'one-time' : service.hourlyRate ? '/hour' : 'for pricing'}
                </div>
                <div className="text-center mt-2">
                  <span className="text-xs text-muted-foreground">*Pricing varies based on specific needs</span>
                </div>
              </div>

              {/* Registration Section */}
              <div className="space-y-6">
                <div className="text-center">
                  <h3 className="text-xl font-semibold text-card-foreground mb-2">
                    Get Started Today
                  </h3>
                  <p className="text-muted-foreground mb-6">
                    {service.type === 'MENTORSHIP' 
                      ? 'Start your personalized mentoring journey and accelerate your career growth.'
                      : 'Get expert advisory support for your specific business challenges.'
                    }
                  </p>
                  
                  <Link
                    href={`/auth/signup?service=${service.type.toLowerCase()}&serviceId=${service.id}`}
                    className={`block w-full ${getServiceButtonColor(service.type)} text-white py-4 px-6 rounded-xl font-semibold transition-all duration-300 shadow-lg hover:shadow-xl text-center`}
                  >
                    {service.type === 'MENTORSHIP' ? 'Start Mentoring Journey' : 'Get Advisory Support'}
                  </Link>
                </div>

                {/* Contact Alternative */}
                <div className="pt-6 border-t border-border">
                  <p className="text-sm text-muted-foreground text-center mb-4">
                    Need more information or have questions?
                  </p>
                  <Link
                    href="/contact"
                    className="block w-full text-center py-3 px-4 border border-border rounded-xl text-card-foreground hover:bg-card/50 transition-colors"
                  >
                    Contact for Consultation
                  </Link>
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
              {testimonials.map((testimonial: any, index: number) => (
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