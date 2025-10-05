'use client'

import Header from '@/components/landing/Header'
import HeroSection from '@/components/landing/HeroSection'
import AboutSection from '@/components/landing/AboutSection'
import MentoringSection from '@/components/landing/MentoringSection'
import BlogSection from '@/components/landing/BlogSection'
import VideoSection from '@/components/landing/VideoSection'
import EmailSection from '@/components/landing/EmailSection'
import ServicesSection from '@/components/landing/ServicesSection'
import PricingSection from '@/components/landing/PricingSection'
import TestimonialsSection from '@/components/landing/TestimonialsSection'
import Footer from '@/components/landing/Footer'

export default function Home() {
  // Show landing page for all users (personal website is public)
  return (
    <main className="flex min-h-screen flex-col bg-background text-foreground">
      <Header />
      <div className="container mt-24 mx-auto px-12 py-4">
        <HeroSection />
        <AboutSection />
        <MentoringSection />
        <BlogSection />
        <VideoSection />
        <ServicesSection />
        <PricingSection />
        <TestimonialsSection />
        <EmailSection />
      </div>
      <Footer />
    </main>
  )
}
