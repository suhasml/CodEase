// 'use client';

// import { useState, useEffect, Suspense } from 'react';
// import { useRouter, useSearchParams } from 'next/navigation';
// import Cookies from 'js-cookie';
// import { motion } from 'framer-motion';
// import { 
//   ArrowRight, Calendar, Check, CreditCard, Shield, AlertTriangle, 
//   RefreshCw, Package, Sparkles, Zap, Wallet, X, AlertCircle 
// } from 'lucide-react';
// import Header from '@/components/Header/header';
// import Footer from '@/components/Footer/footer';
// import { getStoredToken } from '@/lib/auth-utils';
// import { authenticatedFetch } from '@/lib/api-utils';
// import { getUserFromCookie } from '@/lib/cookie-utils';

// interface SubscriptionDetails {
//   plan_name: string;
//   plan_description?: string;
//   status: string;
//   current_period_end: string;
//   end_date?: string;
//   price: number;
//   currency: string;
//   billing_cycle: string;
//   features?: string[];
//   payment_method?: {
//     type: string;
//     last4?: string;
//     expiry?: string;
//   };
// }

// interface SubscriptionStatus {
//   has_subscription: boolean;
//   subscription_details?: any; // Changed to any to accommodate the actual API response
// }

// interface CreditPurchase {
//   quantity: number;
//   unitPrice: number;
//   discount: number;
//   totalPrice: string;
// }

// interface SelectedPlanInfo {
//   id: string;
//   cycle: string;
//   creditPurchase?: CreditPurchase;
// }

// const SubscriptionPage = () => {
//   const router = useRouter();
//   const searchParams = useSearchParams();
//   const [subscription, setSubscription] = useState<SubscriptionStatus | null>(null);
//   const [loading, setLoading] = useState(true);
//   const [error, setError] = useState<string | null>(null);
//   const [showSuccessMessage, setShowSuccessMessage] = useState(false);
//   const [selectedPlanInfo, setSelectedPlanInfo] = useState<SelectedPlanInfo | null>(null);
//   const [showCancelModal, setShowCancelModal] = useState(false);
//   const [cancelType, setCancelType] = useState<'end_of_cycle' | 'immediate'>('end_of_cycle');
//   const [cancelLoading, setCancelLoading] = useState(false);
//   const [cancelError, setCancelError] = useState<string | null>(null);
//   const [cancelSuccess, setCancelSuccess] = useState<string | null>(null);
//   const [changingPlan, setChangingPlan] = useState<boolean>(false);
//   const [showSamePlanNotification, setShowSamePlanNotification] = useState<boolean>(false);
//   const [cancelPlanChangeLoading, setCancelPlanChangeLoading] = useState(false);


//   const [showPlanChangeModal, setShowPlanChangeModal] = useState<boolean>(false);
//   const [planChangeDetails, setPlanChangeDetails] = useState<{
//     currentPlan: string;
//     newPlan: string;
//     currentPrice: number;
//     newPrice: number;
//     currency: string;
//     effectiveDate: string;
//   } | null>(null);
//   const [planChangeLoading, setPlanChangeLoading] = useState<boolean>(false);

//   useEffect(() => {
//     // Check if user is logged in
//     // const storedUser = Cookies.get('user');
//     // if (!storedUser) {
//     //   router.push('/signin');
//     //   return;
//     // }
//     const userData = getUserFromCookie();
//     if (!userData) {
//       router.push('/signin');
//       return;
//     }
//     // Check for error messages in URL params
//     const errorParam = searchParams.get('error');
//     if (errorParam === 'active_subscription') {
//       setError('You already have an active subscription. You can change your plan at the end of your billing period.');
//     }
  
//     // Check for success message from URL params
//     if (searchParams.get('status') === 'success') {
//       setShowSuccessMessage(true);
//       // Clear the status param after 5 seconds
//       setTimeout(() => {
//         setShowSuccessMessage(false);
//         const newUrl = window.location.pathname;
//         window.history.replaceState({}, '', newUrl);
//       }, 5000);
//     } else if (searchParams.get('status') === 'plan_change_scheduled') {
//       setShowSuccessMessage(true);
//       // Clear the status param after 5 seconds
//       setTimeout(() => {
//         setShowSuccessMessage(false);
//         const newUrl = window.location.pathname;
//         window.history.replaceState({}, '', newUrl);
//       }, 5000);
//     }
  
//     // Check if a plan was selected (in sessionStorage)
//     const selectedPlanId = sessionStorage.getItem('selectedPlanId');
//     const billingCycle = sessionStorage.getItem('billingCycle');
//     const creditPurchaseStr = sessionStorage.getItem('creditPurchase');
//     const isChangingPlan = sessionStorage.getItem('isChangingPlan') === 'true';
    
//     if (selectedPlanId) {
//       // Check if this is a credit purchase
//       if (creditPurchaseStr) {
//         try {
//           const creditPurchase = JSON.parse(creditPurchaseStr);
//           setSelectedPlanInfo({
//             id: selectedPlanId,
//             cycle: 'credit',
//             creditPurchase: creditPurchase
//           });
//         } catch (e) {
//           console.error('Error parsing credit purchase data:', e);
//           setSelectedPlanInfo({
//             id: selectedPlanId,
//             cycle: 'credit'
//           });
//         }
//       } else if (billingCycle) {
//         // Regular subscription
//         setSelectedPlanInfo({
//           id: selectedPlanId,
//           cycle: billingCycle
//         });
//       }
//     }
  
//     // Fetch subscription status
//     const fetchSubscriptionStatus = async () => {
//       try {
//         setLoading(true);
//         // const user = Cookies.get('user') ? JSON.parse(Cookies.get('user') || '{}') : null;
//         // const idToken = user?.idToken || getStoredToken();
//         const userData = getUserFromCookie();
//         const idToken = userData?.idToken || getStoredToken();

//         if (!idToken) {
//           console.error('No authentication token available');
//           router.push('/signin');
//           return;
//         }

//         const response = await authenticatedFetch(
//           `${process.env.NEXT_PUBLIC_API_URL}/payments/subscription`
//         );
        
        
//         if (!response.ok) {
//           throw new Error('Failed to fetch subscription details');
//         }
        
//         const data: SubscriptionStatus = await response.json();
//         setSubscription(data);
        
//         // If user already has an active subscription and selected a plan (not credit purchase)
//         if (data.has_subscription && 
//             data.subscription_details?.status === "active" && 
//             selectedPlanId && 
//             !creditPurchaseStr && 
//             !isChangingPlan) {
          
//           // Clear the selected plan data as they already have an active subscription
//           sessionStorage.removeItem('selectedPlanId');
//           sessionStorage.removeItem('billingCycle');
          
//           // Show message that they already have an active subscription
//           // setError("You already have an active subscription. You can change your plan at the end of the billing cycle.");
//         }
        
// // Handle plan change flow
// if (isChangingPlan && data.has_subscription) {
//   setChangingPlan(true);
//   // If they have a selectedPlanId, it means they've already selected a new plan
//   if (selectedPlanId) {
//     try {
//       // Get details of the new plan for comparison
//       const planDetailsResponse = await authenticatedFetch(
//         `${process.env.NEXT_PUBLIC_API_URL}/payments/plan/${selectedPlanId}`
//       );
      
//       if (!planDetailsResponse.ok) {
//         throw new Error('Failed to get plan details');
//       }
      
//       const newPlanDetails = await planDetailsResponse.json();
      
//       // Prepare comparison data for the modal
//       const currentPlanName = data.subscription_details?.plan?.name || 'Current Plan';
//       const currentPlanPrice = data.subscription_details?.amount_paid || 0;
//       const newPlanName = newPlanDetails.name || 'New Plan';
//       const newPlanPrice = newPlanDetails.amount || 0;
//       const currency = data.subscription_details?.currency || 'USD';
      
//       // Calculate next billing date
//       const currentPeriodEnd = data.subscription_details?.end_date;
//       const effectiveDate = currentPeriodEnd ? formatDate(currentPeriodEnd) : 'next billing cycle';
      
//       // Show the confirmation modal with the plan change details
//       setPlanChangeDetails({
//         currentPlan: currentPlanName,
//         newPlan: newPlanName,
//         currentPrice: currentPlanPrice,
//         newPrice: newPlanPrice,
//         currency: currency,
//         effectiveDate: effectiveDate
//       });
      
//       setShowPlanChangeModal(true);
//       setChangingPlan(false);
      
//     } catch (err) {
//       console.error('Error processing plan change:', err);
//       setError(err instanceof Error ? err.message : 'An unknown error occurred');
//       setChangingPlan(false);
//     }
//   } else {
//     // They're in "changing plan" mode but haven't selected one yet
//     router.push('/pricing');
//   }
// }
//       } catch (err) {
//         console.error('Error fetching subscription details:', err);
//         setError(err instanceof Error ? err.message : 'An unknown error occurred');
//       } finally {
//         setLoading(false);
//       }
//     };
  
//     fetchSubscriptionStatus();
//   }, [router, searchParams]);

//   const handleCancelPlanChange = async () => {
//     try {
//       setCancelPlanChangeLoading(true);
//       const userData = getUserFromCookie();
//       if (!userData) {
//         throw new Error('User not logged in');
//       }
      
//       // const user = JSON.parse(storedUser);
//       const response = await authenticatedFetch(
//         `${process.env.NEXT_PUBLIC_API_URL}/payments/cancel-plan-change`,
//         {
//           method: 'POST',
//           headers: {
//             'Content-Type': 'application/json'
//           }
//         }
//       );
  
//       const result = await response.json();
      
//       if (result.success) {
//         // Refresh the page to show updated subscription status
//         window.location.reload();
//       } else {
//         setError(result.message || 'Failed to cancel plan change');
//       }
//     } catch (err) {
//       console.error('Error canceling plan change:', err);
//       setError(err instanceof Error ? err.message : 'An unknown error occurred');
//     } finally {
//       setCancelPlanChangeLoading(false);
//     }
//   };

// const handleConfirmPlanChange = async () => {
//   if (!selectedPlanInfo?.id) return;
  
//   setPlanChangeLoading(true);
  
//   try {
//     // const storedUser = Cookies.get('user');
//     const userData = getUserFromCookie();
//     if (!userData) {
//       throw new Error('User not logged in');
//     }
    
//     // const user = JSON.parse(storedUser);
//     const response = await authenticatedFetch(
//       `${process.env.NEXT_PUBLIC_API_URL}/payments/change-plan`,
//       {
//         method: 'POST',
//         headers: {
//           'Content-Type': 'application/json'
//         },
//         body: JSON.stringify({
//           plan_id: selectedPlanInfo.id
//         })
//       }
//     );
    
//     const result = await response.json();
    
//     // Clear plan change flags and selections
//     sessionStorage.removeItem('isChangingPlan');
//     sessionStorage.removeItem('selectedPlanId');
//     sessionStorage.removeItem('billingCycle');
    
//     if (result.success) {
//       // Show success message and refresh data
//       setShowPlanChangeModal(false);
//       router.push('/subscription?status=plan_change_scheduled');
//     } else {
//       // Handle errors
//       if (result.message && result.message.includes('already subscribed to this plan')) {
//         setShowSamePlanNotification(true);
//       } else {
//         setError(result.message || 'Failed to schedule plan change');
//       }
//       setShowPlanChangeModal(false);
//     }
//   } catch (err) {
//     console.error('Error scheduling plan change:', err);
//     setError(err instanceof Error ? err.message : 'An unknown error occurred');
//     setShowPlanChangeModal(false);
//   } finally {
//     setPlanChangeLoading(false);
//   }
// };

//   // Handle subscription cancellation
//   const handleCancelSubscription = async (immediate: boolean) => {
//     setCancelLoading(true);
//     setCancelError(null);
//     setCancelSuccess(null);
    
//     try {
//       // const storedUser = Cookies.get('user');
//       const userData = getUserFromCookie();
//       if (!userData) {
//         throw new Error('User not logged in');
//       }
      
