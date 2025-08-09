// 'use client'

// export default function PrivacyPolicy() {
//   return (
//     <div className="min-h-screen bg-gray-50 text-gray-900">
//       <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-12 pt-28">
//         <div className="max-w-4xl mx-auto">
//           <h1 className="text-4xl font-semibold mb-6 text-gray-800 border-b border-gray-300 pb-2">Privacy Policy</h1>
//           <p className="text-gray-600 mb-10 text-sm font-medium">Last Updated: March 12, 2025</p>
          
//           {/* Introduction */}
//           <div className="mb-12">
//             <p className="text-lg text-gray-700 mb-4 leading-relaxed">
//               At CodEase, we are committed to protecting your privacy while providing powerful AI-driven browser extension development tools. This policy explains how we collect, use, and safeguard your information.
//             </p>
//             <p className="text-gray-600 text-sm">
//               By using CodEase, you agree to the collection and use of information in accordance with this policy.
//             </p>
//           </div>
          
//           {/* Policy Sections */}
//           <div className="space-y-12">
//             {/* Information Collection */}
//             <section className="p-6 rounded-lg bg-white border border-gray-200 shadow-sm hover:shadow-md transition-shadow">
//               <h2 className="text-2xl font-medium mb-4 text-gray-800">Information We Collect</h2>
              
//               <div className="space-y-6">
//                 <div>
//                   <h3 className="font-semibold text-gray-700 mb-2">Account Information</h3>
//                   <p className="text-gray-600 text-sm leading-relaxed">
//                     When you create an account or sign up for our beta, we collect email addresses to manage your account, provide access to our services, and communicate important updates.
//                   </p>
//                 </div>
                
//                 <div>
//                   <h3 className="font-semibold text-gray-700 mb-2">Generated Extensions</h3>
//                   <p className="text-gray-600 text-sm leading-relaxed">
//                     We store only the final generated extension zip files to provide you with access to your previously created extensions. We do not store your extension descriptions, prompts, or other development data.
//                   </p>
//                 </div>
                
//                 <div>
//                   <h3 className="font-semibold text-gray-700 mb-2">Session Information</h3>
//                   <p className="text-gray-600 text-sm leading-relaxed">
//                     We collect basic session information such as login times and service usage for security and troubleshooting purposes.
//                   </p>
//                 </div>
//               </div>
//             </section>
          
//             {/* How We Use Information */}
//             <section className="p-6 rounded-lg bg-white border border-gray-200 shadow-sm hover:shadow-md transition-shadow">
//               <h2 className="text-2xl font-medium mb-4 text-gray-800">How We Use Your Information</h2>
              
//               <ul className="space-y-4 text-gray-600 text-sm">
//                 <li className="flex items-start">
//                   <div className="w-4 h-4 rounded-full bg-gray-300 flex items-center justify-center mr-3 mt-1">
//                     <div className="w-2 h-2 rounded-full bg-gray-500"></div>
//                   </div>
//                   <span>To generate browser extensions based on your requirements</span>
//                 </li>
//                 <li className="flex items-start">
//                   <div className="w-4 h-4 rounded-full bg-gray-300 flex items-center justify-center mr-3 mt-1">
//                     <div className="w-2 h-2 rounded-full bg-gray-500"></div>
//                   </div>
//                   <span>To store and provide access to your generated extension files</span>
//                 </li>
//                 <li className="flex items-start">
//                   <div className="w-4 h-4 rounded-full bg-gray-300 flex items-center justify-center mr-3 mt-1">
//                     <div className="w-2 h-2 rounded-full bg-gray-500"></div>
//                   </div>
//                   <span>To communicate with you about service updates and new features</span>
//                 </li>
//                 <li className="flex items-start">
//                   <div className="w-4 h-4 rounded-full bg-gray-300 flex items-center justify-center mr-3 mt-1">
//                     <div className="w-2 h-2 rounded-full bg-gray-500"></div>
//                   </div>
//                   <span>To troubleshoot technical issues and improve platform stability</span>
//                 </li>
//                 <li className="flex items-start">
//                   <div className="w-4 h-4 rounded-full bg-gray-300 flex items-center justify-center mr-3 mt-1">
//                     <div className="w-2 h-2 rounded-full bg-gray-500"></div>
//                   </div>
//                   <span>To maintain account security and prevent fraud</span>
//                 </li>
//               </ul>
//             </section>
            
