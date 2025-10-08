import { Metadata } from 'next'
import Header from '@/components/landing/Header'
import Footer from '@/components/landing/Footer'

export const metadata: Metadata = {
  title: 'Cookie Policy - Dr. Sam Mokhtari',
  description: 'Cookie Policy for Sam Mokhtari\'s mentorship and advisory services.',
}

export default function CookiePolicyPage() {
  return (
    <main className="min-h-screen bg-background">
      <Header />
      
      <div className="pt-24 pb-16">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="bg-white dark:bg-gray-900 rounded-lg shadow-lg p-8">
            <h1 className="text-4xl font-bold text-gray-900 dark:text-white mb-8">
              Cookie Policy
            </h1>
            
            <div className="prose prose-lg max-w-none text-gray-700 dark:text-gray-300">
              <p className="text-lg mb-6">
                <strong>Last updated:</strong> January 2025
              </p>

              <h2 className="text-2xl font-semibold text-gray-900 dark:text-white mt-8 mb-4">
                1. What Are Cookies
              </h2>
              <p>
                Cookies are small text files that are placed on your computer or mobile device when you 
                visit our website. They are widely used to make websites work more efficiently and to 
                provide information to website owners.
              </p>

              <h2 className="text-2xl font-semibold text-gray-900 dark:text-white mt-8 mb-4">
                2. How We Use Cookies
              </h2>
              <p>We use cookies for several purposes:</p>
              <ul className="list-disc pl-6 mt-4">
                <li><strong>Essential Cookies:</strong> Required for the website to function properly</li>
                <li><strong>Performance Cookies:</strong> Help us understand how visitors interact with our website</li>
                <li><strong>Functional Cookies:</strong> Remember your preferences and settings</li>
                <li><strong>Marketing Cookies:</strong> Used to deliver relevant advertisements</li>
              </ul>

              <h2 className="text-2xl font-semibold text-gray-900 dark:text-white mt-8 mb-4">
                3. Types of Cookies We Use
              </h2>
              
              <h3 className="text-xl font-semibold text-gray-900 dark:text-white mt-6 mb-3">
                3.1 Essential Cookies
              </h3>
              <p>
                These cookies are necessary for the website to function and cannot be switched off. 
                They are usually only set in response to actions made by you which amount to a 
                request for services, such as setting your privacy preferences or logging in.
              </p>

              <h3 className="text-xl font-semibold text-gray-900 dark:text-white mt-6 mb-3">
                3.2 Analytics Cookies
              </h3>
              <p>
                These cookies allow us to count visits and traffic sources so we can measure and 
                improve the performance of our site. They help us to know which pages are the 
                most and least popular and see how visitors move around the site.
              </p>

              <h3 className="text-xl font-semibold text-gray-900 dark:text-white mt-6 mb-3">
                3.3 Functional Cookies
              </h3>
              <p>
                These cookies enable the website to provide enhanced functionality and personalization. 
                They may be set by us or by third party providers whose services we have added to our pages.
              </p>

              <h3 className="text-xl font-semibold text-gray-900 dark:text-white mt-6 mb-3">
                3.4 Marketing Cookies
              </h3>
              <p>
                These cookies may be set through our site by our advertising partners to build a 
                profile of your interests and show you relevant adverts on other sites.
              </p>

              <h2 className="text-2xl font-semibold text-gray-900 dark:text-white mt-8 mb-4">
                4. Third-Party Cookies
              </h2>
              <p>We may use third-party services that set their own cookies:</p>
              <ul className="list-disc pl-6 mt-4">
                <li><strong>Google Analytics:</strong> For website analytics and performance tracking</li>
                <li><strong>Stripe:</strong> For secure payment processing</li>
                <li><strong>NextAuth.js:</strong> For authentication and session management</li>
                <li><strong>Social Media Platforms:</strong> For social sharing and integration</li>
              </ul>

              <h2 className="text-2xl font-semibold text-gray-900 dark:text-white mt-8 mb-4">
                5. Managing Cookies
              </h2>
              <p>
                You can control and/or delete cookies as you wish. You can delete all cookies that 
                are already on your computer and you can set most browsers to prevent them from 
                being placed. If you do this, however, you may have to manually adjust some preferences 
                every time you visit our site.
              </p>

              <h3 className="text-xl font-semibold text-gray-900 dark:text-white mt-6 mb-3">
                5.1 Browser Settings
              </h3>
              <p>
                Most web browsers allow you to control cookies through their settings preferences. 
                You can set your browser to refuse cookies or delete certain cookies. However, 
                if you choose to delete or refuse our cookies, some features of our website may not work properly.
              </p>

              <h3 className="text-xl font-semibold text-gray-900 dark:text-white mt-6 mb-3">
                5.2 Cookie Consent
              </h3>
              <p>
                When you first visit our website, you may see a cookie consent banner. You can 
                choose to accept or decline cookies. You can also change your preferences at any 
                time through our cookie settings.
              </p>

              <h2 className="text-2xl font-semibold text-gray-900 dark:text-white mt-8 mb-4">
                6. Cookie Retention
              </h2>
              <p>
                Different cookies have different retention periods. Session cookies are deleted 
                when you close your browser, while persistent cookies remain on your device for 
                a set period or until you delete them manually.
              </p>

              <h2 className="text-2xl font-semibold text-gray-900 dark:text-white mt-8 mb-4">
                7. Updates to This Policy
              </h2>
              <p>
                We may update this Cookie Policy from time to time to reflect changes in our 
                practices or for other operational, legal, or regulatory reasons. We will notify 
                you of any changes by posting the updated policy on our website.
              </p>

              <h2 className="text-2xl font-semibold text-gray-900 dark:text-white mt-8 mb-4">
                8. Contact Us
              </h2>
              <p>
                If you have any questions about our use of cookies or this Cookie Policy, please contact us at:
              </p>
              <p className="mt-4">
                <strong>Email:</strong> sam.mokhtari87@gmail.com
              </p>

              <h2 className="text-2xl font-semibold text-gray-900 dark:text-white mt-8 mb-4">
                9. More Information
              </h2>
              <p>
                For more information about cookies and how they work, you can visit:
              </p>
              <ul className="list-disc pl-6 mt-4">
                <li><a href="https://www.allaboutcookies.org" className="text-blue-600 hover:text-blue-800 dark:text-blue-400 dark:hover:text-blue-300" target="_blank" rel="noopener noreferrer">All About Cookies</a></li>
                <li><a href="https://www.youronlinechoices.eu" className="text-blue-600 hover:text-blue-800 dark:text-blue-400 dark:hover:text-blue-300" target="_blank" rel="noopener noreferrer">Your Online Choices</a></li>
              </ul>
            </div>
          </div>
        </div>
      </div>
      
      <Footer />
    </main>
  )
}
