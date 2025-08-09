'use client';

import React, { useState, use } from 'react';
import TokenizationForm from '@/components/Tokenization/TokenizationForm';
import { ArrowLeft, Coins, TrendingUp, DollarSign, Shield, Users } from 'lucide-react';
import Link from 'next/link';

interface CursorPosition {
  x: number;
  y: number;
}

interface TokenizePageProps {
  params: Promise<{ sessionId: string }>;
}

export default function TokenizePage({ params }: TokenizePageProps) {
  // Unwrap the params Promise using React.use()
  const { sessionId } = use(params);
  
  const [cursorPosition, setCursorPosition] = useState<CursorPosition>({ x: 0, y: 0 });
  const [isClient, setIsClient] = useState<boolean>(false);
  const [screenWidth, setScreenWidth] = useState<number>(0);

  React.useEffect(() => {
    setIsClient(true);
    setScreenWidth(window.innerWidth);
    
    const handleResize = () => {
      setScreenWidth(window.innerWidth);
    };
    
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  // Handle cursor movement for the spotlight effect
  const handleMouseMove = (e: React.MouseEvent): void => {
    setCursorPosition({
      x: e.clientX,
      y: e.clientY
    });
  };

  return (
    <div 
      className="min-h-screen bg-gray-950 text-white overflow-hidden relative px-4 py-6"
      onMouseMove={handleMouseMove}
    >
      {/* Interactive background with spotlight effect */}
      <div className="absolute inset-0 overflow-hidden">
        {/* Spotlight gradient that follows cursor */}
        {isClient && (
          <div 
            className="absolute w-[500px] sm:w-[800px] h-[500px] sm:h-[800px] rounded-full opacity-30 pointer-events-none transition-transform duration-100 ease-out"
            style={{
              background: 'radial-gradient(circle, rgba(56,182,255,0.15) 0%, rgba(38,161,240,0.08) 40%, transparent 70%)',
              left: `${cursorPosition.x - (screenWidth < 640 ? 250 : 400)}px`,
              top: `${cursorPosition.y - (screenWidth < 640 ? 250 : 400)}px`,
              transform: 'translate3d(0, 0, 0)'
            }}
          />
        )}
      
        {/* Dynamic aurora effects */}
        <div className="absolute -top-[300px] sm:-top-[500px] -left-[200px] sm:-left-[400px] w-[600px] sm:w-[1000px] h-[600px] sm:h-[1000px] bg-[radial-gradient(ellipse_at_center,hsla(217,100%,50%,0.12)_0%,transparent_70%)]" style={{ animation: isClient ? 'aurora-x 25s ease-in-out infinite' : 'none' }} />
        <div className="absolute -top-[200px] sm:-top-[300px] -right-[200px] sm:-right-[300px] w-[500px] sm:w-[800px] h-[500px] sm:h-[800px] bg-[radial-gradient(ellipse_at_center,hsla(265,89%,60%,0.12)_0%,transparent_70%)]" style={{ animation: isClient ? 'aurora-y 20s ease-in-out infinite' : 'none' }} />
        <div className="absolute bottom-[10%] sm:bottom-[20%] left-[5%] sm:left-[10%] w-[300px] sm:w-[600px] h-[300px] sm:h-[600px] bg-[radial-gradient(ellipse_at_center,hsla(190,95%,50%,0.06)_0%,transparent_70%)]" style={{ animation: isClient ? 'aurora-pulse 30s ease infinite' : 'none' }} />
        
        {/* Enhanced grid effect */}
        <div className="absolute inset-0 bg-[linear-gradient(rgba(59,130,246,0.05)_1px,transparent_1px),linear-gradient(90deg,rgba(59,130,246,0.05)_1px,transparent_1px)] bg-[size:40px_40px] [mask-image:radial-gradient(ellipse_at_center,black_20%,transparent_70%)]" />
        
        {/* Subtle gradient overlay */}
        <div className="absolute bottom-0 left-0 w-full h-1/2 bg-gradient-to-t from-gray-900 via-gray-900/40 to-transparent" />
      </div>

      {/* Content */}
      <div className="relative z-10 max-w-6xl mx-auto">
        {/* Back button */}
        <Link 
          href={`/chat/${sessionId}`} 
          className="inline-flex items-center text-gray-400 hover:text-white mb-6 transition-all duration-200 hover:transform hover:translate-x-1 group"
        >
          <ArrowLeft className="w-5 h-5 mr-2 group-hover:translate-x-[-2px] transition-transform" />
          Back to Chat
        </Link>

        {/* Header Section - Minimal */}
        <div className="text-center mb-8">
          <h1 className="text-3xl md:text-4xl font-bold text-white mb-3 bg-gradient-to-r from-blue-400 to-purple-400 bg-clip-text text-transparent">
            Tokenize Your Extension
          </h1>
          <p className="text-lg text-gray-300 max-w-2xl mx-auto">
            Transform your Chrome extension into a tradeable digital asset on the Hedera network
          </p>
        </div>

        {/* Form Section - Primary CTA */}
        <div className="flex justify-center mb-16">
          <div className="w-full max-w-4xl">
            <TokenizationForm 
              extensionId={sessionId}
            />
          </div>
        </div>
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
        
        @keyframes gradient-x {
          0% { background-position: 0% 50%; }
          50% { background-position: 100% 50%; }
          100% { background-position: 0% 50%; }
        }
        
        .animate-gradient-x {
          background-size: 200% auto;
          animation: gradient-x 8s ease infinite;
        }
      `}</style>
    </div>
  );
} 