'use client'

import Header from '@/components/Header/header';
import Footer from '@/components/Footer/footer';
import { motion } from 'framer-motion';
import Link from 'next/link';
import { ArrowLeft } from 'lucide-react';
import { useState } from 'react';
import ContactModal from '@/components/Modal/ContactModal';

export default function ShippingPolicy() {
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

          <h1 className="text-4xl font-semibold mb-6 text-transparent bg-clip-text bg-gradient-to-r from-blue-400 via-purple-400 to-teal-400 pb-2 border-b border-gray-700">Shipping Policy</h1>
          <p className="text-blue-300 mb-4 text-sm font-medium">Last Updated: April 19, 2025</p>
          
          {/* Razorpay Policy Link - Added for verification */}
          <div className="mb-6 p-4 rounded-lg bg-blue-900/20 border border-blue-500/30">
            <p className="text-gray-300 text-sm leading-relaxed">
              Our official shipping policy is also available on Razorpay at{" "}
              <a 
                href="https://merchant.razorpay.com/policy/QK8SfAxappIeFn/shipping" 
                target="_blank" 
                rel="noopener noreferrer"
                className="text-blue-400 hover:text-blue-300 underline"
              >
                https://merchant.razorpay.com/policy/QK8SfAxappIeFn/shipping
              </a>
            </p>
          </div>
          
          {/* Introduction */}
          <div className="mb-12">
            <p className="text-lg text-gray-300 mb-4 leading-relaxed">
              CodEase is a digital service that provides AI-powered browser extension development. As we offer only digital products and services, this shipping policy outlines our delivery methods and process.
            </p>
          </div>
          
          {/* Policy Sections */}
          <div className="space-y-12">
            {/* Digital Delivery */}
            <motion.section 
              className="p-6 rounded-lg bg-gradient-to-b from-blue-900/30 to-purple-900/30 border border-blue-500/30 backdrop-blur-sm shadow-xl hover:border-blue-400/40 transition-all duration-300"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.1 }}
            >
              <h2 className="text-2xl font-medium mb-4 text-white">Digital Delivery</h2>
              
              <p className="text-gray-300 text-sm leading-relaxed mb-4">
                All CodEase products and services are delivered digitally. We do not ship any physical products.
              </p>
              
              <div className="space-y-4 mb-6">
                <div className="p-4 border border-gray-700 bg-gray-800/40 rounded-lg">
                  <h3 className="font-semibold text-blue-300 mb-2">Account Access</h3>
                  <p className="text-gray-300 text-sm leading-relaxed">
                    Upon successful purchase, you will receive immediate access to your CodEase subscription, credits, or services through your account. No physical shipping or delivery is required.
                  </p>
                </div>
                
                <div className="p-4 border border-gray-700 bg-gray-800/40 rounded-lg">
                  <h3 className="font-semibold text-blue-300 mb-2">Delivery Timeline</h3>
                  <p className="text-gray-300 text-sm leading-relaxed">
                    Digital delivery of our services is immediate following successful payment processing. In rare cases, there might be a short delay of up to 24 hours if additional account verification is required.
                  </p>
                </div>
              </div>
            </motion.section>
          
            {/* Access Methods */}
            <motion.section 
              className="p-6 rounded-lg bg-gradient-to-b from-purple-900/30 to-blue-900/30 border border-purple-500/30 backdrop-blur-sm shadow-xl hover:border-purple-400/40 transition-all duration-300"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.2 }}
            >
              <h2 className="text-2xl font-medium mb-4 text-white">Access Methods</h2>
              
              <p className="text-gray-300 text-sm leading-relaxed mb-4">
                You can access your purchased CodEase services through the following methods:
              </p>
              
              <div className="space-y-4 mb-6">
                <div className="p-4 border border-gray-700 bg-gray-800/40 rounded-lg">
                  <h3 className="font-semibold text-blue-300 mb-2">Web Application</h3>
                  <p className="text-gray-300 text-sm leading-relaxed">
                    All features and services are accessible through our web application at codease.pro. Simply log in with your account credentials to access your subscription features, credits, and services.
                  </p>
                </div>
                
                <div className="p-4 border border-gray-700 bg-gray-800/40 rounded-lg">
                  <h3 className="font-semibold text-blue-300 mb-2">Email Confirmation</h3>
                  <p className="text-gray-300 text-sm leading-relaxed">
                    After your purchase, you will receive a confirmation email with details about your transaction and instructions on how to access your services if you're a new user.
                  </p>
                </div>
              </div>
            </motion.section>
            
            {/* Service Updates */}
            <motion.section 
              className="p-6 rounded-lg bg-gradient-to-b from-blue-900/30 to-indigo-900/30 border border-blue-500/30 backdrop-blur-sm shadow-xl hover:border-blue-400/40 transition-all duration-300"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.3 }}
            >
              <h2 className="text-2xl font-medium mb-4 text-white">Service Updates</h2>
              
              <p className="text-gray-300 text-sm leading-relaxed mb-4">
                As a digital service, CodEase products are continuously updated and improved:
              </p>
              
              <ul className="space-y-2 text-gray-300 text-sm mb-4">
                <li className="flex items-start">
                  <div className="w-4 h-4 rounded-full bg-blue-500/40 flex items-center justify-center mr-3 mt-1">
                    <div className="w-2 h-2 rounded-full bg-blue-400"></div>
                  </div>
                  <span>Updates to our platform and services are automatically delivered to all users</span>
                </li>
                <li className="flex items-start">
                  <div className="w-4 h-4 rounded-full bg-blue-500/40 flex items-center justify-center mr-3 mt-1">
                    <div className="w-2 h-2 rounded-full bg-blue-400"></div>
                  </div>
                  <span>No action is required from your side to receive the latest features and improvements</span>
                </li>
                <li className="flex items-start">
                  <div className="w-4 h-4 rounded-full bg-blue-500/40 flex items-center justify-center mr-3 mt-1">
                    <div className="w-2 h-2 rounded-full bg-blue-400"></div>
                  </div>
                  <span>We notify users about significant updates via email and in-app notifications</span>
                </li>
              </ul>
              
              <p className="text-gray-300 text-sm leading-relaxed">
                Major feature updates and changes are communicated through our newsletter, blog, and directly through our application.
              </p>
            </motion.section>
          
            {/* International Access */}
            <motion.section 
              className="p-6 rounded-lg bg-gradient-to-b from-indigo-900/30 to-purple-900/30 border border-indigo-500/30 backdrop-blur-sm shadow-xl hover:border-indigo-400/40 transition-all duration-300"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.4 }}
            >
              <h2 className="text-2xl font-medium mb-4 text-white">International Access</h2>
              <p className="text-gray-300 mb-4 text-sm leading-relaxed">
                As a cloud-based service, CodEase is available internationally with the following considerations:
              </p>
              
              <div className="space-y-4 mb-6">
                <div className="p-4 border border-gray-700 bg-gray-800/40 rounded-lg">
                  <h3 className="font-semibold text-blue-300 mb-2">Global Availability</h3>
                  <p className="text-gray-300 text-sm leading-relaxed">
                    Our services are accessible worldwide wherever there is an internet connection. There are no geographical limitations to accessing our platform.
                  </p>
                </div>
                
                <div className="p-4 border border-gray-700 bg-gray-800/40 rounded-lg">
                  <h3 className="font-semibold text-blue-300 mb-2">Language and Currency</h3>
                  <p className="text-gray-300 text-sm leading-relaxed">
                    Currently, our platform is available in English only. We accept payments in multiple currencies through our payment processor, with amounts converted according to current exchange rates.
                  </p>
                </div>
              </div>
            </motion.section>

            {/* Contact Information */}
            <motion.section 
              className="p-6 rounded-lg bg-gradient-to-b from-purple-900/30 to-blue-900/30 border border-purple-500/30 backdrop-blur-sm shadow-xl hover:border-purple-400/40 transition-all duration-300"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.5 }}
            >
              <h2 className="text-2xl font-medium mb-4 text-white">Contact Us</h2>
              <p className="text-gray-300 mb-6 text-sm leading-relaxed">
                If you have any questions about accessing your CodEase products or services, please contact our support team:
              </p>
              
              <div className="flex flex-col sm:flex-row gap-4">
                <button 
                  onClick={() => setShowContactModal(true)}
                  className="px-6 py-3 bg-gradient-to-r from-blue-500 to-purple-500 hover:from-blue-600 hover:to-purple-600 text-white rounded-lg font-medium transition-all text-center text-sm"
                >
                  Contact Support
                </button>
              </div>
              
              <p className="mt-6 text-xs text-gray-400">
                We aim to respond to all support inquiries within 2 business days.
              </p>
            </motion.section>
          </div>
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