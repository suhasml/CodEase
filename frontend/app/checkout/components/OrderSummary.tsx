'use client'

import { motion } from 'framer-motion';
import { Check } from 'lucide-react';
import { OrderSummaryProps } from '../types';

export default function OrderSummary({ 
  plan, 
  creditPurchase, 
  isYearly, 
  displayCurrency,
  formatPrice,
  formatCreditPrice,
  devMode = false,
  devModeValues
}: OrderSummaryProps) {
  // Determine currency to use for display
  const currencyForDisplay = creditPurchase ? creditPurchase.currency || displayCurrency : (plan ? plan.currency : displayCurrency);

  return (
    <div className={`bg-gradient-to-b from-gray-800/40 to-gray-800/30 border ${
      devMode && creditPurchase?.paymentMethod === 'codon' ? 'border-amber-500/50 border-dashed' : 'border-gray-700'
    } rounded-xl p-4 sm:p-6 backdrop-blur-sm shadow-xl hover:border-blue-500/30 transition-colors duration-500`}>
      <h2 className="text-xl sm:text-2xl font-bold mb-4 text-white">
        Order Summary
        
        {/* Dev mode indicator for CODON payments */}
        {devMode && creditPurchase?.paymentMethod === 'codon' && (
          <span className="inline-block ml-2 text-xs font-normal bg-amber-500/20 text-amber-300 px-2 py-0.5 rounded-full">
            DEV MODE
          </span>
        )}
      </h2>

      {/* Plan name/description */}
      <div className="flex items-center justify-between mb-6">
        <div>
          {creditPurchase ? (
            <>
              <h3 className="font-bold text-lg text-white mb-1">
                {creditPurchase.paymentMethod === 'codon' ? 'CODON Credit Purchase' : 'Credit Purchase'}
              </h3>
              <p className="text-sm text-gray-400">
                {creditPurchase.paymentMethod === 'codon' 
                  ? `${creditPurchase.credits} credits for your account` 
                  : `${creditPurchase.quantity} credits for your account`}
              </p>
            </>
          ) : (
            <>
              <h3 className="font-bold text-lg text-white mb-1">{plan?.name} Plan</h3>
              <p className="text-sm text-gray-400">{plan?.description}</p>
            </>
          )}
        </div>
        
        {/* Plan badges */}
        {!creditPurchase && plan?.id === 'pay_as_you_go' && (
          <span className="bg-blue-500/20 text-blue-300 px-2 sm:px-3 py-0.5 sm:py-1 rounded-full text-xs sm:text-sm font-medium">
            Popular
          </span>
        )}
        {!creditPurchase && plan?.name === 'Pro' && (
          <span className="bg-purple-500/20 text-purple-300 px-2 sm:px-3 py-0.5 sm:py-1 rounded-full text-xs sm:text-sm font-medium">
            Advanced
          </span>
        )}
      </div>

      <div className="border-t border-gray-700 my-5 sm:my-6 pt-5 sm:pt-6">
        {creditPurchase ? (
          // Credit purchase summary
          <div className="space-y-3 mb-6 bg-gray-800/40 rounded-lg p-3 sm:p-4">
            {creditPurchase.paymentMethod === 'codon' ? (
              // CODON purchase summary
              <>
                {/* Credits */}
                <div className="flex justify-between">
                  <span className="text-sm sm:text-base text-gray-400">Credits</span>
                  <span className="text-sm sm:text-base text-white">{creditPurchase.credits}</span>
                </div>
                
                {/* Total CODON amount */}
                <div className="flex justify-between">
                  <span className="text-sm sm:text-base text-gray-400">Total CODON</span>
                  <span className="text-sm sm:text-base text-white">
                    {devMode && devModeValues ? devModeValues.total : creditPurchase.totalCodon?.toLocaleString()} CODON
                  </span>
                </div>
                
                {/* Platform fee */}
                <div className="flex justify-between">
                  <span className="text-sm sm:text-base text-gray-400">Platform Fee</span>
                  <span className="text-sm sm:text-base text-white">
                    {devMode && devModeValues ? devModeValues.platformFee : creditPurchase.platformAmount?.toLocaleString()} CODON
                  </span>
                </div>
                
                {/* Burn amount */}
                <div className="flex justify-between">
                  <span className="text-sm sm:text-base text-gray-400">Burn Amount</span>
                  <span className="text-sm sm:text-base text-white">
                    {devMode && devModeValues ? devModeValues.burn : creditPurchase.burnAmount?.toLocaleString()} CODON
                  </span>
                </div>
                
                {/* Savings (if discount applied) */}
                {creditPurchase.discountApplied && creditPurchase.savings && creditPurchase.savings > 0 && (
                  <div className="flex justify-between border-t border-gray-700 pt-3">
                    <span className="text-sm sm:text-base text-green-400">
                      Bulk Discount ({creditPurchase.discountPercentage}%)
                    </span>
                    <span className="text-sm sm:text-base text-green-400">
                      -{creditPurchase.savings.toLocaleString()} CODON saved
                    </span>
                  </div>
                )}

                {/* Final Total */}
                <div className="border-t border-gray-700 pt-3 sm:pt-4 flex justify-between items-center">
                  <span className="font-medium text-sm sm:text-base text-white">Final Total</span>
                  <div className="text-right">
                    <span className="text-xl sm:text-2xl font-bold text-white">
                      {devMode && devModeValues ? devModeValues.total : creditPurchase.totalCodon?.toLocaleString()} CODON
                    </span>
                  </div>
                </div>
              </>
            ) : (
              // Regular fiat credit purchase
              <>
                {/* Quantity */}
                <div className="flex justify-between">
                  <span className="text-sm sm:text-base text-gray-400">Quantity</span>
                  <span className="text-sm sm:text-base text-white">{creditPurchase.quantity} credits</span>
                </div>
                
                {/* Price per credit */}
                <div className="flex justify-between">
                  <span className="text-sm sm:text-base text-gray-400">Price per credit</span>
                  <span className="text-sm sm:text-base text-white">
                    {formatCreditPrice(Number(creditPurchase.unitPrice || 0), currencyForDisplay || 'USD')}
                  </span>
                </div>
                
                {/* Discount */}
                {creditPurchase.discount && creditPurchase.discount > 0 && (
                  <div className="flex justify-between">
                    <span className="text-sm sm:text-base text-green-400 flex items-center">
                      Bulk discount (%)
                    </span>
                    <span className="text-sm sm:text-base text-green-400">
                      -{creditPurchase.discount}%
                    </span>
                  </div>
                )}
                
                {/* Subtotal */}
                <div className="flex justify-between border-t border-gray-700 pt-3">
                  <span className="text-sm sm:text-base text-gray-400">Subtotal</span>
                  <span className="text-sm sm:text-base text-white">
                    {formatCreditPrice(Number(creditPurchase.totalPrice || '0'), currencyForDisplay || 'USD')}
                  </span>
                </div>
                
                {/* Tax */}
                <div className="flex justify-between">
                  <span className="text-sm sm:text-base text-gray-400 flex items-center">
                    Tax (18%)
                  </span>
                  <span className="text-sm sm:text-base text-gray-300">
                    {formatCreditPrice(Number(creditPurchase.totalPrice || '0') * 0.18, currencyForDisplay || 'USD')}
                  </span>
                </div>
                
                {/* Final Total */}
                <div className="border-t border-gray-700 pt-3 sm:pt-4 flex justify-between items-center">
                  <span className="font-medium text-sm sm:text-base text-white">Final Total</span>
                  <div className="text-right">
                    <span className="text-xl sm:text-2xl font-bold text-white">
                      {formatCreditPrice(Number(creditPurchase.totalPrice || '0') * 1.18, currencyForDisplay || 'USD')}
                    </span>
                  </div>
                </div>
              </>
            )}
          </div>
        ) : plan ? (
          // Subscription plan summary
          <>
            {/* Billing Cycle Toggle */}
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-6 gap-3 sm:gap-4">
              <span className="text-sm sm:text-base text-gray-300">Billing Cycle</span>
              <div className="flex items-center p-1 bg-gray-800/70 rounded-full cursor-pointer border border-gray-700 shadow-inner self-start sm:self-auto">
                <div
                  className={`relative px-3 sm:px-4 py-1 sm:py-1.5 rounded-full transition-all duration-300 flex items-center text-xs sm:text-sm ${
                    !isYearly ? 'bg-gradient-to-r from-blue-500 to-purple-500 text-white font-medium' : 'text-gray-400 hover:text-gray-300'
                  }`}
                >
                  Monthly
                </div>
                <div
                  className={`relative px-3 sm:px-4 py-1 sm:py-1.5 rounded-full transition-all duration-300 flex items-center text-xs sm:text-sm ${
                    isYearly ? 'bg-gradient-to-r from-blue-500 to-purple-500 text-white font-medium' : 'text-gray-400 hover:text-gray-300'
                  }`}
                >
                  Yearly <span className="ml-1 bg-green-500/20 text-green-400 text-[10px] px-1.5 py-0.5 rounded-full">-20%</span>
                </div>
              </div>
            </div>

            <div className="space-y-3 mb-6 bg-gray-800/40 rounded-lg p-3 sm:p-4">
              {/* Base Price */}
              <div className="flex justify-between">
                <span className="text-sm sm:text-base text-gray-400">Base price</span>
                <span className="text-sm sm:text-base text-white">
                  {formatPrice(plan.amount, plan.currency, false)} {isYearly ? '× 12' : ''}
                </span>
              </div>
              
              {/* Yearly Discount */}
              {isYearly && (
                <div className="flex justify-between">
                  <span className="text-sm sm:text-base text-green-400 flex items-center">
                    Yearly discount
                  </span>
                  <span className="text-sm sm:text-base text-green-400">
                    -20% ({formatPrice(plan.amount * 12 * 0.2, plan.currency, false)})
                  </span>
                </div>
              )}
              
              {/* Subtotal */}
              <div className="flex justify-between border-t border-gray-700 pt-3">
                <span className="text-sm sm:text-base text-gray-400">Subtotal</span>
                <span className="text-sm sm:text-base text-white">
                  {formatPrice(isYearly ? plan.amount * 12 * 0.8 : plan.amount, plan.currency, false)}
                </span>
              </div>
              
              {/* Tax */}
              <div className="flex justify-between">
                <span className="text-sm sm:text-base text-gray-400 flex items-center">
                  Tax (18%)
                </span>
                <span className="text-sm sm:text-base text-gray-300">
                  {formatPrice((isYearly ? plan.amount * 12 * 0.8 : plan.amount) * 0.18, plan.currency, false)}
                </span>
              </div>
            </div>
            
            {/* Final Total */}
            <div className="border-t border-gray-700 pt-3 sm:pt-4 flex justify-between items-center">
              <span className="font-medium text-sm sm:text-base text-white">Final Total</span>
              <div className="text-right">
                <span className="text-xl sm:text-2xl font-bold text-white">
                  {formatPrice((isYearly ? plan.amount * 12 * 0.8 : plan.amount) * 1.18, plan.currency, false)}
                </span>
                <span className="text-xs sm:text-sm text-gray-400 block sm:inline ml-0 sm:ml-1">
                  {isYearly ? '/year' : '/month'} <span className="whitespace-nowrap">(tax included)</span>
                </span>
              </div>
            </div>
          </>
        ) : null}
      </div>

      {/* Features list */}
      <div className="mt-5 sm:mt-6 space-y-3">
        <h4 className="font-medium text-sm sm:text-base text-white mb-2 sm:mb-3">
          {creditPurchase ? 'Benefits of purchasing credits:' : 'What you\'ll get:'}
        </h4>
        <div className="grid gap-2 sm:gap-2.5">
          {creditPurchase ? (
            // Credit purchase benefits
            creditPurchase.paymentMethod === 'codon' ? [
              "Fixed rate pricing - no market volatility",
              "Bulk discounts for 5+ credits (10% off)",
              "30% of tokens burned (deflationary)",
              "Credits never expire"
            ] : [
              "Use credits for advanced features and services",
              "Credits never expire",
              "Bulk discounts for larger purchases",
              "Top up your account at any time"
            ].map((feature, i) => (
              <motion.div
                key={i}
                className="flex items-start group"
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: i * 0.1, duration: 0.3 }}
              >
                <div className="mt-0.5 bg-green-500/10 rounded-full p-0.5 mr-2 group-hover:bg-green-500/20 transition-colors">
                  <Check className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-green-500 flex-shrink-0" />
                </div>
                <span className="text-sm sm:text-base text-gray-300 group-hover:text-gray-200 transition-colors">
                  {feature}
                </span>
              </motion.div>
            ))
          ) : plan ? (
            // Subscription plan features
            plan.features.map((feature, i) => (
              <motion.div
                key={i}
                className="flex items-start group"
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: i * 0.1, duration: 0.3 }}
              >
                <div className="mt-0.5 bg-green-500/10 rounded-full p-0.5 mr-2 group-hover:bg-green-500/20 transition-colors">
                  <Check className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-green-500 flex-shrink-0" />
                </div>
                <span className="text-sm sm:text-base text-gray-300 group-hover:text-gray-200 transition-colors">
                  {feature}
                </span>
              </motion.div>
            ))
          ) : null}
        </div>
      </div>
    </div>
  );
}
