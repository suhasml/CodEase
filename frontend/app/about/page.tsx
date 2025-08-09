'use client'

import Header from '@/components/Header/header';
import Footer from '@/components/Footer/footer';
import { motion } from 'framer-motion';
import Link from 'next/link';
import { ArrowLeft, Code, Cpu, Globe, Lightbulb, MessageSquare, Target, Users } from 'lucide-react';
import { useState } from 'react';
import ContactModal from '@/components/Modal/ContactModal';

export default function AboutPage() {
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
          className="max-w-5xl mx-auto"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          <Link href="/" className="mb-6 inline-flex items-center text-sm text-blue-400 hover:text-blue-300 transition-colors group">
            <ArrowLeft className="w-4 h-4 mr-2 group-hover:-translate-x-1 transition-transform" />
            Back to Home
          </Link>

          <h1 className="text-4xl md:text-5xl font-semibold mb-6 text-transparent bg-clip-text bg-gradient-to-r from-blue-400 via-purple-400 to-teal-400 pb-2">About CodEase</h1>
          
          {/* Hero Section */}
          <div className="mb-16">
            <p className="text-xl text-gray-300 mb-6 leading-relaxed">
              Revolutionizing browser extension development with the power of AI, making it accessible to everyone regardless of coding experience.
            </p>
            
            {/* <div className="rounded-2xl overflow-hidden border border-blue-500/20 shadow-[0_0_40px_rgba(59,130,246,0.1)]">
              <Image 
                src="/about-hero.jpg" 
                alt="CodEase Team Working" 
                width={1200} 
                height={600} 
                className="w-full h-auto object-cover"
              />
            </div> */}
          </div>
          
          {/* Our Story */}
          <motion.section 
            className="mb-20"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.1 }}
          >
            <h2 className="text-3xl font-semibold mb-8 text-white border-b border-blue-500/30 pb-3">Our Story</h2>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              <div>
                <p className="text-gray-300 text-lg leading-relaxed mb-4">
                  Founded in 2025, CodEase emerged from a simple observation: creating browser extensions required specialized knowledge that was inaccessible to many.
                </p>
                <p className="text-gray-300 text-lg leading-relaxed mb-4">
                  Our team of developers and AI enthusiasts saw an opportunity to bridge this gap by leveraging the latest advancements in artificial intelligence.
                </p>
                <p className="text-gray-300 text-lg leading-relaxed">
                  What started as a passion project quickly evolved into a powerful platform that's changing how people interact with and customize their browsing experience.
                </p>
              </div>
              
              <div className="p-6 bg-gradient-to-b from-blue-900/20 to-purple-900/20 border border-blue-500/30 rounded-xl backdrop-blur-sm">
                <h3 className="text-xl font-semibold mb-4 text-blue-300">Our Mission</h3>
                <p className="text-gray-300 leading-relaxed">
                  To democratize browser extension development by providing intuitive AI-powered tools that enable anyone to bring their ideas to life, regardless of their technical background.
                </p>
                
                <h3 className="text-xl font-semibold mt-6 mb-4 text-blue-300">Our Vision</h3>
                <p className="text-gray-300 leading-relaxed">
                  A world where technology adapts to people's needs seamlessly, where anyone can shape their digital experience without barriers, and where innovation is limited only by imagination, not technical skill.
                </p>
              </div>
            </div>
          </motion.section>
          
          {/* What Makes Us Different */}
          <motion.section 
            className="mb-20"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.2 }}
          >
            <h2 className="text-3xl font-semibold mb-8 text-white border-b border-blue-500/30 pb-3">What Makes Us Different</h2>
            
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              <div className="p-6 bg-gradient-to-b from-blue-900/20 to-indigo-900/20 border border-blue-500/30 rounded-xl transition-all hover:border-blue-400/40 hover:shadow-[0_0_20px_rgba(59,130,246,0.2)]">
                <div className="w-12 h-12 bg-blue-500/20 rounded-full flex items-center justify-center mb-4">
                  <Cpu className="w-6 h-6 text-blue-400" />
                </div>
                <h3 className="text-xl font-semibold mb-3 text-white">Advanced AI</h3>
                <p className="text-gray-300 leading-relaxed">
                  Our proprietary AI models are specifically trained on browser extension development patterns, ensuring high-quality, reliable outputs.
                </p>
              </div>
              
              <div className="p-6 bg-gradient-to-b from-purple-900/20 to-blue-900/20 border border-purple-500/30 rounded-xl transition-all hover:border-purple-400/40 hover:shadow-[0_0_20px_rgba(147,51,234,0.2)]">
                <div className="w-12 h-12 bg-purple-500/20 rounded-full flex items-center justify-center mb-4">
                  <Users className="w-6 h-6 text-purple-400" />
                </div>
                <h3 className="text-xl font-semibold mb-3 text-white">Accessibility First</h3>
                <p className="text-gray-300 leading-relaxed">
                  Designed for users of all skill levels, from beginners with no coding experience to experienced developers looking to save time.
                </p>
              </div>
              
              <div className="p-6 bg-gradient-to-b from-indigo-900/20 to-violet-900/20 border border-indigo-500/30 rounded-xl transition-all hover:border-indigo-400/40 hover:shadow-[0_0_20px_rgba(99,102,241,0.2)]">
                <div className="w-12 h-12 bg-indigo-500/20 rounded-full flex items-center justify-center mb-4">
                  <Lightbulb className="w-6 h-6 text-indigo-400" />
                </div>
                <h3 className="text-xl font-semibold mb-3 text-white">Innovation Focus</h3>
                <p className="text-gray-300 leading-relaxed">
                  We continuously refine our technology and add new features based on user feedback and emerging browser capabilities.
                </p>
              </div>
              
              <div className="p-6 bg-gradient-to-b from-cyan-900/20 to-blue-900/20 border border-cyan-500/30 rounded-xl transition-all hover:border-cyan-400/40 hover:shadow-[0_0_20px_rgba(6,182,212,0.2)]">
                <div className="w-12 h-12 bg-cyan-500/20 rounded-full flex items-center justify-center mb-4">
                  <Code className="w-6 h-6 text-cyan-400" />
                </div>
                <h3 className="text-xl font-semibold mb-3 text-white">Pre-Tested Code</h3>
                <p className="text-gray-300 leading-relaxed">
                  All extension code generated by our AI is thoroughly tested before delivery, ensuring you receive working, high-quality code from the first output.
                </p>
              </div>
              
              <div className="p-6 bg-gradient-to-b from-teal-900/20 to-cyan-900/20 border border-teal-500/30 rounded-xl transition-all hover:border-teal-400/40 hover:shadow-[0_0_20px_rgba(20,184,166,0.2)]">
                <div className="w-12 h-12 bg-teal-500/20 rounded-full flex items-center justify-center mb-4">
                  <MessageSquare className="w-6 h-6 text-teal-400" />
                </div>
                <h3 className="text-xl font-semibold mb-3 text-white">Live Testing Environment</h3>
                <p className="text-gray-300 leading-relaxed">
                  Test your extensions directly in our portal before deploying them. See how they perform in real-time and make adjustments on the fly.
                </p>
              </div>
              
              <div className="p-6 bg-gradient-to-b from-blue-900/20 to-sky-900/20 border border-blue-500/30 rounded-xl transition-all hover:border-blue-400/40 hover:shadow-[0_0_20px_rgba(59,130,246,0.2)]">
                <div className="w-12 h-12 bg-blue-500/20 rounded-full flex items-center justify-center mb-4">
                  <Target className="w-6 h-6 text-blue-400" />
                </div>
                <h3 className="text-xl font-semibold mb-3 text-white">Debugging Made Easy</h3>
                <p className="text-gray-300 leading-relaxed">
                  Simply upload your existing extension as a ZIP file, and our AI will identify and fix issues, optimizing your code for better performance.
                </p>
              </div>
            </div>
          </motion.section>
          
          {/* Our Values */}
          <motion.section 
            className="mb-20"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.3 }}
          >
            <h2 className="text-3xl font-semibold mb-8 text-white border-b border-blue-500/30 pb-3">Our Values</h2>
            
            <div className="space-y-6">
              <div className="p-6 bg-gradient-to-r from-blue-900/20 to-indigo-900/20 border border-blue-500/30 rounded-xl">
                <h3 className="text-xl font-semibold mb-3 text-blue-300">Accessibility</h3>
                <p className="text-gray-300 leading-relaxed">
                  We believe technology should be accessible to everyone. Our platform is designed to remove barriers and empower users regardless of their technical background.
                </p>
              </div>
              
              <div className="p-6 bg-gradient-to-r from-indigo-900/20 to-purple-900/20 border border-indigo-500/30 rounded-xl">
                <h3 className="text-xl font-semibold mb-3 text-indigo-300">Innovation</h3>
                <p className="text-gray-300 leading-relaxed">
                  We're committed to pushing the boundaries of what's possible with AI and browser technology, constantly exploring new ways to improve and expand our capabilities.
                </p>
              </div>
              
              <div className="p-6 bg-gradient-to-r from-purple-900/20 to-violet-900/20 border border-purple-500/30 rounded-xl">
                <h3 className="text-xl font-semibold mb-3 text-purple-300">Trust & Quality</h3>
                <p className="text-gray-300 leading-relaxed">
                  We prioritize generating secure, reliable, and high-quality code. We believe in transparency and building trust through consistent quality and security.
                </p>
              </div>
              
              <div className="p-6 bg-gradient-to-r from-violet-900/20 to-blue-900/20 border border-violet-500/30 rounded-xl">
                <h3 className="text-xl font-semibold mb-3 text-violet-300">User-Centered Design</h3>
                <p className="text-gray-300 leading-relaxed">
                  Our users' needs drive our development. We actively listen to feedback and continuously refine our platform to provide the best possible user experience.
                </p>
              </div>
            </div>
          </motion.section>
          
          {/* Global Reach */}
          <motion.section 
            className="mb-20"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.4 }}
          >
            <h2 className="text-3xl font-semibold mb-8 text-white border-b border-blue-500/30 pb-3">Global Reach</h2>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8 items-center">
              <div>
                <p className="text-gray-300 text-lg leading-relaxed mb-4">
                  CodEase is proud to serve customers worldwide, helping developers and businesses across the globe create innovative browser extensions.
                </p>
                <p className="text-gray-300 text-lg leading-relaxed mb-4">
                  Our platform is used by individuals and teams in over 50 countries, from solo entrepreneurs to established enterprises.
                </p>
                <p className="text-gray-300 text-lg leading-relaxed">
                  We're committed to supporting a global user base with accessible pricing, 24/7 support, and a platform that respects diverse needs and languages.
                </p>
              </div>
              
              <div className="flex justify-center">
                <div className="relative w-full max-w-md aspect-square">
                  <div className="absolute inset-0 bg-gradient-to-b from-blue-500/20 to-purple-500/20 rounded-full opacity-20 animate-pulse-slow"></div>
                  <div className="absolute inset-4 rounded-full overflow-hidden border border-blue-500/30">
                    <Globe className="w-full h-full p-8 text-blue-400/80" />
                  </div>
                </div>
              </div>
            </div>
          </motion.section>
          
          {/* Connect With Us */}
          <motion.section 
            className="mb-12"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.5 }}
          >
            <div className="p-8 bg-gradient-to-r from-blue-900/30 to-purple-900/30 border border-blue-500/30 rounded-xl text-center">
              <h2 className="text-2xl font-semibold mb-4 text-white">Connect With Us</h2>
              <p className="text-gray-300 text-lg mb-6 max-w-2xl mx-auto">
                Have questions about CodEase? Want to learn more about how we can help you build amazing browser extensions?
              </p>
              
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <button 
                  onClick={() => setShowContactModal(true)} 
                  className="px-6 py-3 bg-gradient-to-r from-blue-500 to-purple-500 hover:from-blue-600 hover:to-purple-600 text-white rounded-lg font-medium transition-all"
                >
                  Contact Our Team
                </button>
                <Link 
                  href="/pricing"
                  className="px-6 py-3 bg-gray-800 hover:bg-gray-700 text-white rounded-lg font-medium transition-all"
                >
                  View Pricing
                </Link>
              </div>
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
        
        @keyframes pulse-slow {
          0%, 100% { transform: scale(1); opacity: 0.2; }
          50% { transform: scale(1.05); opacity: 0.3; }
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