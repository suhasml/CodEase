'use client'

import { useState } from 'react'
import { motion } from 'framer-motion'
import { Check, Sparkles, TrendingUp, Shield, Zap, Flame, ArrowRight } from 'lucide-react'

// Define interfaces for CODON pricing data (Fixed Rate System)
interface CODONPricingResponse {
  success: boolean;
  credits: number;
  total_codon_amount: number;
  platform_amount: number;
  burn_amount: number;
  codon_per_credit: number;
  original_codon_per_credit: number;
  platform_percentage: number;
  burn_percentage: number;
  discount_applied: boolean;
  discount_percentage: number;
  savings: number;
  price_source: string;
}

interface CodonPricingCardsProps {
  codonCredits: number;
  setCodonCredits: (credits: number) => void;
  codonPricingData: CODONPricingResponse | null;
  isLoadingCodonPricing: boolean;
  codonPricingError: string | null;
  fetchCodonPricing: (credits: number) => Promise<void>;
  handleCodonPurchase: () => void;
}

export default function CodonPricingCards({
  codonCredits,
  setCodonCredits,
  codonPricingData,
  isLoadingCodonPricing,
  codonPricingError,
  fetchCodonPricing,
  handleCodonPurchase
}: CodonPricingCardsProps) {
  // Card animation variants
  const cardVariants = {
    initial: { opacity: 0, y: 20 },
    animate: { opacity: 1, y: 0, transition: { duration: 0.5 } }
  };

  // Loading state
  if (isLoadingCodonPricing && !codonPricingData) {
    return (
      <div className="flex justify-center items-center min-h-[300px]">
        <div className="flex flex-col items-center">
          <div className="w-16 h-16 border-4 border-purple-500 border-t-transparent rounded-full animate-spin mb-4"></div>
          <p className="text-purple-300">Loading CODON pricing...</p>
        </div>
      </div>
    );
  }

  // Error state
  if (codonPricingError) {
    return (
      <div className="max-w-md mx-auto rounded-xl border border-red-500/50 backdrop-blur-sm bg-red-900/20 overflow-hidden p-6 text-center">
        <p className="text-red-300 mb-4">Failed to load CODON pricing</p>
        <p className="text-sm text-gray-300">{codonPricingError}</p>
        <button 
          onClick={() => fetchCodonPricing(codonCredits)}
          className="mt-4 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
        >
          Retry
        </button>
      </div>
    );
  }

  // Data available
  if (codonPricingData) {
    return (
      <div className="max-w-2xl mx-auto">
        {/* Simplified single card */}
        <motion.div
          className="rounded-xl border border-purple-500/50 backdrop-blur-sm bg-gradient-to-b from-purple-900/30 to-blue-900/30 overflow-hidden"
          variants={cardVariants}
          initial="initial"
          animate="animate"
        >
          <div className="p-6">
            <h3 className="text-xl font-bold text-white mb-6 flex items-center">
              <div className="w-10 h-10 rounded-full bg-gradient-to-br from-purple-500/30 to-blue-500/20 flex items-center justify-center mr-3">
                <Flame className="w-5 h-5 text-purple-400" />
              </div>
              CODON Credits - Fixed Rate
            </h3>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Left column: Credit selection */}
              <div className="space-y-5">
                <div>
                  <label className="block text-gray-300 mb-2">Number of credits:</label>
                  <select
                    className="w-full bg-gray-800 border border-gray-700 rounded-lg p-2.5 text-white focus:border-purple-500 focus:ring focus:ring-purple-500/20 focus:outline-none"
                    onChange={(e) => setCodonCredits(parseInt(e.target.value, 10))}
                    value={codonCredits}
                  >
                    {[1, 2, 3, 4, 5, 10, 20, 30, 50, 100].map(num => (
                      <option key={num} value={num}>{num} credit{num > 1 ? 's' : ''}</option>
                    ))}
                  </select>
                  
                  {/* Discount notice */}
                  {codonPricingData?.discount_applied && (
                    <div className="mt-2 rounded-md bg-green-900/30 border border-green-500/30 px-3 py-1.5 text-sm text-center">
                      <span className="text-green-300">
                        🎉 {codonPricingData.discount_percentage}% bulk discount applied! 
                        Save {codonPricingData.savings.toLocaleString()} CODON
                      </span>
                    </div>
                  )}
                </div>
                
                {/* Price Display */}
                <div className="flex items-baseline">
                  <span className="text-3xl font-bold text-white">
                    {codonPricingData.total_codon_amount.toLocaleString()}
                  </span>
                  <span className="text-gray-400 ml-2 text-sm">CODON</span>
                </div>
                
                {/* Show per-credit rate */}
                <div className="text-sm text-gray-300">
                  {codonPricingData.codon_per_credit.toLocaleString()} CODON per credit
                  {codonPricingData.discount_applied && (
                    <span className="text-gray-500 line-through ml-2">
                      {codonPricingData.original_codon_per_credit.toLocaleString()}
                    </span>
                  )}
                </div>
                
                <div className="bg-gray-800/50 rounded-lg p-3 space-y-1.5 text-sm">
                  <div className="flex justify-between">
                    <span className="text-gray-400">Credits:</span>
                    <span className="text-white">{codonPricingData.credits}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-400">Total CODON:</span>
                    <span className="text-white font-medium">{codonPricingData.total_codon_amount.toLocaleString()}</span>
                  </div>
                </div>
              </div>
              
              {/* Right column: Transaction details */}
              <div className="space-y-5">
                {/* Transaction breakdown */}
                <div className="bg-purple-900/20 border border-purple-500/20 rounded-lg p-4 text-sm">
                  <h4 className="text-white font-medium mb-3">Transaction Breakdown</h4>
                  <div className="space-y-2">
                    <div className="flex justify-between">
                      <span className="text-purple-200">
                        Platform Fee ({Math.round(codonPricingData.platform_percentage * 100)}%):
                      </span>
                      <span className="text-white">{codonPricingData.platform_amount.toLocaleString()}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-purple-200">
                        Burn Amount ({Math.round(codonPricingData.burn_percentage * 100)}%):
                      </span>
                      <span className="text-white">{codonPricingData.burn_amount.toLocaleString()}</span>
                    </div>
                  </div>
                </div>
                
                {/* Features */}
                <ul className="space-y-2 text-sm">
                  <li className="flex items-start">
                    <Check className="w-4 h-4 mr-2 mt-0.5 flex-shrink-0 text-purple-400" />
                    <span className="text-gray-300">Fixed rate pricing (no volatility)</span>
                  </li>
                  <li className="flex items-start">
                    <Check className="w-4 h-4 mr-2 mt-0.5 flex-shrink-0 text-purple-400" />
                    <span className="text-gray-300">Bulk discounts for 5+ credits</span>
                  </li>
                  <li className="flex items-start">
                    <Check className="w-4 h-4 mr-2 mt-0.5 flex-shrink-0 text-purple-400" />
                    <span className="text-gray-300">30% of tokens burned (deflationary)</span>
                  </li>
                  <li className="flex items-start">
                    <Check className="w-4 h-4 mr-2 mt-0.5 flex-shrink-0 text-purple-400" />
                    <span className="text-gray-300">Instant processing</span>
                  </li>
                </ul>
                
                <button
                  onClick={handleCodonPurchase}
                  className="w-full py-3 px-4 rounded-lg font-medium bg-gradient-to-r from-purple-600 to-blue-600 text-white hover:shadow-lg hover:shadow-purple-500/20 transition-all flex items-center justify-center"
                >
                  Purchase with CODON
                  <ArrowRight className="w-4 h-4 ml-2" />
                </button>
              </div>
            </div>
          </div>
        </motion.div>
      </div>
    );
  }
  
  // Fallback empty state
  return null;
}