//             {/* Data Storage & Sharing */}
//             <section className="p-6 rounded-lg bg-white border border-gray-200 shadow-sm hover:shadow-md transition-shadow">
//               <h2 className="text-2xl font-medium mb-4 text-gray-800">Data Storage and Sharing</h2>
              
//               <div className="mb-6">
//                 <h3 className="font-semibold text-gray-700 mb-2">Data Storage</h3>
//                 <p className="text-gray-600 mb-3 text-sm leading-relaxed">
//                   We only store your completed extension zip files on our secure servers to allow you to access and reuse your extensions. Your prompts, descriptions, and interaction data are not stored after your session ends.
//                 </p>
//                 <p className="text-gray-600 text-sm leading-relaxed">
//                   We utilize industry-standard security measures to protect your data from unauthorized access or disclosure.
//                 </p>
//               </div>
              
//               <div>
//                 <h3 className="font-semibold text-gray-700 mb-2">Third-Party Services</h3>
//                 <p className="text-gray-600 mb-3 text-sm leading-relaxed">
//                   We use third-party AI services like OpenAI and Anthropic to power our code generation features. Your requests to these services are processed in real-time and are not stored or used for AI model retraining.
//                 </p>
//                 <p className="text-gray-600 text-sm leading-relaxed">
//                   Our integration with these AI models is designed to maintain your privacy while providing high-quality extension code generation.
//                 </p>
//               </div>
              
//               <div className="mt-6 p-4 bg-gray-100 rounded-lg border border-gray-300">
//                 <p className="text-gray-800 font-semibold text-sm">Data Commitment</p>
//                 <p className="text-gray-600 text-xs">
//                   We will never sell your personal information or extension files to third parties for advertising purposes or use your data to train AI models.
//                 </p>
//               </div>
//             </section>
          
//             {/* Your Rights */}
//             <section className="p-6 rounded-lg bg-white border border-gray-200 shadow-sm hover:shadow-md transition-shadow">
//               <h2 className="text-2xl font-medium mb-4 text-gray-800">Your Rights</h2>
              
//               <div className="grid md:grid-cols-2 gap-6">
//                 <div className="p-4 border border-gray-300 rounded-lg transition-shadow hover:shadow-sm">
//                   <h3 className="font-semibold text-gray-700 mb-2">Access</h3>
//                   <p className="text-gray-600 text-xs leading-relaxed">
//                     You can access your stored extension files at any time through your account.
//                   </p>
//                 </div>
                
//                 <div className="p-4 border border-gray-300 rounded-lg transition-shadow hover:shadow-sm">
//                   <h3 className="font-semibold text-gray-700 mb-2">Deletion</h3>
//                   <p className="text-gray-600 text-xs leading-relaxed">
//                     You can delete your account and associated extension files at any time through your account settings.
//                   </p>
//                 </div>
                
//                 <div className="p-4 border border-gray-300 rounded-lg transition-shadow hover:shadow-sm">
//                   <h3 className="font-semibold text-gray-700 mb-2">Control</h3>
//                   <p className="text-gray-600 text-xs leading-relaxed">
//                     You maintain complete control over your extension files and can download or delete them at any time.
//                   </p>
//                 </div>
                
//                 <div className="p-4 border border-gray-300 rounded-lg transition-shadow hover:shadow-sm">
//                   <h3 className="font-semibold text-gray-700 mb-2">Ownership</h3>
//                   <p className="text-gray-600 text-xs leading-relaxed">
//                     You retain full ownership of all extensions generated using our platform.
//                   </p>
//                 </div>
//               </div>
//             </section>
            
//             {/* Children's Privacy */}
//             <section className="p-6 rounded-lg bg-white border border-gray-200 shadow-sm hover:shadow-md transition-shadow">
//               <h2 className="text-2xl font-medium mb-4 text-gray-800">Children's Privacy</h2>
//               <p className="text-gray-600 text-sm leading-relaxed">
//                 CodEase is not intended for use by individuals under the age of 16. We do not knowingly collect personal information from children under 16. If you believe a child has provided us with their information, please contact us and we will promptly remove such information.
//               </p>
//             </section>
            