//       // const user = JSON.parse(storedUser);
//       const endpoint = immediate 
//         ? `${process.env.NEXT_PUBLIC_API_URL}/payments/cancel-subscription-immediately`
//         : `${process.env.NEXT_PUBLIC_API_URL}/payments/cancel-subscription`;
      
//         const response = await authenticatedFetch(
//           endpoint,
//           {
//             method: 'POST',
//             headers: {
//               'Content-Type': 'application/json'
//             }
//           }
//         );
      
//       const result = await response.json();
      
//       if (!result.success) {
//         throw new Error(result.error || 'Failed to cancel subscription');
//       }
      
//       setCancelSuccess(result.message);
      
//       // Refresh subscription details after a short delay
//       setTimeout(() => {
//         setShowCancelModal(false);
        
//         // Refresh the page to update subscription status
//         window.location.reload();
//       }, 2000);
      
//     } catch (err) {
//       console.error('Error canceling subscription:', err);
//       setCancelError(err instanceof Error ? err.message : 'An unknown error occurred');
//     } finally {
//       setCancelLoading(false);
//     }
//   };

//   // Format date for display - Updated with robust error handling
//   const formatDate = (dateString: string | undefined): string => {
//     try {
//       // Check if date string is valid
//       if (!dateString) return 'N/A';
      
//       // Try to parse the date - handle ISO strings or timestamps
//       const date = new Date(dateString);
      
//       // Check if the date is valid
//       if (isNaN(date.getTime())) {
//         console.warn('Invalid date string:', dateString);
//         return 'Invalid date';
//       }
      
//       return new Intl.DateTimeFormat('en-US', {
//         year: 'numeric',
//         month: 'long',
//         day: 'numeric',
//       }).format(date);
//     } catch (error) {
//       console.error('Error formatting date:', error);
//       return 'Date error';
//     }
//   };

//   // Format price
//   const formatPrice = (amount: number, currency: string): string => {
//     return new Intl.NumberFormat('en-US', {
//       style: 'currency',
//       currency: currency,
//       minimumFractionDigits: 0,
//     }).format(amount / 100);
//   };

//   // Animation variants
//   const fadeIn = {
//     initial: { opacity: 0, y: 20 },
//     animate: { opacity: 1, y: 0, transition: { duration: 0.5 } }
//   };

//   if (loading) {
//     return (
//       <div className="min-h-screen bg-gradient-to-b from-gray-950 via-gray-900 to-gray-950 flex items-center justify-center">
//         <div className="animate-pulse flex flex-col items-center">
//           <div className="w-12 h-12 border-4 border-blue-500 border-t-transparent rounded-full animate-spin mb-4"></div>
//           <p className="text-gray-400">Loading subscription details...</p>
//         </div>
//       </div>
//     );
//   }

//   if (error) {
//     return (
//       <div className="min-h-screen bg-gradient-to-b from-gray-950 via-gray-900 to-gray-950">
//         <Header />
//         <div className="relative overflow-hidden">
//           <div className="absolute -top-[500px] -left-[400px] w-[1000px] h-[1000px] bg-[radial-gradient(ellipse_at_center,hsla(217,100%,50%,0.12)_0%,transparent_70%)]" 
//                style={{ animation: 'aurora-x 25s ease-in-out infinite' }} />
//           <div className="absolute -top-[300px] -right-[300px] w-[800px] h-[800px] bg-[radial-gradient(ellipse_at_center,hsla(265,89%,60%,0.12)_0%,transparent_70%)]" 
//                style={{ animation: 'aurora-y 20s ease-in-out infinite' }} />
          
//           <div className="absolute inset-0 bg-[linear-gradient(rgba(59,130,246,0.05)_1px,transparent_1px),linear-gradient(90deg,rgba(59,130,246,0.05)_1px,transparent_1px)] bg-[size:40px_40px] [mask-image:radial-gradient(ellipse_at_center,black_20%,transparent_70%)]" />
//         </div>
        
//         <div className="container mx-auto px-4 py-32 relative z-10">
//           <motion.div
//             initial={{ opacity: 0, y: 20 }}
//             animate={{ opacity: 1, y: 0 }}
//             transition={{ duration: 0.5 }}
//             className="max-w-md mx-auto bg-gradient-to-b from-red-900/30 to-red-800/20 border border-red-500/30 rounded-xl p-6 backdrop-blur-sm shadow-xl"
//           >
//             <div className="text-center mb-6">
//               <AlertTriangle className="w-12 h-12 text-red-400 mx-auto mb-4" />
//               <h2 className="text-xl font-bold text-white mb-2">Something went wrong</h2>
//               <p className="text-red-200/80 mb-4">{error}</p>
//             </div>
//             <button 
//               onClick={() => router.push('/pricing')}
//               className="w-full py-3 px-4 rounded-lg font-medium transition-all flex items-center justify-center bg-gradient-to-r from-blue-500 to-purple-500 text-white hover:shadow-lg hover:shadow-blue-500/20"
//             >
//               View Pricing Plans
//               <ArrowRight className="w-4 h-4 ml-2" />
//             </button>
//           </motion.div>
//         </div>
//         <Footer />
//       </div>
//     );
//   }

//   if (!subscription?.has_subscription) {
//     // Check if user selected a plan from pricing page
//     return (
//       <div className="min-h-screen bg-gradient-to-b from-gray-950 via-gray-900 to-gray-950">
//         <Header />
        
//         <div className="relative overflow-hidden">
//           <div className="absolute -top-[500px] -left-[400px] w-[1000px] h-[1000px] bg-[radial-gradient(ellipse_at_center,hsla(217,100%,50%,0.12)_0%,transparent_70%)]" 
//                style={{ animation: 'aurora-x 25s ease-in-out infinite' }} />
//           <div className="absolute -top-[300px] -right-[300px] w-[800px] h-[800px] bg-[radial-gradient(ellipse_at_center,hsla(265,89%,60%,0.12)_0%,transparent_70%)]" 
//                style={{ animation: 'aurora-y 20s ease-in-out infinite' }} />
//           <div className="absolute bottom-[20%] left-[10%] w-[600px] h-[600px] bg-[radial-gradient(ellipse_at_center,hsla(190,95%,50%,0.06)_0%,transparent_70%)]" 
//                style={{ animation: 'aurora-pulse 30s ease infinite' }} />
          
//           <div className="absolute inset-0 bg-[linear-gradient(rgba(59,130,246,0.05)_1px,transparent_1px),linear-gradient(90deg,rgba(59,130,246,0.05)_1px,transparent_1px)] bg-[size:40px_40px] [mask-image:radial-gradient(ellipse_at_center,black_20%,transparent_70%)]" />
//         </div>
        
//         <div className="container mx-auto px-4 pt-32 pb-16 relative z-10">
//           <motion.div
//             initial={{ opacity: 0, y: 20 }}
//             animate={{ opacity: 1, y: 0 }}
//             transition={{ duration: 0.5 }}
//             className="max-w-xl mx-auto"
//           >
//             {selectedPlanInfo ? (
//               // User has selected a plan, show checkout prompt
//               <div className="bg-gradient-to-b from-blue-900/30 to-purple-900/30 border border-blue-500/40 rounded-xl overflow-hidden shadow-xl">
//                 <div className="p-8">
//                   <div className="flex justify-center mb-6">
//                     <div className="w-16 h-16 rounded-full bg-blue-500/20 flex items-center justify-center">
//                       <Sparkles className="w-8 h-8 text-blue-400" />
//                     </div>
//                   </div>
                  
//                   <h2 className="text-2xl font-bold text-white text-center mb-2">
//                     Ready to Complete Your {selectedPlanInfo.cycle === 'credit' ? 'Purchase' : 'Subscription'}
//                   </h2>
                  
//                   <p className="text-gray-300 text-center mb-6">
//                     {selectedPlanInfo.cycle === 'credit' 
//                       ? "You're just one step away from adding credits to your account."
//                       : "You've selected a plan and you're just one step away from unlocking premium features."}
//                   </p>
                  
//                   <div className="bg-gray-800/40 border border-gray-700 rounded-lg p-4 mb-8">
//                     {selectedPlanInfo.cycle === 'credit' && selectedPlanInfo.creditPurchase ? (
//                       <>
//                         <div className="flex items-center justify-between mb-4">
//                           <span className="text-gray-400">Selected Purchase:</span>
//                           <span className="px-3 py-1 bg-blue-500/20 text-blue-400 rounded-full text-sm font-medium">
//                             Credit Package
//                           </span>
//                         </div>
                        
//                         <div className="space-y-2">
//                           <div className="flex justify-between items-center">
//                             <span className="text-gray-300">Quantity:</span>
//                             <span className="text-white font-medium">{selectedPlanInfo.creditPurchase.quantity} credits</span>
//                           </div>
                          
//                           <div className="flex justify-between items-center">
//                             <span className="text-gray-300">Unit Price:</span>
//                             <span className="text-white">${selectedPlanInfo.creditPurchase.unitPrice.toFixed(2)}</span>
//                           </div>
                          
//                           {selectedPlanInfo.creditPurchase.discount > 0 && (
//                             <div className="flex justify-between items-center">
//                               <span className="text-gray-300">Discount:</span>
//                               <span className="text-green-400">{selectedPlanInfo.creditPurchase.discount}% off</span>
//                             </div>
//                           )}
                          
//                           <div className="flex justify-between items-center pt-2 border-t border-gray-700 mt-2">
//                             <span className="text-gray-300 font-medium">Total:</span>
//                             <span className="text-white font-medium">${selectedPlanInfo.creditPurchase.totalPrice}</span>
//                           </div>
//                         </div>
//                       </>
//                     ) : (
//                       <>
//                         <div className="flex items-center justify-between mb-4">
//                           <span className="text-gray-400">Selected Plan:</span>
//                           <span className="px-3 py-1 bg-blue-500/20 text-blue-400 rounded-full text-sm font-medium">
//                             {selectedPlanInfo.cycle === 'yearly' ? 'Annual Billing' : 'Monthly Billing'}
//                           </span>
//                         </div>
                        
//                         <div className="flex justify-between items-center">
//                           <div className="flex items-center">
//                             <Zap className="w-5 h-5 text-blue-400 mr-2" />
//                             <span className="text-white">Premium Features</span>
//                           </div>
//                           <ArrowRight className="w-4 h-4 text-gray-500" />
//                         </div>
//                       </>
//                     )}
//                   </div>
                  
//                   <div className="flex flex-col space-y-4">
//                     <button 
//                       onClick={() => router.push('/checkout')}
//                       className="py-3 px-4 bg-gradient-to-r from-blue-500 to-purple-500 hover:from-blue-600 hover:to-purple-600 text-white rounded-lg font-medium transition-all flex items-center justify-center group"
//                     >
//                       <span>Continue to {selectedPlanInfo.cycle === 'credit' ? 'Payment' : 'Checkout'}</span>
//                       <ArrowRight className="w-4 h-4 ml-2 group-hover:translate-x-1 transition-transform" />
//                     </button>
                    
//                     <button 
//                       onClick={() => {
//                         // Clear selected plan
//                         sessionStorage.removeItem('selectedPlanId');
//                         sessionStorage.removeItem('billingCycle');
//                         sessionStorage.removeItem('creditPurchase');
//                         setSelectedPlanInfo(null);
//                         router.push('/pricing');
//                       }}
//                       className="py-3 px-4 bg-gray-800 hover:bg-gray-700 text-white rounded-lg font-medium transition-all flex items-center justify-center"
//                     >
//                       <RefreshCw className="w-4 h-4 mr-2" />
//                       <span>Choose a Different {selectedPlanInfo.cycle === 'credit' ? 'Package' : 'Plan'}</span>
//                     </button>
//                   </div>
//                 </div>
                
