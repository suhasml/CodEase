'use client'

import { motion } from 'framer-motion'
import PricingCard from './PricingCard'
import { PlanObject, ExtendedPlanObject } from '../../pricing/types'

interface PricingCardsProps {
  plans: ExtendedPlanObject[];
  loading: boolean;
  error: Error | string | null;
  selectedCurrency: string;
  selectedPlan: number | null;
  setSelectedPlan: (index: number) => void;
  updateCreditQuantity: (planIndex: number, quantity: number) => void;
  handleSelectPlan: (plan: ExtendedPlanObject, index: number) => Promise<void>;
  formatPrice: (plan: PlanObject) => string;
  formatCurrency: (amount: number) => string;
}

export default function PricingCards({
  plans,
  loading,
  error,
  selectedCurrency,
  selectedPlan,
  setSelectedPlan,
  updateCreditQuantity,
  handleSelectPlan,
  formatPrice,
  formatCurrency
}: PricingCardsProps) {
  // Staggered container animation
  const container = {
    animate: {
      transition: {
        staggerChildren: 0.1
      }
    }
  }

  if (loading) {
    return (
      <div className="max-w-6xl mx-auto flex justify-center py-10 sm:py-20">
        <div className="animate-pulse flex flex-col items-center">
          <div className="w-12 h-12 border-4 border-blue-500 border-t-transparent rounded-full animate-spin mb-4"></div>
          <p className="text-gray-400">Loading pricing plans ({selectedCurrency})...</p>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="max-w-md mx-auto bg-red-900/20 border border-red-500/50 rounded-lg p-6 text-center">
        <p className="text-red-400 mb-4">Failed to load pricing plans</p>
        <p className="text-sm text-gray-300">{error as string}</p>
      </div>
    )
  }

  if (plans.length === 0) {
    return (
      <div className="max-w-md mx-auto text-center py-10 sm:py-20">
        <p className="text-gray-400">No pricing plans available for {selectedCurrency} at the moment.</p>
      </div>
    )
  }  // For a single card, use a flex container instead of grid to properly center it
  if (plans.length === 1) {
    return (
      <motion.div 
        className="flex justify-center max-w-6xl mx-auto"
        variants={container}
        initial="initial"
        animate="animate"
      >
        <div className="w-full max-w-md"> {/* Limit width for better appearance */}
          <PricingCard
            key={`${plans[0].id}-0`}
            plan={plans[0]}
            index={0}
            selectedPlan={selectedPlan}
            setSelectedPlan={setSelectedPlan}
            updateCreditQuantity={updateCreditQuantity}
            handleSelectPlan={handleSelectPlan}
            formatPrice={formatPrice}
            formatCurrency={formatCurrency}
          />
        </div>
      </motion.div>
    );
  }
  
  // Otherwise use the grid layout for multiple cards
  return (
    <motion.div
      className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 sm:gap-8 max-w-6xl mx-auto"
      variants={container}
      initial="initial"
      animate="animate"
    >
      {plans.map((plan, index) => (
        <PricingCard
          key={`${plan.id}-${index}`}
          plan={plan}
          index={index}
          selectedPlan={selectedPlan}
          setSelectedPlan={setSelectedPlan}
          updateCreditQuantity={updateCreditQuantity}
          handleSelectPlan={handleSelectPlan}
          formatPrice={formatPrice}
          formatCurrency={formatCurrency}
        />
      ))}
    </motion.div>
  )
}
