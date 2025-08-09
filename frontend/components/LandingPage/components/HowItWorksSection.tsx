import React from 'react'
import { Terminal, Sparkles, Play, Box, Pencil, Eye, Coins } from 'lucide-react'

export default function HowItWorksSection() {
  const steps = [
    {
      icon: <Terminal className="w-6 h-6 sm:w-7 sm:h-7 md:w-8 md:h-8 text-blue-400" />,
      title: "1. Describe",
      description: "Explain what you want your extension to do in plain English"
    },
    {
      icon: <Pencil className="w-6 h-6 sm:w-7 sm:h-7 md:w-8 md:h-8 text-purple-400" />,
      title: "2. Generate",
      description: "CodEase creates all necessary code files in seconds"
    },
    {
      icon: <Eye className="w-6 h-6 sm:w-7 sm:h-7 md:w-8 md:h-8 text-green-400" />,
      title: "3. Preview",
      description: "Test your extension instantly in our sandbox environment"
    },
    {
      icon: <Coins className="w-6 h-6 sm:w-7 sm:h-7 md:w-8 md:h-8 text-yellow-400" />,
      title: "4. Tokenize",
      description: "Mint your extension as a Hedera token and earn passive income"
    }
  ]

  return (
    <section className="py-8 sm:py-12 md:py-20 bg-gradient-to-b from-gray-900 to-transparent relative overflow-hidden" id="how-it-works">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        <div className="max-w-4xl mx-auto text-center mb-6 sm:mb-8 md:mb-12">
          <span className="inline-block text-blue-500 text-xs sm:text-sm font-semibold tracking-wider uppercase mb-2">How It Works</span>
          <h2 className="text-xl sm:text-2xl md:text-3xl lg:text-4xl font-bold mb-3 sm:mb-4 relative">
            <span className="bg-clip-text text-transparent bg-gradient-to-r from-blue-400 to-teal-400">Four Simple Steps to Your Chrome Extension</span>
            <span className="absolute -inset-1 bg-blue-500/10 blur-xl rounded-lg opacity-30"></span>
          </h2>
          <p className="text-gray-300 text-sm sm:text-base lg:text-lg px-2">No coding required — just describe what you want, and CodEase does the rest within minutes</p>
        </div>
        
        {/* Mobile: Compact vertical layout */}
        <div className="block sm:hidden space-y-3 max-w-md mx-auto">
          {steps.map((step, index) => (
            <div 
              key={index} 
              className="flex items-center p-3 rounded-lg bg-gray-800/40 backdrop-blur-sm border border-gray-700"
            >
              <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-blue-500/10 to-purple-500/10 flex items-center justify-center mr-3 flex-shrink-0">
                {step.icon}
              </div>
              <div className="flex-1">
                <h3 className="text-sm font-bold mb-1">{step.title}</h3>
                <p className="text-xs text-gray-400">{step.description}</p>
              </div>
            </div>
          ))}
        </div>
        
        {/* Desktop/Tablet: Grid layout */}
        <div className="hidden sm:grid sm:grid-cols-2 lg:grid-cols-4 gap-4 lg:gap-5 max-w-6xl mx-auto">
          {steps.map((step, index) => (
            <div 
              key={index} 
              className="p-4 lg:p-5 xl:p-6 rounded-xl bg-gray-800/40 backdrop-blur-sm border border-gray-700 hover:border-blue-500/40 transition-all hover:shadow-lg hover:shadow-blue-500/5 group"
            >
              <div className="w-12 h-12 lg:w-14 lg:h-14 xl:w-16 xl:h-16 rounded-lg bg-gradient-to-br from-blue-500/10 to-purple-500/10 flex items-center justify-center mb-3 lg:mb-4 group-hover:from-blue-500/20 group-hover:to-purple-500/20 transition-all">
                {step.icon}
              </div>
              <h3 className="text-base lg:text-lg xl:text-xl font-bold mb-1 lg:mb-2 group-hover:text-blue-400 transition-colors">{step.title}</h3>
              <p className="text-sm lg:text-base text-gray-400 group-hover:text-gray-300 transition-colors">{step.description}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}
