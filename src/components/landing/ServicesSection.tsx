'use client'

import Link from 'next/link'
import { ArrowRight, Users, Target, Clock, CheckCircle, Star, Zap } from 'lucide-react'
import { motion } from 'framer-motion'
import ClientOnly from '@/components/animations/ClientOnly'

export default function ServicesSection() {
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
    <section id="services" className="py-16 sm:py-20 lg:py-32 bg-white relative overflow-hidden">
      {/* Background Pattern */}
      <div className="absolute inset-0 opacity-5">
        <div className="absolute inset-0" style={{
          backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23000000' fill-opacity='1'%3E%3Ccircle cx='30' cy='30' r='2'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`,
        }} />
      </div>

      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Section Header */}
        <div className="text-center mb-12 sm:mb-16">
          <ClientOnly fallback={
            <div className="inline-flex items-center space-x-2 bg-blue-50 px-4 py-2 rounded-full mb-6">
              <Zap className="w-4 h-4 text-blue-600" />
              <span className="text-blue-600 font-medium text-sm">Our Services</span>
            </div>
          }>
            <motion.div 
              className="inline-flex items-center space-x-2 bg-blue-50 px-4 py-2 rounded-full mb-6"
              initial={{ opacity: 0, y: -20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              whileHover={{ scale: 1.05 }}
            >
              <Zap className="w-4 h-4 text-blue-600" />
              <span className="text-blue-600 font-medium text-sm">Our Services</span>
            </motion.div>
          </ClientOnly>
          
          <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-gray-900 mb-4 sm:mb-6 px-4 sm:px-0">
            Choose Your Path to
            <span className="block bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
              Professional Growth
            </span>
          </h2>
          <p className="text-lg sm:text-xl text-gray-600 max-w-3xl mx-auto px-4 sm:px-0">
            Whether you need ongoing mentorship or strategic advisory support, 
            we have the perfect solution to accelerate your career.
          </p>
        </div>

        {/* Services Grid */}
        <div className="grid lg:grid-cols-2 gap-6 sm:gap-8 lg:gap-12">
          {/* Mentorship Program */}
          <ClientOnly fallback={
            <div className="bg-gradient-to-br from-blue-50 to-indigo-50 rounded-2xl sm:rounded-3xl p-6 sm:p-8 lg:p-10 border border-blue-100">
              <div className="bg-blue-600 text-white px-4 py-2 rounded-full text-sm font-semibold shadow-lg mb-6 inline-block">
                Most Popular
              </div>
              <div className="flex items-center mb-6">
                <div className="w-12 h-12 sm:w-16 sm:h-16 bg-blue-600 rounded-2xl flex items-center justify-center mr-4">
                  <Users className="w-6 h-6 sm:w-8 sm:h-8 text-white" />
                </div>
                <div>
                  <h3 className="text-xl sm:text-2xl font-bold text-gray-900">Mentorship Programs</h3>
                  <p className="text-blue-600 font-medium text-sm sm:text-base">Long-term Growth Partnership</p>
                </div>
              </div>
              <p className="text-gray-600 mb-6 sm:mb-8 text-base sm:text-lg leading-relaxed">
                Get paired with an industry expert for ongoing guidance, skill development, 
                and career advancement through structured mentorship sessions.
              </p>
              <div className="space-y-3 sm:space-y-4 mb-6 sm:mb-8">
                {mentorshipFeatures.map((feature, index) => (
                  <div key={index} className="flex items-center space-x-3">
                    <CheckCircle className="w-4 h-4 sm:w-5 sm:h-5 text-green-500 flex-shrink-0" />
                    <span className="text-gray-700 text-sm sm:text-base">{feature}</span>
                  </div>
                ))}
              </div>
              <div className="bg-white/80 backdrop-blur-sm rounded-2xl p-4 sm:p-6 mb-6 sm:mb-8 border border-white/50">
                <div className="flex items-center justify-between mb-4">
                  <span className="text-gray-600">Starting from</span>
                  <div className="flex items-center space-x-1">
                    {[1, 2, 3, 4, 5].map((i) => (
                      <Star key={i} className="w-3 h-3 sm:w-4 sm:h-4 text-yellow-400 fill-current" />
                    ))}
                    <span className="text-xs sm:text-sm text-gray-600 ml-2">(4.9/5)</span>
                  </div>
                </div>
                <div className="flex items-baseline space-x-2">
                  <span className="text-2xl sm:text-3xl font-bold text-gray-900">$199</span>
                  <span className="text-gray-600">/month</span>
                </div>
              </div>
              <Link
                href="/register?service=mentorship"
                className="w-full bg-blue-600 text-white py-3 sm:py-4 px-6 rounded-xl font-semibold hover:bg-blue-700 transition-all duration-300 flex items-center justify-center space-x-2 shadow-lg hover:shadow-xl"
              >
                <span>Start Mentorship Journey</span>
                <ArrowRight className="w-4 h-4 sm:w-5 sm:h-5" />
              </Link>
            </div>
          }>
            <motion.div 
              className="group relative bg-gradient-to-br from-blue-50 to-indigo-50 rounded-2xl sm:rounded-3xl p-6 sm:p-8 lg:p-10 border border-blue-100 hover:border-blue-200 transition-all duration-300"
              initial={{ opacity: 0, y: 40 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6, ease: "easeOut" }}
              whileHover={{ y: -8, scale: 1.02 }}
            >
              {/* Floating Badge */}
              <motion.div 
                className="absolute -top-3 sm:-top-4 left-6 sm:left-8 bg-blue-600 text-white px-3 sm:px-4 py-2 rounded-full text-xs sm:text-sm font-semibold shadow-lg"
                animate={{ y: [0, -2, 0] }}
                transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
              >
                Most Popular
              </motion.div>

              <div className="flex items-center mb-6">
                <motion.div 
                  className="w-12 h-12 sm:w-16 sm:h-16 bg-blue-600 rounded-2xl flex items-center justify-center mr-4 group-hover:scale-110 transition-transform duration-300"
                  whileHover={{ rotate: 5 }}
                >
                  <Users className="w-6 h-6 sm:w-8 sm:h-8 text-white" />
                </motion.div>
                <div>
                  <h3 className="text-xl sm:text-2xl font-bold text-gray-900">Mentorship Programs</h3>
                  <p className="text-blue-600 font-medium text-sm sm:text-base">Long-term Growth Partnership</p>
                </div>
              </div>

              <p className="text-gray-600 mb-6 sm:mb-8 text-base sm:text-lg leading-relaxed">
                Get paired with an industry expert for ongoing guidance, skill development, 
                and career advancement through structured mentorship sessions.
              </p>

              {/* Features */}
              <div className="space-y-3 sm:space-y-4 mb-6 sm:mb-8">
                {mentorshipFeatures.map((feature, index) => (
                  <motion.div 
                    key={index}
                    className="flex items-center space-x-3"
                    initial={{ opacity: 0, x: -20 }}
                    whileInView={{ opacity: 1, x: 0 }}
                    transition={{ delay: index * 0.1, duration: 0.5 }}
                    viewport={{ once: true }}
                  >
                    <CheckCircle className="w-4 h-4 sm:w-5 sm:h-5 text-green-500 flex-shrink-0" />
                    <span className="text-gray-700 text-sm sm:text-base">{feature}</span>
                  </motion.div>
                ))}
              </div>

              {/* Pricing Preview */}
              <div className="bg-white/80 backdrop-blur-sm rounded-2xl p-4 sm:p-6 mb-6 sm:mb-8 border border-white/50">
                <div className="flex items-center justify-between mb-4">
                  <span className="text-gray-600 text-sm sm:text-base">Starting from</span>
                  <div className="flex items-center space-x-1">
                    {[1, 2, 3, 4, 5].map((i) => (
                      <Star key={i} className="w-3 h-3 sm:w-4 sm:h-4 text-yellow-400 fill-current" />
                    ))}
                    <span className="text-xs sm:text-sm text-gray-600 ml-2">(4.9/5)</span>
                  </div>
                </div>
                <div className="flex items-baseline space-x-2">
                  <span className="text-2xl sm:text-3xl font-bold text-gray-900">$199</span>
                  <span className="text-gray-600">/month</span>
                </div>
              </div>

              <motion.div
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
              >
                <Link
                  href="/register?service=mentorship"
                  className="group w-full bg-blue-600 text-white py-3 sm:py-4 px-6 rounded-xl font-semibold hover:bg-blue-700 transition-all duration-300 flex items-center justify-center space-x-2 shadow-lg hover:shadow-xl"
                >
                  <span>Start Mentorship Journey</span>
                  <motion.div
                    animate={{ x: [0, 4, 0] }}
                    transition={{ duration: 1.5, repeat: Infinity, ease: 'easeInOut' }}
                  >
                    <ArrowRight className="w-4 h-4 sm:w-5 sm:h-5" />
                  </motion.div>
                </Link>
              </motion.div>
            </motion.div>
          </ClientOnly>

          {/* Advisory Services */}
          <ClientOnly fallback={
            <div className="bg-gradient-to-br from-purple-50 to-pink-50 rounded-2xl sm:rounded-3xl p-6 sm:p-8 lg:p-10 border border-purple-100">
              <div className="flex items-center mb-6">
                <div className="w-12 h-12 sm:w-16 sm:h-16 bg-purple-600 rounded-2xl flex items-center justify-center mr-4">
                  <Target className="w-6 h-6 sm:w-8 sm:h-8 text-white" />
                </div>
                <div>
                  <h3 className="text-xl sm:text-2xl font-bold text-gray-900">Advisory Services</h3>
                  <p className="text-purple-600 font-medium text-sm sm:text-base">Strategic Project Support</p>
                </div>
              </div>
              <p className="text-gray-600 mb-6 sm:mb-8 text-base sm:text-lg leading-relaxed">
                Get expert consultation for specific projects, strategic decisions, 
                or business challenges with our experienced advisory professionals.
              </p>
              <div className="space-y-3 sm:space-y-4 mb-6 sm:mb-8">
                {advisoryFeatures.map((feature, index) => (
                  <div key={index} className="flex items-center space-x-3">
                    <CheckCircle className="w-4 h-4 sm:w-5 sm:h-5 text-green-500 flex-shrink-0" />
                    <span className="text-gray-700 text-sm sm:text-base">{feature}</span>
                  </div>
                ))}
              </div>
              <div className="bg-white/80 backdrop-blur-sm rounded-2xl p-4 sm:p-6 mb-6 sm:mb-8 border border-white/50">
                <div className="flex items-center justify-between mb-4">
                  <span className="text-gray-600">Hourly rate</span>
                  <div className="flex items-center space-x-2">
                    <Clock className="w-3 h-3 sm:w-4 sm:h-4 text-purple-600" />
                    <span className="text-xs sm:text-sm text-gray-600">Flexible scheduling</span>
                  </div>
                </div>
                <div className="flex items-baseline space-x-2">
                  <span className="text-2xl sm:text-3xl font-bold text-gray-900">$150</span>
                  <span className="text-gray-600">/hour</span>
                </div>
              </div>
              <Link
                href="/register?service=advisory"
                className="w-full bg-purple-600 text-white py-3 sm:py-4 px-6 rounded-xl font-semibold hover:bg-purple-700 transition-all duration-300 flex items-center justify-center space-x-2 shadow-lg hover:shadow-xl"
              >
                <span>Book Advisory Session</span>
                <ArrowRight className="w-4 h-4 sm:w-5 sm:h-5" />
              </Link>
            </div>
          }>
            <motion.div 
              className="group relative bg-gradient-to-br from-purple-50 to-pink-50 rounded-2xl sm:rounded-3xl p-6 sm:p-8 lg:p-10 border border-purple-100 hover:border-purple-200 transition-all duration-300"
              initial={{ opacity: 0, y: 40 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6, ease: "easeOut", delay: 0.2 }}
              whileHover={{ y: -8, scale: 1.02 }}
            >
              <div className="flex items-center mb-6">
                <motion.div 
                  className="w-12 h-12 sm:w-16 sm:h-16 bg-purple-600 rounded-2xl flex items-center justify-center mr-4 group-hover:scale-110 transition-transform duration-300"
                  whileHover={{ rotate: -5 }}
                >
                  <Target className="w-6 h-6 sm:w-8 sm:h-8 text-white" />
                </motion.div>
                <div>
                  <h3 className="text-xl sm:text-2xl font-bold text-gray-900">Advisory Services</h3>
                  <p className="text-purple-600 font-medium text-sm sm:text-base">Strategic Project Support</p>
                </div>
              </div>

              <p className="text-gray-600 mb-6 sm:mb-8 text-base sm:text-lg leading-relaxed">
                Get expert consultation for specific projects, strategic decisions, 
                or business challenges with our experienced advisory professionals.
              </p>

              {/* Features */}
              <div className="space-y-3 sm:space-y-4 mb-6 sm:mb-8">
                {advisoryFeatures.map((feature, index) => (
                  <motion.div 
                    key={index}
                    className="flex items-center space-x-3"
                    initial={{ opacity: 0, x: -20 }}
                    whileInView={{ opacity: 1, x: 0 }}
                    transition={{ delay: index * 0.1, duration: 0.5 }}
                    viewport={{ once: true }}
                  >
                    <CheckCircle className="w-4 h-4 sm:w-5 sm:h-5 text-green-500 flex-shrink-0" />
                    <span className="text-gray-700 text-sm sm:text-base">{feature}</span>
                  </motion.div>
                ))}
              </div>

              {/* Pricing Preview */}
              <div className="bg-white/80 backdrop-blur-sm rounded-2xl p-4 sm:p-6 mb-6 sm:mb-8 border border-white/50">
                <div className="flex items-center justify-between mb-4">
                  <span className="text-gray-600 text-sm sm:text-base">Hourly rate</span>
                  <div className="flex items-center space-x-2">
                    <Clock className="w-3 h-3 sm:w-4 sm:h-4 text-purple-600" />
                    <span className="text-xs sm:text-sm text-gray-600">Flexible scheduling</span>
                  </div>
                </div>
                <div className="flex items-baseline space-x-2">
                  <span className="text-2xl sm:text-3xl font-bold text-gray-900">$150</span>
                  <span className="text-gray-600">/hour</span>
                </div>
              </div>

              <motion.div
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
              >
                <Link
                  href="/register?service=advisory"
                  className="group w-full bg-purple-600 text-white py-3 sm:py-4 px-6 rounded-xl font-semibold hover:bg-purple-700 transition-all duration-300 flex items-center justify-center space-x-2 shadow-lg hover:shadow-xl"
                >
                  <span>Book Advisory Session</span>
                  <motion.div
                    animate={{ x: [0, 4, 0] }}
                    transition={{ duration: 1.5, repeat: Infinity, ease: 'easeInOut' }}
                  >
                    <ArrowRight className="w-4 h-4 sm:w-5 sm:h-5" />
                  </motion.div>
                </Link>
              </motion.div>
            </motion.div>
          </ClientOnly>
        </div>

        {/* Bottom CTA */}
        <div className="text-center mt-12 sm:mt-16">
          <ClientOnly fallback={
            <div className="inline-flex flex-col sm:flex-row items-center space-y-4 sm:space-y-0 sm:space-x-4 bg-gradient-to-r from-blue-50 to-purple-50 px-6 sm:px-8 py-6 rounded-2xl border border-gray-200 max-w-2xl mx-auto">
              <div className="text-center sm:text-left">
                <div className="font-semibold text-gray-900">Not sure which service fits you?</div>
                <div className="text-gray-600 text-sm">Get a free consultation to find your perfect match</div>
              </div>
              <button className="bg-gradient-to-r from-blue-600 to-purple-600 text-white px-6 py-3 rounded-xl font-semibold whitespace-nowrap">
                Free Consultation
              </button>
            </div>
          }>
            <motion.div 
              className="inline-flex flex-col sm:flex-row items-center space-y-4 sm:space-y-0 sm:space-x-4 bg-gradient-to-r from-blue-50 to-purple-50 px-6 sm:px-8 py-6 rounded-2xl border border-gray-200 max-w-2xl mx-auto"
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: 0.4, duration: 0.6 }}
              whileHover={{ scale: 1.05, y: -2 }}
            >
              <div className="text-center sm:text-left">
                <div className="font-semibold text-gray-900">Not sure which service fits you?</div>
                <div className="text-gray-600 text-sm">Get a free consultation to find your perfect match</div>
              </div>
              <motion.button 
                className="bg-gradient-to-r from-blue-600 to-purple-600 text-white px-6 py-3 rounded-xl font-semibold hover:shadow-lg transition-all duration-300 whitespace-nowrap"
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                Free Consultation
              </motion.button>
            </motion.div>
          </ClientOnly>
        </div>
      </div>
    </section>
  )
}