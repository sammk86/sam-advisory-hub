'use client'

import Link from 'next/link'
import { Mail, Phone, MapPin, Twitter, Github, Heart } from 'lucide-react'

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
              <span className="text-xl font-bold">MentorshipHub</span>
            </div>
            <p className="text-gray-400 mb-6 leading-relaxed">
              Accelerating careers through expert mentorship and strategic advisory services. 
              Connect with industry leaders and achieve your professional goals.
            </p>
            <div className="flex space-x-4">
              <a 
                href="#" 
                className="text-gray-400 hover:text-white transition-colors p-2 rounded-lg hover:bg-gray-800"
                aria-label="Twitter"
              >
                <Twitter className="w-5 h-5" />
              </a>
              <a 
                href="#" 
                className="text-gray-400 hover:text-white transition-colors p-2 rounded-lg hover:bg-gray-800"
                aria-label="LinkedIn"
              >
                <div className="w-5 h-5 bg-gray-400 rounded"></div>
              </a>
              <a 
                href="#" 
                className="text-gray-400 hover:text-white transition-colors p-2 rounded-lg hover:bg-gray-800"
                aria-label="GitHub"
              >
                <Github className="w-5 h-5" />
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

          {/* Company */}
          <div>
            <h3 className="text-lg font-semibold mb-6">Company</h3>
            <ul className="space-y-4">
              <li>
                <Link href="#about" className="text-gray-400 hover:text-white transition-colors">
                  About Us
                </Link>
              </li>
              <li>
                <Link href="#careers" className="text-gray-400 hover:text-white transition-colors">
                  Careers
                </Link>
              </li>
              <li>
                <Link href="#blog" className="text-gray-400 hover:text-white transition-colors">
                  Blog
                </Link>
              </li>
              <li>
                <Link href="#press" className="text-gray-400 hover:text-white transition-colors">
                  Press
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
                <span>hello@mentorshiphub.com</span>
              </li>
              <li className="flex items-center space-x-3 text-gray-400">
                <Phone className="w-4 h-4" />
                <span>+1 (555) 123-4567</span>
              </li>
              <li className="flex items-center space-x-3 text-gray-400">
                <MapPin className="w-4 h-4" />
                <span>San Francisco, CA</span>
              </li>
            </ul>
            
            {/* Newsletter */}
            <div className="mt-8">
              <h4 className="font-semibold mb-4">Stay Updated</h4>
              <div className="flex">
                <input
                  type="email"
                  placeholder="Enter your email"
                  className="flex-1 px-4 py-2 bg-gray-800 border border-gray-700 rounded-l-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-white placeholder-gray-400"
                />
                <button className="px-4 py-2 bg-blue-600 hover:bg-blue-700 rounded-r-lg transition-colors">
                  Subscribe
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Bottom Section */}
        <div className="border-t border-gray-800 mt-12 pt-8">
          <div className="flex flex-col md:flex-row justify-between items-center space-y-4 md:space-y-0">
            <div className="flex flex-col md:flex-row items-center space-y-2 md:space-y-0 md:space-x-6 text-gray-400 text-sm">
              <p>&copy; {currentYear} MentorshipHub. All rights reserved.</p>
              <div className="flex items-center space-x-1">
                <span>Made with</span>
                <Heart className="w-4 h-4 text-red-500 fill-current" />
                <span>for career growth</span>
              </div>
            </div>
            <div className="flex space-x-6 text-sm">
              <Link href="#privacy" className="text-gray-400 hover:text-white transition-colors">
                Privacy Policy
              </Link>
              <Link href="#terms" className="text-gray-400 hover:text-white transition-colors">
                Terms of Service
              </Link>
              <Link href="#cookies" className="text-gray-400 hover:text-white transition-colors">
                Cookie Policy
              </Link>
            </div>
          </div>
        </div>
      </div>
    </footer>
  )
}