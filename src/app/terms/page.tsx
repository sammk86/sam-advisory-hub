import { Metadata } from 'next'
import Header from '@/components/landing/Header'
import Footer from '@/components/landing/Footer'

export const metadata: Metadata = {
  title: 'Terms of Service - Dr. Sam Mokhtari',
  description: 'Terms of Service for Sam Mokhtari\'s mentorship and advisory services.',
}

export default function TermsOfServicePage() {
  return (
    <main className="min-h-screen bg-background">
      <Header />
      
      <div className="pt-24 pb-16">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="bg-white dark:bg-gray-900 rounded-lg shadow-lg p-8">
            <h1 className="text-4xl font-bold text-gray-900 dark:text-white mb-8">
              Terms of Service
            </h1>
            
            <div className="prose prose-lg max-w-none text-gray-700 dark:text-gray-300">
              <p className="text-lg mb-6">
                <strong>Last updated:</strong> January 2025
              </p>

              <h2 className="text-2xl font-semibold text-gray-900 dark:text-white mt-8 mb-4">
                1. Acceptance of Terms
              </h2>
              <p>
                By accessing and using Dr. Sam Mokhtari's mentorship and advisory services, you accept 
                and agree to be bound by the terms and provision of this agreement.
              </p>

              <h2 className="text-2xl font-semibold text-gray-900 dark:text-white mt-8 mb-4">
                2. Description of Services
              </h2>
              <p>Our services include:</p>
              <ul className="list-disc pl-6 mt-4">
                <li>1-on-1 mentorship sessions</li>
                <li>Strategic advisory and consulting</li>
                <li>Career coaching and guidance</li>
                <li>Educational content and resources</li>
                <li>Newsletter and communication services</li>
              </ul>

              <h2 className="text-2xl font-semibold text-gray-900 dark:text-white mt-8 mb-4">
                3. User Responsibilities
              </h2>
              <p>As a user of our services, you agree to:</p>
              <ul className="list-disc pl-6 mt-4">
                <li>Provide accurate and complete information</li>
                <li>Maintain the confidentiality of your account</li>
                <li>Use the services for lawful purposes only</li>
                <li>Respect the intellectual property rights of others</li>
                <li>Attend scheduled sessions or provide adequate notice for cancellations</li>
              </ul>

              <h2 className="text-2xl font-semibold text-gray-900 dark:text-white mt-8 mb-4">
                4. Payment Terms
              </h2>
              <p>
                Payment for services is required in advance unless otherwise agreed. We accept 
                payments through Stripe and other secure payment processors. All fees are 
                non-refundable unless otherwise specified in our refund policy.
              </p>

              <h2 className="text-2xl font-semibold text-gray-900 dark:text-white mt-8 mb-4">
                5. Cancellation and Refund Policy
              </h2>
              <p>
                Cancellations must be made at least 24 hours in advance of scheduled sessions. 
                Refunds are provided at our discretion and may be subject to administrative fees. 
                No refunds are provided for completed sessions or digital content.
              </p>

              <h2 className="text-2xl font-semibold text-gray-900 dark:text-white mt-8 mb-4">
                6. Intellectual Property
              </h2>
              <p>
                All content, materials, and intellectual property provided through our services 
                remain the property of Dr. Sam Mokhtari. Users may not reproduce, distribute, 
                or create derivative works without explicit written permission.
              </p>

              <h2 className="text-2xl font-semibold text-gray-900 dark:text-white mt-8 mb-4">
                7. Confidentiality
              </h2>
              <p>
                We maintain strict confidentiality regarding all client information and sessions. 
                Information shared during mentorship sessions will not be disclosed to third 
                parties without your explicit consent, except as required by law.
              </p>

              <h2 className="text-2xl font-semibold text-gray-900 dark:text-white mt-8 mb-4">
                8. Limitation of Liability
              </h2>
              <p>
                Our services are provided on an "as is" basis. We make no warranties regarding 
                the outcomes of mentorship or advisory services. We shall not be liable for 
                any indirect, incidental, or consequential damages arising from the use of our services.
              </p>

              <h2 className="text-2xl font-semibold text-gray-900 dark:text-white mt-8 mb-4">
                9. Termination
              </h2>
              <p>
                We reserve the right to terminate or suspend your account and access to our 
                services at any time, with or without notice, for any reason, including breach 
                of these terms.
              </p>

              <h2 className="text-2xl font-semibold text-gray-900 dark:text-white mt-8 mb-4">
                10. Governing Law
              </h2>
              <p>
                These terms shall be governed by and construed in accordance with the laws 
                of the jurisdiction in which Dr. Sam Mokhtari operates, without regard to 
                conflict of law provisions.
              </p>

              <h2 className="text-2xl font-semibold text-gray-900 dark:text-white mt-8 mb-4">
                11. Contact Information
              </h2>
              <p>
                If you have any questions about these Terms of Service, please contact us at:
              </p>
              <p className="mt-4">
                <strong>Email:</strong> sam.mokhtari87@gmail.com
              </p>

              <h2 className="text-2xl font-semibold text-gray-900 dark:text-white mt-8 mb-4">
                12. Changes to Terms
              </h2>
              <p>
                We reserve the right to modify these terms at any time. We will notify users 
                of any changes by posting the updated terms on our website. Continued use of 
                our services after changes constitutes acceptance of the new terms.
              </p>
            </div>
          </div>
        </div>
      </div>
      
      <Footer />
    </main>
  )
}
