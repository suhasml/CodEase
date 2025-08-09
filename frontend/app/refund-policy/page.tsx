// 'use client'

// import Header from '@/components/Header/header';
// import Footer from '@/components/Footer/footer';
// import { motion } from 'framer-motion';
// import Link from 'next/link';
// import { ArrowLeft } from 'lucide-react';

// export default function RefundPolicy() {
//   return (
//     <div className="min-h-screen bg-gradient-to-b from-gray-950 via-gray-900 to-gray-950 text-white">
//       <Header />
      
//       {/* Background effects */}
//       <div className="relative overflow-hidden">
//         {/* Dynamic aurora effects */}
//         <div className="absolute -top-[500px] -left-[400px] w-[1000px] h-[1000px] bg-[radial-gradient(ellipse_at_center,hsla(217,100%,50%,0.12)_0%,transparent_70%)]" 
//              style={{ animation: 'aurora-x 25s ease-in-out infinite' }} />
//         <div className="absolute -top-[300px] -right-[300px] w-[800px] h-[800px] bg-[radial-gradient(ellipse_at_center,hsla(265,89%,60%,0.12)_0%,transparent_70%)]" 
//              style={{ animation: 'aurora-y 20s ease-in-out infinite' }} />
//         <div className="absolute bottom-[20%] left-[10%] w-[600px] h-[600px] bg-[radial-gradient(ellipse_at_center,hsla(190,95%,50%,0.06)_0%,transparent_70%)]" 
//              style={{ animation: 'aurora-pulse 30s ease infinite' }} />
        
//         {/* Grid effect */}
//         <div className="absolute inset-0 bg-[linear-gradient(rgba(59,130,246,0.05)_1px,transparent_1px),linear-gradient(90deg,rgba(59,130,246,0.05)_1px,transparent_1px)] bg-[size:40px_40px] [mask-image:radial-gradient(ellipse_at_center,black_20%,transparent_70%)]" />
//       </div>
      
//       <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-12 pt-28 relative z-10">
//         <motion.div 
//           className="max-w-4xl mx-auto"
//           initial={{ opacity: 0, y: 20 }}
//           animate={{ opacity: 1, y: 0 }}
//           transition={{ duration: 0.5 }}
//         >
//           <Link href="/pricing" className="mb-6 inline-flex items-center text-sm text-blue-400 hover:text-blue-300 transition-colors group">
//             <ArrowLeft className="w-4 h-4 mr-2 group-hover:-translate-x-1 transition-transform" />
//             Back to Pricing
//           </Link>

//           <h1 className="text-4xl font-semibold mb-6 text-transparent bg-clip-text bg-gradient-to-r from-blue-400 via-purple-400 to-teal-400 pb-2 border-b border-gray-700">Refund Policy</h1>
//           <p className="text-blue-300 mb-4 text-sm font-medium">Last Updated: April 11, 2025</p>
          
//           {/* Razorpay Policy Link - Added for verification */}
//           <div className="mb-6 p-4 rounded-lg bg-blue-900/20 border border-blue-500/30">
//             <p className="text-gray-300 text-sm leading-relaxed">
//               Our official refund policy is also available on Razorpay at{" "}
//               <a 
//                 href="https://merchant.razorpay.com/policy/QK8SfAxappIeFn/refund" 
//                 target="_blank" 
//                 rel="noopener noreferrer"
//                 className="text-blue-400 hover:text-blue-300 underline"
//               >
//                 https://merchant.razorpay.com/policy/QK8SfAxappIeFn/refund
//               </a>
//             </p>
//           </div>
          
//           {/* Introduction */}
//           <div className="mb-12">
//             <p className="text-lg text-gray-300 mb-4 leading-relaxed">
//               At CodEase, we strive to provide the best possible service for AI-powered browser extension development. This policy outlines our refund terms for subscriptions and credit purchases.
//             </p>
//           </div>
          
