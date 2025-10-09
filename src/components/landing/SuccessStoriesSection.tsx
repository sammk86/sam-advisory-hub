'use client'

import Link from 'next/link'
import { Star, Quote, ArrowRight, Users, TrendingUp } from 'lucide-react'

export default function SuccessStoriesSection() {
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
    },
    {
      name: "David Kim",
      role: "Data Scientist",
      company: "Netflix",
      image: "/api/placeholder/64/64",
      content: "The AI advisory sessions helped me transition from traditional analytics to machine learning leadership. I now lead a team of 15 data scientists.",
      rating: 5,
      achievement: "ML Team Leadership",
      timeframe: "12 months"
    },
    {
      name: "Lisa Thompson",
      role: "CTO",
      company: "FinTech Startup",
      image: "/api/placeholder/64/64",
      content: "The strategic guidance helped me scale our technology infrastructure from 0 to 1M users. The mentorship was crucial for our Series B success.",
      rating: 5,
      achievement: "Series B Funding",
      timeframe: "18 months"
    },
    {
      name: "Alex Johnson",
      role: "VP of Engineering",
      company: "Microsoft",
      image: "/api/placeholder/64/64",
      content: "The leadership mentoring transformed my approach to team management. I successfully led a major cloud migration project affecting 500+ engineers.",
      rating: 5,
      achievement: "Cloud Migration Success",
      timeframe: "9 months"
    }
  ]

  const stats = [
    { number: "95%", label: "Success Rate", icon: TrendingUp },
    { number: "10k+", label: "Professionals Mentored", icon: Users },
    { number: "5/5", label: "Average Rating", icon: Star }
  ]

  return (
    <section className="py-16 sm:py-20 lg:py-32 bg-gradient-to-br from-primary/5 to-secondary/5 relative overflow-hidden">
      {/* Background Elements */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute top-20 left-4 sm:left-10 w-24 sm:w-32 h-24 sm:h-32 bg-primary/20 rounded-full mix-blend-multiply filter blur-xl opacity-30" />
        <div className="absolute bottom-20 right-4 sm:right-10 w-32 sm:w-40 h-32 sm:h-40 bg-secondary/20 rounded-full mix-blend-multiply filter blur-xl opacity-30" />
      </div>

      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Section Header */}
        <div className="text-center mb-12 sm:mb-16">
          <div className="inline-flex items-center space-x-2 bg-card/80 backdrop-blur-sm px-4 py-2 rounded-full mb-6 shadow-lg border border-border">
            <Quote className="w-4 h-4 text-primary" />
            <span className="text-primary font-medium text-sm">Success Stories</span>
          </div>
          
          <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-foreground mb-4 sm:mb-6">
            Transforming Careers,
            <span className="block text-gradient-magenta-cyan">
              One Success at a Time
            </span>
          </h2>
          <p className="text-lg sm:text-xl text-muted-foreground max-w-3xl mx-auto">
            Join thousands of professionals who have accelerated their careers 
            through our mentorship and advisory programs.
          </p>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 sm:gap-8 mb-12 sm:mb-16">
          {stats.map((stat, index) => {
            const Icon = stat.icon
            return (
              <div
                key={index}
                className="text-center bg-card/80 backdrop-blur-sm rounded-2xl p-6 shadow-lg border border-border hover:shadow-xl transition-all duration-300 hover:-translate-y-1"
              >
                <div className="w-10 h-10 sm:w-12 sm:h-12 bg-gradient-magenta-cyan rounded-xl flex items-center justify-center mx-auto mb-4">
                  <Icon className="w-5 h-5 sm:w-6 sm:h-6 text-white" />
                </div>
                <div className="text-2xl sm:text-3xl font-bold text-foreground mb-2">
                  {stat.number}
                </div>
                <div className="text-muted-foreground font-medium text-sm sm:text-base">{stat.label}</div>
              </div>
            )
          })}
        </div>

        {/* Testimonials Grid */}
        <div className="grid lg:grid-cols-3 gap-6 sm:gap-8 mb-12 sm:mb-16">
          {testimonials.map((testimonial, index) => (
            <div
              key={index}
              className="group bg-card/90 backdrop-blur-sm rounded-2xl sm:rounded-3xl p-6 sm:p-8 shadow-lg border border-border hover:shadow-2xl transition-all duration-300 hover:-translate-y-2"
            >
              {/* Quote Icon */}
              <div className="w-10 h-10 sm:w-12 sm:h-12 bg-gradient-magenta-cyan rounded-2xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform duration-300">
                <Quote className="w-5 h-5 sm:w-6 sm:h-6 text-white" />
              </div>

              {/* Rating */}
              <div className="flex items-center space-x-1 mb-4">
                {[...Array(testimonial.rating)].map((_, i) => (
                  <Star key={i} className="w-4 h-4 sm:w-5 sm:h-5 text-yellow-400 fill-current" />
                ))}
              </div>

              {/* Content */}
              <blockquote className="text-card-foreground mb-6 leading-relaxed text-sm sm:text-base">
                "{testimonial.content}"
              </blockquote>

              {/* Achievement Badge */}
              <div className="bg-gradient-to-r from-green-50 to-blue-50 rounded-xl p-3 mb-6 border border-green-100">
                <div className="flex items-center justify-between">
                  <div>
                    <div className="font-semibold text-green-800 text-xs sm:text-sm">Achievement</div>
                    <div className="text-green-600 font-medium text-sm sm:text-base">{testimonial.achievement}</div>
                  </div>
                  <div className="text-right">
                    <div className="text-muted-foreground text-xs">Timeline</div>
                    <div className="text-card-foreground font-medium text-xs sm:text-sm">{testimonial.timeframe}</div>
                  </div>
                </div>
              </div>

              {/* Author */}
              <div className="flex items-center space-x-4">
                <div className="w-10 h-10 sm:w-12 sm:h-12 bg-gradient-cyan-blue rounded-full flex items-center justify-center">
                  <span className="text-white font-semibold text-sm sm:text-lg">
                    {testimonial.name.split(' ').map(n => n[0]).join('')}
                  </span>
                </div>
                <div>
                  <div className="font-semibold text-card-foreground text-sm sm:text-base">{testimonial.name}</div>
                  <div className="text-muted-foreground text-xs sm:text-sm">{testimonial.role}</div>
                  <div className="text-primary text-xs sm:text-sm font-medium">{testimonial.company}</div>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* CTA Section */}
        <div className="text-center">
          <div className="bg-gradient-magenta-cyan rounded-2xl sm:rounded-3xl p-6 sm:p-8 lg:p-12 text-white relative overflow-hidden max-w-4xl mx-auto">
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
                <Link
                  href="/register?service=mentorship"
                  className="w-full sm:w-auto bg-white text-primary px-6 sm:px-8 py-3 sm:py-4 rounded-xl font-semibold hover:bg-gray-50 transition-colors flex items-center justify-center space-x-2 shadow-lg"
                >
                  <span>Start Mentorship Program</span>
                  <ArrowRight className="w-4 h-4 sm:w-5 sm:h-5" />
                </Link>
                
                <Link
                  href="/register?service=advisory"
                  className="w-full sm:w-auto border-2 border-white text-white px-6 sm:px-8 py-3 sm:py-4 rounded-xl font-semibold hover:bg-white hover:text-primary transition-all duration-300 flex items-center justify-center space-x-2"
                >
                  <span>Book Advisory Session</span>
                  <ArrowRight className="w-4 h-4 sm:w-5 sm:h-5" />
                </Link>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}
