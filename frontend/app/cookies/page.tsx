'use client'

import Header from '@/components/Header/header';
import Footer from '@/components/Footer/footer';
import { motion } from 'framer-motion';
import Link from 'next/link';
import { ArrowLeft, ShieldCheck, Settings2, BarChart2 } from 'lucide-react';
import { useState } from 'react';
import ContactModal from '@/components/Modal/ContactModal';

export default function CookiesPolicy() {
  const [showContactModal, setShowContactModal] = useState<boolean>(false);

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-950 via-gray-900 to-gray-950 text-white">
      <Header />
      
      {/* Background effects */}
      <div className="relative overflow-hidden">
        {/* Dynamic aurora effects */}
        <div className="absolute -top-[500px] -left-[400px] w-[1000px] h-[1000px] bg-[radial-gradient(ellipse_at_center,hsla(217,100%,50%,0.12)_0%,transparent_70%)]" 
             style={{ animation: 'aurora-x 25s ease-in-out infinite' }} />
        <div className="absolute -top-[300px] -right-[300px] w-[800px] h-[800px] bg-[radial-gradient(ellipse_at_center,hsla(265,89%,60%,0.12)_0%,transparent_70%)]" 
             style={{ animation: 'aurora-y 20s ease-in-out infinite' }} />
        <div className="absolute bottom-[20%] left-[10%] w-[600px] h-[600px] bg-[radial-gradient(ellipse_at_center,hsla(190,95%,50%,0.06)_0%,transparent_70%)]" 
             style={{ animation: 'aurora-pulse 30s ease infinite' }} />
        
        {/* Grid effect */}
        <div className="absolute inset-0 bg-[linear-gradient(rgba(59,130,246,0.05)_1px,transparent_1px),linear-gradient(90deg,rgba(59,130,246,0.05)_1px,transparent_1px)] bg-[size:40px_40px] [mask-image:radial-gradient(ellipse_at_center,black_20%,transparent_70%)]" />
      </div>
      
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-12 pt-28 relative z-10">
        <motion.div 
          className="max-w-4xl mx-auto"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          <Link href="/" className="mb-6 inline-flex items-center text-sm text-blue-400 hover:text-blue-300 transition-colors group">
            <ArrowLeft className="w-4 h-4 mr-2 group-hover:-translate-x-1 transition-transform" />
            Back to Home
          </Link>

          <h1 className="text-4xl font-semibold mb-6 text-transparent bg-clip-text bg-gradient-to-r from-blue-400 via-purple-400 to-teal-400 pb-2 border-b border-gray-700">Cookies Policy</h1>
          <p className="text-blue-300 mb-8 text-sm font-medium">Last Updated: April 19, 2025</p>
          
          {/* Introduction */}
          <div className="mb-12">
            <p className="text-lg text-gray-300 mb-6 leading-relaxed">
              At CodEase, we use cookies and similar technologies to enhance your browsing experience, personalize content, and improve the functionality of our platform. This Cookies Policy explains how we use these technologies and the choices you have regarding their use.
            </p>
            
            <div className="p-4 bg-blue-900/20 border border-blue-500/30 rounded-lg text-gray-300 text-sm">
              <p>By continuing to use our website, you consent to the use of cookies as described in this policy. You can change your cookie preferences at any time by adjusting your browser settings.</p>
            </div>
          </div>
          
          {/* What Are Cookies */}
          <motion.section
            className="mb-12"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.1 }}
          >
            <h2 className="text-2xl font-medium mb-6 text-white border-b border-gray-700 pb-2">What Are Cookies?</h2>
            <p className="text-gray-300 mb-4 leading-relaxed">
              Cookies are small text files that are stored on your device (computer, tablet, or mobile) when you visit a website. They are widely used to make websites work more efficiently and provide information to the website owners.
            </p>
            <p className="text-gray-300 leading-relaxed">
              Cookies help us recognize your device and remember certain information about your visit, such as your user preferences, settings, and previous activities. This enables us to provide you with a more personalized and seamless experience when you use our services.
            </p>
          </motion.section>
          
          {/* Types of Cookies We Use */}
          <motion.section
            className="mb-12"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.2 }}
          >
            <h2 className="text-2xl font-medium mb-6 text-white border-b border-gray-700 pb-2">Types of Cookies We Use</h2>
            <p className="text-gray-300 mb-6 leading-relaxed">
              At CodEase, we use the following types of cookies to enhance your experience:
            </p>
            
            <div className="space-y-6">
              <div className="flex items-start gap-4 p-4 bg-gradient-to-r from-blue-900/20 to-indigo-900/20 border border-blue-500/30 rounded-lg">
                <div className="mt-1">
                  <ShieldCheck className="w-6 h-6 text-blue-400" />
                </div>
                <div>
                  <h3 className="text-xl font-medium mb-2 text-blue-300">Essential Cookies</h3>
                  <p className="text-gray-300 text-sm leading-relaxed">
                    These cookies are necessary for the website to function properly. They enable core functionalities such as user authentication, security, and session management. Without these cookies, our services cannot be provided. These include cookies for login sessions and user identification.
                  </p>
                </div>
              </div>
              
              <div className="flex items-start gap-4 p-4 bg-gradient-to-r from-purple-900/20 to-indigo-900/20 border border-purple-500/30 rounded-lg">
                <div className="mt-1">
                  <Settings2 className="w-6 h-6 text-purple-400" />
                </div>
                <div>
                  <h3 className="text-xl font-medium mb-2 text-purple-300">Functional Cookies</h3>
                  <p className="text-gray-300 text-sm leading-relaxed">
                    These cookies help us remember the choices you make and provide enhanced, personalized features. They may be set by us or by third-party providers whose services we have added to our pages. They enable features like remembering your preferences and settings, such as language preferences and display options.
                  </p>
                </div>
              </div>
              
              <div className="flex items-start gap-4 p-4 bg-gradient-to-r from-indigo-900/20 to-blue-900/20 border border-indigo-500/30 rounded-lg">
                <div className="mt-1">
                  <BarChart2 className="w-6 h-6 text-indigo-400" />
                </div>
                <div>
                  <h3 className="text-xl font-medium mb-2 text-indigo-300">Analytics Cookies</h3>
                  <p className="text-gray-300 text-sm leading-relaxed">
                    These cookies help us understand how visitors interact with our website by collecting and reporting information anonymously. They help us improve our website's structure, content, and user experience based on how users navigate and use our platform.
                  </p>
                </div>
              </div>
            </div>
          </motion.section>
          
          {/* How We Use Cookies */}
          <motion.section
            className="mb-12"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.3 }}
          >
            <h2 className="text-2xl font-medium mb-6 text-white border-b border-gray-700 pb-2">How We Use Cookies</h2>
            <p className="text-gray-300 mb-6 leading-relaxed">
              We use cookies for the following purposes:
            </p>
            
            <ul className="space-y-3 text-gray-300">
              <li className="flex items-start">
                <div className="min-w-4 h-4 rounded-full bg-blue-500/40 flex items-center justify-center mr-3 mt-1.5">
                  <div className="w-2 h-2 rounded-full bg-blue-400"></div>
                </div>
                <span>To authenticate users and maintain secure login sessions</span>
              </li>
              <li className="flex items-start">
                <div className="min-w-4 h-4 rounded-full bg-blue-500/40 flex items-center justify-center mr-3 mt-1.5">
                  <div className="w-2 h-2 rounded-full bg-blue-400"></div>
                </div>
                <span>To remember your preferences and settings for future visits</span>
              </li>
              <li className="flex items-start">
                <div className="min-w-4 h-4 rounded-full bg-blue-500/40 flex items-center justify-center mr-3 mt-1.5">
                  <div className="w-2 h-2 rounded-full bg-blue-400"></div>
                </div>
                <span>To enhance user experience by personalizing content and features</span>
              </li>
              <li className="flex items-start">
                <div className="min-w-4 h-4 rounded-full bg-blue-500/40 flex items-center justify-center mr-3 mt-1.5">
                  <div className="w-2 h-2 rounded-full bg-blue-400"></div>
                </div>
                <span>To analyze user behavior and improve our website functionality</span>
              </li>
              <li className="flex items-start">
                <div className="min-w-4 h-4 rounded-full bg-blue-500/40 flex items-center justify-center mr-3 mt-1.5">
                  <div className="w-2 h-2 rounded-full bg-blue-400"></div>
                </div>
                <span>To maintain your session while you navigate between pages</span>
              </li>
            </ul>
          </motion.section>
          
          {/* Managing Cookies */}
          <motion.section
            className="mb-12"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.4 }}
          >
            <h2 className="text-2xl font-medium mb-6 text-white border-b border-gray-700 pb-2">Managing Your Cookie Preferences</h2>
            <p className="text-gray-300 mb-4 leading-relaxed">
              Most web browsers allow you to control cookies through their settings. You can typically find these settings in the "Options," "Preferences," or "Settings" menu of your browser. You can:
            </p>
            
            <ul className="space-y-3 text-gray-300 mb-6">
              <li className="flex items-start">
                <div className="min-w-4 h-4 rounded-full bg-blue-500/40 flex items-center justify-center mr-3 mt-1.5">
                  <div className="w-2 h-2 rounded-full bg-blue-400"></div>
                </div>
                <span>Delete all existing cookies</span>
              </li>
              <li className="flex items-start">
                <div className="min-w-4 h-4 rounded-full bg-blue-500/40 flex items-center justify-center mr-3 mt-1.5">
                  <div className="w-2 h-2 rounded-full bg-blue-400"></div>
                </div>
                <span>Block or allow cookies from being set</span>
              </li>
              <li className="flex items-start">
                <div className="min-w-4 h-4 rounded-full bg-blue-500/40 flex items-center justify-center mr-3 mt-1.5">
                  <div className="w-2 h-2 rounded-full bg-blue-400"></div>
                </div>
                <span>Configure your browser to notify you when you receive a cookie</span>
              </li>
            </ul>
            
            <p className="text-gray-300 mb-4 leading-relaxed">
              Please note that if you choose to disable or block certain cookies, some features of our website may not function correctly. In particular, disabling essential cookies will affect your ability to log in and use our platform's core features.
            </p>
            
            <div className="p-4 bg-indigo-900/20 border border-indigo-500/30 rounded-lg text-sm text-gray-300">
              <p className="font-medium text-indigo-300 mb-2">Browser-specific instructions:</p>
              <ul className="space-y-1">
                <li>
                  <a href="https://support.google.com/chrome/answer/95647" target="_blank" rel="noopener noreferrer" className="text-blue-400 hover:text-blue-300 transition-colors">Google Chrome</a>
                </li>
                <li>
                  <a href="https://support.mozilla.org/en-US/kb/cookies-information-websites-store-on-your-computer" target="_blank" rel="noopener noreferrer" className="text-blue-400 hover:text-blue-300 transition-colors">Mozilla Firefox</a>
                </li>
                <li>
                  <a href="https://support.microsoft.com/en-us/microsoft-edge/delete-cookies-in-microsoft-edge-63947406-40ac-c3b8-57b9-2a946a29ae09" target="_blank" rel="noopener noreferrer" className="text-blue-400 hover:text-blue-300 transition-colors">Microsoft Edge</a>
                </li>
                <li>
                  <a href="https://support.apple.com/guide/safari/manage-cookies-sfri11471/mac" target="_blank" rel="noopener noreferrer" className="text-blue-400 hover:text-blue-300 transition-colors">Safari</a>
                </li>
              </ul>
            </div>
          </motion.section>
          
          {/* Updates to Policy */}
          <motion.section
            className="mb-12"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.5 }}
          >
            <h2 className="text-2xl font-medium mb-6 text-white border-b border-gray-700 pb-2">Updates to Our Cookies Policy</h2>
            <p className="text-gray-300 leading-relaxed">
              We may update this Cookies Policy from time to time to reflect changes in technology, regulation, or our business practices. Any changes will be posted on this page with an updated "Last Updated" date. We encourage you to review this policy periodically to stay informed about how we use cookies.
            </p>
          </motion.section>
          
          {/* Questions */}
          <motion.section
            className="mb-12"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.6 }}
          >
            <div className="p-6 bg-gradient-to-r from-blue-900/30 to-purple-900/30 border border-blue-500/30 rounded-xl">
              <h2 className="text-2xl font-medium mb-4 text-white">Questions or Concerns?</h2>
              <p className="text-gray-300 mb-6 leading-relaxed">
                If you have any questions about our use of cookies or this Cookies Policy, please don't hesitate to contact us.
              </p>
              
              <button 
                onClick={() => setShowContactModal(true)}
                className="px-6 py-3 bg-gradient-to-r from-blue-500 to-purple-500 hover:from-blue-600 hover:to-purple-600 text-white rounded-lg font-medium transition-all text-sm"
              >
                Contact Us
              </button>
            </div>
          </motion.section>
        </motion.div>
      </div>

      {/* CSS animations */}
      <style jsx global>{`
        @keyframes aurora-x {
          0%, 100% { transform: translateX(0) rotate(0); opacity: 0.8; }
          50% { transform: translateX(30px) rotate(5deg); opacity: 1; }
        }
        
        @keyframes aurora-y {
          0%, 100% { transform: translateY(0) rotate(0); opacity: 0.7; }
          50% { transform: translateY(30px) rotate(-5deg); opacity: 1; }
        }
        
        @keyframes aurora-pulse {
          0%, 100% { opacity: 0.3; transform: scale(1); }
          50% { opacity: 0.5; transform: scale(1.1); }
        }
      `}</style>
      
      {/* Contact Modal */}
      <ContactModal 
        isOpen={showContactModal}
        onClose={() => setShowContactModal(false)}
      />
      
      <Footer />
    </div>
  )
}