//           {/* Policy Sections */}
//           <div className="space-y-12">
//             {/* Subscription Refund Policy */}
//             <motion.section 
//               className="p-6 rounded-lg bg-gradient-to-b from-blue-900/30 to-purple-900/30 border border-blue-500/30 backdrop-blur-sm shadow-xl hover:border-blue-400/40 transition-all duration-300"
//               initial={{ opacity: 0, y: 20 }}
//               animate={{ opacity: 1, y: 0 }}
//               transition={{ duration: 0.5, delay: 0.1 }}
//             >
//               <h2 className="text-2xl font-medium mb-4 text-white">Subscription Refunds</h2>
              
//               <p className="text-gray-300 text-sm leading-relaxed mb-4">
//                 CodEase subscriptions provide immediate access to our premium features upon purchase. Our no-refund policy for subscriptions is as follows:
//               </p>
              
//               <div className="space-y-4 mb-6">
//                 <div className="p-4 border border-gray-700 bg-gray-800/40 rounded-lg">
//                   <h3 className="font-semibold text-amber-300 mb-2">No Refunds for Subscription Payments</h3>
//                   <p className="text-gray-300 text-sm leading-relaxed">
//                     We do not offer refunds for subscription payments once the payment has been processed. When you purchase a subscription, you will be billed for the period you selected (monthly or yearly).
//                   </p>
//                 </div>
                
//                 <div className="p-4 border border-gray-700 bg-gray-800/40 rounded-lg">
//                   <h3 className="font-semibold text-blue-300 mb-2">Subscription Cancellations</h3>
//                   <p className="text-gray-300 text-sm leading-relaxed">
//                     You may cancel your subscription at any time through your account settings. Your subscription will remain active until the end of your current billing period, and you will continue to have access to all features during this time. No partial refunds will be issued for the remaining time in the billing period.
//                   </p>
//                 </div>
//               </div>
              
//               <p className="text-gray-400 text-sm italic">
//                 By purchasing a subscription, you acknowledge and agree to these terms.
//               </p>
//             </motion.section>
          
//             {/* Credit Purchase Refund Policy */}
//             <motion.section 
//               className="p-6 rounded-lg bg-gradient-to-b from-purple-900/30 to-blue-900/30 border border-purple-500/30 backdrop-blur-sm shadow-xl hover:border-purple-400/40 transition-all duration-300"
//               initial={{ opacity: 0, y: 20 }}
//               animate={{ opacity: 1, y: 0 }}
//               transition={{ duration: 0.5, delay: 0.2 }}
//             >
//               <h2 className="text-2xl font-medium mb-4 text-white">Credit Purchase Refunds</h2>
              
//               <p className="text-gray-300 text-sm leading-relaxed mb-4">
//                 Credits are digital goods that are added to your account immediately after purchase. Our policy regarding credit purchases is:
//               </p>
              
//               <div className="space-y-4 mb-6">
//                 <div className="p-4 border border-gray-700 bg-gray-800/40 rounded-lg">
//                   <h3 className="font-semibold text-amber-300 mb-2">No Refunds for Credit Purchases</h3>
//                   <p className="text-gray-300 text-sm leading-relaxed">
//                     Due to the immediate digital delivery nature of credits, we do not offer refunds for credit purchases once they have been added to your account.
//                   </p>
//                 </div>
                
//                 <div className="p-4 border border-gray-700 bg-gray-800/40 rounded-lg">
//                   <h3 className="font-semibold text-blue-300 mb-2">Credit Validity</h3>
//                   <p className="text-gray-300 text-sm leading-relaxed">
//                     Credits purchased never expire and will remain in your account even if you cancel your subscription. You can use these credits at any time for services that require credit usage.
//                   </p>
//                 </div>
//               </div>
              
//               <p className="text-gray-400 text-sm italic">
//                 By purchasing credits, you acknowledge and agree to these terms.
//               </p>
//             </motion.section>
            
//             {/* Exceptional Circumstances */}
//             <motion.section 
//               className="p-6 rounded-lg bg-gradient-to-b from-blue-900/30 to-indigo-900/30 border border-blue-500/30 backdrop-blur-sm shadow-xl hover:border-blue-400/40 transition-all duration-300"
//               initial={{ opacity: 0, y: 20 }}
//               animate={{ opacity: 1, y: 0 }}
//               transition={{ duration: 0.5, delay: 0.3 }}
//             >
//               <h2 className="text-2xl font-medium mb-4 text-white">Exceptional Circumstances</h2>
              
