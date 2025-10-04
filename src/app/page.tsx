import Header from '@/components/landing/Header'
import Hero from '@/components/landing/Hero'
import ServicesSection from '@/components/landing/ServicesSection'
import PricingSection from '@/components/landing/PricingSection'
import TestimonialsSection from '@/components/landing/TestimonialsSection'
import Footer from '@/components/landing/Footer'

export default function Home() {
  return (
    <div className="min-h-screen">
      <Header />
      <main>
        <Hero />
        <ServicesSection />
        <PricingSection />
        <TestimonialsSection />
      </main>
      <Footer />
    </div>
  )
}
