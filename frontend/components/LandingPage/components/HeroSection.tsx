'use client'

import React, { useState, useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { ArrowRight, Play, Chrome, Download, Check, TestTube, RefreshCw, Star, Zap } from 'lucide-react';

export default function HeroSection() {
  const router = useRouter(); 
  const [isClient, setIsClient] = useState(false);
  const [demoStage, setDemoStage] = useState(0);
  const [progressPercent, setProgressPercent] = useState(70);
  const [isHovered, setIsHovered] = useState(false);
  const [cursorPosition, setCursorPosition] = useState({ x: 0, y: 0 });
  const [isMobile, setIsMobile] = useState(false);
  const heroRef = useRef<HTMLElement | null>(null);
  // Fix the types for these refs
  const demoTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const progressIntervalRef = useRef<ReturnType<typeof setInterval> | null>(null);
  
  // Check for mobile device
  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 768);
    };
    
    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);
  
  // Handle cursor movement for the spotlight effect
  const handleMouseMove = (e: React.MouseEvent) => {
    if (heroRef.current) {
      const rect = heroRef.current.getBoundingClientRect();
      setCursorPosition({
        x: e.clientX - rect.left,
        y: e.clientY - rect.top
      });
    }
  };
  
  const resetDemo = () => {
    // Clear any existing timeouts
    if (demoTimeoutRef.current) clearTimeout(demoTimeoutRef.current);
    if (progressIntervalRef.current) clearInterval(progressIntervalRef.current);
    
    setDemoStage(0);
    setProgressPercent(70);
    
    // Start animation sequence again
    progressIntervalRef.current = setInterval(() => {
      setProgressPercent(prev => {
        if (prev >= 100) {
          if (progressIntervalRef.current) clearInterval(progressIntervalRef.current);
          demoTimeoutRef.current = setTimeout(() => setDemoStage(1), 500);
          return 100;
        }
        return prev + 1;
      });
    }, 100);
    demoTimeoutRef.current = setTimeout(() => {
        setDemoStage(2);
        
        // Auto-restart the demo after 5 seconds
        demoTimeoutRef.current = setTimeout(() => {
          resetDemo();
        }, 7000);
      }, 6000);
    };
    

  useEffect(() => {
    setIsClient(true);
    
    // Animation sequence for the demo card
    if (isClient) {
      // Start with 87% progress
      progressIntervalRef.current = setInterval(() => {
        setProgressPercent(prev => {
          if (prev >= 100) {
            if (progressIntervalRef.current) clearInterval(progressIntervalRef.current);
            // Move to completed stage after reaching 100%
            demoTimeoutRef.current = setTimeout(() => setDemoStage(1), 500);
            return 100;
          }
          return prev + 1;
        });
      }, 100);
      // After completion stage, move to download/test stage
      demoTimeoutRef.current = setTimeout(() => {
        setDemoStage(2);
        
        // Auto-restart the demo after 5 seconds
        demoTimeoutRef.current = setTimeout(() => {
          resetDemo();
        }, 7000);
      }, 6000);
    }
    
    // Clean up timeouts and intervals on unmount
    return () => {
      if (demoTimeoutRef.current) clearTimeout(demoTimeoutRef.current);
      if (progressIntervalRef.current) clearInterval(progressIntervalRef.current);
    };
  }, [isClient]);

  // Add custom text-typing animation
  const [typedText, setTypedText] = useState("");
  const fullText = "A productivity timer that blocks distracting websites and tracks my focus time";
  
  useEffect(() => {
    if (!isClient) return;
    
    let index = 0;
    const typingInterval = setInterval(() => {
      if (index < fullText.length) {
        setTypedText(fullText.substring(0, index + 1));
        index++;
      } else {
        clearInterval(typingInterval);
      }
    }, 50);
    
    return () => clearInterval(typingInterval);
  }, [isClient]);

  const [counters, setCounters] = useState({
    extensions: 0,
    accuracy: 0,
    speed: 0
  });
  
  // Add this useEffect for the counter animation
  useEffect(() => {
    if (!isClient) return;
  
    const duration = 2000; // 2 seconds animation
    const steps = 60;
    const interval = duration / steps;
  
    const countersInterval = setInterval(() => {
      setCounters(prev => ({
        extensions: Math.min(prev.extensions + Math.ceil(250 / steps), 250),
        accuracy: Math.min(prev.accuracy + Math.ceil(90 / steps), 90),
        speed: Math.min(prev.speed + Math.ceil(10 / steps), 10)
      }));
    }, interval);
  
    return () => clearInterval(countersInterval);
  }, [isClient]);

  return (
    <section 
      className="sm:min-h-screen flex items-start relative overflow-hidden pt-4 sm:pt-8"
      style={{ paddingTop: 'calc(80px + 1rem)' }}
      id="hero"
      ref={heroRef}
      onMouseMove={handleMouseMove}
    >
      {/* Interactive background with spotlight effect - disabled on mobile */}
      <div className="absolute inset-0 overflow-hidden">
        {/* Spotlight gradient that follows cursor - disabled on mobile */}
        {isClient && !isMobile && (
          <div 
            className="absolute w-[800px] h-[800px] rounded-full opacity-30 pointer-events-none transition-transform duration-100 ease-out"
            style={{
              background: 'radial-gradient(circle, rgba(56,182,255,0.15) 0%, rgba(38,161,240,0.08) 40%, transparent 70%)',
              left: `${cursorPosition.x - 400}px`,
              top: `${cursorPosition.y - 400}px`,
              transform: 'translate3d(0, 0, 0)'
            }}
          />
        )}
      
        {/* Dynamic aurora effects - simplified on mobile */}
        <div 
          className="absolute -top-[500px] -left-[400px] w-[1000px] h-[1000px] bg-[radial-gradient(ellipse_at_center,hsla(217,100%,50%,0.12)_0%,transparent_70%)]" 
          style={{ animation: isClient && !isMobile ? 'aurora-x 25s ease-in-out infinite' : 'none' }} 
        />
        <div 
          className="absolute -top-[300px] -right-[300px] w-[800px] h-[800px] bg-[radial-gradient(ellipse_at_center,hsla(265,89%,60%,0.12)_0%,transparent_70%)]" 
          style={{ animation: isClient && !isMobile ? 'aurora-y 20s ease-in-out infinite' : 'none' }} 
        />
        <div 
          className="absolute bottom-[20%] left-[10%] w-[600px] h-[600px] bg-[radial-gradient(ellipse_at_center,hsla(190,95%,50%,0.06)_0%,transparent_70%)]" 
          style={{ animation: isClient && !isMobile ? 'aurora-pulse 30s ease infinite' : 'none' }} 
        />
        
        {/* Animated particles - disabled on mobile */}
        {isClient && !isMobile && Array.from({ length: 8 }).map((_, i) => (
          <div 
            key={i}
            className="absolute w-1 h-1 rounded-full bg-blue-400/30"
            style={{
              top: `${Math.random() * 100}%`,
              left: `${Math.random() * 100}%`,
              animation: `float-particle ${8 + Math.random() * 10}s linear infinite`,
              animationDelay: `${Math.random() * 5}s`
            }}
          />
        ))}
        
        {/* Enhanced grid effect - simplified on mobile */}
        <div 
          className="absolute inset-0 bg-[linear-gradient(rgba(59,130,246,0.05)_1px,transparent_1px),linear-gradient(90deg,rgba(59,130,246,0.05)_1px,transparent_1px)] bg-[size:40px_40px] [mask-image:radial-gradient(ellipse_at_center,black_20%,transparent_70%)]"
          style={{ opacity: isMobile ? 0.5 : 1 }}
        />
        
        {/* Subtle gradient overlay */}
        <div className="absolute bottom-0 left-0 w-full h-1/2 bg-gradient-to-t from-gray-900 via-gray-900/40 to-transparent" />
      </div>
      
      <div className="container mx-auto px-3 sm:px-6 relative z-10 pb-6 sm:pb-2">
        <div className="max-w-6xl mx-auto text-center">
          {/* Enhanced animated badge with tokenization update - mobile optimized */}
          <div className="mb-3 sm:mb-6 inline-flex items-center px-3 sm:px-4 py-1.5 sm:py-2 rounded-full bg-gray-800/30 backdrop-blur-sm border border-gray-700 hover:border-blue-500/50 transition-all duration-300 group relative overflow-hidden">
            <div className="absolute inset-0 bg-gradient-to-r from-blue-500/10 to-purple-500/10 group-hover:opacity-100 opacity-0 transition-opacity duration-300"></div>
            <div className="absolute inset-0 rounded-full bg-blue-500/5 animate-pulse"></div>
            <span className="flex items-center bg-blue-500/20 px-1.5 sm:px-2 py-0.5 sm:py-1 rounded-full mr-1.5 sm:mr-2 relative z-10 group-hover:bg-blue-500/30 transition-colors">
              <span className="text-[10px] sm:text-xs font-semibold text-blue-400">NEW</span>
            </span>
            <span className="text-[10px] sm:text-xs md:text-sm text-gray-300 group-hover:text-blue-200 transition-colors duration-200 relative z-10">
              <span className="font-semibold">Tokenize your extensions</span>
              <span className="sm:hidden"> - Mint on Hedera and earn passive income</span>
              <span className="hidden sm:inline md:hidden"> - Mint on Hedera to earn passive income</span>
              <span className="hidden md:inline"> - You can now mint your extensions as Hedera tokens and earn passive income</span>
            </span>
          </div>
          
          {/* Enhanced heading with animated gradient and staggered reveal - responsive */}
          <h1 className="text-3xl sm:text-5xl md:text-6xl lg:text-7xl font-bold mb-4 sm:mb-6 relative leading-tight">
            <span className="relative inline-block w-full">
              <span className="relative bg-gradient-to-br from-blue-400 via-purple-400 to-teal-400 bg-clip-text text-transparent animate-gradient-x px-2 sm:px-4">
                Build Chrome Extensions
              </span>
            </span>
            <span className="bg-gradient-to-r from-purple-400 via-teal-400 to-blue-400 bg-clip-text text-transparent animate-gradient-x px-2 sm:px-4 inline-block w-full">
              in Minutes, Not Months
            </span>
          </h1>
          
          {/* Enhanced subtitle with animated text highlight - responsive */}
          <p className="text-base sm:text-lg md:text-xl text-gray-300 mb-6 sm:mb-8 max-w-2xl sm:max-w-3xl mx-auto leading-relaxed px-4 sm:px-0">
            This VibeCoding AI platform transforms your ideas into fully-functional Chrome extensions{' '}
            <span className="hidden sm:inline whitespace-nowrap">—&nbsp;</span>
            <span className="relative group inline-block">
              <span className="absolute -inset-1 rounded bg-gradient-to-r from-blue-500/30 to-purple-500/30 opacity-0 group-hover:opacity-100 blur-sm transition-opacity duration-500"></span>
              <span className="relative text-white font-medium bg-gradient-to-r from-white to-blue-200 bg-clip-text animate-pulse">
                just describe what you need in plain English
              </span>
            </span>
          </p>
          
          {/* Enhanced CTA buttons with better hover effects and micro-interactions - responsive */}
          <div className="flex flex-col sm:flex-row justify-center space-y-4 sm:space-y-0 sm:space-x-4 items-center mb-8 sm:mb-12 px-4 sm:px-0">
            <button 
              onClick={() => router.push('/signin')}
              className="relative w-auto min-w-[280px] sm:w-auto px-6 sm:px-8 py-3 sm:py-4 rounded-lg font-medium text-base sm:text-xl overflow-hidden group"
              onMouseEnter={() => setIsHovered(true)}
              onMouseLeave={() => setIsHovered(false)}
            >
              {/* Button background with animated gradient on hover */}
              <span className="absolute inset-0 bg-gradient-to-r from-blue-600 via-blue-500 to-teal-500 transition-all duration-500 group-hover:blur-sm"></span>
              <span className="absolute inset-0 bg-gradient-to-r from-blue-600 via-teal-500 to-blue-500 opacity-0 group-hover:opacity-100 transition-all duration-500 group-hover:animate-gradient-x"></span>
              
              {/* Button content */}
              <span className="relative flex items-center justify-center z-10 group-hover:scale-105 transition-transform duration-300">
                <span className="text-sm sm:text-lg">Build Your Extension <span className="text-xs sm:text-base font-normal">for</span> Free</span>
                <ArrowRight className="w-4 h-4 sm:w-6 sm:h-6 ml-1 sm:ml-3 group-hover:translate-x-1 transition-transform" />
              </span>
              
              {/* Subtle glow effect */}
              <span className="absolute inset-0 rounded-lg shadow-xl opacity-0 group-hover:opacity-100 shadow-blue-500/30 transition-opacity"></span>
            </button>
            
            <button
              onClick={() => {
                const demoSection = document.getElementById('demo');
                if (demoSection) {
                  demoSection.scrollIntoView({ behavior: 'smooth' });
                }
              }}
              className="relative w-auto min-w-[200px] sm:w-auto px-4 sm:px-6 py-2.5 sm:py-3.5 rounded-lg font-medium overflow-hidden group"
            >
              {/* Transparent background with animated border */}
              <span className="absolute inset-0 bg-gray-800/60 backdrop-blur-sm border border-gray-700 rounded-lg group-hover:border-teal-500/50 transition-all duration-300"></span>
              
              {/* Button content */}
              <span className="relative flex items-center justify-center z-10">
                <Play className="w-4 h-4 sm:w-5 sm:h-5 mr-1.5 sm:mr-2 text-teal-400 group-hover:scale-110 transition-transform duration-300" />
                <span className="text-sm sm:text-lg group-hover:text-teal-400 transition-colors duration-300">See It In Action</span>
              </span>
            </button>
          </div>

          {/* Enhanced stats with more dynamic animations and depth - responsive */}
          <div className="grid grid-cols-3 sm:grid-cols-3 gap-2 sm:gap-4 max-w-lg sm:max-w-2xl mx-auto mb-6 sm:mb-12">
            {[
              { 
                icon: Zap, 
                value: counters.extensions, 
                suffix: "+",
                label: "Extensions Developed", 
                color: "blue" 
              },
              { 
                icon: Star, 
                value: counters.accuracy, 
                suffix: "%",
                label: "Accuracy Rate", 
                color: "purple" 
              },
              { 
                icon: Chrome, 
                value: counters.speed, 
                suffix: "x",
                label: "Faster Development", 
                color: "teal" 
              }
            ].map((stat, index) => (
              <div 
                key={index}
                className="relative p-2 sm:p-4 rounded-lg bg-gray-800/20 backdrop-blur-sm border border-gray-700/50 overflow-hidden transition-all duration-500 hover:-translate-y-1 hover:shadow-lg group"
              >
                {/* Animated gradient background on hover - simplified for mobile */}
                {!isMobile && (
                  <div className={`absolute inset-0 bg-gradient-to-br from-${stat.color}-500/10 to-${stat.color}-800/5 opacity-0 group-hover:opacity-100 transition-opacity duration-500`}></div>
                )}
                
                {/* Top left corner accent - removed for mobile */}
                {!isMobile && (
                  <div className={`absolute top-0 left-0 w-8 h-8 -translate-x-4 -translate-y-4 bg-${stat.color}-500/20 rounded-full blur-xl group-hover:translate-x-0 group-hover:translate-y-0 transition-all duration-700`}></div>
                )}
                
                {/* Text content with animated reveal - responsive */}
                <p className={`text-${stat.color}-400 text-lg sm:text-2xl font-bold relative z-10 flex items-center justify-center`}>
                  <span>{stat.value}</span>
                  <span className="text-sm sm:text-lg ml-0.5">{stat.suffix}</span>
                </p>
                <p className="text-gray-400 text-[10px] sm:text-xs mt-1 sm:mt-1.5 relative z-10 group-hover:text-gray-300 transition-colors text-center">{stat.label}</p>
              </div>
            ))}
          </div>

          {/* Interactive demo visual with animation sequence - responsive */}
          {isClient && (
            <div className="relative w-full h-52 sm:h-[400px] mt-1 sm:mt-8 mb-2 sm:mb-4">
              {/* Main browser window with enhanced effects - responsive */}
              <div 
                className="absolute top-0 left-1/2 transform -translate-x-1/2 w-[350px] sm:w-[600px] max-w-[95%] h-52 sm:h-80 bg-gradient-to-br from-gray-900/90 to-gray-800/90 backdrop-blur-md rounded-xl border border-cyan-500/20 shadow-xl shadow-cyan-500/10 hover:shadow-cyan-500/20 hover:border-cyan-400/30 transition-all duration-500" 
                style={{ animation: !isMobile ? 'float 6s ease-in-out infinite' : 'none' }}
              >
                <div className="p-3 sm:p-6">
                  {/* Window Controls with hover effect */}
                  <div className="flex space-x-1.5 sm:space-x-3">
                    <div className="w-2.5 h-2.5 sm:w-4 sm:h-4 bg-rose-500/80 rounded-full hover:bg-rose-400 transition-colors"></div>
                    <div className="w-2.5 h-2.5 sm:w-4 sm:h-4 bg-amber-500/80 rounded-full hover:bg-amber-400 transition-colors"></div>
                    <div className="w-2.5 h-2.5 sm:w-4 sm:h-4 bg-emerald-500/80 rounded-full hover:bg-emerald-400 transition-colors"></div>
                  </div>
                  
                  {/* Content area with transitions between states - responsive */}
                  <div className="mt-3 sm:mt-6 bg-gray-900/40 rounded-lg p-2.5 sm:p-5 text-xs sm:text-base text-cyan-300 border border-cyan-700/30 shadow-inner shadow-cyan-500/20 h-32 sm:h-52 relative overflow-hidden">
                    <div className="font-mono text-[10px] sm:text-sm mb-2 sm:mb-4 text-gray-400">
                      <span className="text-blue-400">»</span> Describe your extension:
                    </div>
                    
                    <span className="font-mono tracking-wide bg-gradient-to-r from-cyan-400 to-blue-500 text-transparent bg-clip-text text-[10px] sm:text-sm">
                      "{typedText}"
                    </span>
                    <span className="h-0.5 w-2 sm:w-3 bg-blue-400 inline-block ml-1" style={{ animation: 'blink 1s step-end infinite' }}></span>
                    
                    {/* Progress stage - responsive */}
                    {demoStage < 2 && (
                      <div className="mt-3 sm:mt-5">
                        {/* Dynamic text based on progress */}
                        <div className="text-[9px] sm:text-sm text-cyan-500/70 font-mono flex justify-between">
                          <span>{progressPercent < 100 ? "Generating files..." : "Extension created successfully!"}</span>
                          <span className={`${progressPercent === 100 ? "text-green-400" : "text-teal-400"}`}>
                            {progressPercent}% complete
                          </span>
                        </div>

                        {/* Dynamic progress bar */}
                        <div className="w-full bg-gray-800 h-0.5 sm:h-1.5 rounded-full mt-1.5 sm:mt-3 overflow-hidden">
                          <div 
                            className={`h-0.5 sm:h-1.5 rounded-full transition-all duration-300 ${
                              progressPercent < 100 
                                ? "bg-gradient-to-r from-blue-500 to-teal-500" 
                                : "bg-gradient-to-r from-green-500 to-teal-400"
                            }`} 
                            style={{ width: `${progressPercent}%` }}
                          />
                        </div>
                        
                        {/* Show completion message when at 100% */}
                        {demoStage === 1 && (
                          <div className="absolute inset-0 flex items-center justify-center bg-gray-900/80 backdrop-blur-sm animate-fadeIn rounded-lg">
                            <div className="text-center">
                              <div className="inline-flex items-center justify-center w-8 sm:w-12 h-8 sm:h-12 rounded-full bg-green-500/20 mb-2 sm:mb-4">
                                <Check className="w-4 sm:w-6 h-4 sm:h-6 text-green-400" />
                              </div>
                              <p className="text-green-400 font-medium text-xs sm:text-lg">Extension Generated!</p>
                            </div>
                          </div>
                        )}
                      </div>
                    )}
                    
                    {/* Download & Test stage - responsive */}
                    {demoStage === 2 && (
                      <div className="mt-2 sm:mt-5 animate-fadeIn">
                        <p className="text-[10px] sm:text-base text-green-400 font-medium mb-2 sm:mb-4 text-center">Your extension is ready!</p>
                        
                        <div className="flex flex-col sm:flex-row gap-1.5 sm:gap-4 mt-2 sm:mt-5">
                          <button className="w-full sm:flex-1 py-1 sm:py-2.5 px-2 sm:px-4 bg-gradient-to-r from-blue-600 to-blue-500 rounded text-[10px] sm:text-sm font-medium flex items-center justify-center hover:from-blue-500 hover:to-blue-400 transition-all duration-300 group">
                            <Download className="w-2 sm:w-4 h-2 sm:h-4 mr-1 sm:mr-2 group-hover:animate-bounce" />
                            Download Extension
                          </button>
                          
                          <button className="w-full sm:flex-1 py-1 sm:py-2.5 px-2 sm:px-4 bg-gray-800/80 border border-gray-700 rounded text-[10px] sm:text-sm font-medium flex items-center justify-center hover:bg-gray-800 hover:border-cyan-700/50 transition-colors">
                            <TestTube className="w-2 sm:w-4 h-2 sm:h-4 mr-1 sm:mr-2" />
                            Test in Browser
                          </button>
                        </div>
                        
                        <div className="mt-1.5 sm:mt-4">
                          <button 
                            onClick={resetDemo} 
                            className="px-2 sm:px-4 py-1 sm:py-2 text-[10px] sm:text-sm font-medium text-cyan-400 hover:text-cyan-300 flex items-center justify-center mx-auto transition-all duration-300"
                          >
                            <RefreshCw className="w-2 sm:w-4 h-2 sm:h-4 mr-1 sm:mr-2 group-hover:rotate-180 transition-transform duration-500" />
                            See again
                          </button>
                        </div>
                      </div>
                    )}
                  </div>

                  {/* Enhanced status bar - responsive */}
                  <div className="absolute bottom-0 left-0 right-0 px-2.5 sm:px-5 py-1.5 sm:py-2.5 border-t border-cyan-700/20 bg-gray-900/30 rounded-b-xl text-[10px] sm:text-sm font-mono flex justify-between items-center">
                    <span className="text-cyan-400/80">CodEase AI</span>
                    <span className={`px-1.5 sm:px-3 py-0.5 sm:py-1 rounded-full text-[9px] sm:text-xs ${
                      demoStage === 2 ? "bg-green-500/20 text-green-400" : "bg-blue-500/20 text-blue-400"
                    }`}>
                      {demoStage === 2 ? "Ready to deploy" : "Processing..."}
                    </span>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
      
      {/* Enhanced CSS animations - conditional application for mobile */}
      {isClient && (
        <style jsx global>{`
          @keyframes float {
            0%, 100% { transform: translateY(0) translateX(-50%); }
            50% { transform: translateY(-10px) translateX(-50%); }
          }
          
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
          
          @keyframes blink {
            0%, 100% { opacity: 1; }
            50% { opacity: 0; }
          }
          
          @keyframes fadeIn {
            from { opacity: 0; transform: translateY(10px); }
            to { opacity: 1; transform: translateY(0); }
          }
          
          @keyframes gradient-x {
            0% { background-position: 0% 50%; }
            50% { background-position: 100% 50%; }
            100% { background-position: 0% 50%; }
          }
          
          @keyframes scale-in {
            from { transform: scale(0.9); opacity: 0; }
            to { transform: scale(1); opacity: 1; }
          }
          
          @keyframes float-particle {
            0% { transform: translateY(0) translateX(0); opacity: 0.3; }
            50% { transform: translateY(-20px) translateX(10px); opacity: 1; }
            100% { transform: translateY(-40px) translateX(0); opacity: 0.3; }
          }
          
          .animate-fadeIn {
            animation: fadeIn 0.6s ease forwards;
          }
          
          .animate-gradient-x {
            background-size: 200% auto;
            animation: gradient-x 8s ease infinite;
          }
          
          .scale-in {
            animation: scale-in 0.5s cubic-bezier(0.175, 0.885, 0.32, 1.275) forwards;
          }
        `}</style>
      )}
    </section>
  );
}