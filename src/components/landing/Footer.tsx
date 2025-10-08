'use client'

import Link from 'next/link'
import { Mail, Heart, Linkedin, Youtube } from 'lucide-react'
import NewsletterSignupForm from '@/components/newsletter/NewsletterSignupForm'

export default function Footer() {
  const currentYear = new Date().getFullYear()

  return (
    <footer className="bg-gray-900 text-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          {/* Company Info */}
          <div className="lg:col-span-1">
            <div className="flex items-center space-x-2 mb-6">
              <div className="w-10 h-10 bg-gradient-to-r from-blue-600 to-purple-600 rounded-xl flex items-center justify-center">
                <span className="text-white font-bold text-lg">M</span>
              </div>
              <span className="text-xl font-bold">SamAdvisoryHub</span>
            </div>
            <p className="text-gray-400 mb-6 leading-relaxed">
              Accelerating careers through expert mentorship and strategic advisory services. 
              Connect with industry leaders and achieve your professional goals.
            </p>
            <div className="flex space-x-4">
              <a 
                href="https://www.linkedin.com/in/sam-mokhtari-59b32971/"
                target="_blank"
                rel="noopener noreferrer"
                className="text-gray-400 hover:text-white transition-colors p-2 rounded-lg hover:bg-gray-800"
                aria-label="LinkedIn"
              >
                <Linkedin className="w-5 h-5" />
              </a>
              <a 
                href="https://www.youtube.com/@aiiwisdom"
                target="_blank"
                rel="noopener noreferrer"
                className="text-gray-400 hover:text-white transition-colors p-2 rounded-lg hover:bg-gray-800"
                aria-label="YouTube"
              >
                <Youtube className="w-5 h-5" />
              </a>
              <a 
                href="https://medium.com/@sammokhtari"
                target="_blank"
                rel="noopener noreferrer"
                className="text-gray-400 hover:text-white transition-colors p-2 rounded-lg hover:bg-gray-800"
                aria-label="Medium"
              >
                <svg className="w-5 h-5" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M13.54 12a6.8 6.8 0 01-6.77 6.82A6.8 6.8 0 010 12a6.8 6.8 0 016.77-6.82A6.8 6.8 0 0113.54 12zM20.96 12c0 3.54-1.51 6.42-3.38 6.42-1.87 0-3.39-2.88-3.39-6.42s1.52-6.42 3.39-6.42 3.38 2.88 3.38 6.42M24 12c0 3.17-.53 5.75-1.19 5.75-.66 0-1.19-2.58-1.19-5.75s.53-5.75 1.19-5.75S24 8.83 24 12z"/>
                </svg>
              </a>
            </div>
          </div>

          {/* Services */}
          <div>
            <h3 className="text-lg font-semibold mb-6">Services</h3>
            <ul className="space-y-4">
              <li>
                <Link href="#mentorship" className="text-gray-400 hover:text-white transition-colors">
                  Mentorship Programs
                </Link>
              </li>
              <li>
                <Link href="#advisory" className="text-gray-400 hover:text-white transition-colors">
                  Advisory Services
                </Link>
              </li>
              <li>
                <Link href="#career-coaching" className="text-gray-400 hover:text-white transition-colors">
                  Career Coaching
                </Link>
              </li>
              <li>
                <Link href="#leadership" className="text-gray-400 hover:text-white transition-colors">
                  Leadership Development
                </Link>
              </li>
            </ul>
          </div>

          {/* Content */}
          <div>
            <h3 className="text-lg font-semibold mb-6">Content</h3>
            <ul className="space-y-4">
              <li>
                <Link href="/blogs" className="text-gray-400 hover:text-white transition-colors">
                  Blogs
                </Link>
              </li>
              <li>
                <Link href="/videos" className="text-gray-400 hover:text-white transition-colors">
                  Videos
                </Link>
              </li>
              <li>
                <Link href="/newsletters" className="text-gray-400 hover:text-white transition-colors">
                  Newsletters
                </Link>
              </li>
            </ul>
          </div>

          {/* Contact */}
          <div>
            <h3 className="text-lg font-semibold mb-6">Contact</h3>
            <ul className="space-y-4">
              <li className="flex items-center space-x-3 text-gray-400">
                <Mail className="w-4 h-4" />
                <span>sam.mokhtari87@gmail.com</span>
              </li>
            </ul>
            
            {/* Newsletter */}
            <div className="mt-8">
              <h4 className="font-semibold mb-4">Stay Updated</h4>
              <p className="text-sm text-gray-400 mb-4">
                Get the latest insights on career growth and mentorship
              </p>
              <NewsletterSignupForm 
                variant="footer"
                showInterests={false}
                onSuccess={(subscriber) => {
                  // Track successful subscription
                  if (typeof window !== 'undefined' && window.gtag) {
                    window.gtag('event', 'newsletter_signup', {
                      event_category: 'engagement',
                      event_label: 'footer',
                    })
                  }
                }}
                onError={(error) => {
                  console.error('Newsletter subscription error:', error)
                }}
              />
            </div>
          </div>
        </div>

        {/* Bottom Section */}
        <div className="border-t border-gray-800 mt-12 pt-8">
          <div className="flex flex-col md:flex-row justify-between items-center space-y-4 md:space-y-0">
            <div className="flex flex-col md:flex-row items-center space-y-2 md:space-y-0 md:space-x-6 text-gray-400 text-sm">
              <p>&copy; {currentYear} SamAdvisoryHub. All rights reserved.</p>
              <div className="flex items-center space-x-1">
                <span>Made with</span>
                <Heart className="w-4 h-4 text-red-500 fill-current" />
                <span>for career growth</span>
              </div>
            </div>
            <div className="flex space-x-6 text-sm">
              <Link href="/privacy" className="text-gray-400 hover:text-white transition-colors">
                Privacy Policy
              </Link>
              <Link href="/terms" className="text-gray-400 hover:text-white transition-colors">
                Terms of Service
              </Link>
              <Link href="/cookies" className="text-gray-400 hover:text-white transition-colors">
                Cookie Policy
              </Link>
            </div>
          </div>
        </div>
      </div>
    </footer>
  )
}