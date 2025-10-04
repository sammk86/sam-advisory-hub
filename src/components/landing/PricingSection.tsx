'use client'

import Link from 'next/link'
import { Check, ArrowRight, Star, Zap, Crown, Users } from 'lucide-react'
import { motion } from 'framer-motion'
import ClientOnly from '@/components/animations/ClientOnly'

export default function PricingSection() {
  const mentorshipPlans = [
    {
      name: "Starter",
      price: 199,
      period: "month",
      description: "Perfect for early-career professionals",
      features: [
        "2 sessions per month (1 hour each)",
        "Email support between sessions",
        "Goal setting & progress tracking",
        "Resource recommendations",
        "Community access"
      ],
      popular: false,
      cta: "Get Started",
      href: "/register?service=mentorship&plan=starter",
      color: "blue"
    },
    {
      name: "Professional",
      price: 299,
      period: "month",
      description: "Most popular for mid-level professionals",
      features: [
        "4 sessions per month (1 hour each)",
        "Priority email & chat support",
        "Custom learning roadmap",
        "Industry connections",
        "Resume & LinkedIn review",
        "Mock interview sessions"
      ],
      popular: true,
      cta: "Start Pro Plan",
      href: "/register?service=mentorship&plan=pro",
      color: "purple"
    },
    {
      name: "Executive",
      price: 499,
      period: "month",
      description: "For senior professionals & leaders",
      features: [
        "Weekly sessions (1 hour each)",
        "24/7 priority support",
        "Leadership coaching",
        "Strategic career planning",
        "Executive network access",
        "Personal branding strategy",
        "Board preparation"
      ],
      popular: false,
      cta: "Go Executive",
      href: "/register?service=mentorship&plan=executive",
      color: "gold"
    }
  ]

  const advisoryPackages = [
    {
      name: "Project Sprint",
      price: 150,
      period: "hour",
      description: "Perfect for specific challenges",
      features: [
        "1-on-1 consultation",
        "Problem analysis",
        "Strategic recommendations",
        "Action plan delivery",
        "Follow-up email summary"
      ],
      cta: "Book Session",
      href: "/register?service=advisory&plan=hourly"
    },
    {
      name: "Strategic Package",
      price: 1200,
      period: "package",
      originalPrice: 1500,
      description: "Comprehensive project support",
      features: [
        "10 hours of consultation",
        "Multi-session engagement",
        "Detailed deliverables",
        "Implementation support",
        "3 months of follow-up"
      ],
      cta: "Choose Package",
      href: "/register?service=advisory&plan=package",
      popular: true
    }
  ]

  return (
    <section id="pricing" className="py-16 sm:py-20 lg:py-32 bg-white relative overflow-hidden">
      {/* Background Elements */}
      <ClientOnly>
        <div className="absolute inset-0 overflow-hidden">
          <motion.div
            className="absolute top-1/4 left-0 w-48 sm:w-64 h-48 sm:h-64 bg-gradient-to-r from-blue-200 to-purple-200 rounded-full mix-blend-multiply filter blur-xl opacity-20"
            animate={{
              x: [0, 100, 0],
              y: [0, -50, 0],
            }}
            transition={{
              duration: 20,
              repeat: Infinity,
              ease: "linear"
            }}
          />
          <motion.div
            className="absolute bottom-1/4 right-0 w-48 sm:w-64 h-48 sm:h-64 bg-gradient-to-r from-purple-200 to-pink-200 rounded-full mix-blend-multiply filter blur-xl opacity-20"
            animate={{
              x: [0, -100, 0],
              y: [0, 50, 0],
            }}
            transition={{
              duration: 25,
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
            <div className="inline-flex items-center space-x-2 bg-gradient-to-r from-blue-50 to-purple-50 px-4 py-2 rounded-full mb-6 border border-blue-100">
              <Crown className="w-4 h-4 text-purple-600" />
              <span className="text-purple-600 font-medium text-sm">Pricing Plans</span>
            </div>
          }>
            <motion.div 
              className="inline-flex items-center space-x-2 bg-gradient-to-r from-blue-50 to-purple-50 px-4 py-2 rounded-full mb-6 border border-blue-100"
              initial={{ opacity: 0, y: -20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              whileHover={{ scale: 1.05 }}
            >
              <Crown className="w-4 h-4 text-purple-600" />
              <span className="text-purple-600 font-medium text-sm">Pricing Plans</span>
            </motion.div>
          </ClientOnly>
          
          <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-gray-900 mb-4 sm:mb-6 px-4 sm:px-0">
            Invest in Your
            <span className="block bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
              Professional Future
            </span>
          </h2>
          <p className="text-lg sm:text-xl text-gray-600 max-w-3xl mx-auto px-4 sm:px-0">
            Choose the perfect plan to accelerate your career growth. 
            All plans include our satisfaction guarantee.
          </p>
        </div>

        {/* Mentorship Plans */}
        <div className="mb-16 sm:mb-20">
          <div className="text-center mb-8 sm:mb-12">
            <h3 className="text-2xl sm:text-3xl font-bold text-gray-900 mb-4">Mentorship Programs</h3>
            <p className="text-gray-600 max-w-2xl mx-auto px-4 sm:px-0">
              Long-term partnerships for sustained career growth and skill development
            </p>
          </div>

          <div className="grid lg:grid-cols-3 gap-6 sm:gap-8">
            {mentorshipPlans.map((plan, index) => (
              <ClientOnly key={index} fallback={
                <div className={`bg-white rounded-2xl sm:rounded-3xl p-6 sm:p-8 border-2 shadow-lg ${
                  plan.popular 
                    ? 'border-purple-200 shadow-2xl' 
                    : 'border-gray-200'
                }`}>
                  {plan.popular && (
                    <div className="bg-gradient-to-r from-purple-600 to-pink-600 text-white px-4 sm:px-6 py-2 rounded-full text-xs sm:text-sm font-semibold shadow-lg mb-6 inline-flex items-center">
                      <Star className="w-3 h-3 sm:w-4 sm:h-4 inline mr-1" />
                      Most Popular
                    </div>
                  )}
                  
                  <div className="text-center mb-6 sm:mb-8">
                    <div className={`w-12 h-12 sm:w-16 sm:h-16 mx-auto mb-4 rounded-2xl flex items-center justify-center ${
                      plan.color === 'purple' ? 'bg-gradient-to-r from-purple-600 to-pink-600' :
                      plan.color === 'gold' ? 'bg-gradient-to-r from-yellow-500 to-orange-500' :
                      'bg-gradient-to-r from-blue-600 to-indigo-600'
                    }`}>
                      {plan.color === 'gold' ? <Crown className="w-6 h-6 sm:w-8 sm:h-8 text-white" /> :
                       plan.color === 'purple' ? <Zap className="w-6 h-6 sm:w-8 sm:h-8 text-white" /> :
                       <Users className="w-6 h-6 sm:w-8 sm:h-8 text-white" />}
                    </div>
                    <h4 className="text-xl sm:text-2xl font-bold text-gray-900 mb-2">{plan.name}</h4>
                    <p className="text-gray-600 mb-4 text-sm sm:text-base">{plan.description}</p>
                    <div className="flex items-baseline justify-center space-x-2">
                      <span className="text-3xl sm:text-4xl font-bold text-gray-900">${plan.price}</span>
                      <span className="text-gray-600">/{plan.period}</span>
                    </div>
                  </div>

                  <div className="space-y-3 sm:space-y-4 mb-6 sm:mb-8">
                    {plan.features.map((feature, featureIndex) => (
                      <div key={featureIndex} className="flex items-center space-x-3">
                        <Check className="w-4 h-4 sm:w-5 sm:h-5 text-green-500 flex-shrink-0" />
                        <span className="text-gray-700 text-sm sm:text-base">{feature}</span>
                      </div>
                    ))}
                  </div>

                  <Link
                    href={plan.href}
                    className={`w-full py-3 sm:py-4 px-6 rounded-xl font-semibold transition-all duration-300 flex items-center justify-center space-x-2 shadow-lg hover:shadow-xl ${
                      plan.popular
                        ? 'bg-gradient-to-r from-purple-600 to-pink-600 text-white'
                        : 'bg-gray-900 text-white hover:bg-gray-800'
                    }`}
                  >
                    <span>{plan.cta}</span>
                    <ArrowRight className="w-4 h-4 sm:w-5 sm:h-5" />
                  </Link>
                </div>
              }>
                <motion.div
                  className={`group relative bg-white rounded-2xl sm:rounded-3xl p-6 sm:p-8 border-2 transition-all duration-300 ${
                    plan.popular 
                      ? 'border-purple-200 shadow-2xl scale-105' 
                      : 'border-gray-200 shadow-lg hover:shadow-xl hover:border-blue-200'
                  }`}
                  initial={{ opacity: 0, y: 40 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: index * 0.1, duration: 0.6 }}
                  whileHover={{ y: -8, scale: plan.popular ? 1.05 : 1.02 }}
                >
                  {/* Popular Badge */}
                  {plan.popular && (
                    <motion.div 
                      className="absolute -top-3 sm:-top-4 left-1/2 transform -translate-x-1/2 bg-gradient-to-r from-purple-600 to-pink-600 text-white px-4 sm:px-6 py-2 rounded-full text-xs sm:text-sm font-semibold shadow-lg"
                      animate={{ y: [0, -2, 0] }}
                      transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
                    >
                      <Star className="w-3 h-3 sm:w-4 sm:h-4 inline mr-1" />
                      Most Popular
                    </motion.div>
                  )}

                  {/* Plan Header */}
                  <div className="text-center mb-6 sm:mb-8">
                    <motion.div 
                      className={`w-12 h-12 sm:w-16 sm:h-16 mx-auto mb-4 rounded-2xl flex items-center justify-center ${
                        plan.color === 'purple' ? 'bg-gradient-to-r from-purple-600 to-pink-600' :
                        plan.color === 'gold' ? 'bg-gradient-to-r from-yellow-500 to-orange-500' :
                        'bg-gradient-to-r from-blue-600 to-indigo-600'
                      }`}
                      whileHover={{ rotate: 5, scale: 1.1 }}
                    >
                      {plan.color === 'gold' ? <Crown className="w-6 h-6 sm:w-8 sm:h-8 text-white" /> :
                       plan.color === 'purple' ? <Zap className="w-6 h-6 sm:w-8 sm:h-8 text-white" /> :
                       <Users className="w-6 h-6 sm:w-8 sm:h-8 text-white" />}
                    </motion.div>
                    <h4 className="text-xl sm:text-2xl font-bold text-gray-900 mb-2">{plan.name}</h4>
                    <p className="text-gray-600 mb-4 text-sm sm:text-base">{plan.description}</p>
                    <div className="flex items-baseline justify-center space-x-2">
                      <span className="text-3xl sm:text-4xl font-bold text-gray-900">${plan.price}</span>
                      <span className="text-gray-600">/{plan.period}</span>
                    </div>
                  </div>

                  {/* Features */}
                  <div className="space-y-3 sm:space-y-4 mb-6 sm:mb-8">
                    {plan.features.map((feature, featureIndex) => (
                      <motion.div 
                        key={featureIndex}
                        className="flex items-center space-x-3"
                        initial={{ opacity: 0, x: -20 }}
                        whileInView={{ opacity: 1, x: 0 }}
                        transition={{ delay: featureIndex * 0.1, duration: 0.5 }}
                        viewport={{ once: true }}
                      >
                        <Check className="w-4 h-4 sm:w-5 sm:h-5 text-green-500 flex-shrink-0" />
                        <span className="text-gray-700 text-sm sm:text-base">{feature}</span>
                      </motion.div>
                    ))}
                  </div>

                  {/* CTA Button */}
                  <motion.div
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                  >
                    <Link
                      href={plan.href}
                      className={`group w-full py-3 sm:py-4 px-6 rounded-xl font-semibold transition-all duration-300 flex items-center justify-center space-x-2 ${
                        plan.popular
                          ? 'bg-gradient-to-r from-purple-600 to-pink-600 text-white shadow-lg hover:shadow-xl'
                          : 'bg-gray-900 text-white hover:bg-gray-800 shadow-lg hover:shadow-xl'
                      }`}
                    >
                      <span>{plan.cta}</span>
                      <ArrowRight className="w-4 h-4 sm:w-5 sm:h-5 group-hover:translate-x-1 transition-transform" />
                    </Link>
                  </motion.div>
                </motion.div>
              </ClientOnly>
            ))}
          </div>
        </div>

        {/* Advisory Services */}
        <div>
          <div className="text-center mb-8 sm:mb-12">
            <h3 className="text-2xl sm:text-3xl font-bold text-gray-900 mb-4">Advisory Services</h3>
            <p className="text-gray-600 max-w-2xl mx-auto px-4 sm:px-0">
              Flexible consultation options for specific projects and strategic guidance
            </p>
          </div>

          <div className="grid lg:grid-cols-2 gap-6 sm:gap-8 max-w-4xl mx-auto">
            {advisoryPackages.map((pkg, index) => (
              <ClientOnly key={index} fallback={
                <div className={`bg-gradient-to-br from-gray-50 to-blue-50 rounded-2xl sm:rounded-3xl p-6 sm:p-8 border-2 shadow-lg ${
                  pkg.popular 
                    ? 'border-blue-200 shadow-2xl' 
                    : 'border-gray-200'
                }`}>
                  {pkg.popular && (
                    <div className="bg-blue-600 text-white px-4 py-2 rounded-full text-xs sm:text-sm font-semibold shadow-lg mb-6 inline-block">
                      Best Value
                    </div>
                  )}

                  <div className="text-center mb-6 sm:mb-8">
                    <h4 className="text-xl sm:text-2xl font-bold text-gray-900 mb-2">{pkg.name}</h4>
                    <p className="text-gray-600 mb-4 text-sm sm:text-base">{pkg.description}</p>
                    <div className="flex items-baseline justify-center space-x-2">
                      {pkg.originalPrice && (
                        <span className="text-base sm:text-lg text-gray-400 line-through">${pkg.originalPrice}</span>
                      )}
                      <span className="text-3xl sm:text-4xl font-bold text-gray-900">${pkg.price}</span>
                      <span className="text-gray-600">/{pkg.period}</span>
                    </div>
                    {pkg.originalPrice && (
                      <div className="text-green-600 font-semibold text-sm mt-2">
                        Save ${pkg.originalPrice - pkg.price}!
                      </div>
                    )}
                  </div>

                  <div className="space-y-3 sm:space-y-4 mb-6 sm:mb-8">
                    {pkg.features.map((feature, featureIndex) => (
                      <div key={featureIndex} className="flex items-center space-x-3">
                        <Check className="w-4 h-4 sm:w-5 sm:h-5 text-green-500 flex-shrink-0" />
                        <span className="text-gray-700 text-sm sm:text-base">{feature}</span>
                      </div>
                    ))}
                  </div>

                  <Link
                    href={pkg.href}
                    className="w-full bg-blue-600 text-white py-3 sm:py-4 px-6 rounded-xl font-semibold hover:bg-blue-700 transition-all duration-300 flex items-center justify-center space-x-2 shadow-lg hover:shadow-xl"
                  >
                    <span>{pkg.cta}</span>
                    <ArrowRight className="w-4 h-4 sm:w-5 sm:h-5" />
                  </Link>
                </div>
              }>
                <motion.div
                  className={`group relative bg-gradient-to-br from-gray-50 to-blue-50 rounded-2xl sm:rounded-3xl p-6 sm:p-8 border-2 transition-all duration-300 ${
                    pkg.popular 
                      ? 'border-blue-200 shadow-2xl' 
                      : 'border-gray-200 shadow-lg hover:shadow-xl hover:border-blue-200'
                  }`}
                  initial={{ opacity: 0, y: 40 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: index * 0.1, duration: 0.6 }}
                  whileHover={{ y: -8, scale: 1.02 }}
                >
                  {pkg.popular && (
                    <motion.div 
                      className="absolute -top-3 sm:-top-4 left-1/2 transform -translate-x-1/2 bg-blue-600 text-white px-4 py-2 rounded-full text-xs sm:text-sm font-semibold shadow-lg"
                      animate={{ y: [0, -2, 0] }}
                      transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
                    >
                      Best Value
                    </motion.div>
                  )}

                  <div className="text-center mb-6 sm:mb-8">
                    <h4 className="text-xl sm:text-2xl font-bold text-gray-900 mb-2">{pkg.name}</h4>
                    <p className="text-gray-600 mb-4 text-sm sm:text-base">{pkg.description}</p>
                    <div className="flex items-baseline justify-center space-x-2">
                      {pkg.originalPrice && (
                        <span className="text-base sm:text-lg text-gray-400 line-through">${pkg.originalPrice}</span>
                      )}
                      <span className="text-3xl sm:text-4xl font-bold text-gray-900">${pkg.price}</span>
                      <span className="text-gray-600">/{pkg.period}</span>
                    </div>
                    {pkg.originalPrice && (
                      <div className="text-green-600 font-semibold text-sm mt-2">
                        Save ${pkg.originalPrice - pkg.price}!
                      </div>
                    )}
                  </div>

                  <div className="space-y-3 sm:space-y-4 mb-6 sm:mb-8">
                    {pkg.features.map((feature, featureIndex) => (
                      <motion.div 
                        key={featureIndex}
                        className="flex items-center space-x-3"
                        initial={{ opacity: 0, x: -20 }}
                        whileInView={{ opacity: 1, x: 0 }}
                        transition={{ delay: featureIndex * 0.1, duration: 0.5 }}
                        viewport={{ once: true }}
                      >
                        <Check className="w-4 h-4 sm:w-5 sm:h-5 text-green-500 flex-shrink-0" />
                        <span className="text-gray-700 text-sm sm:text-base">{feature}</span>
                      </motion.div>
                    ))}
                  </div>

                  <motion.div
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                  >
                    <Link
                      href={pkg.href}
                      className="group w-full bg-blue-600 text-white py-3 sm:py-4 px-6 rounded-xl font-semibold hover:bg-blue-700 transition-all duration-300 flex items-center justify-center space-x-2 shadow-lg hover:shadow-xl"
                    >
                      <span>{pkg.cta}</span>
                      <ArrowRight className="w-4 h-4 sm:w-5 sm:h-5 group-hover:translate-x-1 transition-transform" />
                    </Link>
                  </motion.div>
                </motion.div>
              </ClientOnly>
            ))}
          </div>
        </div>

        {/* Money Back Guarantee */}
        <div className="text-center mt-12 sm:mt-16">
          <ClientOnly fallback={
            <div className="inline-flex flex-col sm:flex-row items-center space-y-4 sm:space-y-0 sm:space-x-4 bg-gradient-to-r from-green-50 to-blue-50 px-6 sm:px-8 py-6 rounded-2xl border border-green-200 max-w-2xl mx-auto">
              <div className="w-10 h-10 sm:w-12 sm:h-12 bg-green-500 rounded-full flex items-center justify-center">
                <Check className="w-5 h-5 sm:w-6 sm:h-6 text-white" />
              </div>
              <div className="text-center sm:text-left">
                <div className="font-bold text-gray-900 text-base sm:text-lg">30-Day Money-Back Guarantee</div>
                <div className="text-gray-600 text-sm sm:text-base">Not satisfied? Get a full refund, no questions asked.</div>
              </div>
            </div>
          }>
            <motion.div 
              className="inline-flex flex-col sm:flex-row items-center space-y-4 sm:space-y-0 sm:space-x-4 bg-gradient-to-r from-green-50 to-blue-50 px-6 sm:px-8 py-6 rounded-2xl border border-green-200 max-w-2xl mx-auto"
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: 0.6, duration: 0.6 }}
              whileHover={{ scale: 1.05, y: -2 }}
            >
              <motion.div 
                className="w-10 h-10 sm:w-12 sm:h-12 bg-green-500 rounded-full flex items-center justify-center"
                whileHover={{ rotate: 10, scale: 1.1 }}
              >
                <Check className="w-5 h-5 sm:w-6 sm:h-6 text-white" />
              </motion.div>
              <div className="text-center sm:text-left">
                <div className="font-bold text-gray-900 text-base sm:text-lg">30-Day Money-Back Guarantee</div>
                <div className="text-gray-600 text-sm sm:text-base">Not satisfied? Get a full refund, no questions asked.</div>
              </div>
            </motion.div>
          </ClientOnly>
        </div>
      </div>
    </section>
  )
}