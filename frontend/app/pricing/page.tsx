'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { motion } from 'framer-motion'
import { usePricingPlans } from '@/components/LandingPage/hooks/usePricingPlans'
import Header from '@/components/Header/header'
import Footer from '@/components/Footer/footer'
import PlanSelectionModal from '@/components/Modal/PlanSelectionModal'
import ContactModal from '@/components/Modal/ContactModal'
import { getStoredToken } from '@/lib/auth-utils'
import { authenticatedFetch } from '@/lib/api-utils'
import { getUserFromCookie } from '@/lib/cookie-utils'
import { Coins, Check, Copy, CheckCircle, Flame } from 'lucide-react'

// Import types
import { ExtendedPlanObject, PlanObject, User } from './types'
import { faqs } from './data'

// Import components
import PricingHero from './components/PricingHero'
import PricingCards from './components/PricingCards'
import EnterpriseCta from './components/EnterpriseCta'
import FaqSection from './components/FaqSection'
import BackgroundEffects from './components/BackgroundEffects'
import FiatPricingTiers from './components/FiatPricingTiers'
import CodonPricingCards from './components/CodonPricingCards'
import TokenBanner from './components/TokenBanner'

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

// Add grid pattern styles
const gridPatternStyle = `
  .bg-grid-pattern {
    background-image: 
      linear-gradient(to right, rgba(255,255,255,0.05) 1px, transparent 1px),
      linear-gradient(to bottom, rgba(255,255,255,0.05) 1px, transparent 1px);
    background-size: 20px 20px;
  }
`

