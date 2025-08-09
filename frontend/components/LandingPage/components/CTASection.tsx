import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { ArrowRight, ShieldCheck, Clock, Sparkles, CheckCircle, Rocket, Flag } from 'lucide-react'

interface CTASectionProps {
  email: string
  setEmail: (email: string) => void
  isSubmitting: boolean
  isSubmitted: boolean
  error: string
  handleEmailSubmit: (e: React.FormEvent) => Promise<void>
}

export default function CTASection({ 
  email, 
  setEmail, 
  isSubmitting, 
  isSubmitted, 
  error, 
  handleEmailSubmit 
}: CTASectionProps) {
  const router = useRouter()

  return (
    <section className="py-8 sm:py-12 md:py-24 relative overflow-hidden">
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-0 left-0 right-0 h-1/3 bg-gradient-to-b from-gray-900 to-transparent" />
        <div className="absolute top-1/3 left-0 w-full h-full bg-[radial-gradient(ellipse_at_center,hsla(217,100%,50%,0.15)_0%,transparent_70%)]" />
      </div>
      
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        <div className="max-w-4xl mx-auto">
          <div className="bg-gradient-to-r from-blue-900/50 to-purple-900/50 rounded-lg sm:rounded-xl md:rounded-3xl overflow-hidden shadow-2xl shadow-blue-900/20 backdrop-blur-sm border border-blue-500/30">
            <div className="p-4 sm:p-6 md:p-12 relative">
              {/* Abstract shapes */}
              <div className="absolute top-0 right-0 w-24 sm:w-32 md:w-64 h-24 sm:h-32 md:h-64 bg-blue-500/10 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2" />
              <div className="absolute bottom-0 left-0 w-32 sm:w-40 md:w-80 h-32 sm:h-40 md:h-80 bg-purple-500/10 rounded-full blur-3xl translate-y-1/2 -translate-x-1/2" />
              
              <div className="relative">
                <div className="text-center mb-6 md:mb-8">
                  <h2 className="text-xl sm:text-2xl md:text-3xl lg:text-4xl font-bold mb-3 md:mb-4 bg-gradient-to-r from-blue-300 to-purple-300 bg-clip-text text-transparent leading-tight md:leading-normal px-2">
                    Build Your Chrome Extension Today
                  </h2>
                  <p className="text-sm sm:text-base md:text-lg lg:text-xl text-gray-300 max-w-2xl mx-auto px-2">
                    Create powerful browser extensions in minutes – no coding required
                  </p>
                </div>
                
                <div className="max-w-lg mx-auto text-center">
                  <button
                    onClick={() => router.push('/signup')}
                    className="w-full sm:w-auto px-6 sm:px-8 py-3 sm:py-4 bg-gradient-to-r from-blue-500 to-purple-500 rounded-lg text-white text-base sm:text-lg font-medium transition-all hover:shadow-lg hover:shadow-blue-500/30 hover:scale-105 transform relative"
                  >
                    <Flag className="w-4 h-4 sm:w-5 sm:h-5 mr-2 inline-block" />
                    <span>Get Started Free</span>
                    <div className="absolute -top-3 right-0 sm:-right-3 transform rotate-0 sm:rotate-3">
                      <div className="bg-yellow-500 text-black text-xs font-bold px-2 py-0.5 rounded-md animate-pulse">
                        Limited Time!
                      </div>
                    </div>
                  </button>
                  
                  <p className="text-blue-300 text-xs sm:text-sm mt-6 md:mt-6 px-2 font-medium">
                    <span className="text-yellow-300 font-bold">FREE ACCESS:</span> Sign up today and get 1 free credit to build your first extension!
                  </p>
                  
                  <p className="text-gray-400 text-xs sm:text-sm mt-3 md:mt-4 px-2">
                    Join thousands of users who are already saving weeks of development time
                    with CodEase's AI-powered extension builder
                  </p>

                  <p className="text-emerald-300 text-xs sm:text-sm mt-3 md:mt-4 px-2 font-medium animate-pulse">
                    <span className="text-white bg-emerald-600/40 px-2 py-0.5 rounded">Just $2 per extension</span> - As cheap as a cup of coffee!
                  </p>
                  
                  <div className="flex flex-col sm:flex-row items-center justify-center mt-6 sm:mt-8 space-y-3 sm:space-y-0 sm:space-x-6">
                    <div className="flex items-center">
                      <ShieldCheck className="w-4 h-4 sm:w-5 sm:h-5 text-blue-400 mr-2" />
                      <span className="text-xs sm:text-sm text-gray-400">Secure & private</span>
                    </div>
                    <div className="flex items-center">
                      <Clock className="w-4 h-4 sm:w-5 sm:h-5 text-blue-400 mr-2" />
                      <span className="text-xs sm:text-sm text-gray-400">Cancel anytime</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}