//                 <div className="bg-gray-800/60 border-t border-gray-700 p-4">
//                   <p className="text-gray-400 text-sm text-center">
//                     {selectedPlanInfo.cycle === 'credit' 
//                       ? "Credits will be added to your account immediately after payment"
//                       : "Your card will only be charged after you complete checkout"}
//                   </p>
//                 </div>
//               </div>
//             ) : (
//               // No plan selected, show regular no subscription message
//               <div className="bg-gray-800/40 backdrop-blur-sm border border-gray-700 rounded-xl p-8 text-center">
//                 <motion.div 
//                   initial={{ scale: 0.9, opacity: 0 }}
//                   animate={{ scale: 1, opacity: 1 }}
//                   transition={{ duration: 0.5 }}
//                 >
//                   <Package className="w-16 h-16 text-gray-400 mx-auto mb-4" />
//                 </motion.div>
                
//                 <h2 className="text-2xl font-bold text-white mb-3">No Active Subscription</h2>
                
//                 <p className="text-gray-300 mb-8 max-w-md mx-auto">
//                   You don't currently have an active subscription plan. Choose a plan to unlock premium features and enhance your experience.
//                 </p>
                
//                 <button 
//                   onClick={() => router.push('/pricing')}
//                   className="px-6 py-3 bg-gradient-to-r from-blue-500 to-purple-500 hover:from-blue-600 hover:to-purple-600 text-white rounded-lg font-medium transition-all flex items-center justify-center mx-auto group"
//                 >
//                   <span>Explore Plans</span>
//                   <ArrowRight className="w-4 h-4 ml-2 group-hover:translate-x-1 transition-transform" />
//                 </button>
//               </div>
//             )}
//           </motion.div>
//         </div>
//       </div>
//     );
//   }

//   // User has an active subscription - show subscription details
//   const details = subscription.subscription_details!;
  
//   // Map API response fields to the expected format
//   const mappedDetails: SubscriptionDetails = {
//     plan_name: details.plan?.name || 'Basic',
//     plan_description: details.plan?.description || 'Premium features and capabilities',
//     status: details.status || 'active',
//     current_period_end: details.end_date || '',
//     price: details.plan?.amount || details.amount_paid || 0,
//     currency: details.currency || 'USD',
//     billing_cycle: details.plan?.interval || 'monthly',
//     features: details.plan?.features || [],
//     payment_method: {
//       type: 'card',
//       last4: '****' // Limited payment info for security
//     }
//   };

//   // Check if subscription is in cancellation requested state
//   const isCancellationRequested = details.status === 'cancellation_requested';

//   return (
//     <div className="min-h-screen bg-gradient-to-b from-gray-950 via-gray-900 to-gray-950">
//       <Header />
      
//       <div className="relative overflow-hidden">
//         {/* Dynamic aurora effects with subtle animations */}
//         <div className="absolute -top-[500px] -left-[400px] w-[1000px] h-[1000px] bg-[radial-gradient(ellipse_at_center,hsla(217,100%,50%,0.12)_0%,transparent_70%)]" 
//              style={{ animation: 'aurora-x 25s ease-in-out infinite' }} />
//         <div className="absolute -top-[300px] -right-[300px] w-[800px] h-[800px] bg-[radial-gradient(ellipse_at_center,hsla(265,89%,60%,0.12)_0%,transparent_70%)]" 
//              style={{ animation: 'aurora-y 20s ease-in-out infinite' }} />
        
//         {/* Enhanced grid effect */}
//         <div className="absolute inset-0 bg-[linear-gradient(rgba(59,130,246,0.05)_1px,transparent_1px),linear-gradient(90deg,rgba(59,130,246,0.05)_1px,transparent_1px)] bg-[size:40px_40px] [mask-image:radial-gradient(ellipse_at_center,black_20%,transparent_70%)]" />
//       </div>
      
//       {showSuccessMessage && (
//         <motion.div
//           initial={{ opacity: 0, y: -50 }}
//           animate={{ opacity: 1, y: 0 }}
//           transition={{ duration: 0.5 }}
//           className="fixed top-20 left-0 right-0 mx-auto max-w-md z-50"
//         >
//           <div className="bg-green-600/80 backdrop-blur-sm text-white px-6 py-4 rounded-lg shadow-lg flex items-center">
//             <Check className="w-5 h-5 mr-3" />
//             <p>Subscription activated successfully! Thank you for your purchase.</p>
//           </div>
//         </motion.div>
//       )}
      
//       <div className="container mx-auto px-4 py-32 relative z-10">
//         <div className="max-w-4xl mx-auto">
//           <motion.h1 
//             className="text-3xl md:text-4xl font-bold mb-8 text-white text-center bg-clip-text text-transparent bg-gradient-to-r from-blue-400 via-purple-400 to-teal-400"
//             initial={{ opacity: 0, y: -20 }}
//             animate={{ opacity: 1, y: 0 }}
//             transition={{ duration: 0.5 }}
//           >
//             Your Subscription
//           </motion.h1>
          
//           {isCancellationRequested && (
//             <motion.div 
//               className="mb-8 bg-yellow-500/20 border border-yellow-500/30 rounded-lg p-4 backdrop-blur-sm shadow-xl"
//               initial={{ opacity: 0, y: -10 }}
//               animate={{ opacity: 1, y: 0 }}
//               transition={{ duration: 0.5, delay: 0.2 }}
//             >
//               <div className="flex items-center">
//                 <AlertTriangle className="w-5 h-5 text-yellow-400 mr-3 flex-shrink-0" />
//                 <p className="text-yellow-200">
//                   Your subscription has been scheduled for cancellation and will end on {formatDate(mappedDetails.current_period_end)}. You'll continue to have access to all features until then.
//                 </p>
//               </div>
//             </motion.div>
//           )}
          
//           <motion.div 
//             className="grid md:grid-cols-3 gap-8"
//             variants={fadeIn}
//             initial="initial"
//             animate="animate"
//           >
//             {/* Subscription Summary */}
//             <div className="md:col-span-2 bg-gradient-to-b from-blue-900/30 to-purple-900/30 border border-blue-500/30 rounded-xl p-6 backdrop-blur-sm shadow-xl">
//               <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-6">
//                 <div>
//                   <h2 className="text-2xl font-bold text-white mb-1">{mappedDetails.plan_name} Plan</h2>
//                   <p className="text-gray-300">{mappedDetails.plan_description}</p>
//                 </div>
//                 <div className="mt-4 md:mt-0">
//                   <span className={`px-3 py-1.5 rounded-full text-sm font-medium ${
//                     mappedDetails.status === 'active' 
//                       ? 'bg-green-500/20 text-green-400' 
//                       : mappedDetails.status === 'trial' 
//                         ? 'bg-blue-500/20 text-blue-400'
//                         : mappedDetails.status === 'cancellation_requested'
//                         ? 'bg-yellow-500/20 text-yellow-400'
//                         : 'bg-yellow-500/20 text-yellow-400'
//                   }`}>
//                     {mappedDetails.status === 'active' 
//                       ? 'Active' 
//                       : mappedDetails.status === 'trial' 
//                         ? 'Trial' 
//                         : mappedDetails.status === 'cancellation_requested'
//                         ? 'Ending soon'
//                         : 'Grace Period'}
//                   </span>
//                 </div>
//               </div>

//               {subscription.subscription_details?.scheduled_change && (
//   <motion.div 
//     className="md:col-span-3 bg-blue-900/30 border border-blue-500/30 rounded-xl p-6 backdrop-blur-sm shadow-xl mb-6"
//     initial={{ opacity: 0, y: -10 }}
//     animate={{ opacity: 1, y: 0 }}
//     transition={{ duration: 0.5, delay: 0.2 }}
//   >
//     <div className="flex items-start">
//       <Calendar className="w-6 h-6 text-blue-400 mr-3 flex-shrink-0" />
//       <div className="flex-grow">
//         <h3 className="text-lg font-medium text-white mb-2">Scheduled Plan Change</h3>
//         <p className="text-blue-100">
//           Your subscription will be upgraded to the{' '}
//           <span className="font-medium text-white">
//             {subscription.subscription_details.scheduled_change.plan_id
//               .replace(/_/g, ' ')
//               .replace(/^\w/, (c: string) => c.toUpperCase())}
//           </span>
//           {' '}plan on{' '}
//           <span className="font-medium text-white">
//             {formatDate(subscription.subscription_details.scheduled_change.effective_from)}
//           </span>
//         </p>
//         <button 
//           onClick={handleCancelPlanChange}
//           disabled={cancelPlanChangeLoading}
//           className="mt-4 text-sm text-blue-400 hover:text-blue-300 transition-colors flex items-center disabled:opacity-50 disabled:cursor-not-allowed"
//         >
//           {cancelPlanChangeLoading ? (
//             <>
//               <div className="w-4 h-4 border-2 border-blue-400 border-t-transparent rounded-full animate-spin mr-2" />
//               Canceling...
//             </>
//           ) : (
//             <>
//               <X className="w-4 h-4 mr-1" />
//               Cancel scheduled change
//             </>
//           )}
//         </button>
//       </div>
//     </div>
//   </motion.div>
// )}
              
//               <div className="grid grid-cols-2 md:grid-cols-3 gap-6 mb-8">
//                 <div className="bg-gray-800/40 rounded-lg p-4 hover:bg-gray-800/60 transition-colors duration-300 group">
//                   <p className="text-gray-400 text-sm mb-1 group-hover:text-gray-300 transition-colors">Billing Cycle</p>
//                   <div className="flex items-center">
//                     <Calendar className="w-4 h-4 text-blue-400 mr-2 group-hover:scale-110 transition-transform" />
//                     <span className="text-white capitalize">{mappedDetails.billing_cycle}</span>
//                   </div>
//                 </div>
//                 <div className="bg-gray-800/40 rounded-lg p-4 hover:bg-gray-800/60 transition-colors duration-300 group">
//                   <p className="text-gray-400 text-sm mb-1 group-hover:text-gray-300 transition-colors">Next Billing</p>
//                   <span className="text-white">
//                     {mappedDetails.current_period_end ? formatDate(mappedDetails.current_period_end) : 'Not available'}
//                   </span>
//                 </div>
//                 <div className="bg-gray-800/40 rounded-lg p-4 hover:bg-gray-800/60 transition-colors duration-300 group">
//                   <p className="text-gray-400 text-sm mb-1 group-hover:text-gray-300 transition-colors">Price</p>
//                   <span className="text-white">
//                     {formatPrice(mappedDetails.price, mappedDetails.currency)}/{mappedDetails.billing_cycle === 'yearly' ? 'year' : 'month'}
//                   </span>
//                 </div>
//               </div>
              
//               {/* Credit Information - if available */}
//               {details.plan?.credits && (
//                 <div className="mb-8">
//                   <h3 className="text-lg font-medium text-white mb-3">Plan Allowance</h3>
//                   <div className="bg-gray-800/40 border border-gray-700 rounded-lg p-4 hover:border-blue-500/30 transition-colors duration-300">
//                     <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
//                       <div className="flex items-center">
//                         <Zap className="w-5 h-5 text-blue-400 mr-3" />
//                         <div>
//                           <p className="text-white">{details.plan.credits} extensions per {mappedDetails.billing_cycle === 'yearly' ? 'year' : 'month'}</p>
//                           <p className="text-gray-400 text-sm">Resets on {formatDate(mappedDetails.current_period_end)}</p>
//                         </div>
//                       </div>
//                       {details.plan.follow_ups && (
//                         <div className="flex items-center">
//                           <RefreshCw className="w-5 h-5 text-purple-400 mr-3" />
//                           <div>
//                             <p className="text-white">{details.plan.follow_ups} follow-ups per extension</p>
//                           </div>
//                         </div>
//                       )}
//                     </div>
//                   </div>
//                 </div>
//               )}
              
//               {mappedDetails.payment_method && (
//                 <div className="mb-8">
//                   <h3 className="text-lg font-medium text-white mb-3">Payment Method</h3>
//                   <div className="bg-gray-800/40 border border-gray-700 rounded-lg p-4 flex items-center hover:border-blue-500/30 transition-colors duration-300">
//                     <CreditCard className="w-5 h-5 text-gray-400 mr-3" />
//                     <div>
//                       <p className="text-white">
//                         {mappedDetails.payment_method?.type === 'card' 
//                           ? `Card ending in ${mappedDetails.payment_method?.last4 || '****'}` 
//                           : 'Online Payment'}
//                       </p>
//                       {mappedDetails.payment_method?.expiry && (
//                         <p className="text-gray-400 text-sm">Expires {mappedDetails.payment_method.expiry}</p>
//                       )}
//                     </div>
//                   </div>
//                 </div>
//               )}
              