//             {/* Policy Updates */}
//             <section className="p-6 rounded-lg bg-white border border-gray-200 shadow-sm hover:shadow-md transition-shadow">
//               <h2 className="text-2xl font-medium mb-4 text-gray-800">Policy Updates</h2>
//               <p className="text-gray-600 mb-3 text-sm leading-relaxed">
//                 We may update this Privacy Policy from time to time to reflect changes in our practices or for legal, operational, or regulatory reasons.
//               </p>
//               <p className="text-gray-600 text-sm leading-relaxed">
//                 When we make significant changes to this policy, we will notify you via email or through a prominent notice on our website. We encourage you to periodically review this page for the latest information on our privacy practices.
//               </p>
//             </section>
            
//             {/* Contact Us */}
//             <section className="p-6 rounded-lg bg-white border border-gray-200 shadow-sm">
//               <h2 className="text-2xl font-medium mb-4 text-gray-800">Contact Us</h2>
//               <p className="text-gray-600 mb-6 text-sm leading-relaxed">
//                 If you have any questions or concerns about our Privacy Policy or data practices, please contact us:
//               </p>
              
//               <div className="flex flex-col sm:flex-row gap-4">
//                 <a 
//                     href="mailto:admin@codease.pro" 
//                     target="_blank"
//                     rel="noopener noreferrer"
//                     className="px-6 py-3 bg-gray-800 text-white rounded-lg font-medium hover:bg-gray-900 transition-all text-center text-sm"
//                 >
//                   Email Our Privacy Team
//                 </a>
//               </div>
              
//               <p className="mt-6 text-xs text-gray-500">
//                 We will respond to all legitimate privacy inquiries within 7 business days.
//               </p>
//             </section>
//           </div>
//         </div>
//       </div>
//     </div>
//   )
// }

'use client'

import Header from '@/components/Header/header';
import Footer from '@/components/Footer/footer';
import { motion } from 'framer-motion';

