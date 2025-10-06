'use client'

import Header from '@/components/landing/Header'
import SubscribeSection from '@/components/landing/SubscribeSection'
import HeroSection from '@/components/landing/HeroSection'
import MentoringSection from '@/components/landing/MentoringSection'
import BlogSection from '@/components/landing/BlogSection'
import VideoSection from '@/components/landing/VideoSection'
import PricingSection from '@/components/landing/PricingSection'
import Footer from '@/components/landing/Footer'

export default function Home() {
  // Show landing page for all users (personal website is public)
  return (
    <main className="flex min-h-screen flex-col bg-background text-foreground">
      <Header />
      <SubscribeSection />
      <div className="container mx-auto px-12 py-4">
        <HeroSection />
        <MentoringSection />
        <BlogSection />
        <VideoSection />
      </div>
      <Footer />
    </main>
  )
}
