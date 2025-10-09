'use client'

import Link from 'next/link'
import { Star, Quote, ArrowRight, Users, TrendingUp } from 'lucide-react'
import { motion } from 'framer-motion'
import ClientOnly from '@/components/animations/ClientOnly'

export default function TestimonialsSection() {
  const testimonials = [
    {
      name: "Sarah Chen",
      role: "Senior Software Engineer",
      company: "Google",
      image: "/api/placeholder/64/64",
      content: "The mentorship program completely transformed my career trajectory. Within 6 months, I was promoted to senior engineer and gained the confidence to lead cross-functional teams.",
      rating: 5,
      achievement: "Promoted to Senior Engineer",
      timeframe: "6 months"
    },
    {
      name: "Marcus Rodriguez",
      role: "Product Manager",
      company: "Stripe",
      image: "/api/placeholder/64/64",
      content: "The strategic advisory sessions helped me navigate a complex product launch. The insights were invaluable and directly contributed to our 40% increase in user adoption.",
      rating: 5,
      achievement: "40% User Growth",
      timeframe: "3 months"
    },
    {
      name: "Emily Watson",
      role: "Startup Founder",
      company: "TechFlow",
      image: "/api/placeholder/64/64",
      content: "Having an experienced mentor during my startup journey was game-changing. The guidance helped me secure Series A funding and build a world-class team.",
      rating: 5,
      achievement: "Series A Funded",
      timeframe: "8 months"
    }
  ]

  const stats = [
    { number: "95%", label: "Success Rate", icon: TrendingUp },
    { number: "10k+", label: "Professionals Mentored", icon: Users },
    { number: "5/5", label: "Average Rating", icon: Star }
  ]

  return (
    <section className="py-16 sm:py-20 lg:py-32 bg-gradient-to-br from-gray-50 to-blue-50 relative overflow-hidden">
      {/* Background Elements */}
      <ClientOnly>
        <div className="absolute inset-0 overflow-hidden">
          <motion.div
            className="absolute top-20 left-4 sm:left-10 w-24 sm:w-32 h-24 sm:h-32 bg-blue-200 rounded-full mix-blend-multiply filter blur-xl opacity-30"
            animate={{
              x: [0, 50, 0],
              y: [0, -30, 0],
            }}
            transition={{
              duration: 15,
              repeat: Infinity,
              ease: "linear"
            }}
          />
          <motion.div
            className="absolute bottom-20 right-4 sm:right-10 w-32 sm:w-40 h-32 sm:h-40 bg-purple-200 rounded-full mix-blend-multiply filter blur-xl opacity-30"
            animate={{
              x: [0, -40, 0],
              y: [0, 40, 0],
            }}
            transition={{
              duration: 18,
              repeat: Infinity,
              ease: "linear"
            }}
          />
        </div>
      </ClientOnly>

      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Section Header */}
        <div className="text-center mb-12 sm:mb-16">
          <ClientOnly fallback={
            <div className="inline-flex items-center space-x-2 bg-white/80 backdrop-blur-sm px-4 py-2 rounded-full mb-6 shadow-lg">
              <Quote className="w-4 h-4 text-blue-600" />
              <span className="text-blue-600 font-medium text-sm">Success Stories</span>
            </div>
          }>
            <motion.div 
              className="inline-flex items-center space-x-2 bg-white/80 backdrop-blur-sm px-4 py-2 rounded-full mb-6 shadow-lg"
              initial={{ opacity: 0, y: -20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              whileHover={{ scale: 1.05 }}
            >
              <Quote className="w-4 h-4 text-blue-600" />
              <span className="text-blue-600 font-medium text-sm">Success Stories</span>
            </motion.div>
          </ClientOnly>
          
          <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-gray-900 mb-4 sm:mb-6 px-4 sm:px-0">
            Transforming Careers,
            <span className="block bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
              One Success at a Time
            </span>
          </h2>
          <p className="text-lg sm:text-xl text-gray-600 max-w-3xl mx-auto px-4 sm:px-0">
            Join thousands of professionals who have accelerated their careers 
            through our mentorship and advisory programs.
          </p>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 sm:gap-8 mb-12 sm:mb-16">
          {stats.map((stat, index) => {
            const Icon = stat.icon
            return (
              <ClientOnly key={index} fallback={
                <div className="text-center bg-white/80 backdrop-blur-sm rounded-2xl p-6 shadow-lg border border-white/50">
                  <div className="w-10 h-10 sm:w-12 sm:h-12 bg-gradient-to-r from-blue-600 to-purple-600 rounded-xl flex items-center justify-center mx-auto mb-4">
                    <Icon className="w-5 h-5 sm:w-6 sm:h-6 text-white" />
                  </div>
                  <div className="text-2xl sm:text-3xl font-bold text-gray-900 mb-2">
                    {stat.number}
                  </div>
                  <div className="text-gray-600 font-medium text-sm sm:text-base">{stat.label}</div>
                </div>
              }>
                <motion.div
                  className="text-center bg-white/80 backdrop-blur-sm rounded-2xl p-6 shadow-lg border border-white/50"
                  initial={{ opacity: 0, y: 40 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: index * 0.1, duration: 0.6 }}
                  whileHover={{ y: -5, scale: 1.02 }}
                >
                  <motion.div
                    className="w-10 h-10 sm:w-12 sm:h-12 bg-gradient-to-r from-blue-600 to-purple-600 rounded-xl flex items-center justify-center mx-auto mb-4"
                    whileHover={{ rotate: 5, scale: 1.1 }}
                  >
                    <Icon className="w-5 h-5 sm:w-6 sm:h-6 text-white" />
                  </motion.div>
                  <motion.div 
                    className="text-2xl sm:text-3xl font-bold text-gray-900 mb-2"
                    initial={{ opacity: 0, scale: 0 }}
                    whileInView={{ opacity: 1, scale: 1 }}
                    transition={{ delay: index * 0.2, duration: 0.5, type: "spring" }}
                    viewport={{ once: true }}
                  >
                    {stat.number}
                  </motion.div>
                  <div className="text-gray-600 font-medium text-sm sm:text-base">{stat.label}</div>
                </motion.div>
              </ClientOnly>
            )
          })}
        </div>

        {/* Testimonials Grid */}
        <div className="grid lg:grid-cols-3 gap-6 sm:gap-8 mb-12 sm:mb-16">
          {testimonials.map((testimonial, index) => (
            <ClientOnly key={index} fallback={
              <div className="bg-white/90 backdrop-blur-sm rounded-2xl sm:rounded-3xl p-6 sm:p-8 shadow-lg border border-white/50">
                <div className="w-10 h-10 sm:w-12 sm:h-12 bg-gradient-to-r from-blue-600 to-purple-600 rounded-2xl flex items-center justify-center mb-6">
                  <Quote className="w-5 h-5 sm:w-6 sm:h-6 text-white" />
                </div>
                <div className="flex items-center space-x-1 mb-4">
                  {[...Array(testimonial.rating)].map((_, i) => (
                    <Star key={i} className="w-4 h-4 sm:w-5 sm:h-5 text-yellow-400 fill-current" />
                  ))}
                </div>
                <blockquote className="text-gray-700 mb-6 leading-relaxed text-sm sm:text-base">
                  "{testimonial.content}"
                </blockquote>
                <div className="bg-gradient-to-r from-green-50 to-blue-50 rounded-xl p-3 mb-6 border border-green-100">
                  <div className="flex items-center justify-between">
                    <div>
                      <div className="font-semibold text-green-800 text-xs sm:text-sm">Achievement</div>
                      <div className="text-green-600 font-medium text-sm sm:text-base">{testimonial.achievement}</div>
                    </div>
                    <div className="text-right">
                      <div className="text-gray-500 text-xs">Timeline</div>
                      <div className="text-gray-700 font-medium text-xs sm:text-sm">{testimonial.timeframe}</div>
                    </div>
                  </div>
                </div>
                <div className="flex items-center space-x-4">
                  <div className="w-10 h-10 sm:w-12 sm:h-12 bg-gradient-to-r from-blue-400 to-purple-400 rounded-full flex items-center justify-center">
                    <span className="text-white font-semibold text-sm sm:text-lg">
                      {testimonial.name.split(' ').map(n => n[0]).join('')}
                    </span>
                  </div>
                  <div>
                    <div className="font-semibold text-gray-900 text-sm sm:text-base">{testimonial.name}</div>
                    <div className="text-gray-600 text-xs sm:text-sm">{testimonial.role}</div>
                    <div className="text-blue-600 text-xs sm:text-sm font-medium">{testimonial.company}</div>
                  </div>
                </div>
              </div>
            }>
              <motion.div
                className="group bg-white/90 backdrop-blur-sm rounded-2xl sm:rounded-3xl p-6 sm:p-8 shadow-lg border border-white/50 hover:shadow-2xl transition-all duration-300"
                initial={{ opacity: 0, y: 40 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.1, duration: 0.6 }}
                whileHover={{ y: -8, scale: 1.02 }}
              >
                {/* Quote Icon */}
                <motion.div 
                  className="w-10 h-10 sm:w-12 sm:h-12 bg-gradient-to-r from-blue-600 to-purple-600 rounded-2xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform duration-300"
                  whileHover={{ rotate: 10 }}
                >
                  <Quote className="w-5 h-5 sm:w-6 sm:h-6 text-white" />
                </motion.div>

                {/* Rating */}
                <div className="flex items-center space-x-1 mb-4">
                  {[...Array(testimonial.rating)].map((_, i) => (
                    <motion.div
                      key={i}
                      initial={{ opacity: 0, scale: 0 }}
                      whileInView={{ opacity: 1, scale: 1 }}
                      transition={{ delay: i * 0.1, duration: 0.3 }}
                      viewport={{ once: true }}
                    >
                      <Star className="w-4 h-4 sm:w-5 sm:h-5 text-yellow-400 fill-current" />
                    </motion.div>
                  ))}
                </div>

                {/* Content */}
                <blockquote className="text-gray-700 mb-6 leading-relaxed text-sm sm:text-base">
                  "{testimonial.content}"
                </blockquote>

                {/* Achievement Badge */}
                <motion.div 
                  className="bg-gradient-to-r from-green-50 to-blue-50 rounded-xl p-3 mb-6 border border-green-100"
                  whileHover={{ scale: 1.02 }}
                >
                  <div className="flex items-center justify-between">
                    <div>
                      <div className="font-semibold text-green-800 text-xs sm:text-sm">Achievement</div>
                      <div className="text-green-600 font-medium text-sm sm:text-base">{testimonial.achievement}</div>
                    </div>
                    <div className="text-right">
                      <div className="text-gray-500 text-xs">Timeline</div>
                      <div className="text-gray-700 font-medium text-xs sm:text-sm">{testimonial.timeframe}</div>
                    </div>
                  </div>
                </motion.div>

                {/* Author */}
                <div className="flex items-center space-x-4">
                  <motion.div 
                    className="w-10 h-10 sm:w-12 sm:h-12 bg-gradient-to-r from-blue-400 to-purple-400 rounded-full flex items-center justify-center"
                    whileHover={{ scale: 1.1 }}
                  >
                    <span className="text-white font-semibold text-sm sm:text-lg">
                      {testimonial.name.split(' ').map(n => n[0]).join('')}
                    </span>
                  </motion.div>
                  <div>
                    <div className="font-semibold text-gray-900 text-sm sm:text-base">{testimonial.name}</div>
                    <div className="text-gray-600 text-xs sm:text-sm">{testimonial.role}</div>
                    <div className="text-blue-600 text-xs sm:text-sm font-medium">{testimonial.company}</div>
                  </div>
                </div>
              </motion.div>
            </ClientOnly>
          ))}
        </div>

        {/* CTA Section */}
        <div className="text-center">
          <ClientOnly fallback={
            <div className="bg-gradient-to-r from-blue-600 to-purple-600 rounded-2xl sm:rounded-3xl p-6 sm:p-8 lg:p-12 text-white relative overflow-hidden max-w-4xl mx-auto">
              <div className="relative z-10">
                <h3 className="text-2xl sm:text-3xl lg:text-4xl font-bold mb-4">
                  Ready to Transform Your Career?
                </h3>
                <p className="text-lg sm:text-xl mb-6 sm:mb-8 opacity-90 max-w-2xl mx-auto">
                  Join thousands of professionals who have accelerated their growth 
                  with our expert mentorship and advisory services.
                </p>
                
                <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
                  <Link
                    href="/register?service=mentorship"
                    className="w-full sm:w-auto bg-white text-blue-600 px-6 sm:px-8 py-3 sm:py-4 rounded-xl font-semibold hover:bg-gray-50 transition-colors flex items-center justify-center space-x-2 shadow-lg"
                  >
                    <span>Start Mentorship Program</span>
                    <ArrowRight className="w-4 h-4 sm:w-5 sm:h-5" />
                  </Link>
                  
                  <Link
                    href="/register?service=advisory"
                    className="w-full sm:w-auto border-2 border-white text-white px-6 sm:px-8 py-3 sm:py-4 rounded-xl font-semibold hover:bg-white hover:text-blue-600 transition-all duration-300 flex items-center justify-center space-x-2"
                  >
                    <span>Book Advisory Session</span>
                    <ArrowRight className="w-4 h-4 sm:w-5 sm:h-5" />
                  </Link>
                </div>
              </div>
            </div>
          }>
            <motion.div 
              className="bg-gradient-to-r from-blue-600 to-purple-600 rounded-2xl sm:rounded-3xl p-6 sm:p-8 lg:p-12 text-white relative overflow-hidden max-w-4xl mx-auto"
              initial={{ opacity: 0, y: 40 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: 0.4, duration: 0.6 }}
              whileHover={{ scale: 1.02 }}
            >
              {/* Background Pattern */}
              <div className="absolute inset-0 opacity-10">
                <div className="absolute inset-0" style={{
                  backgroundImage: `url("data:image/svg+xml,%3Csvg width='40' height='40' viewBox='0 0 40 40' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='%23ffffff' fill-opacity='1'%3E%3Cpath d='M20 20c0-5.5-4.5-10-10-10s-10 4.5-10 10 4.5 10 10 10 10-4.5 10-10zm10 0c0-5.5-4.5-10-10-10s-10 4.5-10 10 4.5 10 10 10 10-4.5 10-10z'/%3E%3C/g%3E%3C/svg%3E")`,
                }} />
              </div>

              <div className="relative z-10">
                <h3 className="text-2xl sm:text-3xl lg:text-4xl font-bold mb-4">
                  Ready to Transform Your Career?
                </h3>
                <p className="text-lg sm:text-xl mb-6 sm:mb-8 opacity-90 max-w-2xl mx-auto">
                  Join thousands of professionals who have accelerated their growth 
                  with our expert mentorship and advisory services.
                </p>
                
                <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
                  <motion.div
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    className="w-full sm:w-auto"
                  >
                    <Link
                      href="/register?service=mentorship"
                      className="w-full sm:w-auto bg-white text-blue-600 px-6 sm:px-8 py-3 sm:py-4 rounded-xl font-semibold hover:bg-gray-50 transition-colors flex items-center justify-center space-x-2 shadow-lg"
                    >
                      <span>Start Mentorship Program</span>
                      <ArrowRight className="w-4 h-4 sm:w-5 sm:h-5" />
                    </Link>
                  </motion.div>
                  
                  <motion.div
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    className="w-full sm:w-auto"
                  >
                    <Link
                      href="/register?service=advisory"
                      className="w-full sm:w-auto border-2 border-white text-white px-6 sm:px-8 py-3 sm:py-4 rounded-xl font-semibold hover:bg-white hover:text-blue-600 transition-all duration-300 flex items-center justify-center space-x-2"
                    >
                      <span>Book Advisory Session</span>
                      <ArrowRight className="w-4 h-4 sm:w-5 sm:h-5" />
                    </Link>
                  </motion.div>
                </div>
              </div>
            </motion.div>
          </ClientOnly>
        </div>
      </div>
    </section>
  )
}