//               <div className="space-y-3 mb-8">
//                 <h3 className="text-lg font-medium text-white mb-3">Plan Features</h3>
//                 {mappedDetails.features && mappedDetails.features.length > 0 ? (
//                 mappedDetails.features.map((feature: string, i: number) => (
//                   <div key={i} className="flex items-start group">
//                                   <div className="mt-0.5">
//                         <Check className="w-5 h-5 mr-2 text-green-500 flex-shrink-0 group-hover:scale-110 transition-transform" />
//                       </div>
//                       <span className="text-gray-300 group-hover:text-gray-200 transition-colors">{feature}</span>
//                     </div>
//                   ))
//                 ) : (
//                   <p className="text-gray-400">No features listed for this plan.</p>
//                 )}
//               </div>
              
//               <div className="flex flex-col sm:flex-row gap-4">
//                 {!isCancellationRequested && (
//                   <>
//                     <button 
//                       onClick={() => router.push('/pricing')}
//                       className="px-4 py-2 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-500 hover:to-purple-500 text-white rounded-lg transition-all flex items-center justify-center group"
//                     >
//                       <RefreshCw className="w-4 h-4 mr-2 group-hover:rotate-180 transition-transform duration-500" />
//                       <span>Change Plan</span>
//                     </button>
//                     <button 
//                       onClick={() => setShowCancelModal(true)}
//                       className="px-4 py-2 bg-gray-700 hover:bg-gray-600 text-white rounded-lg transition-colors flex items-center justify-center"
//                     >
//                       <X className="w-4 h-4 mr-2" />
//                       <span>Cancel Subscription</span>
//                     </button>
//                   </>
//                 )}
//                 {isCancellationRequested && (
//                   <button 
//                     onClick={() => router.push('/pricing')}
//                     className="px-4 py-2 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-500 hover:to-purple-500 text-white rounded-lg transition-all flex items-center justify-center group"
//                   >
//                     <Zap className="w-4 h-4 mr-2" />
//                     <span>Renew Subscription</span>
//                   </button>
//                 )}
//               </div>
//             </div>
            
//             {/* Same Plan Notification */}
// {showSamePlanNotification && (
//   <div className="fixed inset-0 bg-gray-900/80 backdrop-blur-sm flex items-center justify-center p-4 z-50">
//     <motion.div 
//       className="bg-gradient-to-b from-blue-900/40 to-indigo-900/40 border border-blue-500/30 rounded-xl max-w-md w-full p-6 shadow-xl"
//       initial={{ opacity: 0, scale: 0.95 }}
//       animate={{ opacity: 1, scale: 1 }}
//       transition={{ duration: 0.3 }}
//     >
//       <div className="text-center mb-6">
//         <div className="w-16 h-16 rounded-full bg-blue-500/20 flex items-center justify-center mx-auto mb-4">
//           <Check className="w-8 h-8 text-blue-400" />
//         </div>
//         <h3 className="text-xl font-bold text-white mb-2">You're Already Subscribed</h3>
//         <p className="text-blue-100">
//           You're already subscribed to this plan. Would you like to explore other plans or keep your current subscription?
//         </p>
//       </div>
      
//       <div className="grid gap-4 mt-6">
//         <button
//           onClick={() => router.push('/pricing')}
//           className="w-full py-3 px-4 bg-gradient-to-r from-blue-500 to-purple-500 hover:from-blue-600 hover:to-purple-600 text-white rounded-lg transition-all flex items-center justify-center group"
//         >
//           <RefreshCw className="w-4 h-4 mr-2 group-hover:rotate-90 transition-transform duration-300" />
//           <span>Explore Different Plans</span>
//         </button>
        
//         <button
//           onClick={() => setShowSamePlanNotification(false)}
//           className="w-full py-3 px-4 bg-gray-700/70 hover:bg-gray-700 text-white rounded-lg transition-all flex items-center justify-center"
//         >
//           <Check className="w-4 h-4 mr-2" />
//           <span>Keep Current Plan</span>
//         </button>
//       </div>
//     </motion.div>
//   </div>
// )}

//             {/* Sidebar */}
//             <div className="space-y-6">
//               <div className="bg-gray-800/40 border border-gray-700 rounded-xl p-6 backdrop-blur-sm hover:border-blue-500/30 transition-colors duration-300">
//                 <h3 className="font-medium text-white mb-3">Need Help?</h3>
//                 <p className="text-gray-400 mb-4">
//                   Have questions about your subscription? Our support team is ready to assist you.
//                 </p>
//                 <a 
//                   href="/support"
//                   className="text-blue-400 hover:text-blue-300 transition-colors flex items-center group"
//                 >
//                   <span>Contact Support</span>
//                   <ArrowRight className="w-4 h-4 ml-1 group-hover:translate-x-1 transition-transform" />
//                 </a>
//               </div>
              
//               <div className="bg-gray-800/40 border border-gray-700 rounded-xl p-6 backdrop-blur-sm hover:border-yellow-500/30 transition-colors duration-300">
//                 <div className="flex items-start mb-4">
//                   <AlertTriangle className="w-5 h-5 text-yellow-500 mr-3 flex-shrink-0 mt-0.5" />
//                   <div>
//                     <h3 className="font-medium text-white mb-1">Cancellation Policy</h3>
//                     <p className="text-gray-400 text-sm">
//                       You can cancel your subscription at any time. Your subscription will remain active until the end of your current billing period.
//                     </p>
//                   </div>
//                 </div>
//                 <a 
//                   href="/faq#subscription"
//                   className="text-gray-400 hover:text-gray-300 text-sm transition-colors"
//                 >
//                   Learn more about our policies →
//                 </a>
//               </div>
//             </div>
//           </motion.div>
//         </div>
//       </div>
      
//       {/* Cancellation Modal */}
//       {showCancelModal && (
//         <div className="fixed inset-0 bg-gray-900/80 backdrop-blur-sm flex items-center justify-center p-4 z-50">
//           <motion.div 
//             className="bg-gray-800 border border-gray-700 rounded-xl max-w-md w-full p-6 shadow-2xl"
//             initial={{ opacity: 0, scale: 0.95 }}
//             animate={{ opacity: 1, scale: 1 }}
//             transition={{ duration: 0.3 }}
//           >
//             <div className="text-center mb-6">
//               <div className="w-12 h-12 rounded-full bg-red-500/20 flex items-center justify-center mx-auto mb-3">
//                 <AlertCircle className="w-6 h-6 text-red-400" />
//               </div>
//               <h3 className="text-xl font-bold text-white mb-2">Cancel Your Subscription</h3>
//               <p className="text-gray-300">Please choose how you'd like to cancel your subscription:</p>
//             </div>
            
//             {cancelError && (
//               <div className="mb-6 p-3 bg-red-500/20 border border-red-500/40 rounded-md text-red-200 text-sm">
//                 {cancelError}
//               </div>
//             )}
            
//             {cancelSuccess && (
//               <div className="mb-6 p-3 bg-green-500/20 border border-green-500/40 rounded-md text-green-200 text-sm">
//                 {cancelSuccess}
//               </div>
//             )}
            
//             <div className="space-y-4 mb-6">
//               <button
//                 onClick={() => setCancelType('end_of_cycle')}
//                 className={`w-full p-4 rounded-lg border text-left flex items-start ${
//                   cancelType === 'end_of_cycle' 
//                     ? 'bg-blue-500/20 border-blue-500/40' 
//                     : 'bg-gray-700/40 border-gray-600 hover:bg-gray-700/60'
//                 }`}
//               >
//                 <div className="flex-shrink-0 mr-3 mt-0.5">
//                   <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center ${
//                     cancelType === 'end_of_cycle' ? 'border-blue-400' : 'border-gray-400'
//                   }`}>
//                     {cancelType === 'end_of_cycle' && (
//                       <div className="w-2.5 h-2.5 bg-blue-400 rounded-full"></div>
//                     )}
//                   </div>
//                 </div>
//                 <div>
//                   <h4 className="font-medium text-white">Cancel at end of billing period</h4>
//                   <p className="text-gray-300 text-sm mt-1">
//                     Keep your access until {formatDate(mappedDetails.current_period_end)}. No refund will be issued.
//                   </p>
//                 </div>
//               </button>
              
//               <button
//                 onClick={() => setCancelType('immediate')}
//                 className={`w-full p-4 rounded-lg border text-left flex items-start ${
//                   cancelType === 'immediate' 
//                     ? 'bg-blue-500/20 border-blue-500/40' 
//                     : 'bg-gray-700/40 border-gray-600 hover:bg-gray-700/60'
//                 }`}
//               >
//                 <div className="flex-shrink-0 mr-3 mt-0.5">
//                   <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center ${
//                     cancelType === 'immediate' ? 'border-blue-400' : 'border-gray-400'
//                   }`}>
//                     {cancelType === 'immediate' && (
//                       <div className="w-2.5 h-2.5 bg-blue-400 rounded-full"></div>
//                     )}
//                   </div>
//                 </div>
//                 <div>
//                   <h4 className="font-medium text-white">Cancel immediately</h4>
//                   <p className="text-gray-300 text-sm mt-1">
//                     Lose access immediately. No refund will be issued for the current billing period.
//                   </p>
//                 </div>
//               </button>
//             </div>
            
//             <div className="flex space-x-3">
//               <button
//                 onClick={() => setShowCancelModal(false)}
//                 className="flex-1 py-2.5 px-4 bg-gray-700 hover:bg-gray-600 text-white rounded-lg transition-colors"
//               >
//                 Keep Subscription
//               </button>
              
//               <button
//                 onClick={() => handleCancelSubscription(cancelType === 'immediate')}
//                 disabled={cancelLoading}
//                 className={`flex-1 py-2.5 px-4 bg-red-600 hover:bg-red-500 text-white rounded-lg transition-colors flex items-center justify-center ${
//                   cancelLoading ? 'opacity-70 cursor-not-allowed' : ''
//                 }`}
//               >
//                 {cancelLoading ? (
//                   <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin mr-2"></div>
//                 ) : null}
//                 Confirm Cancellation
//               </button>
//             </div>
//           </motion.div>
//         </div>
//       )}

// // Add this component before the closing return statement, right before the cancelation modal

// {/* Plan Change Confirmation Modal */}
// {showPlanChangeModal && planChangeDetails && (
//   <div className="fixed inset-0 bg-gray-900/80 backdrop-blur-sm flex items-center justify-center p-4 z-50">
//     <motion.div 
//       className="bg-gradient-to-b from-blue-900/40 to-indigo-900/40 border border-blue-500/30 rounded-xl max-w-md w-full shadow-xl"
//       initial={{ opacity: 0, scale: 0.95 }}
//       animate={{ opacity: 1, scale: 1 }}
//       transition={{ duration: 0.3 }}
//     >
//       <div className="p-6 border-b border-gray-700">
//         <div className="flex justify-between items-start">
//           <h3 className="text-xl font-bold text-white">Change Subscription Plan</h3>
//           <button 
//             onClick={() => setShowPlanChangeModal(false)}
//             className="text-gray-400 hover:text-white transition-colors"
//           >
//             <X className="w-5 h-5" />
//           </button>
//         </div>
        
//         <p className="text-gray-300 mt-2">
//           Your plan will change at the end of your current billing period.
//         </p>
//       </div>
      
//       <div className="p-6">
//         <div className="space-y-4 mb-6">
//           <div className="flex items-center justify-between p-3 bg-gray-800/70 rounded-lg">
//             <div>
//               <p className="text-gray-400 text-sm">Current Plan</p>
//               <p className="text-white font-medium">{planChangeDetails.currentPlan}</p>
//             </div>
//             <div className="text-right">
//               <p className="text-gray-400 text-sm">Price</p>
//               <p className="text-white">
//                 {formatPrice(planChangeDetails.currentPrice, planChangeDetails.currency)}
//               </p>
//             </div>
//           </div>
          
