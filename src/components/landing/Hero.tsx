'use client'

import Link from 'next/link'
import { ArrowRight, Users, Target, Zap, Star, Play, CheckCircle, Mail } from 'lucide-react'
import { motion } from 'framer-motion'
import ClientOnly from '@/components/animations/ClientOnly'
import NewsletterSignupForm from '@/components/newsletter/NewsletterSignupForm'

export default function Hero() {
  return (
    <section className="relative min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100 flex items-center overflow-hidden">
      {/* Animated Background Elements */}
      <ClientOnly>
        <div className="absolute inset-0 overflow-hidden">
          <motion.div
            className="absolute top-20 -right-20 w-72 h-72 bg-blue-400/20 rounded-full blur-3xl"
            animate={{
              x: [0, 50, 0],
              y: [0, -30, 0],
              scale: [1, 1.1, 1],
            }}
            transition={{
              duration: 8,
              repeat: Infinity,
              ease: "easeInOut"
            }}
          />
          <motion.div
            className="absolute bottom-20 -left-20 w-96 h-96 bg-purple-400/20 rounded-full blur-3xl"
            animate={{
              x: [0, -30, 0],
              y: [0, 20, 0],
              scale: [1, 0.9, 1],
            }}
            transition={{
              duration: 10,
              repeat: Infinity,
              ease: "easeInOut"
            }}
          />
          <motion.div
            className="absolute top-1/2 left-1/2 w-64 h-64 bg-indigo-400/20 rounded-full blur-3xl"
            animate={{
              rotate: [0, 360],
              scale: [1, 1.2, 1],
            }}
            transition={{
              duration: 15,
              repeat: Infinity,
              ease: "linear"
            }}
          />
        </div>
      </ClientOnly>

      <div className="relative w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20 lg:py-32">
        {/* Newsletter Signup - Top of Page */}
        <div className="text-center mb-16">
          <ClientOnly fallback={
            <div className="bg-white/95 backdrop-blur-sm rounded-3xl shadow-2xl border border-white/40 p-8 max-w-4xl mx-auto">
              <div className="flex items-center justify-center space-x-3 mb-6">
                <Mail className="w-8 h-8 text-blue-600" />
                <h2 className="text-2xl font-bold text-gray-900">Stay Updated</h2>
              </div>
              <p className="text-gray-600 text-lg mb-8 max-w-2xl mx-auto">
                Get the latest insights on career growth and mentorship delivered to your inbox.
              </p>
              <div className="flex flex-col sm:flex-row gap-4 max-w-2xl mx-auto">
                <input
                  type="email"
                  placeholder="Enter your email address"
                  className="flex-1 px-6 py-4 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none text-gray-900 placeholder-gray-500"
                />
                <button className="px-8 py-4 bg-gradient-to-r from-blue-600 to-purple-600 text-white font-semibold rounded-xl hover:shadow-xl transition-all duration-300">
                  Subscribe Now
                </button>
              </div>
            </div>
          }>
            <motion.div 
              className="bg-white/95 backdrop-blur-sm rounded-3xl shadow-2xl border border-white/40 p-8 max-w-4xl mx-auto"
              initial={{ opacity: 0, y: -30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2, duration: 0.8 }}
              whileHover={{ scale: 1.02, y: -5 }}
            >
              <div className="flex items-center justify-center space-x-3 mb-6">
                <motion.div
                  animate={{ rotate: [0, 10, -10, 0] }}
                  transition={{ duration: 2, repeat: Infinity, ease: 'easeInOut' }}
                >
                  <Mail className="w-8 h-8 text-blue-600" />
                </motion.div>
                <h2 className="text-2xl font-bold text-gray-900">Stay Updated</h2>
              </div>
              <p className="text-gray-600 text-lg mb-8 max-w-2xl mx-auto">
                Get the latest insights on career growth and mentorship delivered to your inbox.
              </p>
              <NewsletterSignupForm 
                variant="hero"
                showInterests={false}
                placeholder="Enter your email address"
                buttonText="Subscribe Now"
                onSuccess={() => {
                  // Track successful subscription
                  if (typeof window !== 'undefined' && window.gtag) {
                    window.gtag('event', 'newsletter_signup', {
                      event_category: 'engagement',
                      event_label: 'hero-top',
                    })
                  }
                }}
                onError={(error) => {
                  console.error('Newsletter subscription error:', error)
                }}
              />
            </motion.div>
          </ClientOnly>
        </div>

        <div className="grid lg:grid-cols-2 gap-12 lg:gap-16 items-center">
          {/* Left Column - Content */}
          <div className="text-center lg:text-left">
            {/* Trust Badge */}
            <ClientOnly fallback={
              <div className="inline-flex items-center space-x-2 bg-white/90 backdrop-blur-sm px-4 py-2 rounded-full shadow-lg border border-white/30 mb-8">
                <Star className="w-4 h-4 text-yellow-500 fill-current" />
                <span className="text-sm font-semibold text-gray-700">Trusted by 10,000+ professionals</span>
                <div className="flex -space-x-1">
                  {[1, 2, 3, 4, 5].map((i) => (
                    <Star key={i} className="w-3 h-3 text-yellow-400 fill-current" />
                  ))}
                </div>
              </div>
            }>
              <motion.div 
                className="inline-flex items-center space-x-2 bg-white/90 backdrop-blur-sm px-4 py-2 rounded-full shadow-lg border border-white/30 mb-8"
                initial={{ opacity: 0, y: -20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.1, duration: 0.6 }}
                whileHover={{ scale: 1.05, y: -2 }}
              >
                <Star className="w-4 h-4 text-yellow-500 fill-current" />
                <span className="text-sm font-semibold text-gray-700">Trusted by 10,000+ professionals</span>
                <div className="flex -space-x-1">
                  {[1, 2, 3, 4, 5].map((i) => (
                    <Star key={i} className="w-3 h-3 text-yellow-400 fill-current" />
                  ))}
                </div>
              </motion.div>
            </ClientOnly>

            {/* Main Headline */}
            <div className="mb-8">
              <h1 className="text-4xl sm:text-5xl lg:text-6xl xl:text-7xl font-bold text-gray-900 leading-tight mb-6">
                Accelerate Your
                <ClientOnly fallback={
                  <span className="block bg-gradient-to-r from-blue-600 via-purple-600 to-indigo-600 bg-clip-text text-transparent">
                    Career Growth
                  </span>
                }>
                  <motion.span 
                    className="block bg-gradient-to-r from-blue-600 via-purple-600 to-indigo-600 bg-clip-text text-transparent"
                    initial={{ opacity: 0, scale: 0.8 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ delay: 0.3, duration: 0.8, ease: 'easeOut' }}
                  >
                    Career Growth
                  </motion.span>
                </ClientOnly>
              </h1>
              
              <p className="text-xl sm:text-2xl text-gray-600 leading-relaxed max-w-2xl mx-auto lg:mx-0">
                Connect with industry experts through personalized mentorship programs or strategic advisory services.
              </p>
            </div>

            {/* Key Benefits */}
            <div className="flex flex-wrap justify-center lg:justify-start gap-4 mb-10">
              {[
                { icon: Users, text: '1-on-1 Expert Guidance', color: 'text-blue-600' },
                { icon: Target, text: 'Goal-Oriented Results', color: 'text-green-600' },
                { icon: Zap, text: 'Fast Career Growth', color: 'text-purple-600' }
              ].map((item, index) => (
                <ClientOnly key={index} fallback={
                  <div className="flex items-center space-x-2 bg-white/90 backdrop-blur-sm px-4 py-2 rounded-full shadow-md border border-white/30">
                    <item.icon className={`w-4 h-4 ${item.color}`} />
                    <span className="text-gray-700 font-medium text-sm">{item.text}</span>
                  </div>
                }>
                  <motion.div 
                    className="flex items-center space-x-2 bg-white/90 backdrop-blur-sm px-4 py-2 rounded-full shadow-md border border-white/30"
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.5 + index * 0.1, duration: 0.5 }}
                    whileHover={{ scale: 1.05, y: -2 }}
                  >
                    <item.icon className={`w-4 h-4 ${item.color}`} />
                    <span className="text-gray-700 font-medium text-sm">{item.text}</span>
                  </motion.div>
                </ClientOnly>
              ))}
            </div>

            {/* CTA Buttons */}
            <div className="flex flex-col sm:flex-row gap-4 justify-center lg:justify-start mb-12">
              <ClientOnly fallback={
                <Link 
                  href="#services"
                  className="inline-flex items-center justify-center px-8 py-4 bg-gradient-to-r from-blue-600 to-purple-600 text-white font-semibold rounded-xl shadow-xl hover:shadow-2xl transition-all duration-300 space-x-2"
                >
                  <span>Start Your Journey</span>
                  <ArrowRight className="w-5 h-5" />
                </Link>
              }>
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.8, duration: 0.6 }}
                  whileHover={{ scale: 1.05, y: -2 }}
                  whileTap={{ scale: 0.98 }}
                >
                  <Link 
                    href="#services"
                    className="group inline-flex items-center justify-center px-8 py-4 bg-gradient-to-r from-blue-600 to-purple-600 text-white font-semibold rounded-xl shadow-xl hover:shadow-2xl transition-all duration-300 space-x-2 relative overflow-hidden"
                  >
                    <motion.div
                      className="absolute inset-0 bg-gradient-to-r from-purple-600 to-blue-600 opacity-0 group-hover:opacity-100 transition-opacity duration-300"
                    />
                    <span className="relative z-10">Start Your Journey</span>
                    <motion.div
                      className="relative z-10"
                      animate={{ x: [0, 4, 0] }}
                      transition={{ duration: 2, repeat: Infinity, ease: 'easeInOut' }}
                    >
                      <ArrowRight className="w-5 h-5" />
                    </motion.div>
                  </Link>
                </motion.div>
              </ClientOnly>
              
              <ClientOnly fallback={
                <button className="inline-flex items-center justify-center px-8 py-4 border-2 border-gray-300 text-gray-700 font-semibold rounded-xl bg-white/80 backdrop-blur-sm hover:border-blue-600 hover:text-blue-600 transition-all duration-300 space-x-2">
                  <Play className="w-5 h-5" />
                  <span>Watch Demo</span>
                </button>
              }>
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 1.0, duration: 0.6 }}
                  whileHover={{ scale: 1.05, y: -2 }}
                  whileTap={{ scale: 0.98 }}
                >
                  <button className="group inline-flex items-center justify-center px-8 py-4 border-2 border-gray-300 text-gray-700 font-semibold rounded-xl bg-white/80 backdrop-blur-sm hover:border-blue-600 hover:text-blue-600 transition-all duration-300 space-x-2">
                    <Play className="w-5 h-5 group-hover:text-blue-600 transition-colors" />
                    <span>Watch Demo</span>
                  </button>
                </motion.div>
              </ClientOnly>
            </div>


            {/* Social Proof Stats */}
            <ClientOnly fallback={
              <div className="grid grid-cols-3 gap-8 text-center">
                <div>
                  <div className="text-3xl font-bold text-gray-900">10,000+</div>
                  <div className="text-gray-600 text-sm">Professionals</div>
                </div>
                <div>
                  <div className="text-3xl font-bold text-gray-900">500+</div>
                  <div className="text-gray-600 text-sm">Expert Mentors</div>
                </div>
                <div>
                  <div className="text-3xl font-bold text-gray-900">95%</div>
                  <div className="text-gray-600 text-sm">Success Rate</div>
                </div>
              </div>
            }>
              <motion.div 
                className="grid grid-cols-3 gap-8 text-center"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 1.2, duration: 0.6 }}
              >
                {[
                  { number: "10,000+", label: "Professionals", delay: 1.4 },
                  { number: "500+", label: "Expert Mentors", delay: 1.6 },
                  { number: "95%", label: "Success Rate", delay: 1.8 }
                ].map((stat, index) => (
                  <div key={index}>
                    <motion.div 
                      className="text-3xl font-bold text-gray-900"
                      initial={{ opacity: 0, scale: 0 }}
                      animate={{ opacity: 1, scale: 1 }}
                      transition={{ delay: stat.delay, duration: 0.5, type: "spring" }}
                    >
                      {stat.number}
                    </motion.div>
                    <div className="text-gray-600 text-sm">{stat.label}</div>
                  </div>
                ))}
              </motion.div>
            </ClientOnly>
          </div>

          {/* Right Column - Visual */}
          <div className="relative">
            <ClientOnly fallback={
              <div className="relative w-full h-96 lg:h-[500px] bg-gradient-to-br from-blue-100 to-purple-100 rounded-3xl shadow-2xl flex items-center justify-center">
                <div className="text-gray-500 text-xl font-medium">Hero Visual</div>
              </div>
            }>
              <motion.div 
                className="relative w-full h-96 lg:h-[500px]"
                initial={{ opacity: 0, x: 50 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.6, duration: 0.8 }}
              >
                {/* Main Card */}
                <motion.div 
                  className="absolute inset-0 bg-gradient-to-br from-white to-blue-50 rounded-3xl shadow-2xl border border-white/50 p-8"
                  whileHover={{ y: -5, rotateY: 5 }}
                  transition={{ duration: 0.3 }}
                >
                  <div className="h-full flex flex-col justify-between">
                    {/* Header */}
                    <div>
                      <div className="flex items-center space-x-3 mb-6">
                        <div className="w-12 h-12 bg-gradient-to-r from-blue-600 to-purple-600 rounded-xl flex items-center justify-center">
                          <Users className="w-6 h-6 text-white" />
                        </div>
                        <div>
                          <h3 className="font-bold text-gray-900">Mentorship Program</h3>
                          <p className="text-gray-600 text-sm">1-on-1 Expert Guidance</p>
                        </div>
                      </div>

                      {/* Progress */}
                      <div className="mb-6">
                        <div className="flex justify-between text-sm mb-2">
                          <span className="text-gray-600">Career Progress</span>
                          <span className="font-semibold text-green-600">85%</span>
                        </div>
                        <div className="w-full bg-gray-200 rounded-full h-2">
                          <motion.div 
                            className="bg-gradient-to-r from-green-400 to-blue-500 h-2 rounded-full"
                            initial={{ width: 0 }}
                            animate={{ width: '85%' }}
                            transition={{ delay: 1.5, duration: 1.5, ease: 'easeOut' }}
                          />
                        </div>
                      </div>

                      {/* Features */}
                      <div className="space-y-3">
                        {[
                          'Weekly 1-on-1 sessions',
                          'Personalized roadmap',
                          'Industry connections',
                          'Career advancement'
                        ].map((feature, index) => (
                          <motion.div 
                            key={index}
                            className="flex items-center space-x-2"
                            initial={{ opacity: 0, x: -20 }}
                            animate={{ opacity: 1, x: 0 }}
                            transition={{ delay: 1.8 + index * 0.1, duration: 0.5 }}
                          >
                            <CheckCircle className="w-4 h-4 text-green-500" />
                            <span className="text-gray-700 text-sm">{feature}</span>
                          </motion.div>
                        ))}
                      </div>
                    </div>

                    {/* Bottom */}
                    <div className="pt-6 border-t border-gray-200">
                      <div className="flex items-center justify-between">
                        <div className="flex -space-x-2">
                          {[1, 2, 3].map((i) => (
                            <div key={i} className="w-8 h-8 bg-gradient-to-r from-blue-400 to-purple-400 rounded-full border-2 border-white flex items-center justify-center">
                              <span className="text-white text-xs font-semibold">M{i}</span>
                            </div>
                          ))}
                        </div>
                        <div className="text-right">
                          <div className="text-2xl font-bold text-gray-900">$299</div>
                          <div className="text-gray-600 text-sm">/month</div>
                        </div>
                      </div>
                    </div>
                  </div>
                </motion.div>

                {/* Floating Elements */}
                <motion.div
                  className="absolute -top-4 -right-4 w-16 h-16 bg-yellow-400 rounded-2xl flex items-center justify-center shadow-lg"
                  animate={{ 
                    y: [0, -10, 0],
                    rotate: [0, 5, 0]
                  }}
                  transition={{ 
                    duration: 3,
                    repeat: Infinity,
                    ease: 'easeInOut'
                  }}
                >
                  <Star className="w-8 h-8 text-white fill-current" />
                </motion.div>

                <motion.div
                  className="absolute -bottom-4 -left-4 w-12 h-12 bg-green-500 rounded-xl flex items-center justify-center shadow-lg"
                  animate={{ 
                    y: [0, 10, 0],
                    rotate: [0, -5, 0]
                  }}
                  transition={{ 
                    duration: 4,
                    repeat: Infinity,
                    ease: 'easeInOut',
                    delay: 1
                  }}
                >
                  <CheckCircle className="w-6 h-6 text-white" />
                </motion.div>
              </motion.div>
            </ClientOnly>
          </div>
        </div>
      </div>
    </section>
  )
}