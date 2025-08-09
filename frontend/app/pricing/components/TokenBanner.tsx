'use client'

import React from 'react'
import { motion } from 'framer-motion'
import { Coins, Copy, CheckCircle, ArrowUpRight, Flame} from 'lucide-react'

interface TokenBannerProps {
  copied: boolean;
  setCopied: (copied: boolean) => void;
  copyContractAddress: () => void;
}

export default function TokenBanner({ copied, setCopied, copyContractAddress }: TokenBannerProps) {
  return (
    <motion.div 
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.3, duration: 0.5 }}
      className="max-w-4xl mx-auto mb-8 rounded-xl overflow-hidden shadow-xl"
    >
      {/* Gradient background wrapper */}
      <div className="bg-gradient-to-r from-purple-900/60 to-blue-900/60 border border-purple-500/30 backdrop-blur-sm overflow-hidden">
        {/* Token information grid */}
        <div className="grid grid-cols-1 md:grid-cols-3">
          {/* Left column - Token info */}
          <div className="p-6 md:col-span-2">
            <div className="flex items-center mb-3">
              <div className="w-12 h-12 rounded-full bg-gradient-to-br from-purple-500/30 to-blue-500/20 flex items-center justify-center mr-3 shadow-lg shadow-purple-500/20">
                <Coins className="w-6 h-6 text-purple-400" />
              </div>
              <h3 className="text-xl sm:text-2xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-purple-400 to-blue-400">
                Introducing $CODON
              </h3>
            </div>
            
            <p className="text-gray-300 text-sm sm:text-base mb-4 md:pr-4">
              Our utility token enables more efficient transactions with reduced fees and supports 
              the platform through a token burn mechanism. Use CODON to purchase credits and 
              enjoy exclusive benefits.
            </p>
            
            <div className="flex flex-wrap gap-3 mb-4">
              <div className="px-3 py-1.5 bg-purple-900/30 border border-purple-500/30 rounded-full text-sm text-purple-300 flex items-center">
                <Flame className="w-4 h-4 mr-1.5" /> Token Burns
              </div>
              <div className="px-3 py-1.5 bg-blue-900/30 border border-blue-500/30 rounded-full text-sm text-blue-300 flex items-center">
                Lower Fees
              </div>
              <div className="px-3 py-1.5 bg-indigo-900/30 border border-indigo-500/30 rounded-full text-sm text-indigo-300 flex items-center">
                Solana Network
              </div>
            </div>
            
            <div className="flex items-center bg-gray-800/70 rounded-lg p-2 mt-2 border border-purple-500/30 max-w-md">
              <span className="text-gray-300 text-xs sm:text-sm mr-2">Contract:</span>
              <code className="text-purple-300 text-xs bg-gray-900/50 px-2 py-1 rounded-md overflow-hidden text-ellipsis whitespace-nowrap flex-1">
                FLsQ58bYWabZKZsHWF1tZ2WYdcZ2gMFBtPjCB2HvLxb8
              </code>
              <button 
                onClick={copyContractAddress}
                className="ml-2 p-1.5 rounded-md hover:bg-gray-700/50 transition-colors relative"
                aria-label="Copy contract address"
              >
                {copied ? 
                  <CheckCircle className="w-4 h-4 text-green-400" /> : 
                  <Copy className="w-4 h-4 text-gray-400" />
                }
                {copied && (
                  <span className="absolute -bottom-8 left-1/2 transform -translate-x-1/2 bg-gray-900 text-white text-xs px-2 py-1 rounded-md whitespace-nowrap">
                    Copied!
                  </span>
                )}
              </button>
            </div>
          </div>
          
          {/* Right column - Token visual */}
          <div className="bg-gradient-to-br from-purple-900/40 to-blue-900/40 flex items-center justify-center p-6 relative overflow-hidden">
            <div className="absolute inset-0 opacity-30">
              <div className="absolute top-0 left-0 w-full h-full bg-grid-pattern"></div>
            </div>
            
            <div className="relative">
              <div className="w-28 h-28 rounded-full bg-gradient-to-r from-purple-600 to-blue-600 flex items-center justify-center shadow-xl shadow-purple-500/20 ring-4 ring-purple-500/20 ring-offset-2 ring-offset-gray-900/80">
                <span className="text-white font-bold text-lg">CODON</span>
              </div>
              
              {/* Animated particles */}
              <div className="absolute top-0 left-0 w-full h-full">
                <motion.div
                  className="w-2 h-2 rounded-full bg-purple-400 absolute"
                  initial={{ top: '10%', left: '10%' }}
                  animate={{ 
                    top: ['10%', '80%', '10%'],
                    left: ['10%', '60%', '10%'],
                    opacity: [0.8, 0.5, 0.8]
                  }}
                  transition={{ duration: 8, repeat: Infinity, ease: "easeInOut" }}
                />
                <motion.div
                  className="w-3 h-3 rounded-full bg-blue-400 absolute"
                  initial={{ top: '80%', left: '30%' }}
                  animate={{ 
                    top: ['80%', '20%', '80%'],
                    left: ['30%', '80%', '30%'],
                    opacity: [0.7, 0.4, 0.7]
                  }}
                  transition={{ duration: 7, repeat: Infinity, ease: "easeInOut" }}
                />
                <motion.div
                  className="w-1.5 h-1.5 rounded-full bg-purple-300 absolute"
                  initial={{ top: '40%', left: '85%' }}
                  animate={{ 
                    top: ['40%', '70%', '40%'],
                    left: ['85%', '20%', '85%'],
                    opacity: [0.6, 0.3, 0.6]
                  }}
                  transition={{ duration: 9, repeat: Infinity, ease: "easeInOut" }}
                />
              </div>
            </div>
            
            {/* View on Explorer button */}
            <a 
              href="https://solscan.io/token/FLsQ58bYWabZKZsHWF1tZ2WYdcZ2gMFBtPjCB2HvLxb8" 
              target="_blank"
              rel="noopener noreferrer"
              className="absolute bottom-4 right-4 flex items-center text-xs text-purple-300 hover:text-purple-200 transition-colors"
            >
              View on Solscan <ArrowUpRight className="w-3 h-3 ml-1" />
            </a>
          </div>
        </div>
      </div>
    </motion.div>
  )
}

// Add a CSS style to component
const styles = `
  .bg-grid-pattern {
    background-image: 
      linear-gradient(to right, rgba(255,255,255,0.05) 1px, transparent 1px),
      linear-gradient(to bottom, rgba(255,255,255,0.05) 1px, transparent 1px);
    background-size: 20px 20px;
  }
`
