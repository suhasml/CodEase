'use client'

import { motion } from 'framer-motion'
import { Check, ArrowRight, Sparkles } from 'lucide-react'
import { PlanObject, ExtendedPlanObject } from '../../pricing/types'

interface PricingCardProps {
  plan: ExtendedPlanObject;
  index: number;
  selectedPlan: number | null;
  setSelectedPlan: (index: number) => void;
  updateCreditQuantity: (planIndex: number, quantity: number) => void;
  handleSelectPlan: (plan: ExtendedPlanObject, index: number) => Promise<void>;
  formatPrice: (plan: PlanObject) => string;
  formatCurrency: (amount: number) => string;
}

export default function PricingCard({
  plan,
  index,
  selectedPlan,
  setSelectedPlan,
  updateCreditQuantity,
  handleSelectPlan,
  formatPrice,
  formatCurrency
}: PricingCardProps) {
  // Calculate credit price for pay-as-you-go
  const isPAYG = plan.id === 'pay_as_you_go';
  const quantity = isPAYG ? (plan.selectedQuantity || 1) : 1;
  const isPro = plan.name === 'Pro';

  // Handle feature rendering with premium highlights
  const renderFeature = (feature: string, idx: number) => {
    // Check for debugging-related features to highlight in the Pro plan
    const isDebugFeature = feature.toLowerCase().includes('debug') ||
                          feature.toLowerCase().includes('error analytics') ||
                          feature.toLowerCase().includes('real-time');

    return (
      <li key={idx} className="flex items-start">
        <Check className={`w-5 h-5 mr-2 mt-0.5 flex-shrink-0 ${
          plan.highlighted ? "text-blue-400" : "text-green-500"
        }`} />
        <div className="text-gray-300">
          {feature}
          {isDebugFeature && isPro && (
            <span className="ml-2 inline-flex items-center px-1.5 py-0.5 text-xs bg-yellow-500/20 text-yellow-300 rounded-full">
              <Sparkles className="w-3 h-3 mr-1" />
              Premium
            </span>
          )}
        </div>
      </li>
    );
  };

  // Calculate discounts
  const getDiscount = (qty: number) => {
    return qty >= 50 ? 15 : qty >= 20 ? 10 : qty >= 5 ? 10 : 0;
  };

  const discount = getDiscount(quantity);
  const discountMultiplier = (100 - discount) / 100;
  const totalPrice = ((plan.amount * quantity) / 100 * discountMultiplier);
  
  // Animation variants
  const fadeIn = {
    initial: { opacity: 0, y: 20 },
    animate: { opacity: 1, y: 0, transition: { duration: 0.6 } }
  };

  return (
    <motion.div
      key={`${plan.id}-${plan.currency}-${index}`}
      variants={fadeIn}
      className={`rounded-2xl border backdrop-blur-sm transition-all duration-300 relative overflow-hidden flex flex-col ${
        selectedPlan === index
          ? "ring-2 ring-blue-500 sm:scale-105 shadow-xl shadow-blue-500/20"
          : "hover:-translate-y-1 hover:shadow-lg"
      } ${
        plan.highlighted
          ? "bg-gradient-to-b from-blue-900/30 to-purple-900/30 border-blue-500/50"
          : "bg-gray-800/40 border-gray-700 hover:border-blue-500/30"
      }`}
      // Only set selected plan on non-PAYG cards; PAYG selection happens via dropdown
      onClick={() => isPAYG ? null : setSelectedPlan(index)}
    >
      {plan.highlighted && (
        <div className="absolute top-0 left-0 right-0 bg-gradient-to-r from-blue-500 to-purple-500 text-white text-xs font-medium py-1 text-center">
          Most Popular
        </div>
      )}

      <div className={`p-5 sm:p-6 md:p-8 ${plan.highlighted ? "pt-8 sm:pt-10" : ""} flex-grow`}>
        <h3 className="text-xl sm:text-2xl font-bold mb-2 text-white">{plan.name}</h3>
        <p className="text-gray-400 mb-4 sm:mb-6 min-h-[2rem] sm:min-h-[3rem]">{plan.description}</p>

        {isPAYG ? (
          <>
            <div className="flex items-baseline mb-4 sm:mb-6">
              <span className="text-3xl sm:text-4xl font-bold text-white">
                {formatPrice(plan)}
              </span>
              <span className="text-gray-400 ml-1">
                /credit
              </span>
            </div>

            <div className="mb-4">
              <label className="block text-gray-300 mb-2 text-sm sm:text-base">Number of credits:</label>
              <select
                className="w-full bg-gray-800 border border-gray-700 rounded-lg p-2 text-white text-sm sm:text-base focus:border-blue-500 focus:ring focus:ring-blue-500/20 focus:outline-none"
                onChange={(e) => {
                  const qty = parseInt(e.target.value, 10);
                  updateCreditQuantity(index, qty);
                }}
                // Stop propagation to prevent card selection when changing quantity
                onClick={(e) => e.stopPropagation()}
                value={plan.selectedQuantity || 1}
              >
                {[1, 2, 3, 4, 5, 10, 20, 50, 100].map(num => (
                  <option key={num} value={num}>{num} credit{num > 1 ? 's' : ''}</option>
                ))}
              </select>
              {/* Discount logic - ensure it applies correctly */}
              {quantity >= 50 && (
                <div className="mt-2 text-xs sm:text-sm bg-green-500/10 text-green-400 px-2 sm:px-3 py-1 sm:py-1.5 rounded-md">
                  15% bulk discount applied
                </div>
              )}
              {quantity >= 5 && quantity < 50 && (
                <div className="mt-2 text-xs sm:text-sm bg-green-500/10 text-green-400 px-2 sm:px-3 py-1 sm:py-1.5 rounded-md">
                  10% bulk discount applied
                </div>
              )}
            </div>

            <div className="mb-4 sm:mb-6 border-t border-gray-700 pt-4">
              <div className="flex justify-between text-gray-400 text-xs sm:text-sm mb-2">
                <span>{quantity} credits × {formatCurrency(plan.amount)}</span>
                <span>{formatCurrency(plan.amount * quantity)}</span>
              </div>

              {quantity >= 5 && (
                <div className="flex justify-between text-green-400 text-xs sm:text-sm mb-2">
                  <span>Bulk discount ({discount}%)</span>
                  <span>-{formatCurrency(plan.amount * quantity * discount / 100)}</span>
                </div>
              )}

              <div className="flex justify-between text-white font-medium text-base sm:text-lg">
                <span>Total:</span>
                <span>
                  {formatCurrency(totalPrice * 100)}
                </span>
              </div>
            </div>
          </>
        ) : (
          <>
            <div className="flex items-baseline mb-4 sm:mb-6">
              <span className="text-3xl sm:text-4xl font-bold text-white">
                {formatPrice(plan)}
              </span>
              <span className="text-gray-400 ml-1">
                /month
              </span>
            </div>

            {plan.credits && (
              <div className="mb-4 sm:mb-6 text-sm text-gray-300">
                Includes {plan.credits} credits per month
              </div>
            )}
          </>
        )}

        <ul className="space-y-2 sm:space-y-3 mb-6 sm:mb-8 text-sm sm:text-base">
          {plan.features && plan.features.map(renderFeature)}
        </ul>

        {/* Pro plan special highlight */}
        {isPro && (
          <div className="mb-4 sm:mb-6 px-3 sm:px-4 py-2 sm:py-3 bg-blue-900/20 border border-blue-600/30 rounded-lg">
            <p className="text-blue-300 text-xs sm:text-sm">
              Includes advanced debugging tools and real-time error analytics
            </p>
          </div>
        )}
      </div>
      <div className="p-5 sm:p-6 md:p-8 pt-0">
        <button
          onClick={(e) => {
            e.stopPropagation(); // Prevent card click if button is clicked
            handleSelectPlan(plan, index);
          }}
          className={`w-full py-2.5 sm:py-3 px-4 rounded-lg font-medium transition-all flex items-center justify-center text-sm sm:text-base ${
            selectedPlan === index
              ? "bg-gradient-to-r from-blue-400 to-purple-400 text-white shadow-lg shadow-blue-500/20"
              : plan.highlighted
                ? "bg-gradient-to-r from-blue-500 to-purple-500 text-white hover:shadow-lg hover:shadow-blue-500/20"
                : "bg-gray-700 text-white hover:bg-gray-600"
          }`}
        >
          {plan.cta}
          <ArrowRight className="w-3.5 h-3.5 sm:w-4 sm:h-4 ml-1 sm:ml-2" />
        </button>
      </div>
    </motion.div>
  )
}