//               <p className="text-gray-300 text-sm leading-relaxed mb-4">
//                 While we maintain a no-refund policy, we understand that exceptional circumstances may arise. In the following situations, we may consider refund requests on a case-by-case basis:
//               </p>
              
//               <ul className="space-y-2 text-gray-300 text-sm mb-4">
//                 <li className="flex items-start">
//                   <div className="w-4 h-4 rounded-full bg-blue-500/40 flex items-center justify-center mr-3 mt-1">
//                     <div className="w-2 h-2 rounded-full bg-blue-400"></div>
//                   </div>
//                   <span>Technical issues that prevent you from accessing our services for a prolonged period</span>
//                 </li>
//                 <li className="flex items-start">
//                   <div className="w-4 h-4 rounded-full bg-blue-500/40 flex items-center justify-center mr-3 mt-1">
//                     <div className="w-2 h-2 rounded-full bg-blue-400"></div>
//                   </div>
//                   <span>Erroneous charges or duplicate billings</span>
//                 </li>
//                 <li className="flex items-start">
//                   <div className="w-4 h-4 rounded-full bg-blue-500/40 flex items-center justify-center mr-3 mt-1">
//                     <div className="w-2 h-2 rounded-full bg-blue-400"></div>
//                   </div>
//                   <span>Legal requirements or compliance reasons</span>
//                 </li>
//               </ul>
              
//               <p className="text-gray-300 text-sm leading-relaxed mb-4">
//                 If you believe your situation warrants special consideration, please contact our support team with details about your purchase and the reason for your refund request.
//               </p>
              
//               <div className="p-4 border border-gray-700 bg-gray-800/40 rounded-lg mt-4">
//                 <h3 className="font-semibold text-green-300 mb-2">Refund Processing Time</h3>
//                 <p className="text-gray-300 text-sm leading-relaxed">
//                   For approved special circumstance refunds, we will process your refund within a maximum of 7 business days from the date of approval.
//                 </p>
//               </div>
//             </motion.section>
          
//             {/* Contact Information */}
//             <motion.section 
//               className="p-6 rounded-lg bg-gradient-to-b from-indigo-900/30 to-purple-900/30 border border-indigo-500/30 backdrop-blur-sm shadow-xl hover:border-indigo-400/40 transition-all duration-300"
//               initial={{ opacity: 0, y: 20 }}
//               animate={{ opacity: 1, y: 0 }}
//               transition={{ duration: 0.5, delay: 0.4 }}
//             >
//               <h2 className="text-2xl font-medium mb-4 text-white">Contact Us</h2>
//               <p className="text-gray-300 mb-6 text-sm leading-relaxed">
//                 If you have any questions about our refund policy or need assistance with your subscription or credit purchase, please contact our support team:
//               </p>
              
//               <div className="flex flex-col sm:flex-row gap-4">
//                 <a 
//                   href="mailto:support@codease.pro" 
//                   target="_blank"
//                   rel="noopener noreferrer"
//                   className="px-6 py-3 bg-gradient-to-r from-blue-500 to-purple-500 hover:from-blue-600 hover:to-purple-600 text-white rounded-lg font-medium transition-all text-center text-sm"
//                 >
//                   Contact Support
//                 </a>
//                 <Link 
//                   href="/faq"
//                   className="px-6 py-3 bg-gray-800 hover:bg-gray-700 text-white rounded-lg font-medium transition-all text-center text-sm"
//                 >
//                   View FAQs
//                 </Link>
//               </div>
              
//               <p className="mt-6 text-xs text-gray-400">
//                 We aim to respond to all support inquiries within 2 business days.
//               </p>
//             </motion.section>