//           <div className="flex justify-center">
//             <ArrowRight className="w-5 h-5 text-blue-400" />
//           </div>
          
//           <div className="flex items-center justify-between p-3 bg-blue-900/30 border border-blue-500/40 rounded-lg">
//             <div>
//               <p className="text-blue-300 text-sm">New Plan</p>
//               <p className="text-white font-medium">{planChangeDetails.newPlan}</p>
//             </div>
//             <div className="text-right">
//               <p className="text-blue-300 text-sm">Price</p>
//               <p className="text-white">
//                 {formatPrice(planChangeDetails.newPrice, planChangeDetails.currency)}
//               </p>
//             </div>
//           </div>
//         </div>
        
//         <div className="bg-gray-800/70 rounded-lg p-4 mb-6">
//           <div className="flex items-start">
//             <Calendar className="w-5 h-5 text-blue-400 mr-2 flex-shrink-0 mt-0.5" />
//             <div>
//               <p className="text-white font-medium">Effective Date</p>
//               <p className="text-gray-300 text-sm">
//                 Your new plan will start on {planChangeDetails.effectiveDate}
//               </p>
//             </div>
//           </div>
//         </div>
        
//         <div className="flex space-x-3">
//           <button
//             onClick={() => setShowPlanChangeModal(false)}
//             className="flex-1 py-2.5 px-4 bg-gray-700 hover:bg-gray-600 text-white rounded-lg transition-colors"
//           >
//             Cancel
//           </button>
          
//           <button
//             onClick={handleConfirmPlanChange}
//             disabled={planChangeLoading}
//             className={`flex-1 py-2.5 px-4 bg-gradient-to-r from-blue-500 to-purple-500 hover:from-blue-600 hover:to-purple-600 text-white rounded-lg transition-colors flex items-center justify-center ${
//               planChangeLoading ? 'opacity-70 cursor-not-allowed' : ''
//             }`}
//           >
//             {planChangeLoading ? (
//               <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin mr-2"></div>
//             ) : null}
//             Confirm Change
//           </button>
//         </div>
//       </div>
//     </motion.div>
//   </div>
// )}

      
//       {/* CSS animations */}
//       <style jsx global>{`
//         @keyframes aurora-x {
//           0%, 100% { transform: translateX(0) rotate(0); opacity: 0.8; }
//           50% { transform: translateX(30px) rotate(5deg); opacity: 1; }
//         }
        
//         @keyframes aurora-y {
//           0%, 100% { transform: translateY(0) rotate(0); opacity: 0.7; }
//           50% { transform: translateY(30px) rotate(-5deg); opacity: 1; }
//         }
        
//         @keyframes aurora-pulse {
//           0%, 100% { opacity: 0.3; transform: scale(1); }
//           50% { opacity: 0.5; transform: scale(1.1); }
//         }
//       `}</style>
      
//       <Footer />
//     </div>
//   );
// };

// export default SubscriptionPage;

'use client';

import { useState, useEffect, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import Cookies from 'js-cookie';
import { motion } from 'framer-motion';
import { 
  ArrowRight, Calendar, Check, CreditCard, Shield, AlertTriangle, 
  RefreshCw, Package, Sparkles, Zap, Wallet, X, AlertCircle 
} from 'lucide-react';
import Header from '@/components/Header/header';
import Footer from '@/components/Footer/footer';
import { getStoredToken } from '@/lib/auth-utils';
import { authenticatedFetch } from '@/lib/api-utils';
import { getUserFromCookie } from '@/lib/cookie-utils';

interface SubscriptionDetails {
  plan_name: string;
  plan_description?: string;
  status: string;
  current_period_end: string;
  end_date?: string;
  price: number;
  currency: string;
  billing_cycle: string;
  features?: string[];
  payment_method?: {
    type: string;
    last4?: string;
    expiry?: string;
  };
}

interface SubscriptionStatus {
  has_subscription: boolean;
  subscription_details?: any; // Changed to any to accommodate the actual API response
}

interface CreditPurchase {
  quantity: number;
  unitPrice: number;
  discount: number;
  totalPrice: string;
}

interface SelectedPlanInfo {
  id: string;
  cycle: string;
  creditPurchase?: CreditPurchase;
}

const SubscriptionLoading = () => {
  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-950 via-gray-900 to-gray-950 flex items-center justify-center">
      <div className="animate-pulse flex flex-col items-center">
        <div className="w-12 h-12 border-4 border-blue-500 border-t-transparent rounded-full animate-spin mb-4"></div>
        <p className="text-gray-400">Loading subscription details...</p>
      </div>
    </div>
  );
};

const SubscriptionContent = () => {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [subscription, setSubscription] = useState<SubscriptionStatus | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showSuccessMessage, setShowSuccessMessage] = useState(false);
  const [selectedPlanInfo, setSelectedPlanInfo] = useState<SelectedPlanInfo | null>(null);
  const [showCancelModal, setShowCancelModal] = useState(false);
  const [cancelType, setCancelType] = useState<'end_of_cycle' | 'immediate'>('end_of_cycle');
  const [cancelLoading, setCancelLoading] = useState(false);
  const [cancelError, setCancelError] = useState<string | null>(null);
  const [cancelSuccess, setCancelSuccess] = useState<string | null>(null);
  const [changingPlan, setChangingPlan] = useState<boolean>(false);
  const [showSamePlanNotification, setShowSamePlanNotification] = useState<boolean>(false);
  const [cancelPlanChangeLoading, setCancelPlanChangeLoading] = useState(false);


  const [showPlanChangeModal, setShowPlanChangeModal] = useState<boolean>(false);
  const [planChangeDetails, setPlanChangeDetails] = useState<{
    currentPlan: string;
    newPlan: string;
    currentPrice: number;
    newPrice: number;
    currency: string;
    effectiveDate: string;
  } | null>(null);
  const [planChangeLoading, setPlanChangeLoading] = useState<boolean>(false);

  useEffect(() => {
    // Check if user is logged in
    // const storedUser = Cookies.get('user');
    // if (!storedUser) {
    //   router.push('/signin');
    //   return;
    // }
    const userData = getUserFromCookie();
    if (!userData) {
      router.push('/signin');
      return;
    }
    // Check for error messages in URL params
    const errorParam = searchParams?.get('error');
    if (errorParam === 'active_subscription') {
      setError('You already have an active subscription. You can change your plan at the end of your billing period.');
    }
  
    // Check for success message from URL params
    if (searchParams.get('status') === 'success') {
      setShowSuccessMessage(true);
      // Clear the status param after 5 seconds
      setTimeout(() => {
        setShowSuccessMessage(false);
        const newUrl = window.location.pathname;
        window.history.replaceState({}, '', newUrl);
      }, 5000);
    } else if (searchParams.get('status') === 'plan_change_scheduled') {
      setShowSuccessMessage(true);
      // Clear the status param after 5 seconds
      setTimeout(() => {
        setShowSuccessMessage(false);
        const newUrl = window.location.pathname;
        window.history.replaceState({}, '', newUrl);
      }, 5000);
    }
  
    // Check if a plan was selected (in sessionStorage)
    const selectedPlanId = sessionStorage.getItem('selectedPlanId');
    const billingCycle = sessionStorage.getItem('billingCycle');
    const creditPurchaseStr = sessionStorage.getItem('creditPurchase');
    const isChangingPlan = sessionStorage.getItem('isChangingPlan') === 'true';
    
    if (selectedPlanId) {
      // Check if this is a credit purchase
      if (creditPurchaseStr) {
        try {
          const creditPurchase = JSON.parse(creditPurchaseStr);
          setSelectedPlanInfo({
            id: selectedPlanId,
            cycle: 'credit',
            creditPurchase: creditPurchase
          });
        } catch (e) {
          setSelectedPlanInfo({
            id: selectedPlanId,
            cycle: 'credit'
          });
        }
      } else if (billingCycle) {
        // Regular subscription
        setSelectedPlanInfo({
          id: selectedPlanId,
          cycle: billingCycle
        });
      }
    }
  
    // Fetch subscription status
    const fetchSubscriptionStatus = async () => {
      try {
        setLoading(true);
        // const user = Cookies.get('user') ? JSON.parse(Cookies.get('user') || '{}') : null;
        // const idToken = user?.idToken || getStoredToken();
        const userData = getUserFromCookie();
        const idToken = userData?.idToken || getStoredToken();

        if (!idToken) {
          router.push('/signin');
          return;
        }

        const response = await authenticatedFetch(
          `${process.env.NEXT_PUBLIC_API_URL}/payments/subscription`
        );
        
        
        if (!response.ok) {
          throw new Error('Failed to fetch subscription details');
        }
        
        const data: SubscriptionStatus = await response.json();
        setSubscription(data);
        
        // If user already has an active subscription and selected a plan (not credit purchase)
        if (data.has_subscription && 
            data.subscription_details?.status === "active" && 
            selectedPlanId && 
            !creditPurchaseStr && 
            !isChangingPlan) {
          
          // Clear the selected plan data as they already have an active subscription
          sessionStorage.removeItem('selectedPlanId');
          sessionStorage.removeItem('billingCycle');
          
          // Show message that they already have an active subscription
          // setError("You already have an active subscription. You can change your plan at the end of the billing cycle.");
        }
        
// Handle plan change flow
if (isChangingPlan && data.has_subscription) {
  setChangingPlan(true);
  // If they have a selectedPlanId, it means they've already selected a new plan
  if (selectedPlanId) {
    try {
      // Get details of the new plan for comparison
      const planDetailsResponse = await authenticatedFetch(
        `${process.env.NEXT_PUBLIC_API_URL}/payments/plan/${selectedPlanId}`
      );
      
      if (!planDetailsResponse.ok) {
        throw new Error('Failed to get plan details');
      }
      
      const newPlanDetails = await planDetailsResponse.json();
      
      // Prepare comparison data for the modal
      const currentPlanName = data.subscription_details?.plan?.name || 'Current Plan';
      const currentPlanPrice = data.subscription_details?.amount_paid || 0;
      const newPlanName = newPlanDetails.name || 'New Plan';
      const newPlanPrice = newPlanDetails.amount || 0;
      const currency = data.subscription_details?.currency || 'USD';
      
      // Calculate next billing date
      const currentPeriodEnd = data.subscription_details?.end_date;
      const effectiveDate = currentPeriodEnd ? formatDate(currentPeriodEnd) : 'next billing cycle';
      
      // Show the confirmation modal with the plan change details
      setPlanChangeDetails({
        currentPlan: currentPlanName,
        newPlan: newPlanName,
        currentPrice: currentPlanPrice,
        newPrice: newPlanPrice,
        currency: currency,
        effectiveDate: effectiveDate
      });
      
      setShowPlanChangeModal(true);
      setChangingPlan(false);
      
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An unknown error occurred');
      setChangingPlan(false);
    }
  } else {
    // They're in "changing plan" mode but haven't selected one yet
    router.push('/pricing');
  }
}
      } catch (err) {
        setError(err instanceof Error ? err.message : 'An unknown error occurred');
      } finally {
        setLoading(false);
      }
    };
  
    fetchSubscriptionStatus();
  }, [router, searchParams]);

  const handleCancelPlanChange = async () => {
    try {
      setCancelPlanChangeLoading(true);
      const userData = getUserFromCookie();
      if (!userData) {
        throw new Error('User not logged in');
      }
      
      // const user = JSON.parse(storedUser);
      const response = await authenticatedFetch(
        `${process.env.NEXT_PUBLIC_API_URL}/payments/cancel-plan-change`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json'
          }
        }
      );
  
      const result = await response.json();
      
      if (result.success) {
        // Refresh the page to show updated subscription status
        window.location.reload();
      } else {
        setError(result.message || 'Failed to cancel plan change');
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An unknown error occurred');
    } finally {
      setCancelPlanChangeLoading(false);
    }
  };

