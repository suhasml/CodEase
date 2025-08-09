import React from 'react'
import { Check, Sparkles, ArrowRight, Play, Zap, Wand2, Code, Settings, Layout } from 'lucide-react'

interface Feature {
  icon: React.ReactNode
  title: string
  description: string
}

interface UseCase {
  title: string
  icon: React.ReactNode
  description: string
  examples: string[]
}

interface FeaturesSectionProps {
  features: Feature[]
  useCases: UseCase[]
}

export default function FeaturesSection({ features, useCases }: FeaturesSectionProps) {
  // Custom action components for different feature cards
  const getFeatureAction = (title: string, index: number) => {
    // Different action UI based on feature type
    switch (index % 5) {
      case 0:
        return (
          <div className="relative">
            <div className="absolute -inset-0.5 bg-gradient-to-r from-blue-500 to-purple-500 rounded-md blur-sm opacity-70 group-hover:animate-pulse-slow"></div>
            <div className="relative flex items-center justify-between bg-gray-900/90 backdrop-blur-sm py-2 px-3 sm:py-3 sm:px-4 rounded-md border border-blue-500/50 shadow-lg shadow-blue-500/10">
              <div className="flex items-center">
                <Play className="h-3 w-3 sm:h-4 sm:w-4 text-green-400 mr-1 sm:mr-2" />
                <span className="text-xs sm:text-sm text-white font-medium">Quick Demo</span>
              </div>
              <div className="flex items-center bg-blue-500/20 px-1.5 py-0.5 sm:px-2 sm:py-1 rounded-md group-hover:bg-blue-500/30 transition-colors">
                <span className="text-blue-300 text-xs font-semibold mr-0.5 sm:mr-1 group-hover:text-white transition-colors">Watch</span>
                <ArrowRight className="w-2.5 h-2.5 sm:w-3 sm:h-3 text-blue-300 group-hover:text-white group-hover:translate-x-0.5 transform transition-all duration-200" />
              </div>
            </div>
          </div>
        );
      
      case 1:
        return (
          <div className="relative">
            <div className="absolute -inset-0.5 bg-gradient-to-r from-green-500 to-blue-500 rounded-md blur-sm opacity-70 group-hover:animate-pulse-slow"></div>
            <div className="relative bg-gray-900/90 backdrop-blur-sm py-2 px-3 sm:py-3 sm:px-4 rounded-md border border-green-500/50 shadow-lg shadow-green-500/10">
              <div className="flex items-center justify-between">
                <div className="flex items-center">
                  <Zap className="h-3 w-3 sm:h-4 sm:w-4 text-yellow-400 mr-1 sm:mr-2 animate-pulse" />
                  <span className="text-xs sm:text-sm text-white font-medium">Instant Setup</span>
                </div>
                <span className="text-[10px] sm:text-xs bg-green-500/20 text-green-300 py-0.5 px-1.5 sm:px-2 rounded-full">Ready to use</span>
              </div>
            </div>
          </div>
        );
      
      case 2:
        return (
          <div className="relative">
            <div className="absolute -inset-0.5 bg-gradient-to-r from-purple-500 to-pink-500 rounded-md blur-sm opacity-70 group-hover:animate-pulse-slow"></div>
            <div className="relative flex flex-col bg-gray-900/90 backdrop-blur-sm py-2 px-3 sm:py-3 sm:px-4 rounded-md border border-purple-500/50 shadow-lg shadow-purple-500/10">
              <div className="flex items-center mb-1 sm:mb-2">
                <Wand2 className="h-3 w-3 sm:h-4 sm:w-4 text-purple-400 mr-1 sm:mr-2" />
                <span className="text-xs sm:text-sm text-white font-medium">AI-Powered Magic</span>
              </div>
              <div className="w-full bg-gray-800 h-1 rounded-full overflow-hidden">
                <div className="h-full bg-gradient-to-r from-purple-500 to-pink-500 w-3/4 rounded-full group-hover:animate-progress"></div>
              </div>
            </div>
          </div>
        );
        
      case 3:
        return (
          <div className="relative">
            <div className="absolute -inset-0.5 bg-gradient-to-r from-amber-500 to-orange-500 rounded-md blur-sm opacity-70 group-hover:animate-pulse-slow"></div>
            <div className="relative flex items-center justify-between bg-gray-900/90 backdrop-blur-sm py-2 px-3 sm:py-3 sm:px-4 rounded-md border border-amber-500/50 shadow-lg shadow-amber-500/10">
              <div className="flex items-center">
                <Code className="h-3 w-3 sm:h-4 sm:w-4 text-amber-400 mr-1 sm:mr-2" />
                <span className="text-xs sm:text-sm text-white font-medium">No coding needed</span>
              </div>
              <div className="flex items-center">
                <span className="text-xs text-amber-300 font-semibold">Try now</span>
              </div>
            </div>
          </div>
        );
        
      case 4:
      default:
        return (
          <div className="relative">
            <div className="absolute -inset-0.5 bg-gradient-to-r from-cyan-500 to-blue-500 rounded-md blur-sm opacity-70 group-hover:animate-pulse-slow"></div>
            <div className="relative bg-gray-900/90 backdrop-blur-sm py-2 px-3 sm:py-3 sm:px-4 rounded-md border border-cyan-500/50 shadow-lg shadow-cyan-500/10">
              <div className="flex items-center justify-between">
                <div className="flex items-center">
                  <Settings className="h-3 w-3 sm:h-4 sm:w-4 text-cyan-400 mr-1 sm:mr-2 animate-spin-slow" />
                  <span className="text-xs sm:text-sm text-white font-medium">Customizable</span>
                </div>
                <div className="flex space-x-0.5 sm:space-x-1">
                  <div className="w-1.5 h-1.5 sm:w-2 sm:h-2 rounded-full bg-cyan-500 animate-ping-staggered-1"></div>
                  <div className="w-1.5 h-1.5 sm:w-2 sm:h-2 rounded-full bg-blue-500 animate-ping-staggered-2"></div>
                  <div className="w-1.5 h-1.5 sm:w-2 sm:h-2 rounded-full bg-indigo-500 animate-ping-staggered-3"></div>
                </div>
              </div>
            </div>
          </div>
        );
    }
  };

  return (
    <section className="py-4 sm:py-12 lg:py-20 bg-gradient-to-t from-gray-900 to-transparent relative overflow-hidden" id="features">
      {/* Animated background elements */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-20 left-10 w-48 sm:w-72 h-48 sm:h-72 bg-blue-500/5 rounded-full blur-3xl animate-pulse-slow" />
        <div className="absolute bottom-20 right-10 w-64 sm:w-96 h-64 sm:h-96 bg-purple-500/5 rounded-full blur-3xl animate-pulse-slow delay-1000" />
        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-full h-full bg-[url('/grid.svg')] opacity-5" />
      </div>

      <div className="container mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        <div className="max-w-4xl mx-auto text-center mb-4 sm:mb-10 lg:mb-16">
          <span className="inline-block text-blue-500 text-xs sm:text-sm font-semibold tracking-wider uppercase mb-1 sm:mb-2">Powerful Features</span>
          <h2 className="text-lg sm:text-4xl md:text-5xl font-bold mb-2 sm:mb-4 bg-gradient-to-r from-blue-400 to-purple-500 text-transparent bg-clip-text relative leading-tight md:leading-normal px-2">
            <span className="absolute -inset-1 bg-blue-500/10 blur-xl rounded-lg opacity-30 animate-pulse-slow" />
            Everything You Need to Create Amazing Extensions
          </h2>
        </div>
        
        {/* Mobile-optimized ultra-compact layout */}
        <div className="block sm:hidden space-y-3">
          {features.map((feature, index) => (
            <div
              key={index}
              className="relative p-3 rounded-md bg-gray-800/30 backdrop-blur-sm border border-gray-700/50"
            >
              <div className="flex items-center space-x-3">
                <div className="w-8 h-8 rounded bg-gradient-to-br from-blue-500/20 to-purple-500/20 flex items-center justify-center flex-shrink-0">
                  <div className="w-4 h-4 text-blue-400">
                    {feature.icon}
                  </div>
                </div>
                <div className="flex-1 min-w-0">
                  <h3 className="text-sm font-medium text-white leading-tight break-words">{feature.title}</h3>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Desktop/tablet grid layout */}
        <div className="hidden sm:grid grid-cols-2 lg:grid-cols-3 gap-4 lg:gap-6 xl:gap-8 perspective-1000">
          {features.map((feature, index) => (
            <div
              key={index}
              className="relative p-4 lg:p-6 xl:p-8 rounded-xl bg-gray-800/40 backdrop-blur-sm border border-gray-700 hover:border-blue-500 hover:shadow-xl hover:shadow-blue-500/10 transition-all duration-500 group transform hover:-translate-y-1"
            >
              {/* Interactive Backgrounds */}
              <div className="absolute inset-0 bg-gradient-to-br from-blue-600/5 to-purple-600/5 opacity-0 group-hover:opacity-100 transition-opacity duration-500 rounded-xl" />
              <div className="absolute -inset-1 bg-grid-pattern opacity-0 group-hover:opacity-10 transition-opacity rounded-xl" />
              
              {/* Glowing effect on hover */}
              <div className="absolute -inset-px bg-gradient-to-r from-blue-500 to-purple-500 rounded-xl opacity-0 group-hover:opacity-30 blur-xl transition-opacity duration-500" />

              <div className="w-10 h-10 lg:w-12 lg:h-12 xl:w-14 xl:h-14 rounded-lg bg-gradient-to-br from-blue-500/20 to-purple-500/20 flex items-center justify-center mb-4 lg:mb-6 group-hover:from-blue-500/30 group-hover:to-purple-500/30 transition-all transform group-hover:scale-110 group-hover:-rotate-3">
                {feature.icon}
              </div>
              
              <h3 className="text-lg lg:text-xl xl:text-2xl font-semibold mb-2 lg:mb-3 group-hover:text-blue-400 transition-colors relative inline-block">
                {feature.title}
                <span className="absolute -bottom-0.5 lg:-bottom-1 left-0 w-0 h-0.5 bg-blue-400 group-hover:w-full transition-all duration-300" />
              </h3>
              
              <p className="text-sm lg:text-base text-gray-300 mb-3 lg:mb-4 group-hover:text-gray-200 transition-colors">{feature.description}</p>
              
              {/* Unique Feature Action for each card */}
              <div className="mt-3 lg:mt-4 opacity-0 group-hover:opacity-100 transition-all duration-500 transform translate-y-2 group-hover:translate-y-0">
                {getFeatureAction(feature.title, index)}
              </div>
            </div>
          ))}
        </div>
        
        {/* Use Cases - Mobile optimized */}
        <div className="mt-6 sm:mt-16 lg:mt-24 max-w-6xl mx-auto">
          <div className="text-center mb-3 sm:mb-8 lg:mb-12">
            <span className="inline-block text-blue-400 text-xs sm:text-sm font-semibold tracking-wider uppercase mb-1 sm:mb-2">Perfect For</span>
            <h3 className="text-lg sm:text-2xl lg:text-3xl font-bold mb-1 sm:mb-2 lg:mb-3">Who Can Benefit from CodEase?</h3>
            <p className="text-xs sm:text-sm lg:text-base text-gray-400 max-w-2xl mx-auto">Our platform helps anyone who needs Chrome extensions — no technical expertise required</p>
          </div>
          
          {/* Mobile ultra-compact list */}
          <div className="block sm:hidden space-y-3">
            {useCases.map((useCase, index) => (
              <div key={index} className="p-4 rounded-md bg-gradient-to-r from-gray-800/40 to-gray-800/20 border border-gray-700/50">
                <div className="flex items-center space-x-4">
                  <div className="w-10 h-10 rounded bg-gradient-to-br from-blue-500/20 to-purple-500/20 flex items-center justify-center flex-shrink-0">
                    <div className="w-5 h-5 text-blue-400">
                      {useCase.icon}
                    </div>
                  </div>
                  <div className="flex-1 min-w-0">
                    <h3 className="text-base font-medium text-white leading-tight break-words">{useCase.title}</h3>
                  </div>
                </div>
              </div>
            ))}
          </div>
          
          {/* Desktop/tablet grid */}
          <div className="hidden sm:grid grid-cols-2 lg:grid-cols-3 gap-4 lg:gap-6">
            {useCases.map((useCase, index) => (
              <div key={index} className="p-4 lg:p-6 rounded-xl bg-gradient-to-b from-gray-800/60 to-gray-800/20 border border-gray-700 hover:border-blue-500/30 transition-all hover:shadow-lg hover:shadow-blue-500/5">
                <div className="flex items-center mb-3 lg:mb-4">
                  <div className="w-10 h-10 lg:w-12 lg:h-12 rounded-lg bg-gradient-to-br from-blue-500/20 to-purple-500/20 flex items-center justify-center mr-3 lg:mr-4">
                    {useCase.icon}
                  </div>
                  <h3 className="text-lg lg:text-xl font-bold text-white">{useCase.title}</h3>
                </div>
                <p className="text-sm lg:text-base text-gray-300 mb-3 lg:mb-4">{useCase.description}</p>
                <ul className="space-y-1.5 lg:space-y-2">
                  {useCase.examples.map((example, i) => (
                    <li key={i} className="flex items-start">
                      <Check className="w-4 h-4 lg:w-5 lg:h-5 text-blue-400 mr-1.5 lg:mr-2 mt-0.5 flex-shrink-0" />
                      <span className="text-xs lg:text-sm text-gray-300">{example}</span>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </div>
      </div>
      
      {/* Add the animation keyframes */}
      <style jsx global>{`
        @keyframes ping-slow {
          0%, 100% {
            transform: scale(1);
            opacity: 0.3;
          }
          50% {
            transform: scale(1.5);
            opacity: 0.6;
          }
        }
        
        .animate-ping-slow {
          animation: ping-slow 3s cubic-bezier(0, 0, 0.2, 1) infinite;
        }
        
        @keyframes spin-slow {
          from {
            transform: rotate(0deg);
          }
          to {
            transform: rotate(360deg);
          }
        }
        
        .animate-spin-slow {
          animation: spin-slow 6s linear infinite;
        }
        
        @keyframes progress {
          0% { width: 0% }
          100% { width: 75% }
        }
        
        .animate-progress {
          animation: progress 1.5s ease-out forwards;
        }
        
        @keyframes ping-staggered-1 {
          0%, 100% { opacity: 0.6; transform: scale(1); }
          50% { opacity: 1; transform: scale(1.5); }
        }
        
        @keyframes ping-staggered-2 {
          0%, 100% { opacity: 0.6; transform: scale(1); }
          60% { opacity: 1; transform: scale(1.5); }
        }
        
        @keyframes ping-staggered-3 {
          0%, 100% { opacity: 0.6; transform: scale(1); }
          70% { opacity: 1; transform: scale(1.5); }
        }
        
        .animate-ping-staggered-1 {
          animation: ping-staggered-1 2s ease-in-out infinite;
        }
        
        .animate-ping-staggered-2 {
          animation: ping-staggered-2 2s ease-in-out infinite;
          animation-delay: 0.2s;
        }
        
        .animate-ping-staggered-3 {
          animation: ping-staggered-3 2s ease-in-out infinite;
          animation-delay: 0.4s;
        }
      `}</style>
    </section>
  )
}







// import React from 'react'
// import { Check, Sparkles, ArrowRight, Play, Zap, Wand2, Code, Settings, Layout } from 'lucide-react'

// interface Feature {
//   icon: React.ReactNode
//   title: string
//   description: string
// }

// interface UseCase {
//   title: string
//   icon: React.ReactNode
//   description: string
//   examples: string[]
// }

// interface FeaturesSectionProps {
//   features: Feature[]
//   useCases: UseCase[]
// }

// export default function FeaturesSection({ features, useCases }: FeaturesSectionProps) {
//   // Custom action components for different feature cards
//   const getFeatureAction = (title: string, index: number) => {
//     // Different action UI based on feature type
//     switch (index % 5) {
//       case 0:
//         return (
//           <div className="relative">
//             <div className="absolute -inset-0.5 bg-gradient-to-r from-blue-500 to-purple-500 rounded-md blur-sm opacity-70 group-hover:animate-pulse-slow"></div>
//             <div className="relative flex items-center justify-between bg-gray-900/90 backdrop-blur-sm py-3 px-4 rounded-md border border-blue-500/50 shadow-lg shadow-blue-500/10">
//               <div className="flex items-center">
//                 <Play className="h-4 w-4 text-green-400 mr-2" />
//                 <span className="text-sm text-white font-medium">Quick Demo</span>
//               </div>
//               <div className="flex items-center bg-blue-500/20 px-2 py-1 rounded-md group-hover:bg-blue-500/30 transition-colors">
//                 <span className="text-blue-300 text-xs font-semibold mr-1 group-hover:text-white transition-colors">Watch</span>
//                 <ArrowRight className="w-3 h-3 text-blue-300 group-hover:text-white transition-colors group-hover:translate-x-0.5 transform transition-transform" />
//               </div>
//             </div>
//           </div>
//         );
      
//       case 1:
//         return (
//           <div className="relative">
//             <div className="absolute -inset-0.5 bg-gradient-to-r from-green-500 to-blue-500 rounded-md blur-sm opacity-70 group-hover:animate-pulse-slow"></div>
//             <div className="relative bg-gray-900/90 backdrop-blur-sm py-3 px-4 rounded-md border border-green-500/50 shadow-lg shadow-green-500/10">
//               <div className="flex items-center justify-between">
//                 <div className="flex items-center">
//                   <Zap className="h-4 w-4 text-yellow-400 mr-2 animate-pulse" />
//                   <span className="text-sm text-white font-medium">Instant Setup</span>
//                 </div>
//                 <span className="text-xs bg-green-500/20 text-green-300 py-0.5 px-2 rounded-full">Ready to use</span>
//               </div>
//             </div>
//           </div>
//         );
      
//       case 2:
//         return (
//           <div className="relative">
//             <div className="absolute -inset-0.5 bg-gradient-to-r from-purple-500 to-pink-500 rounded-md blur-sm opacity-70 group-hover:animate-pulse-slow"></div>
//             <div className="relative flex flex-col bg-gray-900/90 backdrop-blur-sm py-3 px-4 rounded-md border border-purple-500/50 shadow-lg shadow-purple-500/10">
//               <div className="flex items-center mb-2">
//                 <Wand2 className="h-4 w-4 text-purple-400 mr-2" />
//                 <span className="text-sm text-white font-medium">AI-Powered Magic</span>
//               </div>
//               <div className="w-full bg-gray-800 h-1.5 rounded-full overflow-hidden">
//                 <div className="h-full bg-gradient-to-r from-purple-500 to-pink-500 w-3/4 rounded-full group-hover:animate-progress"></div>
//               </div>
//             </div>
//           </div>
//         );
        
//       case 3:
//         return (
//           <div className="relative">
//             <div className="absolute -inset-0.5 bg-gradient-to-r from-amber-500 to-orange-500 rounded-md blur-sm opacity-70 group-hover:animate-pulse-slow"></div>
//             <div className="relative flex items-center justify-between bg-gray-900/90 backdrop-blur-sm py-3 px-4 rounded-md border border-amber-500/50 shadow-lg shadow-amber-500/10">
//               <div className="flex items-center">
//                 <Code className="h-4 w-4 text-amber-400 mr-2" />
//                 <span className="text-sm text-white font-medium">No coding needed</span>
//               </div>
//               <div className="flex items-center">
//                 <span className="text-amber-300 text-xs font-semibold">Try now</span>
//               </div>
//             </div>
//           </div>
//         );
        
//       case 4:
//       default:
//         return (
//           <div className="relative">
//             <div className="absolute -inset-0.5 bg-gradient-to-r from-cyan-500 to-blue-500 rounded-md blur-sm opacity-70 group-hover:animate-pulse-slow"></div>
//             <div className="relative bg-gray-900/90 backdrop-blur-sm py-3 px-4 rounded-md border border-cyan-500/50 shadow-lg shadow-cyan-500/10">
//               <div className="flex items-center justify-between">
//                 <div className="flex items-center">
//                   <Settings className="h-4 w-4 text-cyan-400 mr-2 animate-spin-slow" />
//                   <span className="text-sm text-white font-medium">Customizable</span>
//                 </div>
//                 <div className="flex space-x-1">
//                   <div className="w-2 h-2 rounded-full bg-cyan-500 animate-ping-staggered-1"></div>
//                   <div className="w-2 h-2 rounded-full bg-blue-500 animate-ping-staggered-2"></div>
//                   <div className="w-2 h-2 rounded-full bg-indigo-500 animate-ping-staggered-3"></div>
//                 </div>
//               </div>
//             </div>
//           </div>
//         );
//     }
//   };

//   return (
//     <section className="py-20 bg-gradient-to-t from-gray-900 to-transparent relative overflow-hidden" id="features">
//       {/* Animated background elements */}
//       <div className="absolute inset-0 overflow-hidden pointer-events-none">
//         <div className="absolute top-20 left-10 w-72 h-72 bg-blue-500/5 rounded-full blur-3xl animate-pulse-slow" />
//         <div className="absolute bottom-20 right-10 w-96 h-96 bg-purple-500/5 rounded-full blur-3xl animate-pulse-slow delay-1000" />
//         <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-full h-full bg-[url('/grid.svg')] opacity-5" />
//       </div>

//       <div className="container mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
//         <div className="max-w-4xl mx-auto text-center mb-16">
//           <span className="inline-block text-blue-500 text-sm font-semibold tracking-wider uppercase mb-2">Powerful Features</span>
//           <h2 className="text-4xl md:text-5xl font-bold mb-4 bg-gradient-to-r from-blue-400 to-purple-500 text-transparent bg-clip-text relative leading-tight md:leading-normal px-2">
//             <span className="absolute -inset-1 bg-blue-500/10 blur-xl rounded-lg opacity-30 animate-pulse-slow" />
//             Everything You Need to Create Amazing Extensions
//           </h2>
          
//           {/* <div className="mt-6 inline-flex items-center justify-center px-4 py-2 bg-gradient-to-r from-blue-600/30 to-blue-500/30 rounded-lg text-white font-medium shadow-lg shadow-blue-600/10 border border-blue-500/30">
//             <span className="mr-2">⚡</span>
//             <span>Build in minutes what normally takes days or weeks</span>
//           </div> */}
//         </div>
        
//         <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8 perspective-1000">
//           {features.map((feature, index) => (
//             <div
//               key={index}
//               className="relative p-8 rounded-xl bg-gray-800/40 backdrop-blur-sm border border-gray-700 hover:border-blue-500 hover:shadow-xl hover:shadow-blue-500/10 transition-all duration-500 group transform hover:-translate-y-1"
//             >
//               {/* Interactive Backgrounds */}
//               <div className="absolute inset-0 bg-gradient-to-br from-blue-600/5 to-purple-600/5 opacity-0 group-hover:opacity-100 transition-opacity duration-500 rounded-xl" />
//               <div className="absolute -inset-1 bg-grid-pattern opacity-0 group-hover:opacity-10 transition-opacity rounded-xl" />
              
//               {/* Glowing effect on hover */}
//               <div className="absolute -inset-px bg-gradient-to-r from-blue-500 to-purple-500 rounded-xl opacity-0 group-hover:opacity-30 blur-xl transition-opacity duration-500" />

//               <div className="w-14 h-14 rounded-lg bg-gradient-to-br from-blue-500/20 to-purple-500/20 flex items-center justify-center mb-6 group-hover:from-blue-500/30 group-hover:to-purple-500/30 transition-all transform group-hover:scale-110 group-hover:-rotate-3">
//                 {feature.icon}
//               </div>
              
//               <h3 className="text-2xl font-semibold mb-3 group-hover:text-blue-400 transition-colors relative inline-block">
//                 {feature.title}
//                 <span className="absolute -bottom-1 left-0 w-0 h-0.5 bg-blue-400 group-hover:w-full transition-all duration-300" />
//               </h3>
              
//               <p className="text-gray-300 mb-4 group-hover:text-gray-200 transition-colors">{feature.description}</p>
              
//               {/* Unique Feature Action for each card */}
//               <div className="mt-4 opacity-0 group-hover:opacity-100 transition-all duration-500 transform translate-y-2 group-hover:translate-y-0">
//                 {getFeatureAction(feature.title, index)}
//               </div>
//             </div>
//           ))}
//         </div>
        
//         {/* Use Cases */}
//         <div className="mt-24 max-w-6xl mx-auto">
//           <div className="text-center mb-12">
//             <span className="inline-block text-blue-400 text-sm font-semibold tracking-wider uppercase mb-2">Perfect For</span>
//             <h3 className="text-3xl font-bold mb-3">Who Can Benefit from CodEase?</h3>
//             <p className="text-gray-400 max-w-2xl mx-auto">Our platform helps anyone who needs Chrome extensions — no technical expertise required</p>
//           </div>
          
//           <div className="grid md:grid-cols-3 gap-6">
//             {useCases.map((useCase, index) => (
//               <div key={index} className="p-6 rounded-xl bg-gradient-to-b from-gray-800/60 to-gray-800/20 border border-gray-700 hover:border-blue-500/30 transition-all hover:shadow-lg hover:shadow-blue-500/5">
//                 <div className="flex items-center mb-4">
//                   <div className="w-12 h-12 rounded-lg bg-gradient-to-br from-blue-500/20 to-purple-500/20 flex items-center justify-center mr-4">
//                     {useCase.icon}
//                   </div>
//                   <h3 className="text-xl font-bold text-white">{useCase.title}</h3>
//                 </div>
//                 <p className="text-gray-300 mb-4">{useCase.description}</p>
//                 <ul className="space-y-2">
//                   {useCase.examples.map((example, i) => (
//                     <li key={i} className="flex items-start">
//                       <Check className="w-5 h-5 text-blue-400 mr-2 mt-0.5 flex-shrink-0" />
//                       <span className="text-gray-300 text-sm">{example}</span>
//                     </li>
//                   ))}
//                 </ul>
//               </div>
//             ))}
//           </div>
//         </div>
//       </div>
      
//       {/* Add the animation keyframes */}
//       <style jsx global>{`
//         @keyframes ping-slow {
//           0%, 100% {
//             transform: scale(1);
//             opacity: 0.3;
//           }
//           50% {
//             transform: scale(1.5);
//             opacity: 0.6;
//           }
//         }
        
//         .animate-ping-slow {
//           animation: ping-slow 3s cubic-bezier(0, 0, 0.2, 1) infinite;
//         }
        
//         @keyframes spin-slow {
//           from {
//             transform: rotate(0deg);
//           }
//           to {
//             transform: rotate(360deg);
//           }
//         }
        
//         .animate-spin-slow {
//           animation: spin-slow 6s linear infinite;
//         }
        
//         @keyframes progress {
//           0% { width: 0% }
//           100% { width: 75% }
//         }
        
//         .animate-progress {
//           animation: progress 1.5s ease-out forwards;
//         }
        
//         @keyframes ping-staggered-1 {
//           0%, 100% { opacity: 0.6; transform: scale(1); }
//           50% { opacity: 1; transform: scale(1.5); }
//         }
        
//         @keyframes ping-staggered-2 {
//           0%, 100% { opacity: 0.6; transform: scale(1); }
//           60% { opacity: 1; transform: scale(1.5); }
//         }
        
//         @keyframes ping-staggered-3 {
//           0%, 100% { opacity: 0.6; transform: scale(1); }
//           70% { opacity: 1; transform: scale(1.5); }
//         }
        
//         .animate-ping-staggered-1 {
//           animation: ping-staggered-1 2s ease-in-out infinite;
//         }
        
//         .animate-ping-staggered-2 {
//           animation: ping-staggered-2 2s ease-in-out infinite;
//           animation-delay: 0.2s;
//         }
        
//         .animate-ping-staggered-3 {
//           animation: ping-staggered-3 2s ease-in-out infinite;
//           animation-delay: 0.4s;
//         }
//       `}</style>
//     </section>
//   )
// }