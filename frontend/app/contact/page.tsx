'use client'

import { useState, useEffect } from 'react'
import Header from '@/components/Header/header'
import Footer from '@/components/Footer/footer'
import ContactModal from '@/components/Modal/ContactModal'
import { ArrowRight, Mail, MessageSquare, FileQuestion } from 'lucide-react'

export default function ContactPage() {
  const [showContactModal, setShowContactModal] = useState(false);
  
  // Auto-open the modal when the contact page is accessed directly
  useEffect(() => {
    const timer = setTimeout(() => {
      setShowContactModal(true);
    }, 500);
    
    return () => clearTimeout(timer);
  }, []);
  
  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-950 via-gray-900 to-gray-950">
      <Header />
      
      <div className="relative overflow-hidden">
        {/* Background effects */}
        <div className="absolute -top-[500px] -left-[400px] w-[1000px] h-[1000px] bg-[radial-gradient(ellipse_at_center,hsla(217,100%,50%,0.12)_0%,transparent_70%)]" 
             style={{ animation: 'aurora-x 25s ease-in-out infinite' }} />
        <div className="absolute bottom-[20%] left-[10%] w-[600px] h-[600px] bg-[radial-gradient(ellipse_at_center,hsla(190,95%,50%,0.06)_0%,transparent_70%)]" 
             style={{ animation: 'aurora-pulse 30s ease infinite' }} />
        <div className="absolute inset-0 bg-[linear-gradient(rgba(59,130,246,0.05)_1px,transparent_1px),linear-gradient(90deg,rgba(59,130,246,0.05)_1px,transparent_1px)] bg-[size:40px_40px] [mask-image:radial-gradient(ellipse_at_center,black_20%,transparent_70%)]" />
      </div>
      
      <section className="pt-40 pb-20 relative z-10">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="max-w-3xl mx-auto text-center mb-16">
            <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold mb-6 bg-clip-text text-transparent bg-gradient-to-r from-blue-400 via-purple-400 to-teal-400">
              Get in Touch
            </h1>
            <p className="text-xl text-gray-300">
              Have questions? Need help? We're here to assist you with anything you need.
            </p>
          </div>
          
          <div className="max-w-4xl mx-auto grid md:grid-cols-3 gap-6 md:gap-12">
            <div className="bg-gray-800/30 border border-gray-700 rounded-xl p-6 text-center hover:border-blue-500/40 hover:shadow-lg hover:shadow-blue-500/5 transition-all">
              <div className="w-14 h-14 bg-blue-500/20 rounded-full flex items-center justify-center mx-auto mb-4">
                <Mail className="w-7 h-7 text-blue-400" />
              </div>
              <h3 className="text-xl font-semibold text-white mb-2">Email</h3>
              <p className="text-gray-400 mb-4">Our support team typically responds within 24 hours</p>
              <button 
                onClick={() => window.open('mailto:admin@codease.pro', '_blank')}
                className="text-blue-400 hover:text-blue-300 flex items-center justify-center w-full"
              >
                <span>Send an email</span>
                <ArrowRight className="w-4 h-4 ml-1" />
              </button>
            </div>
            
            <div className="bg-gray-800/30 border border-gray-700 rounded-xl p-6 text-center hover:border-blue-500/40 hover:shadow-lg hover:shadow-blue-500/5 transition-all">
              <div className="w-14 h-14 bg-purple-500/20 rounded-full flex items-center justify-center mx-auto mb-4">
                <MessageSquare className="w-7 h-7 text-purple-400" />
              </div>
              <h3 className="text-xl font-semibold text-white mb-2">Live Chat</h3>
              <p className="text-gray-400 mb-4">Available Monday to Friday, 9AM to 5PM EST</p>
              <button 
                onClick={() => window.open('https://discord.gg/codease', '_blank')}
                className="text-purple-400 hover:text-purple-300 flex items-center justify-center w-full"
              >
                <span>Join our Discord</span>
                <ArrowRight className="w-4 h-4 ml-1" />
              </button>
            </div>
            
            <div className="bg-gray-800/30 border border-gray-700 rounded-xl p-6 text-center hover:border-blue-500/40 hover:shadow-lg hover:shadow-blue-500/5 transition-all">
              <div className="w-14 h-14 bg-teal-500/20 rounded-full flex items-center justify-center mx-auto mb-4">
                <FileQuestion className="w-7 h-7 text-teal-400" />
              </div>
              <h3 className="text-xl font-semibold text-white mb-2">Custom Request</h3>
              <p className="text-gray-400 mb-4">Need something specific? Fill out our detailed form</p>
              <button 
                onClick={() => setShowContactModal(true)}
                className="text-teal-400 hover:text-teal-300 flex items-center justify-center w-full"
              >
                <span>Submit request</span>
                <ArrowRight className="w-4 h-4 ml-1" />
              </button>
            </div>
          </div>
          
          <div className="max-w-4xl mx-auto mt-16 text-center">
            <button
              onClick={() => setShowContactModal(true)}
              className="inline-flex items-center px-6 py-3 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-500 hover:to-purple-500 rounded-lg text-white transition-colors text-lg font-medium"
            >
              <span>Contact Us Now</span>
              <ArrowRight className="w-5 h-5 ml-2" />
            </button>
          </div>
        </div>
      </section>
      
      <ContactModal 
        isOpen={showContactModal}
        onClose={() => setShowContactModal(false)}
      />

      {/* CSS animations */}
      <style jsx global>{`
        @keyframes aurora-x {
          0%, 100% { transform: translateX(0) rotate(0); opacity: 0.8; }
          50% { transform: translateX(30px) rotate(5deg); opacity: 1; }
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