const handleConfirmPlanChange = async () => {
  if (!selectedPlanInfo?.id) return;
  
  setPlanChangeLoading(true);
  
  try {
    // const storedUser = Cookies.get('user');
    const userData = getUserFromCookie();
    if (!userData) {
      throw new Error('User not logged in');
    }
    
    // const user = JSON.parse(storedUser);
    const response = await authenticatedFetch(
      `${process.env.NEXT_PUBLIC_API_URL}/payments/change-plan`,
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          plan_id: selectedPlanInfo.id
        })
      }
    );
    
    const result = await response.json();
    
    // Clear plan change flags and selections
    sessionStorage.removeItem('isChangingPlan');
    sessionStorage.removeItem('selectedPlanId');
    sessionStorage.removeItem('billingCycle');
    
    if (result.success) {
      // Show success message and refresh data
      setShowPlanChangeModal(false);
      router.push('/subscription?status=plan_change_scheduled');
    } else {
      // Handle errors
      if (result.message && result.message.includes('already subscribed to this plan')) {
        setShowSamePlanNotification(true);
      } else {
        setError(result.message || 'Failed to schedule plan change');
      }
      setShowPlanChangeModal(false);
    }
  } catch (err) {
    setError(err instanceof Error ? err.message : 'An unknown error occurred');
    setShowPlanChangeModal(false);
  } finally {
    setPlanChangeLoading(false);
  }
};

  // Handle subscription cancellation
  const handleCancelSubscription = async (immediate: boolean) => {
    setCancelLoading(true);
    setCancelError(null);
    setCancelSuccess(null);
    
    try {
      // const storedUser = Cookies.get('user');
      const userData = getUserFromCookie();
      if (!userData) {
        throw new Error('User not logged in');
      }
      
      // const user = JSON.parse(storedUser);
      const endpoint = immediate 
        ? `${process.env.NEXT_PUBLIC_API_URL}/payments/cancel-subscription-immediately`
        : `${process.env.NEXT_PUBLIC_API_URL}/payments/cancel-subscription`;
      
        const response = await authenticatedFetch(
          endpoint,
          {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json'
            }
          }
        );
      
      const result = await response.json();
      
      if (!result.success) {
        throw new Error(result.error || 'Failed to cancel subscription');
      }
      
      setCancelSuccess(result.message);
      
      // Refresh subscription details after a short delay
      setTimeout(() => {
        setShowCancelModal(false);
        
        // Refresh the page to update subscription status
        window.location.reload();
      }, 2000);
      
    } catch (err) {
      setCancelError(err instanceof Error ? err.message : 'An unknown error occurred');
    } finally {
      setCancelLoading(false);
    }
  };

  // Format date for display - Updated with robust error handling
  const formatDate = (dateString: string | undefined): string => {
    try {
      // Check if date string is valid
      if (!dateString) return 'N/A';
      
      // Try to parse the date - handle ISO strings or timestamps
      const date = new Date(dateString);
      
      // Check if the date is valid
      if (isNaN(date.getTime())) {
        return 'Invalid date';
      }
      
      return new Intl.DateTimeFormat('en-US', {
        year: 'numeric',
        month: 'long',
        day: 'numeric',
      }).format(date);
    } catch (error) {
      return 'Date error';
    }
  };

  // Format price
  const formatPrice = (amount: number, currency: string): string => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: currency,
      minimumFractionDigits: 0,
    }).format(amount / 100);
  };

  // Animation variants
  const fadeIn = {
    initial: { opacity: 0, y: 20 },
    animate: { opacity: 1, y: 0, transition: { duration: 0.5 } }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-gray-950 via-gray-900 to-gray-950 flex items-center justify-center">
        <div className="animate-pulse flex flex-col items-center">
          <div className="w-12 h-12 border-4 border-blue-500 border-t-transparent rounded-full animate-spin mb-4"></div>
          <p className="text-gray-400">Loading subscription details...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-gray-950 via-gray-900 to-gray-950">
        <Header />
        <div className="relative overflow-hidden">
          <div className="absolute -top-[500px] -left-[400px] w-[1000px] h-[1000px] bg-[radial-gradient(ellipse_at_center,hsla(217,100%,50%,0.12)_0%,transparent_70%)]" 
               style={{ animation: 'aurora-x 25s ease-in-out infinite' }} />
          <div className="absolute -top-[300px] -right-[300px] w-[800px] h-[800px] bg-[radial-gradient(ellipse_at_center,hsla(265,89%,60%,0.12)_0%,transparent_70%)]" 
               style={{ animation: 'aurora-y 20s ease-in-out infinite' }} />
          
          <div className="absolute inset-0 bg-[linear-gradient(rgba(59,130,246,0.05)_1px,transparent_1px),linear-gradient(90deg,rgba(59,130,246,0.05)_1px,transparent_1px)] bg-[size:40px_40px] [mask-image:radial-gradient(ellipse_at_center,black_20%,transparent_70%)]" />
        </div>
        
        <div className="container mx-auto px-4 py-32 relative z-10">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="max-w-md mx-auto bg-gradient-to-b from-red-900/30 to-red-800/20 border border-red-500/30 rounded-xl p-6 backdrop-blur-sm shadow-xl"
          >
            <div className="text-center mb-6">
              <AlertTriangle className="w-12 h-12 text-red-400 mx-auto mb-4" />
              <h2 className="text-xl font-bold text-white mb-2">Something went wrong</h2>
              <p className="text-red-200/80 mb-4">{error}</p>
            </div>
            <button 
              onClick={() => router.push('/pricing')}
              className="w-full py-3 px-4 rounded-lg font-medium transition-all flex items-center justify-center bg-gradient-to-r from-blue-500 to-purple-500 text-white hover:shadow-lg hover:shadow-blue-500/20"
            >
              View Pricing Plans
              <ArrowRight className="w-4 h-4 ml-2" />
            </button>
          </motion.div>
        </div>
        <Footer />
      </div>
    );
  }

  if (!subscription?.has_subscription) {
    // Check if user selected a plan from pricing page
    return (
      <div className="min-h-screen bg-gradient-to-b from-gray-950 via-gray-900 to-gray-950">
        <Header />
        
        <div className="relative overflow-hidden">
          <div className="absolute -top-[500px] -left-[400px] w-[1000px] h-[1000px] bg-[radial-gradient(ellipse_at_center,hsla(217,100%,50%,0.12)_0%,transparent_70%)]" 
               style={{ animation: 'aurora-x 25s ease-in-out infinite' }} />
          <div className="absolute -top-[300px] -right-[300px] w-[800px] h-[800px] bg-[radial-gradient(ellipse_at_center,hsla(265,89%,60%,0.12)_0%,transparent_70%)]" 
               style={{ animation: 'aurora-y 20s ease-in-out infinite' }} />
          <div className="absolute bottom-[20%] left-[10%] w-[600px] h-[600px] bg-[radial-gradient(ellipse_at_center,hsla(190,95%,50%,0.06)_0%,transparent_70%)]" 
               style={{ animation: 'aurora-pulse 30s ease infinite' }} />
          
          <div className="absolute inset-0 bg-[linear-gradient(rgba(59,130,246,0.05)_1px,transparent_1px),linear-gradient(90deg,rgba(59,130,246,0.05)_1px,transparent_1px)] bg-[size:40px_40px] [mask-image:radial-gradient(ellipse_at_center,black_20%,transparent_70%)]" />
        </div>
        
        <div className="container mx-auto px-4 pt-32 pb-16 relative z-10">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="max-w-xl mx-auto"
          >
            {selectedPlanInfo ? (
              // User has selected a plan, show checkout prompt
              <div className="bg-gradient-to-b from-blue-900/30 to-purple-900/30 border border-blue-500/40 rounded-xl overflow-hidden shadow-xl">
                <div className="p-8">
                  <div className="flex justify-center mb-6">
                    <div className="w-16 h-16 rounded-full bg-blue-500/20 flex items-center justify-center">
                      <Sparkles className="w-8 h-8 text-blue-400" />
                    </div>
                  </div>
                  
                  <h2 className="text-2xl font-bold text-white text-center mb-2">
                    Ready to Complete Your {selectedPlanInfo.cycle === 'credit' ? 'Purchase' : 'Subscription'}
                  </h2>
                  
                  <p className="text-gray-300 text-center mb-6">
                    {selectedPlanInfo.cycle === 'credit' 
                      ? "You're just one step away from adding credits to your account."
                      : "You've selected a plan and you're just one step away from unlocking premium features."}
                  </p>
                  
                  <div className="bg-gray-800/40 border border-gray-700 rounded-lg p-4 mb-8">
                    {selectedPlanInfo.cycle === 'credit' && selectedPlanInfo.creditPurchase ? (
                      <>
                        <div className="flex items-center justify-between mb-4">
                          <span className="text-gray-400">Selected Purchase:</span>
                          <span className="px-3 py-1 bg-blue-500/20 text-blue-400 rounded-full text-sm font-medium">
                            Credit Package
                          </span>
                        </div>
                        
                        <div className="space-y-2">
                          <div className="flex justify-between items-center">
                            <span className="text-gray-300">Quantity:</span>
                            <span className="text-white font-medium">{selectedPlanInfo.creditPurchase.quantity} credits</span>
                          </div>
                          
                          <div className="flex justify-between items-center">
                            <span className="text-gray-300">Unit Price:</span>
                            <span className="text-white">${selectedPlanInfo.creditPurchase.unitPrice.toFixed(2)}</span>
                          </div>
                          
                          {selectedPlanInfo.creditPurchase.discount > 0 && (
                            <div className="flex justify-between items-center">
                              <span className="text-gray-300">Discount:</span>
                              <span className="text-green-400">{selectedPlanInfo.creditPurchase.discount}% off</span>
                            </div>
                          )}
                          
                          <div className="flex justify-between items-center pt-2 border-t border-gray-700 mt-2">
                            <span className="text-gray-300 font-medium">Total:</span>
                            <span className="text-white font-medium">${selectedPlanInfo.creditPurchase.totalPrice}</span>
                          </div>
                        </div>
                      </>
                    ) : (
                      <>
                        <div className="flex items-center justify-between mb-4">
                          <span className="text-gray-400">Selected Plan:</span>
                          <span className="px-3 py-1 bg-blue-500/20 text-blue-400 rounded-full text-sm font-medium">
                            {selectedPlanInfo.cycle === 'yearly' ? 'Annual Billing' : 'Monthly Billing'}
                          </span>
                        </div>
                        
                        <div className="flex justify-between items-center">
                          <div className="flex items-center">
                            <Zap className="w-5 h-5 text-blue-400 mr-2" />
                            <span className="text-white">Premium Features</span>
                          </div>
                          <ArrowRight className="w-4 h-4 text-gray-500" />
                        </div>
                      </>
                    )}
                  </div>
                  
                  <div className="flex flex-col space-y-4">
                    <button 
                      onClick={() => router.push('/checkout')}
                      className="py-3 px-4 bg-gradient-to-r from-blue-500 to-purple-500 hover:from-blue-600 hover:to-purple-600 text-white rounded-lg font-medium transition-all flex items-center justify-center group"
                    >
                      <span>Continue to {selectedPlanInfo.cycle === 'credit' ? 'Payment' : 'Checkout'}</span>
                      <ArrowRight className="w-4 h-4 ml-2 group-hover:translate-x-1 transition-transform" />
                    </button>
                    
                    <button 
                      onClick={() => {
                        // Clear selected plan
                        sessionStorage.removeItem('selectedPlanId');
                        sessionStorage.removeItem('billingCycle');
                        sessionStorage.removeItem('creditPurchase');
                        setSelectedPlanInfo(null);
                        router.push('/pricing');
                      }}
                      className="py-3 px-4 bg-gray-800 hover:bg-gray-700 text-white rounded-lg font-medium transition-all flex items-center justify-center"
                    >
                      <RefreshCw className="w-4 h-4 mr-2" />
                      <span>Choose a Different {selectedPlanInfo.cycle === 'credit' ? 'Package' : 'Plan'}</span>
                    </button>
                  </div>
                </div>
                
                <div className="bg-gray-800/60 border-t border-gray-700 p-4">
                  <p className="text-gray-400 text-sm text-center">
                    {selectedPlanInfo.cycle === 'credit' 
                      ? "Credits will be added to your account immediately after payment"
                      : "Your card will only be charged after you complete checkout"}
                  </p>
                </div>
              </div>
            ) : (
              // No plan selected, show regular no subscription message
              <div className="bg-gray-800/40 backdrop-blur-sm border border-gray-700 rounded-xl p-8 text-center">
                <motion.div 
                  initial={{ scale: 0.9, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                  transition={{ duration: 0.5 }}
                >
                  <Package className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                </motion.div>
                
                <h2 className="text-2xl font-bold text-white mb-3">No Active Subscription</h2>
                
                <p className="text-gray-300 mb-8 max-w-md mx-auto">
                  You don't currently have an active subscription plan. Choose a plan to unlock premium features and enhance your experience.
                </p>
                
                <button 
                  onClick={() => router.push('/pricing')}
                  className="px-6 py-3 bg-gradient-to-r from-blue-500 to-purple-500 hover:from-blue-600 hover:to-purple-600 text-white rounded-lg font-medium transition-all flex items-center justify-center mx-auto group"
                >
                  <span>Explore Plans</span>
                  <ArrowRight className="w-4 h-4 ml-2 group-hover:translate-x-1 transition-transform" />
                </button>
              </div>
            )}
          </motion.div>
        </div>
      </div>
    );
  }

  // User has an active subscription - show subscription details
  const details = subscription.subscription_details!;
  
  // Map API response fields to the expected format
  const mappedDetails: SubscriptionDetails = {
    plan_name: details.plan?.name || 'Basic',
    plan_description: details.plan?.description || 'Premium features and capabilities',
    status: details.status || 'active',
    current_period_end: details.end_date || '',
    price: details.plan?.amount || details.amount_paid || 0,
    currency: details.currency || 'USD',
    billing_cycle: details.plan?.interval || 'monthly',
    features: details.plan?.features || [],
    payment_method: {
      type: 'card',
      last4: '****' // Limited payment info for security
    }
  };

  // Check if subscription is in cancellation requested state
  const isCancellationRequested = details.status === 'cancellation_requested';

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-950 via-gray-900 to-gray-950">
      <Header />
      
      <div className="relative overflow-hidden">
        {/* Dynamic aurora effects with subtle animations */}
        <div className="absolute -top-[500px] -left-[400px] w-[1000px] h-[1000px] bg-[radial-gradient(ellipse_at_center,hsla(217,100%,50%,0.12)_0%,transparent_70%)]" 
             style={{ animation: 'aurora-x 25s ease-in-out infinite' }} />
        <div className="absolute -top-[300px] -right-[300px] w-[800px] h-[800px] bg-[radial-gradient(ellipse_at_center,hsla(265,89%,60%,0.12)_0%,transparent_70%)]" 
             style={{ animation: 'aurora-y 20s ease-in-out infinite' }} />
        
        {/* Enhanced grid effect */}
        <div className="absolute inset-0 bg-[linear-gradient(rgba(59,130,246,0.05)_1px,transparent_1px),linear-gradient(90deg,rgba(59,130,246,0.05)_1px,transparent_1px)] bg-[size:40px_40px] [mask-image:radial-gradient(ellipse_at_center,black_20%,transparent_70%)]" />
      </div>
      
      {showSuccessMessage && (
        <motion.div
          initial={{ opacity: 0, y: -50 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="fixed top-20 left-0 right-0 mx-auto max-w-md z-50"
        >
          <div className="bg-green-600/80 backdrop-blur-sm text-white px-6 py-4 rounded-lg shadow-lg flex items-center">
            <Check className="w-5 h-5 mr-3" />
            <p>Subscription activated successfully! Thank you for your purchase.</p>
          </div>
        </motion.div>
      )}
      
      <div className="container mx-auto px-4 py-32 relative z-10">
        <div className="max-w-4xl mx-auto">
          <motion.h1 
            className="text-3xl md:text-4xl font-bold mb-8 text-white text-center bg-clip-text text-transparent bg-gradient-to-r from-blue-400 via-purple-400 to-teal-400"
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
          >
            Your Subscription
          </motion.h1>
          
          {isCancellationRequested && (
            <motion.div 
              className="mb-8 bg-yellow-500/20 border border-yellow-500/30 rounded-lg p-4 backdrop-blur-sm shadow-xl"
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.2 }}
            >
              <div className="flex items-center">
                <AlertTriangle className="w-5 h-5 text-yellow-400 mr-3 flex-shrink-0" />
                <p className="text-yellow-200">
                  Your subscription has been scheduled for cancellation and will end on {formatDate(mappedDetails.current_period_end)}. You'll continue to have access to all features until then.
                </p>
              </div>
            </motion.div>
          )}
          
          <motion.div 
            className="grid md:grid-cols-3 gap-8"
            variants={fadeIn}
            initial="initial"
            animate="animate"
          >
            {/* Subscription Summary */}
            <div className="md:col-span-2 bg-gradient-to-b from-blue-900/30 to-purple-900/30 border border-blue-500/30 rounded-xl p-6 backdrop-blur-sm shadow-xl">
              <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-6">
                <div>
                  <h2 className="text-2xl font-bold text-white mb-1">{mappedDetails.plan_name} Plan</h2>
                  <p className="text-gray-300">{mappedDetails.plan_description}</p>
                </div>
                <div className="mt-4 md:mt-0">
                  <span className={`px-3 py-1.5 rounded-full text-sm font-medium ${
                    mappedDetails.status === 'active' 
                      ? 'bg-green-500/20 text-green-400' 
                      : mappedDetails.status === 'trial' 
                        ? 'bg-blue-500/20 text-blue-400'
                        : mappedDetails.status === 'cancellation_requested'
                        ? 'bg-yellow-500/20 text-yellow-400'
                        : 'bg-yellow-500/20 text-yellow-400'
                  }`}>
                    {mappedDetails.status === 'active' 
                      ? 'Active' 
                      : mappedDetails.status === 'trial' 
                        ? 'Trial' 
                        : mappedDetails.status === 'cancellation_requested'
                        ? 'Ending soon'
                        : 'Grace Period'}
                  </span>
                </div>
              </div>

              {subscription.subscription_details?.scheduled_change && (
  <motion.div 
    className="md:col-span-3 bg-blue-900/30 border border-blue-500/30 rounded-xl p-6 backdrop-blur-sm shadow-xl mb-6"
    initial={{ opacity: 0, y: -10 }}
    animate={{ opacity: 1, y: 0 }}
    transition={{ duration: 0.5, delay: 0.2 }}
  >
    <div className="flex items-start">
      <Calendar className="w-6 h-6 text-blue-400 mr-3 flex-shrink-0" />
      <div className="flex-grow">
        <h3 className="text-lg font-medium text-white mb-2">Scheduled Plan Change</h3>
        <p className="text-blue-100">
          Your subscription will be upgraded to the{' '}
          <span className="font-medium text-white">
            {subscription.subscription_details.scheduled_change.plan_id
              .replace(/_/g, ' ')
              .replace(/^\w/, (c: string) => c.toUpperCase())}
          </span>
          {' '}plan on{' '}
          <span className="font-medium text-white">
            {formatDate(subscription.subscription_details.scheduled_change.effective_from)}
          </span>
        </p>
        <button 
          onClick={handleCancelPlanChange}
          disabled={cancelPlanChangeLoading}
          className="mt-4 text-sm text-blue-400 hover:text-blue-300 transition-colors flex items-center disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {cancelPlanChangeLoading ? (
            <>
              <div className="w-4 h-4 border-2 border-blue-400 border-t-transparent rounded-full animate-spin mr-2" />
              Canceling...
            </>
          ) : (
            <>
              <X className="w-4 h-4 mr-1" />
              Cancel scheduled change
            </>
          )}
        </button>
      </div>
    </div>
  </motion.div>
)}
              
              <div className="grid grid-cols-2 md:grid-cols-3 gap-6 mb-8">
                <div className="bg-gray-800/40 rounded-lg p-4 hover:bg-gray-800/60 transition-colors duration-300 group">
                  <p className="text-gray-400 text-sm mb-1 group-hover:text-gray-300 transition-colors">Billing Cycle</p>
                  <div className="flex items-center">
                    <Calendar className="w-4 h-4 text-blue-400 mr-2 group-hover:scale-110 transition-transform" />
                    <span className="text-white capitalize">{mappedDetails.billing_cycle}</span>
                  </div>
                </div>
                <div className="bg-gray-800/40 rounded-lg p-4 hover:bg-gray-800/60 transition-colors duration-300 group">
                  <p className="text-gray-400 text-sm mb-1 group-hover:text-gray-300 transition-colors">Next Billing</p>
                  <span className="text-white">
                    {mappedDetails.current_period_end ? formatDate(mappedDetails.current_period_end) : 'Not available'}
                  </span>
                </div>
                <div className="bg-gray-800/40 rounded-lg p-4 hover:bg-gray-800/60 transition-colors duration-300 group">
                  <p className="text-gray-400 text-sm mb-1 group-hover:text-gray-300 transition-colors">Price</p>
                  <span className="text-white">
                    {formatPrice(mappedDetails.price, mappedDetails.currency)}/{mappedDetails.billing_cycle === 'yearly' ? 'year' : 'month'}
                  </span>
                </div>
              </div>
              
              {/* Credit Information - if available */}
              {details.plan?.credits && (
                <div className="mb-8">
                  <h3 className="text-lg font-medium text-white mb-3">Plan Allowance</h3>
                  <div className="bg-gray-800/40 border border-gray-700 rounded-lg p-4 hover:border-blue-500/30 transition-colors duration-300">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="flex items-center">
                        <Zap className="w-5 h-5 text-blue-400 mr-3" />
                        <div>
                          <p className="text-white">{details.plan.credits} extensions per {mappedDetails.billing_cycle === 'yearly' ? 'year' : 'month'}</p>
                          <p className="text-gray-400 text-sm">Resets on {formatDate(mappedDetails.current_period_end)}</p>
                        </div>
                      </div>
                      {details.plan.follow_ups && (
                        <div className="flex items-center">
                          <RefreshCw className="w-5 h-5 text-purple-400 mr-3" />
                          <div>
                            <p className="text-white">{details.plan.follow_ups} follow-ups per extension</p>
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              )}
              
              {mappedDetails.payment_method && (
                <div className="mb-8">
                  <h3 className="text-lg font-medium text-white mb-3">Payment Method</h3>
                  <div className="bg-gray-800/40 border border-gray-700 rounded-lg p-4 flex items-center hover:border-blue-500/30 transition-colors duration-300">
                    <CreditCard className="w-5 h-5 text-gray-400 mr-3" />
                    <div>
                      <p className="text-white">
                        {mappedDetails.payment_method?.type === 'card' 
                          ? `Card ending in ${mappedDetails.payment_method?.last4 || '****'}` 
                          : 'Online Payment'}
                      </p>
                      {mappedDetails.payment_method?.expiry && (
                        <p className="text-gray-400 text-sm">Expires {mappedDetails.payment_method.expiry}</p>
                      )}
                    </div>
                  </div>
                </div>
              )}
              
              <div className="space-y-3 mb-8">
                <h3 className="text-lg font-medium text-white mb-3">Plan Features</h3>
                {mappedDetails.features && mappedDetails.features.length > 0 ? (
                mappedDetails.features.map((feature: string, i: number) => (
                  <div key={i} className="flex items-start group">
                                  <div className="mt-0.5">
                        <Check className="w-5 h-5 mr-2 text-green-500 flex-shrink-0 group-hover:scale-110 transition-transform" />
                      </div>
                      <span className="text-gray-300 group-hover:text-gray-200 transition-colors">{feature}</span>
                    </div>
                  ))
                ) : (
                  <p className="text-gray-400">No features listed for this plan.</p>
                )}
              </div>
              
              <div className="flex flex-col sm:flex-row gap-4">
                {!isCancellationRequested && (
                  <>
                    <button 
                      onClick={() => router.push('/pricing')}
                      className="px-4 py-2 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-500 hover:to-purple-500 text-white rounded-lg transition-all flex items-center justify-center group"
                    >
                      <RefreshCw className="w-4 h-4 mr-2 group-hover:rotate-180 transition-transform duration-500" />
                      <span>Change Plan</span>
                    </button>
                    <button 
                      onClick={() => setShowCancelModal(true)}
                      className="px-4 py-2 bg-gray-700 hover:bg-gray-600 text-white rounded-lg transition-colors flex items-center justify-center"
                    >
                      <X className="w-4 h-4 mr-2" />
                      <span>Cancel Subscription</span>
                    </button>
                  </>
                )}
                {isCancellationRequested && (
                  <button 
                    onClick={() => router.push('/pricing')}
                    className="px-4 py-2 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-500 hover:to-purple-500 text-white rounded-lg transition-all flex items-center justify-center group"
                  >
                    <Zap className="w-4 h-4 mr-2" />
                    <span>Renew Subscription</span>
                  </button>
                )}
              </div>
            </div>
            
            {/* Same Plan Notification */}
{showSamePlanNotification && (
  <div className="fixed inset-0 bg-gray-900/80 backdrop-blur-sm flex items-center justify-center p-4 z-50">
    <motion.div 
      className="bg-gradient-to-b from-blue-900/40 to-indigo-900/40 border border-blue-500/30 rounded-xl max-w-md w-full p-6 shadow-xl"
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.3 }}
    >
      <div className="text-center mb-6">
        <div className="w-16 h-16 rounded-full bg-blue-500/20 flex items-center justify-center mx-auto mb-4">
          <Check className="w-8 h-8 text-blue-400" />
        </div>
        <h3 className="text-xl font-bold text-white mb-2">You're Already Subscribed</h3>
        <p className="text-blue-100">
          You're already subscribed to this plan. Would you like to explore other plans or keep your current subscription?
        </p>
      </div>
      
      <div className="grid gap-4 mt-6">
        <button
          onClick={() => router.push('/pricing')}
          className="w-full py-3 px-4 bg-gradient-to-r from-blue-500 to-purple-500 hover:from-blue-600 hover:to-purple-600 text-white rounded-lg transition-all flex items-center justify-center group"
        >
          <RefreshCw className="w-4 h-4 mr-2 group-hover:rotate-90 transition-transform duration-300" />
          <span>Explore Different Plans</span>
        </button>
        
        <button
          onClick={() => setShowSamePlanNotification(false)}
          className="w-full py-3 px-4 bg-gray-700/70 hover:bg-gray-700 text-white rounded-lg transition-all flex items-center justify-center"
        >
          <Check className="w-4 h-4 mr-2" />
          <span>Keep Current Plan</span>
        </button>
      </div>
    </motion.div>
  </div>
)}

            {/* Sidebar */}
            <div className="space-y-6">
              <div className="bg-gray-800/40 border border-gray-700 rounded-xl p-6 backdrop-blur-sm hover:border-blue-500/30 transition-colors duration-300">
                <h3 className="font-medium text-white mb-3">Need Help?</h3>
                <p className="text-gray-400 mb-4">
                  Have questions about your subscription? Our support team is ready to assist you.
                </p>
                <a 
                  href="/support"
                  className="text-blue-400 hover:text-blue-300 transition-colors flex items-center group"
                >
                  <span>Contact Support</span>
                  <ArrowRight className="w-4 h-4 ml-1 group-hover:translate-x-1 transition-transform" />
                </a>
              </div>
              
              <div className="bg-gray-800/40 border border-gray-700 rounded-xl p-6 backdrop-blur-sm hover:border-yellow-500/30 transition-colors duration-300">
                <div className="flex items-start mb-4">
                  <AlertTriangle className="w-5 h-5 text-yellow-500 mr-3 flex-shrink-0 mt-0.5" />
                  <div>
                    <h3 className="font-medium text-white mb-1">Cancellation Policy</h3>
                    <p className="text-gray-400 text-sm">
                      You can cancel your subscription at any time. Your subscription will remain active until the end of your current billing period.
                    </p>
                  </div>
                </div>
                <a 
                  href="/faq#subscription"
                  className="text-gray-400 hover:text-gray-300 text-sm transition-colors"
                >
                  Learn more about our policies →
                </a>
              </div>
            </div>
          </motion.div>
        </div>
      </div>
      
      {/* Cancellation Modal */}
      {showCancelModal && (
        <div className="fixed inset-0 bg-gray-900/80 backdrop-blur-sm flex items-center justify-center p-4 z-50">
          <motion.div 
            className="bg-gray-800 border border-gray-700 rounded-xl max-w-md w-full p-6 shadow-2xl"
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.3 }}
          >
            <div className="text-center mb-6">
              <div className="w-12 h-12 rounded-full bg-red-500/20 flex items-center justify-center mx-auto mb-3">
                <AlertCircle className="w-6 h-6 text-red-400" />
              </div>
              <h3 className="text-xl font-bold text-white mb-2">Cancel Your Subscription</h3>
              <p className="text-gray-300">Please choose how you'd like to cancel your subscription:</p>
            </div>
            
            {cancelError && (
              <div className="mb-6 p-3 bg-red-500/20 border border-red-500/40 rounded-md text-red-200 text-sm">
                {cancelError}
              </div>
            )}
            
            {cancelSuccess && (
              <div className="mb-6 p-3 bg-green-500/20 border border-green-500/40 rounded-md text-green-200 text-sm">
                {cancelSuccess}
              </div>
            )}
            
            <div className="space-y-4 mb-6">
              <button
                onClick={() => setCancelType('end_of_cycle')}
                className={`w-full p-4 rounded-lg border text-left flex items-start ${
                  cancelType === 'end_of_cycle' 
                    ? 'bg-blue-500/20 border-blue-500/40' 
                    : 'bg-gray-700/40 border-gray-600 hover:bg-gray-700/60'
                }`}
              >
                <div className="flex-shrink-0 mr-3 mt-0.5">
                  <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center ${
                    cancelType === 'end_of_cycle' ? 'border-blue-400' : 'border-gray-400'
                  }`}>
                    {cancelType === 'end_of_cycle' && (
                      <div className="w-2.5 h-2.5 bg-blue-400 rounded-full"></div>
                    )}
                  </div>
                </div>
                <div>
                  <h4 className="font-medium text-white">Cancel at end of billing period</h4>
                  <p className="text-gray-300 text-sm mt-1">
                    Keep your access until {formatDate(mappedDetails.current_period_end)}. No refund will be issued.
                  </p>
                </div>
              </button>
              
              <button
                onClick={() => setCancelType('immediate')}
                className={`w-full p-4 rounded-lg border text-left flex items-start ${
                  cancelType === 'immediate' 
                    ? 'bg-blue-500/20 border-blue-500/40' 
                    : 'bg-gray-700/40 border-gray-600 hover:bg-gray-700/60'
                }`}
              >
                <div className="flex-shrink-0 mr-3 mt-0.5">
                  <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center ${
                    cancelType === 'immediate' ? 'border-blue-400' : 'border-gray-400'
                  }`}>
                    {cancelType === 'immediate' && (
                      <div className="w-2.5 h-2.5 bg-blue-400 rounded-full"></div>
                    )}
                  </div>
                </div>
                <div>
                  <h4 className="font-medium text-white">Cancel immediately</h4>
                  <p className="text-gray-300 text-sm mt-1">
                    Lose access immediately. No refund will be issued for the current billing period.
                  </p>
                </div>
              </button>
            </div>
            
            <div className="flex space-x-3">
              <button
                onClick={() => setShowCancelModal(false)}
                className="flex-1 py-2.5 px-4 bg-gray-700 hover:bg-gray-600 text-white rounded-lg transition-colors"
              >
                Keep Subscription
              </button>
              
              <button
                onClick={() => handleCancelSubscription(cancelType === 'immediate')}
                disabled={cancelLoading}
                className={`flex-1 py-2.5 px-4 bg-red-600 hover:bg-red-500 text-white rounded-lg transition-colors flex items-center justify-center ${
                  cancelLoading ? 'opacity-70 cursor-not-allowed' : ''
                }`}
              >
                {cancelLoading ? (
                  <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin mr-2"></div>
                ) : null}
                Confirm Cancellation
              </button>
            </div>
          </motion.div>
        </div>
      )}

