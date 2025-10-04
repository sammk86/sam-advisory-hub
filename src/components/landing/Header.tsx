'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { useSession } from 'next-auth/react'
import { Menu, X, ArrowRight, User, LogIn } from 'lucide-react'
import { motion, AnimatePresence } from 'framer-motion'
import ClientOnly from '@/components/animations/ClientOnly'

export default function Header() {
  const [isMenuOpen, setIsMenuOpen] = useState(false)
  const [isScrolled, setIsScrolled] = useState(false)
  const { data: session } = useSession()

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 20)
    }
    window.addEventListener('scroll', handleScroll)
    return () => window.removeEventListener('scroll', handleScroll)
  }, [])

  const navigation = [
    { name: 'Services', href: '#services' },
    { name: 'Pricing', href: '#pricing' },
    { name: 'About', href: '#about' },
    { name: 'Contact', href: '#contact' },
  ]

  return (
    <header 
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
        isScrolled 
          ? 'bg-white/95 backdrop-blur-md shadow-lg border-b border-white/20' 
          : 'bg-transparent'
      }`}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center py-3 sm:py-4">
          {/* Logo */}
          <ClientOnly fallback={
            <Link href="/" className="flex items-center space-x-2">
              <div className="w-8 h-8 sm:w-10 sm:h-10 bg-gradient-to-r from-blue-600 to-purple-600 rounded-xl flex items-center justify-center">
                <span className="text-white font-bold text-base sm:text-lg">M</span>
              </div>
              <span className="text-lg sm:text-xl font-bold text-gray-900">MentorshipHub</span>
            </Link>
          }>
            <motion.div 
              className="flex items-center space-x-2"
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.6, ease: 'easeOut' }}
              whileHover={{ scale: 1.05 }}
            >
              <Link href="/" className="flex items-center space-x-2">
                <motion.div 
                  className="w-8 h-8 sm:w-10 sm:h-10 bg-gradient-to-r from-blue-600 to-purple-600 rounded-xl flex items-center justify-center"
                  whileHover={{ rotate: 5 }}
                  transition={{ duration: 0.2 }}
                >
                  <span className="text-white font-bold text-base sm:text-lg">M</span>
                </motion.div>
                <span className="text-lg sm:text-xl font-bold text-gray-900">MentorshipHub</span>
              </Link>
            </motion.div>
          </ClientOnly>

          {/* Desktop Navigation */}
          <nav className="hidden lg:flex items-center space-x-8">
            {navigation.map((item, index) => (
              <ClientOnly key={item.name} fallback={
                <Link
                  href={item.href}
                  className="text-gray-700 hover:text-blue-600 font-medium transition-colors duration-200"
                >
                  {item.name}
                </Link>
              }>
                <motion.div
                  initial={{ opacity: 0, y: -20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.1, duration: 0.5 }}
                >
                  <Link
                    href={item.href}
                    className="relative text-gray-700 hover:text-blue-600 font-medium transition-colors duration-200 group"
                  >
                    {item.name}
                    <motion.div
                      className="absolute -bottom-1 left-0 w-0 h-0.5 bg-gradient-to-r from-blue-600 to-purple-600 group-hover:w-full transition-all duration-300"
                    />
                  </Link>
                </motion.div>
              </ClientOnly>
            ))}
          </nav>

          {/* Desktop Auth Buttons */}
          <div className="hidden lg:flex items-center space-x-4">
            {session ? (
              <ClientOnly fallback={
                <Link
                  href="/dashboard"
                  className="flex items-center space-x-2 bg-gradient-to-r from-blue-600 to-purple-600 text-white px-4 sm:px-6 py-2 sm:py-3 rounded-xl font-semibold shadow-lg"
                >
                  <User className="w-4 h-4" />
                  <span>Dashboard</span>
                </Link>
              }>
                <motion.div
                  initial={{ opacity: 0, scale: 0.8 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ delay: 0.4, duration: 0.5 }}
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                >
                  <Link
                    href="/dashboard"
                    className="flex items-center space-x-2 bg-gradient-to-r from-blue-600 to-purple-600 text-white px-4 sm:px-6 py-2 sm:py-3 rounded-xl font-semibold hover:shadow-lg transition-all duration-300"
                  >
                    <User className="w-4 h-4" />
                    <span>Dashboard</span>
                  </Link>
                </motion.div>
              </ClientOnly>
            ) : (
              <>
                <ClientOnly fallback={
                  <Link
                    href="/auth/signin"
                    className="flex items-center space-x-2 text-gray-700 hover:text-blue-600 font-medium transition-colors duration-200"
                  >
                    <LogIn className="w-4 h-4" />
                    <span>Sign In</span>
                  </Link>
                }>
                  <motion.div
                    initial={{ opacity: 0, scale: 0.8 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ delay: 0.4, duration: 0.5 }}
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                  >
                    <Link
                      href="/auth/signin"
                      className="flex items-center space-x-2 text-gray-700 hover:text-blue-600 font-medium transition-colors duration-200"
                    >
                      <LogIn className="w-4 h-4" />
                      <span>Sign In</span>
                    </Link>
                  </motion.div>
                </ClientOnly>
                <ClientOnly fallback={
                  <Link
                    href="/auth/signup"
                    className="bg-gradient-to-r from-blue-600 to-purple-600 text-white px-4 sm:px-6 py-2 sm:py-3 rounded-xl font-semibold shadow-lg flex items-center space-x-2"
                  >
                    <span>Get Started</span>
                    <ArrowRight className="w-4 h-4" />
                  </Link>
                }>
                  <motion.div
                    initial={{ opacity: 0, scale: 0.8 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ delay: 0.5, duration: 0.5 }}
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                  >
                    <Link
                      href="/auth/signup"
                      className="group bg-gradient-to-r from-blue-600 to-purple-600 text-white px-4 sm:px-6 py-2 sm:py-3 rounded-xl font-semibold hover:shadow-lg transition-all duration-300 flex items-center space-x-2"
                    >
                      <span>Get Started</span>
                      <motion.div
                        animate={{ x: [0, 2, 0] }}
                        transition={{ duration: 1.5, repeat: Infinity, ease: 'easeInOut' }}
                      >
                        <ArrowRight className="w-4 h-4" />
                      </motion.div>
                    </Link>
                  </motion.div>
                </ClientOnly>
              </>
            )}
          </div>

          {/* Mobile Menu Button */}
          <button
            className="lg:hidden p-2 rounded-lg hover:bg-gray-100 transition-colors"
            onClick={() => setIsMenuOpen(!isMenuOpen)}
          >
            <ClientOnly fallback={
              isMenuOpen ? (
                <X className="w-5 h-5 sm:w-6 sm:h-6 text-gray-700" />
              ) : (
                <Menu className="w-5 h-5 sm:w-6 sm:h-6 text-gray-700" />
              )
            }>
              <AnimatePresence mode="wait">
                {isMenuOpen ? (
                  <motion.div
                    key="close"
                    initial={{ rotate: -90, opacity: 0 }}
                    animate={{ rotate: 0, opacity: 1 }}
                    exit={{ rotate: 90, opacity: 0 }}
                    transition={{ duration: 0.2 }}
                  >
                    <X className="w-5 h-5 sm:w-6 sm:h-6 text-gray-700" />
                  </motion.div>
                ) : (
                  <motion.div
                    key="menu"
                    initial={{ rotate: 90, opacity: 0 }}
                    animate={{ rotate: 0, opacity: 1 }}
                    exit={{ rotate: -90, opacity: 0 }}
                    transition={{ duration: 0.2 }}
                  >
                    <Menu className="w-5 h-5 sm:w-6 sm:h-6 text-gray-700" />
                  </motion.div>
                )}
              </AnimatePresence>
            </ClientOnly>
          </button>
        </div>
      </div>

      {/* Mobile Menu */}
      <ClientOnly>
        <AnimatePresence>
          {isMenuOpen && (
            <motion.div
              className="lg:hidden absolute top-full left-0 right-0 bg-white/95 backdrop-blur-md border-t border-gray-200 shadow-lg"
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              transition={{ duration: 0.3, ease: 'easeInOut' }}
            >
              <div className="px-4 py-6 space-y-4">
                {/* Navigation Links */}
                {navigation.map((item, index) => (
                  <motion.div
                    key={item.name}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: index * 0.1, duration: 0.3 }}
                  >
                    <Link
                      href={item.href}
                      className="block py-3 px-4 text-gray-700 hover:text-blue-600 hover:bg-blue-50 rounded-lg font-medium transition-all duration-200"
                      onClick={() => setIsMenuOpen(false)}
                    >
                      {item.name}
                    </Link>
                  </motion.div>
                ))}

                {/* Mobile Auth Buttons */}
                <div className="pt-4 border-t border-gray-200 space-y-3">
                  {session ? (
                    <motion.div
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: 0.4, duration: 0.3 }}
                    >
                      <Link
                        href="/dashboard"
                        className="flex items-center justify-center space-x-2 bg-gradient-to-r from-blue-600 to-purple-600 text-white py-3 px-6 rounded-xl font-semibold shadow-lg"
                        onClick={() => setIsMenuOpen(false)}
                      >
                        <User className="w-4 h-4" />
                        <span>Dashboard</span>
                      </Link>
                    </motion.div>
                  ) : (
                    <>
                      <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.4, duration: 0.3 }}
                      >
                        <Link
                          href="/auth/signin"
                          className="flex items-center justify-center space-x-2 border-2 border-gray-300 text-gray-700 py-3 px-6 rounded-xl font-semibold hover:border-blue-600 hover:text-blue-600 transition-all duration-200"
                          onClick={() => setIsMenuOpen(false)}
                        >
                          <LogIn className="w-4 h-4" />
                          <span>Sign In</span>
                        </Link>
                      </motion.div>
                      <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.5, duration: 0.3 }}
                      >
                        <Link
                          href="/auth/signup"
                          className="flex items-center justify-center space-x-2 bg-gradient-to-r from-blue-600 to-purple-600 text-white py-3 px-6 rounded-xl font-semibold shadow-lg"
                          onClick={() => setIsMenuOpen(false)}
                        >
                          <span>Get Started</span>
                          <ArrowRight className="w-4 h-4" />
                        </Link>
                      </motion.div>
                    </>
                  )}
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </ClientOnly>
    </header>
  )
}