import React, { useState } from 'react'
import { 
  ArrowLeft, 
  ArrowRight, 
  Check, 
  Code, 
  Play, 
  Rocket, 
  Terminal, 
  MessageCircle
} from 'lucide-react'

interface DemoStep {
  title: string
  description: string
  example: string
  icon: React.ReactNode
}

interface DemoSectionProps {
  demoSteps: DemoStep[]
}

export default function DemoSection({ demoSteps }: DemoSectionProps) {
  const [activeStep, setActiveStep] = useState(0)
  
  const goToNextStep = () => {
    if (activeStep < demoSteps.length - 1) {
      setActiveStep(activeStep + 1)
    }
  }
  
  const goToPrevStep = () => {
    if (activeStep > 0) {
      setActiveStep(activeStep - 1)
    }
  }
  
  return (
    <section className="py-6 sm:py-8 md:py-24 relative overflow-hidden" id="demo">
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-1/3 right-0 w-96 h-96 bg-blue-500/5 rounded-full blur-3xl" />
        <div className="absolute bottom-0 left-1/4 w-80 h-80 bg-purple-500/5 rounded-full blur-3xl" />
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(59,130,246,0.05)_0,transparent_70%)]" />
      </div>
      
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        <div className="max-w-4xl mx-auto text-center mb-4 sm:mb-6 md:mb-16">
          <div className="inline-flex items-center px-3 py-1 rounded-full bg-blue-500/10 text-blue-400 text-sm font-medium mb-3 sm:mb-4 md:mb-6">
            See CodEase in action
          </div>
          <h2 className="text-xl sm:text-2xl md:text-5xl font-bold mb-3 sm:mb-4 md:mb-6 bg-gradient-to-r from-blue-400 via-purple-400 to-teal-400 bg-clip-text text-transparent">
            Transform Words into Working Extensions
          </h2>
        </div>
        
        <div className="max-w-5xl mx-auto">
          {/* Mobile Compact Layout */}
          <div className="block md:hidden">
            {/* Simple mobile stepper */}
            <div className="flex justify-center mb-4">
              <div className="flex space-x-2">
                {demoSteps.map((_, index) => (
                  <button
                    key={index}
                    onClick={() => setActiveStep(index)}
                    className={`w-2 h-2 rounded-full transition-all ${
                      activeStep === index ? 'bg-blue-400 scale-125' : 'bg-gray-600'
                    }`}
                  />
                ))}
              </div>
            </div>

            {/* Compact mobile demo display */}
            <div className="bg-gray-800/40 rounded-lg border border-gray-700 p-4 mb-4">
              <div className="flex items-center mb-3">
                <div className="w-8 h-8 rounded-full bg-blue-500/20 flex items-center justify-center mr-3">
                  <span className="text-blue-400 text-sm">{activeStep + 1}</span>
                </div>
                <div>
                  <h3 className="text-sm font-medium text-blue-400">{demoSteps[activeStep].title}</h3>
                  <p className="text-xs text-gray-400">{demoSteps[activeStep].description}</p>
                </div>
              </div>
              
              {/* Simplified mobile content */}
              <div className="bg-gray-900/50 rounded-lg p-3 border border-gray-800">
                {activeStep === 0 && (
                  <div className="text-center">
                    <div className="text-xs text-gray-300 mb-2">💬 "I need a productivity extension..."</div>
                    <div className="text-xs text-blue-400">✨ AI understands your request</div>
                  </div>
                )}
                {activeStep === 1 && (
                  <div className="text-center">
                    <div className="text-xs text-gray-300 mb-2">⚙️ Generating extension files...</div>
                    <div className="w-full bg-gray-700 h-1 rounded-full"><div className="bg-blue-400 h-1 rounded-full w-3/4"></div></div>
                  </div>
                )}
                {activeStep === 2 && (
                  <div className="text-center">
                    <div className="text-xs text-gray-300 mb-2">🧪 Testing in sandbox...</div>
                    <div className="text-xs text-green-400">✅ All tests passed</div>
                  </div>
                )}
                {activeStep === 3 && (
                  <div className="text-center">
                    <div className="text-xs text-gray-300 mb-2">📦 Extension ready!</div>
                    <div className="text-xs text-green-400">🚀 Ready to deploy</div>
                  </div>
                )}
              </div>
            </div>

            {/* Mobile navigation */}
            <div className="flex justify-between">
              <button 
                onClick={goToPrevStep}
                disabled={activeStep === 0}
                className={`px-3 py-1 rounded text-xs ${
                  activeStep === 0 ? 'text-gray-500 cursor-not-allowed' : 'text-blue-400 hover:bg-blue-500/10'
                }`}
              >
                ← Previous
              </button>
              <button 
                onClick={goToNextStep}
                disabled={activeStep === demoSteps.length - 1}
                className={`px-3 py-1 rounded text-xs ${
                  activeStep === demoSteps.length - 1 ? 'text-gray-500 cursor-not-allowed' : 'text-blue-400 hover:bg-blue-500/10'
                }`}
              >
                Next →
              </button>
            </div>
          </div>

          {/* Desktop Layout */}
          <div className="hidden md:flex gap-4 lg:gap-8">
            {/* Demo Steps Navigation - Displayed vertically on desktop */}
            <div className="md:w-1/3">
              <div className="space-y-4">
                {demoSteps.map((step, index) => (
                  <button
                    key={index}
                    className={`w-full text-left p-4 rounded-xl transition-all duration-300 flex items-start ${
                      activeStep === index
                        ? "bg-gradient-to-r from-blue-500/20 to-purple-500/20 border border-blue-500/40"
                        : "bg-gray-800/30 border border-gray-700 hover:border-blue-500/30"
                    }`}
                    onClick={() => setActiveStep(index)}
                  >
                    <div className={`w-8 h-8 rounded-lg ${
                      activeStep === index 
                        ? "bg-gradient-to-r from-blue-500 to-purple-500" 
                        : "bg-gray-700"
                      } flex items-center justify-center mr-3 flex-shrink-0`}
                    >
                      <span className="text-white font-medium">{index + 1}</span>
                    </div>
                    <div>
                      <h3 className={`font-medium ${activeStep === index ? "text-blue-400" : "text-gray-200"}`}>
                        {step.title}
                      </h3>
                      <p className="text-sm text-gray-400 mt-1 line-clamp-2">{step.description}</p>
                    </div>
                  </button>
                ))}
              </div>
            </div>

            {/* Demo Visualization - Full width on desktop */}
            <div className="w-full md:w-2/3">
              <div className="bg-[#121623] rounded-xl md:rounded-2xl border border-gray-800 overflow-hidden shadow-xl shadow-blue-900/10">
                <div className="p-1 bg-[#121623] border-b border-gray-800">
                  <div className="flex items-center space-x-1.5 px-2">
                    <div className="w-2 h-2 md:w-2.5 md:h-2.5 bg-rose-500 rounded-full"></div>
                    <div className="w-2 h-2 md:w-2.5 md:h-2.5 bg-amber-500 rounded-full"></div>
                    <div className="w-2 h-2 md:w-2.5 md:h-2.5 bg-emerald-500 rounded-full"></div>
                  </div>
                </div>
                
                {/* Responsive height content container */}
                <div className="p-3 md:p-6 min-h-[200px] md:min-h-[460px]">
                  {/* Step 1: Describe */}
                  {activeStep === 0 && (
                    <div className="space-y-3 md:space-y-6 animate-fadeIn">
                      <div className="flex items-start space-x-3">
                        <div className="w-7 h-7 md:w-10 md:h-10 rounded-full bg-gray-700 flex items-center justify-center flex-shrink-0">
                          <span className="text-gray-300 text-sm md:text-base">👤</span>
                        </div>
                        <div className="flex-1">
                          <div className="bg-[#1c2032] p-2 md:p-4 rounded-lg rounded-tl-none">
                            <p className="text-xs md:text-base text-gray-200">I need a Chrome extension that blocks distracting websites during work hours and tracks my focus time.</p>
                          </div>
                        </div>
                      </div>
                      
                      <div className="flex items-start space-x-3">
                        <div className="w-7 h-7 md:w-10 md:h-10 rounded-full bg-[#5e57d9] flex items-center justify-center flex-shrink-0">
                          <span className="text-white text-sm md:text-base">🤖</span>
                        </div>
                        <div className="flex-1">
                          <div className="bg-[#242c45] p-2 md:p-4 rounded-lg rounded-tl-none">
                            <p className="text-xs md:text-base text-gray-200">I'll create a productivity extension with these features:</p>
                            <ul className="mt-2 md:mt-3 space-y-1.5 md:space-y-2 text-xs md:text-sm text-gray-300">
                              <li className="flex items-start">
                                <span className="text-green-400 mr-1.5 mt-0.5">✓</span>
                                <span>Website blocking during configurable work hours</span>
                              </li>
                              <li className="flex items-start">
                                <span className="text-green-400 mr-1.5 mt-0.5">✓</span>
                                <span>Focus time tracking and statistics</span>
                              </li>
                              <li className="flex items-start">
                                <span className="text-green-400 mr-1.5 mt-0.5">✓</span>
                                <span>Customizable block lists and schedules</span>
                              </li>
                              <li className="flex items-start">
                                <span className="text-green-400 mr-1.5 mt-0.5">✓</span>
                                <span>Browser notification system</span>
                              </li>
                            </ul>
                          </div>
                          <div className="flex items-center space-x-2 mt-3">
                            <button className="text-xs px-2.5 py-1 md:px-4 md:py-2 bg-[#242c45] text-blue-400 rounded-md hover:bg-[#2a3352] transition-colors">
                              Modify
                            </button>
                            <button className="text-xs px-2.5 py-1 md:px-4 md:py-2 bg-[#245739] text-green-400 rounded-md hover:bg-[#2d6a45] transition-colors">
                              Confirm
                            </button>
                          </div>
                        </div>
                      </div>
                    </div>
                  )}

                  {/* Step 2: AI Generation */}
                  {activeStep === 1 && (
                    <div className="space-y-3 md:space-y-6 animate-fadeIn">
                      <div className="bg-[#1c2032] rounded-lg p-2 md:p-4 border border-gray-800">
                        <div className="flex items-center justify-between mb-2 md:mb-4">
                          <div className="flex items-center space-x-1.5 md:space-x-2">
                            <Code className="w-3 h-3 md:w-5 md:h-5 text-blue-400" />
                            <span className="text-xs md:text-base font-medium text-gray-200">Generating Files</span>
                          </div>
                          <span className="text-xs text-blue-400 animate-pulse">Processing...</span>
                        </div>
                        
                        <div className="space-y-1.5 md:space-y-3">
                          {[
                            { name: "manifest.json", status: "completed", icon: "📄" },
                            { name: "background.js", status: "completed", icon: "🔄" },
                            { name: "popup.html", status: "completed", icon: "🖼️" },
                            { name: "popup.js", status: "in-progress", icon: "⚙️" },
                            { name: "styles.css", status: "pending", icon: "🎨" },
                            { name: "icons/", status: "pending", icon: "🖌️" }
                          ].map((file, index) => (
                            <div key={index} className="flex items-center justify-between">
                              <div className="flex items-center space-x-1.5 md:space-x-2">
                                <span className="text-xs md:text-sm">{file.icon}</span>
                                <span className="font-mono text-xs md:text-sm text-gray-300 truncate max-w-[120px] md:max-w-none">{file.name}</span>
                              </div>
                              <div>
                                {file.status === "completed" ? (
                                  <span className="text-green-400"><Check className="w-3 h-3 md:w-4 md:h-4" /></span>
                                ) : file.status === "in-progress" ? (
                                  <div className="w-3 h-3 md:w-4 md:h-4 border-2 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
                                ) : (
                                  <span className="text-gray-500">-</span>
                                )}
                              </div>
                            </div>
                          ))}
                        </div>
                        
                        <div className="mt-3 md:mt-6">
                          <div className="w-full bg-gray-700 h-1.5 rounded-full">
                            <div className="bg-gradient-to-r from-blue-500 to-purple-500 h-1.5 rounded-full" style={{ width: '65%' }} />
                          </div>
                          <div className="flex justify-between mt-1.5 text-xs text-gray-400">
                            <span>4/6 files complete</span>
                            <span>65%</span>
                          </div>
                        </div>
                      </div>
                    </div>
                  )}
                  
                  {/* Step 3: Test & Refine */}
                  {activeStep === 2 && (
                    <div className="animate-fadeIn">
                      <div className="rounded-lg md:rounded-xl overflow-hidden border border-gray-800 bg-[#121623]">
                        <div className="bg-[#1c2032] p-1.5 md:p-2 border-b border-gray-800 flex items-center justify-between">
                          <div className="flex items-center space-x-1.5 md:space-x-2">
                            <span className="text-xs md:text-sm text-gray-300">Focus Time Tracker</span>
                          </div>
                          <div className="flex space-x-1">
                            <button className="p-0.5 hover:bg-gray-700 rounded">
                              <span className="block w-1 h-1 bg-gray-400 rounded-full"></span>
                            </button>
                          </div>
                        </div>
                        
                        <div className="p-2 md:p-4">
                          <div className="mb-3 md:mb-6 text-center">
                            <h3 className="font-medium text-base md:text-xl mb-1 bg-gradient-to-r from-blue-400 to-purple-400 bg-clip-text text-transparent">Focus Time Tracker</h3>
                            <p className="text-xs md:text-sm text-gray-400">Block distractions, boost productivity</p>
                          </div>
                          
                          <div className="space-y-2 md:space-y-4">
                            <div className="bg-[#1c2032] rounded-lg p-1.5 md:p-3 border border-gray-800">
                              <div className="flex items-center justify-between mb-1.5">
                                <span className="text-xs md:text-sm text-gray-300 font-medium">Focus Mode</span>
                                <div className="relative">
                                  <div className="w-7 h-3.5 md:w-10 md:h-5 bg-green-500/20 rounded-full flex items-center p-0.5">
                                    <div className="w-2.5 h-2.5 md:w-4 md:h-4 rounded-full bg-green-500 translate-x-full"></div>
                                  </div>
                                </div>
                              </div>
                              <div className="flex items-center justify-between text-xs md:text-sm">
                                <span className="text-gray-400">Current Session</span>
                                <span className="text-green-400 font-mono">00:45:12</span>
                              </div>
                            </div>
                            
                            <div className="bg-[#1c2032] rounded-lg p-1.5 md:p-3 border border-gray-800">
                              <div className="flex items-center justify-between mb-1.5">
                                <span className="text-xs md:text-sm text-gray-300 font-medium">Blocked Sites</span>
                                <button className="text-xs text-blue-400">Edit</button>
                              </div>
                              <div className="flex flex-wrap gap-1 md:gap-2">
                                <span className="px-1.5 py-0.5 md:px-2 md:py-1 bg-[#242c45] rounded text-xs text-gray-300">facebook.com</span>
                                <span className="px-1.5 py-0.5 md:px-2 md:py-1 bg-[#242c45] rounded text-xs text-gray-300">twitter.com</span>
                                <span className="px-1.5 py-0.5 md:px-2 md:py-1 bg-[#242c45] rounded text-xs text-gray-300">youtube.com</span>
                                <span className="px-1.5 py-0.5 md:px-2 md:py-1 bg-[#242c45] rounded text-xs text-blue-400">+ Add</span>
                              </div>
                            </div>
                            
                            <div className="bg-[#1c2032] rounded-lg p-1.5 md:p-3 border border-gray-800">
                              <div className="flex items-center justify-between mb-1.5">
                                <span className="text-xs md:text-sm text-gray-300 font-medium">Schedule</span>
                                <button className="text-xs text-blue-400">Edit</button>
                              </div>
                              <div className="flex items-center justify-between text-xs md:text-sm">
                                <span className="text-gray-400">Work Hours</span>
                                <span className="text-gray-300">9:00 AM - 5:00 PM</span>
                              </div>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  )}
                  
                  {/* Step 4: Export & Deploy */}
                  {activeStep === 3 && (
                    <div className="space-y-3 md:space-y-6 animate-fadeIn">
                      <div className="text-center mb-2 md:mb-4">
                        <div className="inline-flex items-center justify-center w-10 h-10 md:w-16 md:h-16 rounded-full bg-gradient-to-r from-blue-500/20 to-green-500/20 p-2 md:p-4 mb-2 md:mb-4">
                          <Rocket className="w-5 h-5 md:w-8 md:h-8 text-green-400" />
                        </div>
                        <h3 className="text-base md:text-xl font-medium text-white">Your extension is ready!</h3>
                        <p className="text-xs md:text-sm text-gray-400 mt-1">Download and deploy to the Chrome Web Store</p>
                      </div>
                      
                      <div className="bg-[#1c2032] rounded-lg p-2 md:p-4 border border-gray-800">
                        <div className="flex items-center justify-between mb-2 md:mb-4">
                          <div className="flex items-center space-x-1.5 md:space-x-2">
                            <span className="text-xs md:text-base font-medium text-gray-200 truncate">Focus Time Tracker.zip</span>
                          </div>
                          <span className="text-xs bg-green-500/20 text-green-400 px-1.5 py-0.5 rounded-md">Ready</span>
                        </div>
                        
                        <ul className="space-y-1.5 text-xs md:text-sm">
                          <li className="flex items-start text-gray-300">
                            <Check className="w-3 h-3 md:w-4 md:h-4 text-green-400 mr-1.5 flex-shrink-0 mt-0.5" />
                            All files included (manifest.json, scripts, HTML/CSS, icons)
                          </li>
                          <li className="flex items-start text-gray-300">
                            <Check className="w-3 h-3 md:w-4 md:h-4 text-green-400 mr-1.5 flex-shrink-0 mt-0.5" />
                            Tested and verified in sandbox environment
                          </li>
                          <li className="flex items-start text-gray-300">
                            <Check className="w-3 h-3 md:w-4 md:h-4 text-green-400 mr-1.5 flex-shrink-0 mt-0.5" />
                            Optimized for Chrome Web Store requirements
                          </li>
                          <li className="flex items-start text-gray-300">
                            <Check className="w-3 h-3 md:w-4 md:h-4 text-green-400 mr-1.5 flex-shrink-0 mt-0.5" />
                            Documentation included
                          </li>
                        </ul>
                        
                        <div className="mt-3 md:mt-6 flex flex-col sm:flex-row gap-2">
                          <button className="flex-1 py-1.5 md:py-2 px-2 md:px-4 bg-gradient-to-r from-blue-500 to-teal-500 text-white rounded-md hover:shadow-lg hover:shadow-blue-500/20 transition-all flex items-center justify-center text-xs md:text-sm">
                            <ArrowRight className="w-3 h-3 md:w-4 md:h-4 mr-1" />
                            Export
                          </button>
                          <button className="flex-1 py-1.5 md:py-2 px-2 md:px-4 bg-[#1c2032] border border-gray-800 text-gray-300 rounded-md hover:bg-[#242c45] transition-colors flex items-center justify-center text-xs md:text-sm">
                            <Rocket className="w-3 h-3 md:w-4 md:h-4 mr-1" />
                            Guide
                          </button>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
                
                {/* Navigation controls - Improved touch targets */}
                <div className="bg-[#1c2032] border-t border-gray-800 p-1.5 md:p-3 flex justify-between items-center">
                  <button 
                    onClick={goToPrevStep}
                    disabled={activeStep === 0}
                    className={`px-2 md:px-3 py-1 md:py-1.5 rounded-md flex items-center text-xs md:text-sm ${
                      activeStep === 0 
                        ? 'text-gray-500 cursor-not-allowed' 
                        : 'text-blue-400 hover:bg-blue-500/10'
                    }`}
                  >
                    <ArrowLeft className="w-3 h-3 md:w-4 md:h-4 mr-0.5" />
                    <span className="hidden sm:inline">Previous</span>
                  </button>
                  
                  <div className="flex space-x-1 md:space-x-1.5">
                    {demoSteps.map((_, index) => (
                      <button
                        key={index}
                        onClick={() => setActiveStep(index)}
                        className={`w-1.5 md:w-2 h-1.5 md:h-2 rounded-full transition-all ${
                          activeStep === index
                            ? 'bg-blue-400 w-3 md:w-6'
                            : 'bg-gray-600 hover:bg-gray-500'
                        }`}
                        aria-label={`Go to step ${index + 1}`}
                      />
                    ))}
                  </div>
                  
                  <button 
                    onClick={goToNextStep}
                    disabled={activeStep === demoSteps.length - 1}
                    className={`px-2 md:px-3 py-1 md:py-1.5 rounded-md flex items-center text-xs md:text-sm ${
                      activeStep === demoSteps.length - 1 
                        ? 'text-gray-500 cursor-not-allowed' 
                        : 'text-blue-400 hover:bg-blue-500/10'
                    }`}
                  >
                    <span className="hidden sm:inline">Next</span>
                    <ArrowRight className="w-3 h-3 md:w-4 md:h-4 ml-0.5" />
                  </button>
                </div>
              </div>
              
              {/* Current step info - Compact on mobile */}
              <div className="mt-2 md:mt-4 p-2 md:p-4 bg-[#1c2032] rounded-lg border border-gray-800">
                <div className="flex items-start">
                  <div className="bg-[#242c45] rounded-lg p-1 md:p-2 mr-2 md:mr-3 flex items-center justify-center w-8 h-8 md:w-12 md:h-12">
                    {activeStep === 0 && <MessageCircle className="w-3 h-3 md:w-5 md:h-5 text-blue-400" />}
                    {activeStep === 1 && <Code className="w-3 h-3 md:w-5 md:h-5 text-blue-400" />}
                    {activeStep === 2 && <Play className="w-3 h-3 md:w-5 md:h-5 text-blue-400" />}
                    {activeStep === 3 && <Rocket className="w-3 h-3 md:w-5 md:h-5 text-blue-400" />}
                  </div>
                  <div>
                    <h4 className="font-medium text-xs md:text-base text-blue-400">{demoSteps[activeStep].title}</h4>
                    <p className="text-xs md:text-sm text-gray-300 mt-0.5">{demoSteps[activeStep].description}</p>
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






// import React, { useState } from 'react'
// import { 
//   ArrowLeft, 
//   ArrowRight, 
//   Check, 
//   Code, 
//   Play, 
//   Rocket, 
//   Terminal, 
//   MessageCircle
// } from 'lucide-react'

// interface DemoStep {
//   title: string
//   description: string
//   example: string
//   icon: React.ReactNode
// }

// interface DemoSectionProps {
//   demoSteps: DemoStep[]
// }

// export default function DemoSection({ demoSteps }: DemoSectionProps) {
//   const [activeStep, setActiveStep] = useState(0)
  
//   const goToNextStep = () => {
//     if (activeStep < demoSteps.length - 1) {
//       setActiveStep(activeStep + 1)
//     }
//   }
  
//   const goToPrevStep = () => {
//     if (activeStep > 0) {
//       setActiveStep(activeStep - 1)
//     }
//   }
  
//   return (
//     <section className="py-24 relative overflow-hidden" id="demo">
//       <div className="absolute inset-0 overflow-hidden pointer-events-none">
//         <div className="absolute top-1/3 right-0 w-96 h-96 bg-blue-500/5 rounded-full blur-3xl" />
//         <div className="absolute bottom-0 left-1/4 w-80 h-80 bg-purple-500/5 rounded-full blur-3xl" />
//         <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(59,130,246,0.05)_0,transparent_70%)]" />
//       </div>
      
//       <div className="container mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
//         <div className="max-w-4xl mx-auto text-center mb-16">
//           <div className="inline-flex items-center px-3 py-1 rounded-full bg-blue-500/10 text-blue-400 text-sm font-medium mb-6">
//             {/* <span className="mr-1">✨</span>  */}
//             See CodEase in action
//           </div>
//           <h2 className="text-4xl md:text-5xl font-bold mb-6 bg-gradient-to-r from-blue-400 via-purple-400 to-teal-400 bg-clip-text text-transparent">
//             Transform Words into Working Extensions
//           </h2>
//           {/* <p className="text-xl text-gray-300 max-w-3xl mx-auto">
//             Watch how our AI turns a simple description into a fully functional Chrome extension in seconds
//           </p> */}
//         </div>
        
//         <div className="max-w-5xl mx-auto">
//           <div className="flex flex-col md:flex-row gap-8 items-start">
//             {/* Demo Steps Navigation */}
//             <div className="md:w-1/3">
//               <div className="space-y-4">
//                 {demoSteps.map((step, index) => (
//                   <button
//                     key={index}
//                     className={`w-full text-left p-4 rounded-xl transition-all duration-300 flex items-start ${
//                       activeStep === index
//                         ? "bg-gradient-to-r from-blue-500/20 to-purple-500/20 border border-blue-500/40"
//                         : "bg-gray-800/30 border border-gray-700 hover:border-blue-500/30"
//                     }`}
//                     onClick={() => setActiveStep(index)}
//                   >
//                     <div className={`w-8 h-8 rounded-lg ${
//                       activeStep === index 
//                         ? "bg-gradient-to-r from-blue-500 to-purple-500" 
//                         : "bg-gray-700"
//                       } flex items-center justify-center mr-3 flex-shrink-0`}
//                     >
//                       <span className="text-white font-medium">{index + 1}</span>
//                     </div>
//                     <div>
//                       <h3 className={`font-medium ${activeStep === index ? "text-blue-400" : "text-gray-200"}`}>
//                         {step.title}
//                       </h3>
//                       <p className="text-sm text-gray-400 mt-1 line-clamp-2">{step.description}</p>
//                     </div>
//                   </button>
//                 ))}
//               </div>
//             </div>

//             {/* Demo Visualization with consistent dark theme and sizing */}
//             <div className="md:w-2/3">
//               <div className="bg-[#121623] rounded-2xl border border-gray-800 overflow-hidden shadow-xl shadow-blue-900/10">
//                 <div className="p-1 bg-[#121623] border-b border-gray-800">
//                   <div className="flex items-center space-x-1.5 px-2">
//                     <div className="w-2.5 h-2.5 bg-rose-500 rounded-full"></div>
//                     <div className="w-2.5 h-2.5 bg-amber-500 rounded-full"></div>
//                     <div className="w-2.5 h-2.5 bg-emerald-500 rounded-full"></div>
//                   </div>
//                 </div>
                
//                 {/* Fixed height content container */}
//                 <div className="p-6 min-h-[460px]">
//                   {/* Step 1: Describe */}
//                   {activeStep === 0 && (
//                     <div className="space-y-6 animate-fadeIn">
//                       <div className="flex items-start space-x-4">
//                         <div className="w-10 h-10 rounded-full bg-gray-700 flex items-center justify-center flex-shrink-0">
//                           <span className="text-gray-300">👤</span>
//                         </div>
//                         <div className="flex-1">
//                           <div className="bg-[#1c2032] p-4 rounded-lg rounded-tl-none">
//                             <p className="text-gray-200">I need a Chrome extension that blocks distracting websites during work hours and tracks my focus time.</p>
//                           </div>
//                         </div>
//                       </div>
                      
//                       <div className="flex items-start space-x-4">
//                         <div className="w-10 h-10 rounded-full bg-[#5e57d9] flex items-center justify-center flex-shrink-0">
//                           <span className="text-white">🤖</span>
//                         </div>
//                         <div className="flex-1">
//                           <div className="bg-[#242c45] p-4 rounded-lg rounded-tl-none">
//                             <p className="text-gray-200">I'll create a productivity extension with these features:</p>
//                             <ul className="mt-3 space-y-2 text-gray-300">
//                               <li className="flex items-center">
//                                 <span className="text-green-400 mr-2">✓</span>
//                                 <span>Website blocking during configurable work hours</span>
//                               </li>
//                               <li className="flex items-center">
//                                 <span className="text-green-400 mr-2">✓</span>
//                                 <span>Focus time tracking and statistics</span>
//                               </li>
//                               <li className="flex items-center">
//                                 <span className="text-green-400 mr-2">✓</span>
//                                 <span>Customizable block lists and schedules</span>
//                               </li>
//                               <li className="flex items-center">
//                                 <span className="text-green-400 mr-2">✓</span>
//                                 <span>Browser notification system</span>
//                               </li>
//                             </ul>
//                           </div>
//                           <div className="flex items-center space-x-2 mt-4">
//                             <button className="text-sm px-4 py-2 bg-[#242c45] text-blue-400 rounded-md hover:bg-[#2a3352] transition-colors">
//                               Modify Features
//                             </button>
//                             <button className="text-sm px-4 py-2 bg-[#245739] text-green-400 rounded-md hover:bg-[#2d6a45] transition-colors">
//                               Confirm & Generate
//                             </button>
//                           </div>
//                         </div>
//                       </div>
//                     </div>
//                   )}

//                   {/* Step 2: AI Generation */}
//                   {activeStep === 1 && (
//                     <div className="space-y-6 animate-fadeIn">
//                       <div className="bg-[#1c2032] rounded-lg p-4 border border-gray-800">
//                         <div className="flex items-center justify-between mb-4">
//                           <div className="flex items-center space-x-2">
//                             <Code className="w-5 h-5 text-blue-400" />
//                             <span className="font-medium text-gray-200">Generating Extension Files</span>
//                           </div>
//                           <span className="text-blue-400 animate-pulse">Processing...</span>
//                         </div>
                        
//                         <div className="space-y-3">
//                           {[
//                             { name: "manifest.json", status: "completed", icon: "📄" },
//                             { name: "background.js", status: "completed", icon: "🔄" },
//                             { name: "popup.html", status: "completed", icon: "🖼️" },
//                             { name: "popup.js", status: "in-progress", icon: "⚙️" },
//                             { name: "styles.css", status: "pending", icon: "🎨" },
//                             { name: "icons/", status: "pending", icon: "🖌️" }
//                           ].map((file, index) => (
//                             <div key={index} className="flex items-center justify-between">
//                               <div className="flex items-center space-x-2">
//                                 <span>{file.icon}</span>
//                                 <span className="font-mono text-sm text-gray-300">{file.name}</span>
//                               </div>
//                               <div>
//                                 {file.status === "completed" ? (
//                                   <span className="text-green-400"><Check className="w-4 h-4" /></span>
//                                 ) : file.status === "in-progress" ? (
//                                   <div className="w-4 h-4 border-2 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
//                                 ) : (
//                                   <span className="text-gray-500">-</span>
//                                 )}
//                               </div>
//                             </div>
//                           ))}
//                         </div>
                        
//                         <div className="mt-6">
//                           <div className="w-full bg-gray-700 h-1.5 rounded-full">
//                             <div className="bg-gradient-to-r from-blue-500 to-purple-500 h-1.5 rounded-full" style={{ width: '65%' }} />
//                           </div>
//                           <div className="flex justify-between mt-2 text-xs text-gray-400">
//                             <span>4/6 files complete</span>
//                             <span>65%</span>
//                           </div>
//                         </div>
//                       </div>
//                     </div>
//                   )}
                  
//                   {/* Step 3: Test & Refine */}
//                   {activeStep === 2 && (
//                     <div className="animate-fadeIn">
//                       <div className="rounded-xl overflow-hidden border border-gray-800 bg-[#121623]">
//                         <div className="bg-[#1c2032] p-2 border-b border-gray-800 flex items-center justify-between">
//                           <div className="flex items-center space-x-2">
//                             <span className="text-sm text-gray-300">Focus Time Tracker</span>
//                           </div>
//                           <div className="flex space-x-1">
//                             <button className="p-1 hover:bg-gray-700 rounded">
//                               <span className="block w-1 h-1 bg-gray-400 rounded-full"></span>
//                             </button>
//                           </div>
//                         </div>
                        
//                         <div className="p-4">
//                           <div className="mb-6 text-center">
//                             <h3 className="font-medium text-xl mb-1 bg-gradient-to-r from-blue-400 to-purple-400 bg-clip-text text-transparent">Focus Time Tracker</h3>
//                             <p className="text-gray-400 text-sm">Block distractions, boost productivity</p>
//                           </div>
                          
//                           <div className="space-y-4">
//                             <div className="bg-[#1c2032] rounded-lg p-3 border border-gray-800">
//                               <div className="flex items-center justify-between mb-2">
//                                 <span className="text-gray-300 font-medium">Focus Mode</span>
//                                 <div className="relative">
//                                   <div className="w-10 h-5 bg-green-500/20 rounded-full flex items-center p-0.5">
//                                     <div className="w-4 h-4 rounded-full bg-green-500 translate-x-full"></div>
//                                   </div>
//                                 </div>
//                               </div>
//                               <div className="flex items-center justify-between text-sm">
//                                 <span className="text-gray-400">Current Session</span>
//                                 <span className="text-green-400 font-mono">00:45:12</span>
//                               </div>
//                             </div>
                            
//                             <div className="bg-[#1c2032] rounded-lg p-3 border border-gray-800">
//                               <div className="flex items-center justify-between mb-2">
//                                 <span className="text-gray-300 font-medium">Blocked Sites</span>
//                                 <button className="text-xs text-blue-400">Edit</button>
//                               </div>
//                               <div className="flex flex-wrap gap-2">
//                                 <span className="px-2 py-1 bg-[#242c45] rounded text-xs text-gray-300">facebook.com</span>
//                                 <span className="px-2 py-1 bg-[#242c45] rounded text-xs text-gray-300">twitter.com</span>
//                                 <span className="px-2 py-1 bg-[#242c45] rounded text-xs text-gray-300">youtube.com</span>
//                                 <span className="px-2 py-1 bg-[#242c45] rounded text-xs text-blue-400">+ Add</span>
//                               </div>
//                             </div>
                            
//                             <div className="bg-[#1c2032] rounded-lg p-3 border border-gray-800">
//                               <div className="flex items-center justify-between mb-2">
//                                 <span className="text-gray-300 font-medium">Schedule</span>
//                                 <button className="text-xs text-blue-400">Edit</button>
//                               </div>
//                               <div className="flex items-center justify-between text-sm">
//                                 <span className="text-gray-400">Work Hours</span>
//                                 <span className="text-gray-300">9:00 AM - 5:00 PM</span>
//                               </div>
//                             </div>
//                           </div>
//                         </div>
//                       </div>
                      
//                       {/* <div className="flex space-x-3 mt-6">
//                         <button className="flex-1 py-2 bg-[#1e2949] text-blue-400 rounded-md hover:bg-[#283361] transition-colors flex items-center justify-center">
//                           <Terminal className="w-4 h-4 mr-2" />
//                           Edit Code
//                         </button>
//                         <button className="flex-1 py-2 bg-[#2e1e49] text-purple-400 rounded-md hover:bg-[#3b2861] transition-colors flex items-center justify-center">
//                           <Play className="w-4 h-4 mr-2" />
//                           Test Again
//                         </button>
//                       </div> */}
//                     </div>
//                   )}
                  
//                   {/* Step 4: Export & Deploy */}
//                   {activeStep === 3 && (
//                     <div className="space-y-6 animate-fadeIn">
//                       <div className="text-center mb-4">
//                         <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-gradient-to-r from-blue-500/20 to-green-500/20 p-4 mb-4">
//                           <Rocket className="w-8 h-8 text-green-400" />
//                         </div>
//                         <h3 className="text-xl font-medium text-white">Your extension is ready!</h3>
//                         <p className="text-gray-400 mt-1">Download and deploy to the Chrome Web Store in minutes</p>
//                       </div>
                      
//                       <div className="bg-[#1c2032] rounded-lg p-4 border border-gray-800">
//                         <div className="flex items-center justify-between mb-4">
//                           <div className="flex items-center space-x-2">
//                             <span className="font-medium text-gray-200">Focus Time Tracker.zip</span>
//                           </div>
//                           <span className="text-xs bg-green-500/20 text-green-400 px-2 py-0.5 rounded-md">Ready</span>
//                         </div>
                        
//                         <ul className="space-y-2 text-sm">
//                           <li className="flex items-center text-gray-300">
//                             <Check className="w-4 h-4 text-green-400 mr-2 flex-shrink-0" />
//                             All files included (manifest.json, scripts, HTML/CSS, icons)
//                           </li>
//                           <li className="flex items-center text-gray-300">
//                             <Check className="w-4 h-4 text-green-400 mr-2 flex-shrink-0" />
//                             Tested and verified in sandbox environment
//                           </li>
//                           <li className="flex items-center text-gray-300">
//                             <Check className="w-4 h-4 text-green-400 mr-2 flex-shrink-0" />
//                             Optimized for Chrome Web Store requirements
//                           </li>
//                           <li className="flex items-center text-gray-300">
//                             <Check className="w-4 h-4 text-green-400 mr-2 flex-shrink-0" />
//                             Documentation and installation guide included
//                           </li>
//                         </ul>
                        
//                         <div className="mt-6 flex flex-col sm:flex-row gap-3">
//                           <button className="flex-1 py-2 px-4 bg-gradient-to-r from-blue-500 to-teal-500 text-white rounded-md hover:shadow-lg hover:shadow-blue-500/20 transition-all flex items-center justify-center">
//                             <ArrowRight className="w-4 h-4 mr-2" />
//                             Export Extension
//                           </button>
//                           <button className="flex-1 py-2 px-4 bg-[#1c2032] border border-gray-800 text-gray-300 rounded-md hover:bg-[#242c45] transition-colors flex items-center justify-center">
//                             <Rocket className="w-4 h-4 mr-2" />
//                             Publish Guide
//                           </button>
//                         </div>
//                       </div>
//                     </div>
//                   )}
//                 </div>
                
//                 {/* Navigation controls */}
//                 <div className="bg-[#1c2032] border-t border-gray-800 p-3 flex justify-between items-center">
//                   <button 
//                     onClick={goToPrevStep}
//                     disabled={activeStep === 0}
//                     className={`px-3 py-1.5 rounded-md flex items-center ${
//                       activeStep === 0 
//                         ? 'text-gray-500 cursor-not-allowed' 
//                         : 'text-blue-400 hover:bg-blue-500/10'
//                     }`}
//                   >
//                     <ArrowLeft className="w-4 h-4 mr-1" />
//                     Previous
//                   </button>
                  
//                   <div className="flex space-x-1.5">
//                     {demoSteps.map((_, index) => (
//                       <button
//                         key={index}
//                         onClick={() => setActiveStep(index)}
//                         className={`w-2 h-2 rounded-full transition-all ${
//                           activeStep === index
//                             ? 'bg-blue-400 w-6'
//                             : 'bg-gray-600 hover:bg-gray-500'
//                         }`}
//                         aria-label={`Go to step ${index + 1}`}
//                       />
//                     ))}
//                   </div>
                  
//                   <button 
//                     onClick={goToNextStep}
//                     disabled={activeStep === demoSteps.length - 1}
//                     className={`px-3 py-1.5 rounded-md flex items-center ${
//                       activeStep === demoSteps.length - 1 
//                         ? 'text-gray-500 cursor-not-allowed' 
//                         : 'text-blue-400 hover:bg-blue-500/10'
//                     }`}
//                   >
//                     Next
//                     <ArrowRight className="w-4 h-4 ml-1" />
//                   </button>
//                 </div>
//               </div>
              
//               {/* Current step info */}
//               <div className="mt-4 p-4 bg-[#1c2032] rounded-lg border border-gray-800">
//                 <div className="flex items-start">
//                   <div className="bg-[#242c45] rounded-lg p-2 mr-3 flex items-center justify-center w-12 h-12">
//                     {activeStep === 0 && <MessageCircle className="w-5 h-5 text-blue-400" />}
//                     {activeStep === 1 && <Code className="w-5 h-5 text-blue-400" />}
//                     {activeStep === 2 && <Play className="w-5 h-5 text-blue-400" />}
//                     {activeStep === 3 && <Rocket className="w-5 h-5 text-blue-400" />}
//                   </div>
//                   <div>
//                     <h4 className="font-medium text-blue-400">{demoSteps[activeStep].title}</h4>
//                     <p className="text-sm text-gray-300 mt-1">{demoSteps[activeStep].description}</p>
//                   </div>
//                 </div>
//               </div>
//             </div>
//           </div>
//         </div>
//       </div>
//     </section>
//   )
// }