// Add this component before the closing return statement, right before the cancelation modal

{/* Plan Change Confirmation Modal */}
{showPlanChangeModal && planChangeDetails && (
  <div className="fixed inset-0 bg-gray-900/80 backdrop-blur-sm flex items-center justify-center p-4 z-50">
    <motion.div 
      className="bg-gradient-to-b from-blue-900/40 to-indigo-900/40 border border-blue-500/30 rounded-xl max-w-md w-full shadow-xl"
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.3 }}
    >
      <div className="p-6 border-b border-gray-700">
        <div className="flex justify-between items-start">
          <h3 className="text-xl font-bold text-white">Change Subscription Plan</h3>
          <button 
            onClick={() => setShowPlanChangeModal(false)}
            className="text-gray-400 hover:text-white transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>
        
        <p className="text-gray-300 mt-2">
          Your plan will change at the end of your current billing period.
        </p>
      </div>
      
      <div className="p-6">
        <div className="space-y-4 mb-6">
          <div className="flex items-center justify-between p-3 bg-gray-800/70 rounded-lg">
            <div>
              <p className="text-gray-400 text-sm">Current Plan</p>
              <p className="text-white font-medium">{planChangeDetails.currentPlan}</p>
            </div>
            <div className="text-right">
              <p className="text-gray-400 text-sm">Price</p>
              <p className="text-white">
                {formatPrice(planChangeDetails.currentPrice, planChangeDetails.currency)}
              </p>
            </div>
          </div>
          
          <div className="flex justify-center">
            <ArrowRight className="w-5 h-5 text-blue-400" />
          </div>
          
          <div className="flex items-center justify-between p-3 bg-blue-900/30 border border-blue-500/40 rounded-lg">
            <div>
              <p className="text-blue-300 text-sm">New Plan</p>
              <p className="text-white font-medium">{planChangeDetails.newPlan}</p>
            </div>
            <div className="text-right">
              <p className="text-blue-300 text-sm">Price</p>
              <p className="text-white">
                {formatPrice(planChangeDetails.newPrice, planChangeDetails.currency)}
              </p>
            </div>
          </div>
        </div>
        
        <div className="bg-gray-800/70 rounded-lg p-4 mb-6">
          <div className="flex items-start">
            <Calendar className="w-5 h-5 text-blue-400 mr-2 flex-shrink-0 mt-0.5" />
            <div>
              <p className="text-white font-medium">Effective Date</p>
              <p className="text-gray-300 text-sm">
                Your new plan will start on {planChangeDetails.effectiveDate}
              </p>
            </div>
          </div>
        </div>
        
        <div className="flex space-x-3">
          <button
            onClick={() => setShowPlanChangeModal(false)}
            className="flex-1 py-2.5 px-4 bg-gray-700 hover:bg-gray-600 text-white rounded-lg transition-colors"
          >
            Cancel
          </button>
          
          <button
            onClick={handleConfirmPlanChange}
            disabled={planChangeLoading}
            className={`flex-1 py-2.5 px-4 bg-gradient-to-r from-blue-500 to-purple-500 hover:from-blue-600 hover:to-purple-600 text-white rounded-lg transition-colors flex items-center justify-center ${
              planChangeLoading ? 'opacity-70 cursor-not-allowed' : ''
            }`}
          >
            {planChangeLoading ? (
              <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin mr-2"></div>
            ) : null}
            Confirm Change
          </button>
        </div>
      </div>
    </motion.div>
  </div>
)}

      
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
      `}</style>
      
      <Footer />
    </div>
  );
};

const SubscriptionPage = () => {
  return (
    <Suspense fallback={<SubscriptionLoading />}>
      <SubscriptionContent />
    </Suspense>
  );
};

export default SubscriptionPage;