export default function PricingPage() {
  const router = useRouter()
  const [selectedPlan, setSelectedPlan] = useState<number | null>(null)
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(false)
  const [showPlanModal, setShowPlanModal] = useState<boolean>(false)
  const [currentPlanDetails, setCurrentPlanDetails] = useState<{
    currentPlan: string;
    selectedPlan: string;
  } | null>(null)
  const [showContactModal, setShowContactModal] = useState<boolean>(false)
  const [isLoadingCheckout, setIsLoadingCheckout] = useState<boolean>(false)

  // State for currency selection
  const [selectedCurrency, setSelectedCurrency] = useState<string>('USD')
  
  // State for payment method selection ($ or CODON)
  const [paymentMethod, setPaymentMethod] = useState<'fiat' | 'codon'>('codon')
  
  // State for CODON pricing
  const [codonCredits, setCodonCredits] = useState<number>(1)
  const [codonPricingData, setCodonPricingData] = useState<CODONPricingResponse | null>(null)
  const [copied, setCopied] = useState<boolean>(false)
  const [isLoadingCodonPricing, setIsLoadingCodonPricing] = useState<boolean>(false)
  const [codonPricingError, setCodonPricingError] = useState<string | null>(null)

  // Detect user location preference (simple check based on language)
  useEffect(() => {
    const userLang = navigator.language
    if (userLang.startsWith('en-IN')) {
      setSelectedCurrency('INR')
    }
    // Keep USD as default otherwise
  }, [])
  
  // Fetch CODON pricing data when tab changes or credit quantity changes
  useEffect(() => {
    // Only fetch when the CODON payment method is selected
    if (paymentMethod === 'codon') {
      fetchCodonPricing(codonCredits)
    }
  }, [paymentMethod, codonCredits])
  
  // Function to copy contract address to clipboard
  const copyContractAddress = () => {
    const contractAddress = "FLsQ58bYWabZKZsHWF1tZ2WYdcZ2gMFBtPjCB2HvLxb8" // Replace with actual CODON contract address
    navigator.clipboard.writeText(contractAddress)
      .then(() => {
        setCopied(true)
        setTimeout(() => setCopied(false), 2000)
      })      .catch(err => {
        // Handle copy failure gracefully without console error
      })
  }

  // Function to fetch CODON pricing data (Fixed Rate System)
  const fetchCodonPricing = async (credits: number) => {
    try {
      setIsLoadingCodonPricing(true)
      setCodonPricingError(null)
      
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/payments/codon/pricing`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ credits })
      })
      
      if (!response.ok) {
        throw new Error(`Failed to fetch CODON pricing: ${response.statusText}`)
      }
      
      const data = await response.json()
      
      if (data.success) {
        setCodonPricingData(data)
      } else {
        throw new Error(data.detail || 'Failed to fetch CODON pricing')
      }    } catch (error) {
      setCodonPricingError(error instanceof Error ? error.message : 'An unknown error occurred')
    } finally {
      setIsLoadingCodonPricing(false)
    }
  }

  // Use the pricing plans hook with selected currency
  const { plans: apiPlans = [], loading, error, currency: fetchedCurrency } = usePricingPlans(selectedCurrency)

  // Maintain an extended version of plans with UI state
  const [plans, setPlans] = useState<ExtendedPlanObject[]>([])

  // When API plans change (due to data fetch or currency change), filter them based on payment method
  useEffect(() => {
    if (apiPlans && apiPlans.length > 0) {
      const filteredPlans: ExtendedPlanObject[] = []

      apiPlans.forEach(plan => {
        // Create extended plan with the correct highlighted property
        const extendedPlan = {
          ...plan,
          selectedQuantity: 1,
          currency: fetchedCurrency,
          // Override highlighted property to make Pay As You Go the highlighted one
          highlighted: plan.id === 'pay_as_you_go' ? true : false
        }

        // For 'fiat' payment method, only include pay-as-you-go (credit purchase) plans
        // For 'codon' payment method, this will be handled separately later
        if (paymentMethod === 'fiat' && plan.id === 'pay_as_you_go') {
          filteredPlans.push(extendedPlan)
        }
      })

      // Set filtered plans
      setPlans(filteredPlans)
    } else {
      // Clear plans if API returns empty or on error
      setPlans([])
    }
  }, [apiPlans, fetchedCurrency, paymentMethod])

  // Check if user is authenticated on component mount
  useEffect(() => {
    const userData = getUserFromCookie()
    if (userData) {
      setIsAuthenticated(true)
    }
  }, [])

  // Format price using the currency from the plan object
  const formatPrice = (plan: PlanObject): string => {
    if (typeof plan.amount === 'number') {
      // Use the currency provided in the plan data
      const currencyCode = plan.currency || 'USD' // Fallback to USD
      const locale = currencyCode === 'INR' ? 'en-IN' : 'en-US' // Basic locale mapping

      return new Intl.NumberFormat(locale, {
        style: 'currency',
        currency: currencyCode,
        minimumFractionDigits: 0, // Keep as 0 for main price display
        maximumFractionDigits: 0,
      }).format(plan.amount / 100) // Assuming amount is in cents/paise
    }

    return "Price not available"
  }

  // Format currency for the pricing breakdown, using the selected currency state
  const formatCurrency = (amount: number): string => {
    const currencyCode = selectedCurrency || 'USD' // Use state currency
    const locale = currencyCode === 'INR' ? 'en-IN' : 'en-US'

    return new Intl.NumberFormat(locale, {
      style: 'currency',
      currency: currencyCode,
      minimumFractionDigits: 2, // Show cents/paise in breakdown
      maximumFractionDigits: 2,
    }).format(amount / 100) // Assuming amount is in cents/paise
  }

  // Update the quantity for a credit plan
  const updateCreditQuantity = (planIndex: number, quantity: number): void => {
    setPlans(currentPlans => {
      const updatedPlans = [...currentPlans]
      if (updatedPlans[planIndex]) { // Check if plan exists at index
        updatedPlans[planIndex] = {
          ...updatedPlans[planIndex],
          selectedQuantity: quantity
        }
      }
      return updatedPlans
    })

    // Also update the selected plan for UI highlighting
    setSelectedPlan(planIndex)
  }
  const handleSelectPlan = async (plan: ExtendedPlanObject, index: number): Promise<void> => {
    // Set selected plan in state for UI feedback
    setSelectedPlan(index)
    // Show loading state
    setIsLoadingCheckout(true)

    // Clear any existing purchase data (both fiat and CODON)
    sessionStorage.removeItem('creditPurchase')
    sessionStorage.removeItem('codonPurchase')
    sessionStorage.removeItem('isChangingPlan')

    // Store the new plan ID and the currency it was selected with
    sessionStorage.setItem('selectedPlanId', plan.id)
    sessionStorage.setItem('selectedCurrency', plan.currency)

    if (!isAuthenticated) {
      // Store plan details before redirecting to login
      const isPAYG = plan.id === 'pay_as_you_go'
      const quantity = plan.selectedQuantity || 1

      // Store plan information in sessionStorage before redirecting
      sessionStorage.setItem('selectedPlanId', plan.id)
      sessionStorage.setItem('pendingCheckout', 'true')
      sessionStorage.setItem('selectedCurrency', plan.currency)

      if (isPAYG) {
        // For pay-as-you-go plans, store quantity and pricing info
        const discount = quantity >= 50 ? 15 : quantity >= 20 ? 10 : quantity >= 5 ? 5 : 0
        const discountMultiplier = (100 - discount) / 100
        const totalPrice = ((plan.amount * quantity) / 100 * discountMultiplier).toFixed(2)

        sessionStorage.setItem('creditPurchase', JSON.stringify({
          quantity: quantity,
          unitPrice: plan.amount / 100,
          discount: discount,
          totalPrice: totalPrice,
          currency: plan.currency // Store currency with purchase details
        }))
      } else {
        // For subscription plans, always store 'monthly' as billing cycle
        sessionStorage.setItem('billingCycle', 'monthly')
      }

      // Add a slight delay to show the loading state before redirecting
      setTimeout(() => {
        // Redirect to sign-in with a more specific redirect parameter
        router.push('/signin?redirect=checkout')
      }, 800)
      return
    }

    if (plan.id) {
      // Handle PAYG plans
      if (plan.id === 'pay_as_you_go') {
        const quantity = plan.selectedQuantity || 1
        const discount = quantity >= 50 ? 15 : quantity >= 20 ? 10 : quantity >= 5 ? 5 : 0
        const discountMultiplier = (100 - discount) / 100
        const totalPrice = ((plan.amount * quantity) / 100 * discountMultiplier).toFixed(2)

        sessionStorage.setItem('selectedPlanId', plan.id)
        sessionStorage.setItem('selectedCurrency', plan.currency)
        sessionStorage.setItem('creditPurchase', JSON.stringify({
          quantity: quantity,
          unitPrice: plan.amount / 100,
          discount: discount,
          totalPrice: totalPrice,
          currency: plan.currency
        }))
        
        // Add a slight delay before redirecting
        setTimeout(() => {
          router.push('/checkout')
        }, 800)
        return
      }

      // Handle Enterprise plan
      if (plan.name === "Enterprise") {
        setIsLoadingCheckout(false) // Reset loading state, no redirect in this case
        setShowContactModal(true)
        return
      }

      try {
        const userData = getUserFromCookie() as User
        if (!userData) {
          throw new Error('User not logged in')
        }        // Get the ID token using our utility
        const idToken = getStoredToken();
        if (!idToken) {
          setTimeout(() => {
            router.push('/signin')
          }, 800)
          return
        }

        // Check if user already has this plan using authenticatedFetch
        const planCheckResponse = await authenticatedFetch(
          `${process.env.NEXT_PUBLIC_API_URL}/payments/has-plan/${plan.id}`
        )

        if (!planCheckResponse.ok) {
          throw new Error('Failed to check plan status')
        }

        const planStatus = await planCheckResponse.json()

        // If user has this plan or has scheduled a change to it
        if (planStatus.has_plan) {
          setIsLoadingCheckout(false) // Reset loading state, showing modal instead
          setCurrentPlanDetails({
            currentPlan: planStatus.current_plan,
            selectedPlan: plan.id // Keep plan ID consistent
          })
          setShowPlanModal(true)
          return
        }

        // Store plan selection
        sessionStorage.setItem('selectedPlanId', plan.id)
        sessionStorage.setItem('selectedCurrency', plan.currency)
        sessionStorage.setItem('billingCycle', 'monthly')

        // Check current subscription status using authenticatedFetch
        const subResponse = await authenticatedFetch(
          `${process.env.NEXT_PUBLIC_API_URL}/payments/subscription`
        )

        if (!subResponse.ok) {
          throw new Error('Failed to check subscription status')
        }

        const subscriptionData = await subResponse.json()

        if (subscriptionData.has_subscription &&
            subscriptionData.subscription_details?.status === 'active') {
          sessionStorage.setItem('isChangingPlan', 'true')
          setTimeout(() => {
            router.push('/subscription?change=true')
          }, 800)
        } else {
          setTimeout(() => {
            router.push('/checkout')
          }, 800)
        }      } catch (error) {
        // Fallback: still store selection and go to subscription page or checkout
        sessionStorage.setItem('selectedPlanId', plan.id)
        sessionStorage.setItem('selectedCurrency', plan.currency)
        sessionStorage.setItem('billingCycle', 'monthly')
        // Decide fallback route, maybe checkout is safer?
        setTimeout(() => {
          router.push('/checkout')
        }, 800)
      }
    }
  }  // Handle CODON purchase
  const handleCodonPurchase = async () => {
    if (!codonPricingData) return
    
    setIsLoadingCheckout(true)
    
    // Clear any existing conflicting purchase data
    sessionStorage.removeItem('creditPurchase')
    sessionStorage.removeItem('selectedPlanId')
    sessionStorage.removeItem('billingCycle')
    
    if (!isAuthenticated) {
      // Store CODON purchase details in session storage
      sessionStorage.setItem('codonPurchase', JSON.stringify({
        credits: codonPricingData.credits,
        totalCodon: codonPricingData.total_codon_amount,
        platformAmount: codonPricingData.platform_amount,
        burnAmount: codonPricingData.burn_amount,
        savings: codonPricingData.savings,
        discountApplied: codonPricingData.discount_applied,
        discountPercentage: codonPricingData.discount_percentage,
        paymentMethod: 'codon' // Indicate this is a CODON purchase
      }))
      
      // Add a slight delay to show loading state before redirecting
      setTimeout(() => {
        router.push('/signin?redirect=codon-checkout')
      }, 800)
      return
    }
      // User is authenticated - store details and redirect to checkout
    sessionStorage.setItem('codonPurchase', JSON.stringify({
      credits: codonPricingData.credits,
      totalCodon: codonPricingData.total_codon_amount,
      platformAmount: codonPricingData.platform_amount,
      burnAmount: codonPricingData.burn_amount,
      savings: codonPricingData.savings,
      discountApplied: codonPricingData.discount_applied,
      discountPercentage: codonPricingData.discount_percentage,
      paymentMethod: 'codon' // Indicate this is a CODON purchase
    }))
    
    // Navigate to CODON checkout page
    setTimeout(() => {
      router.push('/checkout?payment=codon')
    }, 800)
  }
  
  const handleUpgrade = () => {
    if (currentPlanDetails) {
      setIsLoadingCheckout(true) // Show loading state
      sessionStorage.setItem('selectedPlanId', currentPlanDetails.selectedPlan)
      // Retrieve currency stored during initial selection or default
      const currencyToUse = sessionStorage.getItem('selectedCurrency') || selectedCurrency
      sessionStorage.setItem('selectedCurrency', currencyToUse)
      sessionStorage.setItem('billingCycle', 'monthly')
      sessionStorage.setItem('isChangingPlan', 'true')
      
      // Add a slight delay to show the loading state
      setTimeout(() => {
        router.push('/subscription?change=true')
      }, 800)
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-950 via-gray-900 to-gray-950">
      <style jsx global>{gridPatternStyle}</style>
      <Header />
      
      <BackgroundEffects />

      {/* Hero Section */}
      <PricingHero 
        selectedCurrency={selectedCurrency} 
        setSelectedCurrency={setSelectedCurrency} 
      />
      
      {/* Enhanced Payment Method Toggle */}
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 mb-8">
        <motion.div 
          className="max-w-md mx-auto"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3, duration: 0.6 }}
        >
          <div className="bg-gradient-to-r from-gray-800/60 to-gray-800/40 backdrop-blur-sm rounded-xl p-3 border border-gray-700/50 shadow-lg">
            <div className="flex gap-2">
              <button
                onClick={() => setPaymentMethod('fiat')}
                className={`flex-1 py-3 px-4 rounded-lg transition-all duration-300 flex items-center justify-center ${
                  paymentMethod === 'fiat' 
                    ? 'bg-gradient-to-r from-blue-600 to-blue-500 text-white shadow-lg ring-2 ring-blue-500/30' 
                    : 'bg-gray-800/60 text-gray-300 hover:bg-gray-700'
                }`}
              >
                <motion.div 
                  className="flex items-center"
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.98 }}
                >
                  <div className="w-7 h-7 rounded-full bg-blue-500/20 flex items-center justify-center mr-2">
                    <Coins className="w-4 h-4 text-blue-400" />
                  </div>
                  <span className="font-medium">Pay with $</span>
                </motion.div>
              </button>
              <button
                onClick={() => setPaymentMethod('codon')}
                className={`flex-1 py-3 px-4 rounded-lg transition-all duration-300 flex items-center justify-center ${
                  paymentMethod === 'codon' 
                    ? 'bg-gradient-to-r from-purple-600 to-blue-600 text-white shadow-lg ring-2 ring-purple-500/30' 
                    : 'bg-gray-800/60 text-gray-300 hover:bg-gray-700'
                }`}
              >
                <motion.div 
                  className="flex items-center"
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.98 }}
                >
                  <div className="w-7 h-7 rounded-full bg-purple-500/20 flex items-center justify-center mr-2">
                    <Flame className="w-4 h-4 text-purple-400" />
                  </div>
                  <span className="font-medium">Pay with CODON</span>
                </motion.div>
              </button>
            </div>
          </div>
          
          {/* Currency Toggle - Only show when fiat payment method is selected */}
          {paymentMethod === 'fiat' && (
            <div className="flex items-center justify-center mt-4">
              <div className="flex items-center p-1.5 bg-gradient-to-r from-blue-900/20 to-gray-800/40 backdrop-blur-sm rounded-full border border-blue-500/20 shadow-inner transition-colors">
                <div
                  onClick={() => setSelectedCurrency('USD')}
                  className={`relative px-3 sm:px-4 py-1.5 sm:py-2 text-xs sm:text-sm rounded-full transition-all duration-300 flex items-center cursor-pointer ${
                    selectedCurrency === 'USD' 
                      ? 'bg-blue-600/80 text-white font-medium shadow-md' 
                      : 'text-gray-300 hover:text-white hover:bg-gray-700/50'
                  }`}
                >
                  <span className="font-medium">USD ($)</span>
                </div>
                <div
                  onClick={() => setSelectedCurrency('INR')}
                  className={`relative px-3 sm:px-4 py-1.5 sm:py-2 text-xs sm:text-sm rounded-full transition-all duration-300 flex items-center cursor-pointer ${
                    selectedCurrency === 'INR' 
                      ? 'bg-blue-600/80 text-white font-medium shadow-md' 
                      : 'text-gray-300 hover:text-white hover:bg-gray-700/50'
                  }`}
                >
                  <span className="font-medium">INR (₹)</span>
                </div>
              </div>
            </div>
          )}
        </motion.div>
      </div>

      {/* Pricing Cards - Enhanced UI */}
      <section className="py-8 relative z-10">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          {paymentMethod === 'fiat' ? (
            <>
              <div className="mb-10 text-center">
                <motion.h2 
                  className="text-3xl font-bold text-white mb-2"
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.5 }}
                >
                  Pay with {selectedCurrency === 'USD' ? 'USD' : 'INR'}
                </motion.h2>
                <motion.p 
                  className="text-gray-400 max-w-2xl mx-auto"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ duration: 0.5, delay: 0.2 }}
                >
                  Choose a credit package that fits your needs. All plans include the same powerful AI features.
                </motion.p>
              </div>
              
              {/* Enhanced Fiat Pricing Tiers */}
              <FiatPricingTiers
                plans={plans}
                loading={loading}
                error={error}
                selectedCurrency={selectedCurrency}
                formatCurrency={formatCurrency}
                formatPrice={formatPrice}
                updateCreditQuantity={updateCreditQuantity}
                handleSelectPlan={handleSelectPlan}
              />
            </>
          ) : (
            <>
              <div className="mb-10 text-center">
                <motion.h2 
                  className="text-3xl font-bold text-white mb-2"
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.5 }}
                >
                  Pay with CODON
                </motion.h2>
                <motion.p 
                  className="text-gray-400 max-w-2xl mx-auto"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ duration: 0.5, delay: 0.2 }}
                >
                  Get the most out of your tokens with reduced fees and token burns.
                </motion.p>
              </div>
              
              {/* Enhanced Token Banner */}
              <TokenBanner
                copied={copied}
                setCopied={setCopied}
                copyContractAddress={copyContractAddress}
              />
              
              {/* Enhanced CODON Pricing Cards */}
              <CodonPricingCards
                codonCredits={codonCredits}
                setCodonCredits={setCodonCredits}
                codonPricingData={codonPricingData}
                isLoadingCodonPricing={isLoadingCodonPricing}
                codonPricingError={codonPricingError}
                fetchCodonPricing={fetchCodonPricing}
                handleCodonPurchase={handleCodonPurchase}
              />
            </>
          )}

          {/* Enterprise CTA */}
          <EnterpriseCta setShowContactModal={setShowContactModal} />
        </div>

        {/* Add the ContactModal component */}
        <ContactModal
          isOpen={showContactModal}
          onClose={() => setShowContactModal(false)}
        />
      </section>      {/* Refund policy text */}
      <div className="text-center mt-6 sm:mt-8 max-w-3xl mx-auto px-4">
        <p className="text-gray-400 text-xs sm:text-sm">
          By purchasing, you agree to our{" "}
          <Link href="/refund-policy" className="text-blue-400 hover:text-blue-300 underline">
            refund policy
          </Link>
          . All credit purchases are final and non-refundable.
        </p>
      </div>

      {/* FAQs */}
      <FaqSection faqs={faqs} setShowContactModal={setShowContactModal} />

      <PlanSelectionModal
        isOpen={showPlanModal}
        onClose={() => setShowPlanModal(false)}
        currentPlan={currentPlanDetails?.currentPlan || ''}
        selectedPlan={currentPlanDetails?.selectedPlan || ''}
        onUpgrade={handleUpgrade}
      />

      {/* Checkout Loading Overlay */}
      {isLoadingCheckout && (
        <div className="fixed inset-0 bg-gray-950/80 z-50 flex items-center justify-center backdrop-blur-sm">
          <div className={`bg-gradient-to-b ${paymentMethod === 'codon' ? 'from-purple-900/40 to-gray-900/90 border-purple-500/30' : 'from-gray-800/90 to-gray-900/90 border-blue-500/30'} rounded-xl p-6 shadow-xl border max-w-md w-full mx-4 flex flex-col items-center`}>
            <div className={`w-14 h-14 border-4 ${paymentMethod === 'codon' ? 'border-purple-500' : 'border-blue-500'} border-t-transparent rounded-full animate-spin mb-5`}></div>
            <h3 className="text-xl font-semibold text-white mb-2">Preparing your checkout</h3>
            <p className="text-gray-300 text-center">
              {paymentMethod === 'codon' 
                ? "We're preparing your CODON credit purchase. Just a moment..." 
                : "We're setting up your plan selection. Just a moment..."}
            </p>
          </div>
        </div>
      )}

      <Footer />
    </div>
  );
}
