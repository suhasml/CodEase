'use client'

import Header from '@/components/Header/header';
import Footer from '@/components/Footer/footer';
import { motion } from 'framer-motion';
import Link from 'next/link';
import { ArrowLeft } from 'lucide-react';
import { useState } from 'react';
import ContactModal from '@/components/Modal/ContactModal';

export default function TermsAndConditions() {
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

          <h1 className="text-4xl font-semibold mb-6 text-transparent bg-clip-text bg-gradient-to-r from-blue-400 via-purple-400 to-teal-400 pb-2 border-b border-gray-700">Terms and Conditions</h1>
          <p className="text-blue-300 mb-4 text-sm font-medium">Last Updated: April 19, 2025</p>
          
          {/* Razorpay Policy Link - Added for verification */}
          <div className="mb-6 p-4 rounded-lg bg-blue-900/20 border border-blue-500/30">
            <p className="text-gray-300 text-sm leading-relaxed">
              Our official terms and conditions are also available on Razorpay at{" "}
              <a 
                href="https://merchant.razorpay.com/policy/QK8SfAxappIeFn/terms" 
                target="_blank" 
                rel="noopener noreferrer"
                className="text-blue-400 hover:text-blue-300 underline"
              >
                https://merchant.razorpay.com/policy/QK8SfAxappIeFn/terms
              </a>
            </p>
          </div>
          
          {/* Introduction */}
          <div className="mb-12">
            <p className="text-lg text-gray-300 mb-4 leading-relaxed">
              Welcome to CodEase. These Terms and Conditions govern your use of our website, services, and products. By accessing or using CodEase, you agree to be bound by these terms. Please read them carefully.
            </p>
          </div>
          
          {/* Policy Sections */}
          <div className="space-y-12">
            {/* Acceptance of Terms */}
            <motion.section 
              className="p-6 rounded-lg bg-gradient-to-b from-blue-900/30 to-purple-900/30 border border-blue-500/30 backdrop-blur-sm shadow-xl hover:border-blue-400/40 transition-all duration-300"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.1 }}
            >
              <h2 className="text-2xl font-medium mb-4 text-white">Acceptance of Terms</h2>
              
              <p className="text-gray-300 text-sm leading-relaxed mb-4">
                By accessing or using CodEase services, you acknowledge that you have read, understood, and agree to be bound by these Terms and Conditions, as well as our Privacy Policy.
              </p>
              
              <div className="space-y-4 mb-6">
                <div className="p-4 border border-gray-700 bg-gray-800/40 rounded-lg">
                  <h3 className="font-semibold text-blue-300 mb-2">Eligibility</h3>
                  <p className="text-gray-300 text-sm leading-relaxed">
                    You must be at least 18 years old to use our services. By agreeing to these terms, you represent and warrant that you are at least 18 years of age and have the legal capacity to enter into a binding agreement.
                  </p>
                </div>
                
                <div className="p-4 border border-gray-700 bg-gray-800/40 rounded-lg">
                  <h3 className="font-semibold text-blue-300 mb-2">Changes to Terms</h3>
                  <p className="text-gray-300 text-sm leading-relaxed">
                    We reserve the right to modify these Terms and Conditions at any time. Changes will be effective upon posting to the website. Your continued use of our services after changes are posted constitutes your acceptance of the updated terms.
                  </p>
                </div>
              </div>
            </motion.section>
          
            {/* Account Registration and Security */}
            <motion.section 
              className="p-6 rounded-lg bg-gradient-to-b from-purple-900/30 to-blue-900/30 border border-purple-500/30 backdrop-blur-sm shadow-xl hover:border-purple-400/40 transition-all duration-300"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.2 }}
            >
              <h2 className="text-2xl font-medium mb-4 text-white">Account Registration and Security</h2>
              
              <p className="text-gray-300 text-sm leading-relaxed mb-4">
                To access certain features of CodEase, you may need to create an account. You are responsible for maintaining the security of your account.
              </p>
              
              <div className="space-y-4 mb-6">
                <div className="p-4 border border-gray-700 bg-gray-800/40 rounded-lg">
                  <h3 className="font-semibold text-blue-300 mb-2">Account Information</h3>
                  <p className="text-gray-300 text-sm leading-relaxed">
                    You agree to provide accurate, current, and complete information during the registration process and to update such information to keep it accurate, current, and complete.
                  </p>
                </div>
                
                <div className="p-4 border border-gray-700 bg-gray-800/40 rounded-lg">
                  <h3 className="font-semibold text-blue-300 mb-2">Account Security</h3>
                  <p className="text-gray-300 text-sm leading-relaxed">
                    You are solely responsible for maintaining the confidentiality of your account credentials and for all activities that occur under your account. You agree to notify us immediately of any unauthorized access or use of your account.
                  </p>
                </div>
              </div>
            </motion.section>
            
            {/* Service Usage */}
            <motion.section 
              className="p-6 rounded-lg bg-gradient-to-b from-blue-900/30 to-indigo-900/30 border border-blue-500/30 backdrop-blur-sm shadow-xl hover:border-blue-400/40 transition-all duration-300"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.3 }}
            >
              <h2 className="text-2xl font-medium mb-4 text-white">Service Usage</h2>
              
              <p className="text-gray-300 text-sm leading-relaxed mb-4">
                CodEase provides AI-powered browser extension development tools and services. Your use of these services is subject to the following terms:
              </p>
              
              <ul className="space-y-4 text-gray-300 text-sm mb-4">
                <li className="p-4 border border-gray-700 bg-gray-800/40 rounded-lg">
                  <h3 className="font-semibold text-blue-300 mb-2">Acceptable Use</h3>
                  <p className="leading-relaxed">
                    You agree to use our services only for lawful purposes and in accordance with these Terms. You agree not to use our services:
                  </p>
                  <ul className="list-disc pl-6 mt-2 space-y-1">
                    <li>In any way that violates any applicable federal, state, local, or international law or regulation</li>
                    <li>To transmit, or procure the sending of, any advertising or promotional material, including any "junk mail", "chain letter", "spam", or any other similar solicitation</li>
                    <li>To impersonate or attempt to impersonate CodEase, a CodEase employee, another user, or any other person or entity</li>
                    <li>To engage in any other conduct that restricts or inhibits anyone's use or enjoyment of the service</li>
                  </ul>
                </li>
                
                <li className="p-4 border border-gray-700 bg-gray-800/40 rounded-lg">
                  <h3 className="font-semibold text-blue-300 mb-2">Service Modifications</h3>
                  <p className="leading-relaxed">
                    CodEase reserves the right to modify, suspend, or discontinue any part of our services at any time without prior notice. We will not be liable to you or any third party for any modification, suspension, or discontinuation of our services.
                  </p>
                </li>
              </ul>
            </motion.section>
          
            {/* Intellectual Property */}
            {/* <motion.section 
              className="p-6 rounded-lg bg-gradient-to-b from-indigo-900/30 to-purple-900/30 border border-indigo-500/30 backdrop-blur-sm shadow-xl hover:border-indigo-400/40 transition-all duration-300"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.4 }}
            >
              <h2 className="text-2xl font-medium mb-4 text-white">Intellectual Property</h2>
              
              <div className="space-y-4 mb-6">
                <div className="p-4 border border-gray-700 bg-gray-800/40 rounded-lg">
                  <h3 className="font-semibold text-blue-300 mb-2">CodEase Content</h3>
                  <p className="text-gray-300 text-sm leading-relaxed">
                    The content, features, and functionality of our website and services, including but not limited to text, graphics, logos, icons, images, audio clips, digital downloads, and software, are owned by CodEase or its licensors and are protected by copyright, trademark, and other intellectual property laws.
                  </p>
                </div>
                
                <div className="p-4 border border-gray-700 bg-gray-800/40 rounded-lg">
                  <h3 className="font-semibold text-blue-300 mb-2">User Content</h3>
                  <p className="text-gray-300 text-sm leading-relaxed">
                    You retain ownership of any intellectual property rights that you hold in content you create using our services. By using our services, you grant us a worldwide, royalty-free license to use, reproduce, modify, adapt, publish, translate, and distribute your content in connection with providing our services to you.
                  </p>
                </div>
              </div>
            </motion.section> */}

            {/* Payments and Subscriptions */}
            <motion.section 
              className="p-6 rounded-lg bg-gradient-to-b from-purple-900/30 to-blue-900/30 border border-purple-500/30 backdrop-blur-sm shadow-xl hover:border-purple-400/40 transition-all duration-300"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.5 }}
            >
              <h2 className="text-2xl font-medium mb-4 text-white">Payments and Subscriptions</h2>
              
              <div className="space-y-4 mb-6">
                <div className="p-4 border border-gray-700 bg-gray-800/40 rounded-lg">
                  <h3 className="font-semibold text-blue-300 mb-2">Billing</h3>
                  <p className="text-gray-300 text-sm leading-relaxed">
                    By providing a payment method, you authorize us to charge you for all fees associated with your subscription or purchase. Payments are non-refundable except as expressly stated in our Refund Policy.
                  </p>
                </div>
                
                <div className="p-4 border border-gray-700 bg-gray-800/40 rounded-lg">
                  <h3 className="font-semibold text-blue-300 mb-2">Subscription Terms</h3>
                  <p className="text-gray-300 text-sm leading-relaxed">
                    Subscriptions automatically renew at the end of each billing period unless canceled before the renewal date. You can cancel your subscription at any time through your account settings. Upon cancellation, your subscription will remain active until the end of your current billing period.
                  </p>
                </div>
                
                <div className="p-4 border border-gray-700 bg-gray-800/40 rounded-lg">
                  <h3 className="font-semibold text-blue-300 mb-2">Price Changes</h3>
                  <p className="text-gray-300 text-sm leading-relaxed">
                    We reserve the right to adjust pricing for our services at any time. If the price of your subscription changes, we will notify you before charging you the new price.
                  </p>
                </div>
              </div>
              
              <p className="text-gray-400 text-sm italic">
                For more details on payment terms, please refer to our <Link href="/refund-policy" className="text-blue-400 hover:text-blue-300">Refund Policy</Link>.
              </p>
            </motion.section>
            
            {/* Limitation of Liability */}
            <motion.section 
              className="p-6 rounded-lg bg-gradient-to-b from-blue-900/30 to-indigo-900/30 border border-blue-500/30 backdrop-blur-sm shadow-xl hover:border-blue-400/40 transition-all duration-300"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.6 }}
            >
              <h2 className="text-2xl font-medium mb-4 text-white">Limitation of Liability</h2>
              
              <p className="text-gray-300 text-sm leading-relaxed mb-4">
                To the maximum extent permitted by law, CodEase and its affiliates, officers, employees, agents, partners, and licensors shall not be liable for any indirect, incidental, special, consequential, or punitive damages, including without limitation, loss of profits, data, use, goodwill, or other intangible losses, resulting from:
              </p>
              
              <ul className="space-y-2 text-gray-300 text-sm mb-4 pl-6 list-disc">
                <li>Your access to or use of or inability to access or use our services</li>
                <li>Any conduct or content of any third party on our services</li>
                <li>Any content obtained from our services</li>
                <li>Unauthorized access, use, or alteration of your transmissions or content</li>
              </ul>
              
              <p className="text-gray-300 text-sm leading-relaxed">
                In no event shall our total liability to you for all claims exceed the amount you paid to us during the past 12 months.
              </p>
            </motion.section>
            
            {/* Contact Information */}
            <motion.section 
              className="p-6 rounded-lg bg-gradient-to-b from-indigo-900/30 to-purple-900/30 border border-indigo-500/30 backdrop-blur-sm shadow-xl hover:border-indigo-400/40 transition-all duration-300"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.7 }}
            >
              <h2 className="text-2xl font-medium mb-4 text-white">Contact Us</h2>
              <p className="text-gray-300 mb-6 text-sm leading-relaxed">
                If you have any questions about these Terms and Conditions, please contact our support team:
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
                We aim to respond to all inquiries within 2 business days.
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