//             {/* Policy Updates */}
//             <motion.section 
//               className="p-6 rounded-lg bg-gradient-to-b from-purple-900/30 to-blue-900/30 border border-purple-500/30 backdrop-blur-sm shadow-xl hover:border-purple-400/40 transition-all duration-300"
//               initial={{ opacity: 0, y: 20 }}
//               animate={{ opacity: 1, y: 0 }}
//               transition={{ duration: 0.5, delay: 0.5 }}
//             >
//               <h2 className="text-2xl font-medium mb-4 text-white">Policy Updates</h2>
//               <p className="text-gray-300 mb-3 text-sm leading-relaxed">
//                 We may update this Refund Policy from time to time to reflect changes in our practices or for legal, operational, or regulatory reasons.
//               </p>
//               <p className="text-gray-300 text-sm leading-relaxed">
//                 When we make significant changes to this policy, we will notify you via email or through a prominent notice on our website. Any changes to our refund policy will not be applied retroactively to previous purchases.
//               </p>
//             </motion.section>
//           </div>
//         </motion.div>
//       </div>

//       {/* CSS animations */}
//       <style jsx global>{`
//         @keyframes aurora-x {
//           0%, 100% { transform: translateX(0) rotate(0); opacity: 0.8; }
//           50% { transform: translateX(30px) rotate(5deg); opacity: 1; }
//         }
        
//         @keyframes aurora-y {
//           0%, 100% { transform: translateY(0) rotate(0); opacity: 0.7; }
//           50% { transform: translateY(30px) rotate(-5deg); opacity: 1; }
//         }
        
//         @keyframes aurora-pulse {
//           0%, 100% { opacity: 0.3; transform: scale(1); }
//           50% { opacity: 0.5; transform: scale(1.1); }
//         }
//       `}</style>
      
//       <Footer />
//     </div>
//   )
// }

'use client'

import Header from '@/components/Header/header';
import Footer from '@/components/Footer/footer';
import { motion } from 'framer-motion';
import Link from 'next/link';
import { ArrowLeft } from 'lucide-react';

