'use client'

import React, { useState } from 'react'
import { motion } from 'framer-motion'
import { Check, Zap, ArrowRight, HelpCircle } from 'lucide-react'

interface Feature {
  id: string;
  name: string;
  tooltip?: string;
  fiat: boolean;
  codon: boolean;
}

interface FeatureComparisonProps {
  paymentMethod: 'fiat' | 'codon';
  setPaymentMethod: (method: 'fiat' | 'codon') => void;
}

export default function FeatureComparison({ paymentMethod, setPaymentMethod }: FeatureComparisonProps) {
  const [activeTooltip, setActiveTooltip] = useState<string | null>(null);

  // Define features for comparison
  const features: Feature[] = [
    { id: 'credits', name: 'Standard Credits', fiat: true, codon: true },
    { id: 'ai-models', name: 'All AI Models', fiat: true, codon: true },
    { id: 'transaction-fees', name: 'Lower Transaction Fees', tooltip: 'CODON transactions have reduced processing fees compared to credit card payments', fiat: false, codon: true },
    { id: 'token-burns', name: 'Token Burns', tooltip: 'A portion of CODON tokens are burned with each transaction, potentially increasing token value over time', fiat: false, codon: true },
    { id: 'bulk-discount', name: 'Bulk Discounts', fiat: true, codon: true },
    { id: 'ecosystem', name: 'Support Token Ecosystem', tooltip: 'CODON payments help support the growth of the platform ecosystem', fiat: false, codon: true }
  ];

  const handleTooltip = (id: string | null) => {
    setActiveTooltip(id);
  };

  return (
    <div className="max-w-4xl mx-auto mt-8 mb-12 px-4 sm:px-6">
      <h3 className="text-xl font-bold text-white mb-6 text-center">Payment Method Comparison</h3>
      
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="overflow-hidden rounded-xl border border-gray-700 shadow-lg relative"
      >
        <div className="grid grid-cols-3">
          {/* Feature names column */}
          <div className="bg-gray-800/40 border-r border-gray-700 py-4">
            <div className="h-16 flex items-center px-4 sm:px-6 border-b border-gray-700">
              <span className="text-white font-medium">Features</span>
            </div>
            
            {features.map((feature) => (
              <div key={feature.id} className="py-3 px-4 sm:px-6 border-b border-gray-700/50 flex items-center relative">
                <span className="text-gray-300 text-sm">{feature.name}</span>
                
                {feature.tooltip && (
                  <div className="relative ml-1.5">
                    <HelpCircle 
                      className="w-4 h-4 text-gray-500 hover:text-gray-300 cursor-pointer" 
                      onMouseEnter={() => handleTooltip(feature.id)}
                      onMouseLeave={() => handleTooltip(null)}
                    />
                    
                    {activeTooltip === feature.id && (
                      <div className="absolute bottom-full left-0 mb-2 w-48 sm:w-64 bg-gray-900 text-gray-300 text-xs p-2 rounded-md shadow-lg z-10">
                        {feature.tooltip}
                      </div>
                    )}
                  </div>
                )}
              </div>
            ))}
          </div>
          
          {/* $ USD/INR column */}
          <div 
            className={`py-4 ${paymentMethod === 'fiat' ? 'bg-blue-900/20' : 'bg-gray-800/30'} cursor-pointer transition-colors`}
            onClick={() => setPaymentMethod('fiat')}
          >
            <div className="h-16 flex flex-col items-center justify-center px-4 border-b border-gray-700">
              <div className={`w-12 h-12 rounded-full ${paymentMethod === 'fiat' ? 'bg-blue-700/70' : 'bg-gray-700'} flex items-center justify-center mb-1`}>
                <span className="text-xl font-bold text-white">$</span>
              </div>
              <span className="text-sm text-gray-300">USD/INR</span>
            </div>
            
            {features.map((feature) => (
              <div key={`fiat-${feature.id}`} className={`h-[46px] py-3 px-4 border-b border-gray-700/50 flex items-center justify-center ${paymentMethod === 'fiat' ? 'bg-blue-900/10' : ''}`}>
                {feature.fiat ? (
                  <Check className="w-5 h-5 text-blue-400" />
                ) : (
                  <div className="w-5 h-0.5 bg-gray-700 rounded-full"></div>
                )}
              </div>
            ))}
          </div>
          
          {/* CODON column */}
          <div 
            className={`py-4 ${paymentMethod === 'codon' ? 'bg-purple-900/20' : 'bg-gray-800/30'} cursor-pointer transition-colors`}
            onClick={() => setPaymentMethod('codon')}
          >
            <div className="h-16 flex flex-col items-center justify-center px-4 border-b border-gray-700">
              <div className={`w-12 h-12 rounded-full ${paymentMethod === 'codon' ? 'bg-purple-700/70' : 'bg-gray-700'} flex items-center justify-center mb-1`}>
                <span className="text-xl font-bold text-white">₡</span>
              </div>
              <span className="text-sm text-gray-300">CODON</span>
            </div>
            
            {features.map((feature) => (
              <div key={`codon-${feature.id}`} className={`h-[46px] py-3 px-4 border-b border-gray-700/50 flex items-center justify-center ${paymentMethod === 'codon' ? 'bg-purple-900/10' : ''}`}>
                {feature.codon ? (
                  <Check className="w-5 h-5 text-purple-400" />
                ) : (
                  <div className="w-5 h-0.5 bg-gray-700 rounded-full"></div>
                )}
              </div>
            ))}
          </div>
        </div>
        
        {/* Button row */}
        <div className="grid grid-cols-3">
          <div className="bg-gray-800/40 border-r border-gray-700 p-4">
            <span className="text-white font-medium">Select</span>
          </div>
          
          <div className={`p-4 flex items-center justify-center ${paymentMethod === 'fiat' ? 'bg-blue-900/20' : 'bg-gray-800/30'}`}>
            <button
              onClick={() => setPaymentMethod('fiat')}
              className={`py-2 px-3 text-xs sm:text-sm rounded-md transition-all flex items-center ${
                paymentMethod === 'fiat' 
                  ? 'bg-blue-600 text-white' 
                  : 'bg-gray-700 text-gray-300 hover:bg-gray-600'
              }`}
            >
              Select USD/INR
              <ArrowRight className="w-3 h-3 ml-1" />
            </button>
          </div>
          
          <div className={`p-4 flex items-center justify-center ${paymentMethod === 'codon' ? 'bg-purple-900/20' : 'bg-gray-800/30'}`}>
            <button
              onClick={() => setPaymentMethod('codon')}
              className={`py-2 px-3 text-xs sm:text-sm rounded-md transition-all flex items-center ${
                paymentMethod === 'codon' 
                  ? 'bg-gradient-to-r from-purple-600 to-blue-600 text-white' 
                  : 'bg-gray-700 text-gray-300 hover:bg-gray-600'
              }`}
            >
              Select CODON
              <ArrowRight className="w-3 h-3 ml-1" />
            </button>
          </div>
        </div>
        
        {/* Highlight indicator */}
        <div className="absolute top-0 bottom-0 transition-all duration-300"
          style={{ 
            left: paymentMethod === 'fiat' ? '33.333%' : '66.666%',
            width: '33.333%',
            backgroundColor: 'rgba(255, 255, 255, 0.03)',
            pointerEvents: 'none'
          }}
        >
          <div className="absolute top-0 right-0 bottom-0 left-0 border-2 border-opacity-50"
            style={{
              borderColor: paymentMethod === 'fiat' ? '#3b82f6' : '#a855f7'
            }}
          />
        </div>
      </motion.div>
    </div>
  )
}
