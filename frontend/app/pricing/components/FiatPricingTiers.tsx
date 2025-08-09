'use client'

import { useState } from 'react'
import { motion } from 'framer-motion'
import { Check, Zap, Clock, BarChart3, Cpu, ArrowRight } from 'lucide-react'
import { ExtendedPlanObject } from '../../pricing/types'

interface FiatPricingTiersProps {
  plans: ExtendedPlanObject[];
  loading: boolean;
  error: Error | string | null;
  selectedCurrency: string;
  formatCurrency: (amount: number) => string;
  formatPrice: (plan: ExtendedPlanObject) => string;
  updateCreditQuantity: (planIndex: number, quantity: number) => void;
  handleSelectPlan: (plan: ExtendedPlanObject, index: number) => Promise<void>;
}

export default function FiatPricingTiers({
  plans,
  loading,
  error,
  selectedCurrency,
  formatCurrency,
  formatPrice,
  updateCreditQuantity,
  handleSelectPlan
}: FiatPricingTiersProps) {
  // Card animation variants
  const cardVariants = {
    initial: { opacity: 0, y: 20 },
    animate: { opacity: 1, y: 0, transition: { duration: 0.5 } }
  };
  
  // Loading state
  if (loading) {
    return (
      <div className="flex justify-center py-12">
        <div className="animate-pulse flex flex-col items-center">
          <div className="w-12 h-12 border-4 border-blue-500 border-t-transparent rounded-full animate-spin mb-4"></div>
          <p className="text-gray-400">Loading pricing plans ({selectedCurrency})...</p>
        </div>
      </div>
    );
  }

  // Error state
  if (error) {
    return (
      <div className="max-w-md mx-auto bg-red-900/20 border border-red-500/50 rounded-lg p-6 text-center">
        <p className="text-red-400 mb-4">Failed to load pricing plans</p>
        <p className="text-sm text-gray-300">{error as string}</p>
      </div>
    );
  }

  // No plan state
  if (!plans.length) {
    return (
      <div className="max-w-md mx-auto text-center py-10">
        <p className="text-gray-400">No pricing plans available for {selectedCurrency} at the moment.</p>
      </div>
    );
  }

  // Find the base plan - this is the main PAYG plan from the API
  const basePlan = plans.length > 0 ? plans[0] : null;
  
  if (!basePlan) return null;
  
  // Calculate prices in correct currency
  const basePrice = basePlan.amount / 100; // Convert from cents to dollars/rupees
  
  const calculateTotalPrice = (quantity: number) => {
    // Apply the appropriate discount based on quantity
    let discountPercentage = 0;
    if (quantity >= 50) discountPercentage = 15;
    else if (quantity >= 20) discountPercentage = 10;
    else if (quantity >= 5) discountPercentage = 5;
    
    const pricePerCredit = basePrice * (1 - discountPercentage / 100);
    return pricePerCredit * quantity;
  };
  
  return (
    <div className="max-w-2xl mx-auto">
      {/* Simplified single card */}
      <motion.div
        className="rounded-xl border border-blue-500/50 backdrop-blur-sm bg-gradient-to-b from-blue-900/30 to-indigo-900/30 overflow-hidden"
        variants={cardVariants}
        initial="initial"
        animate="animate"
      >
        <div className="p-6">
          <h3 className="text-xl font-bold text-white mb-6 flex items-center">
            <div className="w-10 h-10 rounded-full bg-gradient-to-br from-blue-500/30 to-indigo-500/20 flex items-center justify-center mr-3">
              <Zap className="w-5 h-5 text-blue-400" />
            </div>
            CodEase Credits
          </h3>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Left column: Credit selection */}
            <div className="space-y-5">
              <div>
                <label className="block text-gray-300 mb-2">Select number of credits:</label>
                <select
                  className="w-full bg-gray-800 border border-gray-700 rounded-lg p-2.5 text-white focus:border-blue-500 focus:ring focus:ring-blue-500/20 focus:outline-none"
                  onChange={(e) => {
                    const qty = parseInt(e.target.value, 10);
                    if (basePlan) {
                      updateCreditQuantity(0, qty);
                    }
                  }}
                  value={basePlan.selectedQuantity || 1}
                >
                  {[1, 2, 3, 4, 5, 10, 20, 30, 50, 100].map(num => (
                    <option key={num} value={num}>{num} credit{num > 1 ? 's' : ''}</option>
                  ))}
                </select>
                
                {/* Discount notice */}
                {(basePlan.selectedQuantity || 1) >= 5 && (
                  <div className="mt-2 rounded-md bg-blue-900/30 border border-blue-500/30 px-3 py-1.5 text-sm text-center">
                    <span className="text-blue-300">
                      {(basePlan.selectedQuantity || 1) >= 50 ? "15% bulk discount applied!" : 
                       (basePlan.selectedQuantity || 1) >= 20 ? "10% bulk discount applied!" : 
                       "5% bulk discount applied!"}
                    </span>
                  </div>
                )}
              </div>
              
              <div className="flex items-baseline">
                <span className="text-3xl font-bold text-white">
                  {formatCurrency(calculateTotalPrice(basePlan.selectedQuantity || 1) * 100)}
                </span>
              </div>
              
              <div className="bg-gray-800/50 rounded-lg p-3 space-y-1.5 text-sm">
                <div className="flex justify-between">
                  <span className="text-gray-400">Currency:</span>
                  <span className="text-white">{selectedCurrency}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-400">Price per credit:</span>
                  <span className="text-white font-medium">
                    {formatCurrency(basePrice * 100 * (1 - ((basePlan.selectedQuantity || 1) >= 50 ? 0.15 : 
                          (basePlan.selectedQuantity || 1) >= 20 ? 0.10 : 
                          (basePlan.selectedQuantity || 1) >= 5 ? 0.05 : 0)))}
                  </span>
                </div>
              </div>
            </div>
            
            {/* Right column: Transaction details */}
            <div className="space-y-5">
              {/* Transaction breakdown */}
              <div className="bg-blue-900/20 border border-blue-500/20 rounded-lg p-4 text-sm">
                <h4 className="text-white font-medium mb-3">Pricing Breakdown</h4>
                <div className="space-y-2">
                  <div className="flex justify-between">
                    <span className="text-blue-200">Base Price:</span>
                    <span className="text-white">{formatCurrency(basePrice * (basePlan.selectedQuantity || 1) * 100)}</span>
                  </div>
                  
                  {(basePlan.selectedQuantity || 1) >= 5 && (
                    <div className="flex justify-between">
                      <span className="text-blue-200">
                        Discount ({(basePlan.selectedQuantity || 1) >= 50 ? '15%' : 
                                  (basePlan.selectedQuantity || 1) >= 20 ? '10%' : '5%'}):
                      </span>
                      <span className="text-green-400">
                        -{formatCurrency(basePrice * (basePlan.selectedQuantity || 1) * 
                          ((basePlan.selectedQuantity || 1) >= 50 ? 0.15 : 
                          (basePlan.selectedQuantity || 1) >= 20 ? 0.10 : 0.05) * 100)}
                      </span>
                    </div>
                  )}
                  
                  <div className="flex justify-between pt-1 border-t border-gray-700">
                    <span className="text-blue-100 font-medium">Total:</span>
                    <span className="text-white font-medium">
                      {formatCurrency(calculateTotalPrice(basePlan.selectedQuantity || 1) * 100)}
                    </span>
                  </div>
                </div>
              </div>
              
              <ul className="space-y-2 text-sm">
                <li className="flex items-start">
                  <Check className="w-4 h-4 mr-2 mt-0.5 flex-shrink-0 text-blue-400" />
                  <span className="text-gray-300">Access to all AI models</span>
                </li>
                <li className="flex items-start">
                  <Check className="w-4 h-4 mr-2 mt-0.5 flex-shrink-0 text-blue-400" />
                  <span className="text-gray-300">Code completion & refactoring</span>
                </li>
                <li className="flex items-start">
                  <Check className="w-4 h-4 mr-2 mt-0.5 flex-shrink-0 text-blue-400" />
                  <span className="text-gray-300">Advanced debugging assistance</span>
                </li>
                <li className="flex items-start">
                  <Check className="w-4 h-4 mr-2 mt-0.5 flex-shrink-0 text-blue-400" />
                  <span className="text-gray-300">Technical support</span>
                </li>
              </ul>
              
              <button
                onClick={() => {
                  if (basePlan) {
                    handleSelectPlan(basePlan, 0);
                  }
                }}
                className="w-full py-3 px-4 rounded-lg font-medium bg-gradient-to-r from-blue-600 to-indigo-600 text-white hover:shadow-lg hover:shadow-blue-500/20 transition-all flex items-center justify-center"
              >
                Purchase Credits
                <ArrowRight className="w-4 h-4 ml-2" />
              </button>
            </div>
          </div>
        </div>
      </motion.div>
    </div>
  );
}