export default function RefundPolicy() {
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
          <Link href="/pricing" className="mb-6 inline-flex items-center text-sm text-blue-400 hover:text-blue-300 transition-colors group">
            <ArrowLeft className="w-4 h-4 mr-2 group-hover:-translate-x-1 transition-transform" />
            Back to Pricing
          </Link>

          <h1 className="text-4xl font-semibold mb-6 text-transparent bg-clip-text bg-gradient-to-r from-blue-400 via-purple-400 to-teal-400 pb-2 border-b border-gray-700">Refund Policy</h1>
          <p className="text-blue-300 mb-4 text-sm font-medium">Last Updated: May 4, 2025</p>
          
          {/* Razorpay Policy Link - Added for verification */}
          <div className="mb-6 p-4 rounded-lg bg-blue-900/20 border border-blue-500/30">
            <p className="text-gray-300 text-sm leading-relaxed">
              Our official refund policy is also available on Razorpay at{" "}
              <a 
                href="https://merchant.razorpay.com/policy/QK8SfAxappIeFn/refund" 
                target="_blank" 
                rel="noopener noreferrer"
                className="text-blue-400 hover:text-blue-300 underline"
              >
                https://merchant.razorpay.com/policy/QK8SfAxappIeFn/refund
              </a>
            </p>
          </div>
          
          {/* Introduction */}
          <div className="mb-12">
            <p className="text-lg text-gray-300 mb-4 leading-relaxed">
              At CodEase, we strive to provide the best possible service for AI-powered browser extension development. This policy outlines our refund terms for credit purchases and subscriptions. We aim for fairness and transparency, and while refunds aren't guaranteed, we review all requests carefully.
            </p>
          </div>
          
          {/* Policy Sections */}
          <div className="space-y-12">
            {/* Credit Purchase Refund Policy */}
            <motion.section 
              className="p-6 rounded-lg bg-gradient-to-b from-purple-900/30 to-blue-900/30 border border-purple-500/30 backdrop-blur-sm shadow-xl hover:border-purple-400/40 transition-all duration-300"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.1 }} // Adjusted delay
            >
              <h2 className="text-2xl font-medium mb-4 text-white">Credit Purchase Refunds</h2>
              
              <p className="text-gray-300 text-sm leading-relaxed mb-4">
                Credits are digital goods added to your account immediately after purchase. Our policy regarding credit purchases is:
              </p>
              
              <div className="space-y-4 mb-6">
                <div className="p-4 border border-gray-700 bg-gray-800/40 rounded-lg">
                  <h3 className="font-semibold text-blue-300 mb-2">Refund Requests for Unused Credits</h3>
                  <p className="text-gray-300 text-sm leading-relaxed">
                    Due to their immediate digital nature, refunds for credits are generally not provided once purchased. However, if you have purchased credits and believe there was a significant issue with the purchase process or the service for which credits are used, you may submit a refund request for unused credits within 7 days of purchase. These requests will be reviewed on a case-by-case basis, and refunds may be issued if a valid reason is determined.
                  </p>
                </div>
                
                <div className="p-4 border border-gray-700 bg-gray-800/40 rounded-lg">
                  <h3 className="font-semibold text-blue-300 mb-2">Credit Validity</h3>
                  <p className="text-gray-300 text-sm leading-relaxed">
                    Credits purchased never expire and will remain in your account even if you cancel your subscription. You can use these credits at any time for services that require credit usage.
                  </p>
                </div>
              </div>
              
              <p className="text-gray-400 text-sm italic">
                By purchasing credits, you acknowledge these terms. Please contact support to submit a refund request.
              </p>
            </motion.section>

            {/* Subscription Refund Policy */}
            <motion.section 
              className="p-6 rounded-lg bg-gradient-to-b from-blue-900/30 to-purple-900/30 border border-blue-500/30 backdrop-blur-sm shadow-xl hover:border-blue-400/40 transition-all duration-300"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.2 }} // Adjusted delay
            >
              <h2 className="text-2xl font-medium mb-4 text-white">Subscription Refunds</h2>
              
              <p className="text-gray-300 text-sm leading-relaxed mb-4">
                CodEase subscriptions provide immediate access to our premium features upon purchase. Our general policy regarding subscription refunds is as follows:
              </p>
              
              <div className="space-y-4 mb-6">
                <div className="p-4 border border-gray-700 bg-gray-800/40 rounded-lg">
                  <h3 className="font-semibold text-blue-300 mb-2">Refund Requests for Dissatisfaction</h3>
                  <p className="text-gray-300 text-sm leading-relaxed">
                    We understand that you might be dissatisfied with the service. If you feel CodEase hasn't met your expectations, you can submit a refund request within 7 days of your initial subscription purchase or renewal. Requests will be reviewed on a case-by-case basis. We may grant a full or partial refund if we determine there was a significant issue or failure on our part justifying a refund.
                  </p>
                </div>
                
                <div className="p-4 border border-gray-700 bg-gray-800/40 rounded-lg">
                  <h3 className="font-semibold text-blue-300 mb-2">Subscription Cancellations</h3>
                  <p className="text-gray-300 text-sm leading-relaxed">
                    You may cancel your subscription at any time through your account settings. Your subscription will remain active until the end of your current billing period, and you will continue to have access to all features during this time. Cancelling does not automatically trigger a refund, but you can still submit a request as outlined above if applicable within the 7-day window.
                  </p>
                </div>
              </div>
              
              <p className="text-gray-400 text-sm italic">
                By purchasing a subscription, you acknowledge these terms. Please contact support to submit a refund request.
              </p>
            </motion.section>
            
            {/* Review Process & Other Circumstances */}
            <motion.section 
              className="p-6 rounded-lg bg-gradient-to-b from-blue-900/30 to-indigo-900/30 border border-blue-500/30 backdrop-blur-sm shadow-xl hover:border-blue-400/40 transition-all duration-300"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.3 }}
            >
              <h2 className="text-2xl font-medium mb-4 text-white">Review Process & Other Circumstances</h2>
              
              <p className="text-gray-300 text-sm leading-relaxed mb-4">
                All refund requests, whether for credits or subscriptions due to dissatisfaction or other exceptional circumstances, are reviewed individually. We aim to be fair and reasonable. Situations where we will consider refund requests include:
              </p>
              
              <ul className="space-y-2 text-gray-300 text-sm mb-4">
                <li className="flex items-start">
                  <div className="w-4 h-4 rounded-full bg-blue-500/40 flex items-center justify-center mr-3 mt-1">
                    <div className="w-2 h-2 rounded-full bg-blue-400"></div>
                  </div>
                  <span>Significant dissatisfaction or issues with the service/purchase within the first 7 days (as mentioned above)</span>
                </li>
                <li className="flex items-start">
                  <div className="w-4 h-4 rounded-full bg-blue-500/40 flex items-center justify-center mr-3 mt-1">
                    <div className="w-2 h-2 rounded-full bg-blue-400"></div>
                  </div>
                  <span>Technical issues originating from CodEase that prevent you from accessing core services for a prolonged period</span>
                </li>
                <li className="flex items-start">
                  <div className="w-4 h-4 rounded-full bg-blue-500/40 flex items-center justify-center mr-3 mt-1">
                    <div className="w-2 h-2 rounded-full bg-blue-400"></div>
                  </div>
                  <span>Confirmed erroneous charges or duplicate billings</span>
                </li>
                <li className="flex items-start">
                  <div className="w-4 h-4 rounded-full bg-blue-500/40 flex items-center justify-center mr-3 mt-1">
                    <div className="w-2 h-2 rounded-full bg-blue-400"></div>
                  </div>
                  <span>Specific legal requirements or compliance reasons</span>
                </li>
              </ul>
              
              <p className="text-gray-300 text-sm leading-relaxed mb-4">
                If you believe your situation warrants consideration, please contact our support team with detailed information about your purchase, account, and the reason for your refund request. Providing clear details will help expedite the review process.
              </p>
              
              <div className="p-4 border border-gray-700 bg-gray-800/40 rounded-lg mt-4">
                <h3 className="font-semibold text-green-300 mb-2">Refund Processing Time</h3>
                <p className="text-gray-300 text-sm leading-relaxed">
                  If a refund is approved after review, we will process it within a maximum of 7 business days from the date of approval. The time it takes for the funds to appear in your account may vary depending on your bank or payment provider.
                </p>
              </div>
            </motion.section>
          
            {/* Contact Information */}
            <motion.section 
              className="p-6 rounded-lg bg-gradient-to-b from-indigo-900/30 to-purple-900/30 border border-indigo-500/30 backdrop-blur-sm shadow-xl hover:border-indigo-400/40 transition-all duration-300"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.4 }}
            >
              <h2 className="text-2xl font-medium mb-4 text-white">Contact Us</h2>
              <p className="text-gray-300 mb-6 text-sm leading-relaxed">
                For any questions about this refund policy, to submit a refund request, or for assistance with your subscription or credits, please contact our support team:
              </p>
              
              <div className="flex flex-col sm:flex-row gap-4">
                <a 
                  href="mailto:support@codease.pro" 
                  target="_blank"
                  rel="noopener noreferrer"
                  className="px-6 py-3 bg-gradient-to-r from-blue-500 to-purple-500 hover:from-blue-600 hover:to-purple-600 text-white rounded-lg font-medium transition-all text-center text-sm"
                >
                  Contact Support for Refunds/Queries
                </a>
                <Link 
                  href="/faq"
                  className="px-6 py-3 bg-gray-800 hover:bg-gray-700 text-white rounded-lg font-medium transition-all text-center text-sm"
                >
                  View FAQs
                </Link>
              </div>
              
              <p className="mt-6 text-xs text-gray-400">
                We aim to respond to all support inquiries, including refund requests, within 2 business days.
              </p>
            </motion.section>

            {/* Policy Updates */}
            <motion.section 
              className="p-6 rounded-lg bg-gradient-to-b from-purple-900/30 to-blue-900/30 border border-purple-500/30 backdrop-blur-sm shadow-xl hover:border-purple-400/40 transition-all duration-300"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.5 }}
            >
              <h2 className="text-2xl font-medium mb-4 text-white">Policy Updates</h2>
              <p className="text-gray-300 mb-3 text-sm leading-relaxed">
                We may update this Refund Policy from time to time to reflect changes in our practices or for legal, operational, or regulatory reasons.
              </p>
              <p className="text-gray-300 text-sm leading-relaxed">
                When we make significant changes to this policy, we will notify you via email or through a prominent notice on our website. Your continued use of the service after such updates constitutes acceptance of the revised policy. Changes will not apply retroactively to purchases made before the policy update.
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
      
      <Footer />
    </div>
  )
}