export default function PrivacyPolicy() {
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
          <h1 className="text-4xl font-semibold mb-6 text-transparent bg-clip-text bg-gradient-to-r from-blue-400 via-purple-400 to-teal-400 pb-2 border-b border-gray-700">Privacy Policy</h1>
          <p className="text-blue-300 mb-10 text-sm font-medium">Last Updated: March 12, 2025</p>
          
          {/* Introduction */}
          <div className="mb-12">
            <p className="text-lg text-gray-300 mb-4 leading-relaxed">
              At CodEase, we are committed to protecting your privacy while providing powerful AI-driven browser extension development tools. This policy explains how we collect, use, and safeguard your information.
            </p>
            <p className="text-gray-400 text-sm">
              By using CodEase, you agree to the collection and use of information in accordance with this policy.
            </p>
          </div>
          
          {/* Policy Sections */}
          <div className="space-y-12">
            {/* Information Collection */}
            <motion.section 
              className="p-6 rounded-lg bg-gradient-to-b from-blue-900/30 to-purple-900/30 border border-blue-500/30 backdrop-blur-sm shadow-xl hover:border-blue-400/40 transition-all duration-300"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.1 }}
            >
              <h2 className="text-2xl font-medium mb-4 text-white">Information We Collect</h2>
              
              <div className="space-y-6">
                <div>
                  <h3 className="font-semibold text-blue-300 mb-2">Account Information</h3>
                  <p className="text-gray-300 text-sm leading-relaxed">
                    When you create an account or sign up for our beta, we collect email addresses to manage your account, provide access to our services, and communicate important updates.
                  </p>
                </div>
                
                <div>
                  <h3 className="font-semibold text-blue-300 mb-2">Generated Extensions</h3>
                  <p className="text-gray-300 text-sm leading-relaxed">
                    We store only the final generated extension zip files to provide you with access to your previously created extensions. We do not store your extension descriptions, prompts, or other development data.
                  </p>
                </div>
                
                <div>
                  <h3 className="font-semibold text-blue-300 mb-2">Session Information</h3>
                  <p className="text-gray-300 text-sm leading-relaxed">
                    We collect basic session information such as login times and service usage for security and troubleshooting purposes.
                  </p>
                </div>
              </div>
            </motion.section>
          
            {/* How We Use Information */}
            <motion.section 
              className="p-6 rounded-lg bg-gradient-to-b from-purple-900/30 to-blue-900/30 border border-purple-500/30 backdrop-blur-sm shadow-xl hover:border-purple-400/40 transition-all duration-300"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.2 }}
            >
              <h2 className="text-2xl font-medium mb-4 text-white">How We Use Your Information</h2>
              
              <ul className="space-y-4 text-gray-300 text-sm">
                <li className="flex items-start">
                  <div className="w-4 h-4 rounded-full bg-purple-500/40 flex items-center justify-center mr-3 mt-1">
                    <div className="w-2 h-2 rounded-full bg-purple-400"></div>
                  </div>
                  <span>To generate browser extensions based on your requirements</span>
                </li>
                <li className="flex items-start">
                  <div className="w-4 h-4 rounded-full bg-purple-500/40 flex items-center justify-center mr-3 mt-1">
                    <div className="w-2 h-2 rounded-full bg-purple-400"></div>
                  </div>
                  <span>To store and provide access to your generated extension files</span>
                </li>
                <li className="flex items-start">
                  <div className="w-4 h-4 rounded-full bg-purple-500/40 flex items-center justify-center mr-3 mt-1">
                    <div className="w-2 h-2 rounded-full bg-purple-400"></div>
                  </div>
                  <span>To communicate with you about service updates and new features</span>
                </li>
                <li className="flex items-start">
                  <div className="w-4 h-4 rounded-full bg-purple-500/40 flex items-center justify-center mr-3 mt-1">
                    <div className="w-2 h-2 rounded-full bg-purple-400"></div>
                  </div>
                  <span>To troubleshoot technical issues and improve platform stability</span>
                </li>
                <li className="flex items-start">
                  <div className="w-4 h-4 rounded-full bg-purple-500/40 flex items-center justify-center mr-3 mt-1">
                    <div className="w-2 h-2 rounded-full bg-purple-400"></div>
                  </div>
                  <span>To maintain account security and prevent fraud</span>
                </li>
              </ul>
            </motion.section>
            
            {/* Data Storage & Sharing */}
            <motion.section 
              className="p-6 rounded-lg bg-gradient-to-b from-blue-900/30 to-indigo-900/30 border border-blue-500/30 backdrop-blur-sm shadow-xl hover:border-blue-400/40 transition-all duration-300"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.3 }}
            >
              <h2 className="text-2xl font-medium mb-4 text-white">Data Storage and Sharing</h2>
              
              <div className="mb-6">
                <h3 className="font-semibold text-blue-300 mb-2">Data Storage</h3>
                <p className="text-gray-300 mb-3 text-sm leading-relaxed">
                  We only store your completed extension zip files on our secure servers to allow you to access and reuse your extensions. Your prompts, descriptions, and interaction data are not stored after your session ends.
                </p>
                <p className="text-gray-300 text-sm leading-relaxed">
                  We utilize industry-standard security measures to protect your data from unauthorized access or disclosure.
                </p>
              </div>
              
              <div>
                <h3 className="font-semibold text-blue-300 mb-2">Third-Party Services</h3>
                <p className="text-gray-300 mb-3 text-sm leading-relaxed">
                  We use third-party AI services like OpenAI and Anthropic to power our code generation features. Your requests to these services are processed in real-time and are not stored or used for AI model retraining.
                </p>
                <p className="text-gray-300 text-sm leading-relaxed">
                  Our integration with these AI models is designed to maintain your privacy while providing high-quality extension code generation.
                </p>
              </div>
              
              <div className="mt-6 p-4 bg-gray-800/60 rounded-lg border border-gray-700">
                <p className="text-white font-semibold text-sm">Data Commitment</p>
                <p className="text-gray-300 text-xs">
                  We will never sell your personal information or extension files to third parties for advertising purposes or use your data to train AI models.
                </p>
              </div>
            </motion.section>
          
            {/* Your Rights */}
            <motion.section 
              className="p-6 rounded-lg bg-gradient-to-b from-indigo-900/30 to-purple-900/30 border border-indigo-500/30 backdrop-blur-sm shadow-xl hover:border-indigo-400/40 transition-all duration-300"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.4 }}
            >
              <h2 className="text-2xl font-medium mb-4 text-white">Your Rights</h2>
              
              <div className="grid md:grid-cols-2 gap-6">
                <div className="p-4 border border-gray-700 bg-gray-800/40 rounded-lg transition-shadow hover:shadow-indigo-500/10 hover:border-indigo-500/40">
                  <h3 className="font-semibold text-indigo-300 mb-2">Access</h3>
                  <p className="text-gray-300 text-xs leading-relaxed">
                    You can access your stored extension files at any time through your account.
                  </p>
                </div>
                
                <div className="p-4 border border-gray-700 bg-gray-800/40 rounded-lg transition-shadow hover:shadow-indigo-500/10 hover:border-indigo-500/40">
                  <h3 className="font-semibold text-indigo-300 mb-2">Deletion</h3>
                  <p className="text-gray-300 text-xs leading-relaxed">
                    You can delete your account and associated extension files at any time through your account settings.
                  </p>
                </div>
                
                <div className="p-4 border border-gray-700 bg-gray-800/40 rounded-lg transition-shadow hover:shadow-indigo-500/10 hover:border-indigo-500/40">
                  <h3 className="font-semibold text-indigo-300 mb-2">Control</h3>
                  <p className="text-gray-300 text-xs leading-relaxed">
                    You maintain complete control over your extension files and can download or delete them at any time.
                  </p>
                </div>
                
                <div className="p-4 border border-gray-700 bg-gray-800/40 rounded-lg transition-shadow hover:shadow-indigo-500/10 hover:border-indigo-500/40">
                  <h3 className="font-semibold text-indigo-300 mb-2">Ownership</h3>
                  <p className="text-gray-300 text-xs leading-relaxed">
                    You retain full ownership of all extensions generated using our platform.
                  </p>
                </div>
              </div>
            </motion.section>
            
            {/* Children's Privacy */}
            <motion.section 
              className="p-6 rounded-lg bg-gradient-to-b from-purple-900/30 to-blue-900/30 border border-purple-500/30 backdrop-blur-sm shadow-xl hover:border-purple-400/40 transition-all duration-300"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.5 }}
            >
              <h2 className="text-2xl font-medium mb-4 text-white">Children's Privacy</h2>
              <p className="text-gray-300 text-sm leading-relaxed">
                CodEase is not intended for use by individuals under the age of 16. We do not knowingly collect personal information from children under 16. If you believe a child has provided us with their information, please contact us and we will promptly remove such information.
              </p>
            </motion.section>
            
            {/* Policy Updates */}
            <motion.section 
              className="p-6 rounded-lg bg-gradient-to-b from-blue-900/30 to-indigo-900/30 border border-blue-500/30 backdrop-blur-sm shadow-xl hover:border-blue-400/40 transition-all duration-300"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.6 }}
            >
              <h2 className="text-2xl font-medium mb-4 text-white">Policy Updates</h2>
              <p className="text-gray-300 mb-3 text-sm leading-relaxed">
                We may update this Privacy Policy from time to time to reflect changes in our practices or for legal, operational, or regulatory reasons.
              </p>
              <p className="text-gray-300 text-sm leading-relaxed">
                When we make significant changes to this policy, we will notify you via email or through a prominent notice on our website. We encourage you to periodically review this page for the latest information on our privacy practices.
              </p>
            </motion.section>
            
            {/* Contact Us */}
            <motion.section 
              className="p-6 rounded-lg bg-gradient-to-b from-indigo-900/30 to-purple-900/30 border border-indigo-500/30 backdrop-blur-sm shadow-xl hover:border-indigo-400/40 transition-all duration-300"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.7 }}
            >
              <h2 className="text-2xl font-medium mb-4 text-white">Contact Us</h2>
              <p className="text-gray-300 mb-6 text-sm leading-relaxed">
                If you have any questions or concerns about our Privacy Policy or data practices, please contact us:
              </p>
              
              <div className="flex flex-col sm:flex-row gap-4">
                <a 
                    href="mailto:admin@codease.pro" 
                    target="_blank"
                    rel="noopener noreferrer"
                    className="px-6 py-3 bg-gradient-to-r from-blue-500 to-purple-500 hover:from-blue-600 hover:to-purple-600 text-white rounded-lg font-medium transition-all text-center text-sm"
                >
                  Email Our Privacy Team
                </a>
              </div>
              
              <p className="mt-6 text-xs text-gray-400">
                We will respond to all legitimate privacy inquiries within 7 business days.
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