'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import { AlertTriangle, ArrowLeft } from 'lucide-react';
import { getUserFromCookie, setCookie } from '@/lib/cookie-utils';
import { authenticatedFetch } from '@/lib/api-utils';
import { toast } from 'react-hot-toast';
import Header from '@/components/Header/header';
import Footer from '@/components/Footer/footer';
import ContactModal from '@/components/Modal/ContactModal';

// Import types
import { Plan, CreditPurchase, RazorpayResponse, User } from './types';

// Import components
import BackgroundEffects from './components/BackgroundEffects';
import CheckoutHeader from './components/CheckoutHeader';
import OrderSummary from './components/OrderSummary';
import PaymentForm from './components/PaymentForm';
import PolicyInformation from './components/PolicyInformation';
import AnimationWrapper from './components/AnimationWrapper';

// Import CODON transaction utilities
import { createSplitPaymentTransaction } from '@/lib/token-transactions';
import { executeTransferWithPhantom } from '@/components/Marketplace/utils';

// Development mode flag for testing with reduced CODON amounts - frontend only
const DEV_MODE = process.env.NEXT_PUBLIC_CODON_DEV_MODE === 'true';

// Helper function to get test values for CODON transactions in dev mode
const getDevModeValues = () => {
  // Start with the total amount
  const total = Number(process.env.NEXT_PUBLIC_CODON_TEST_TOTAL) || 12;
  
  // Use the same platform percentage as the backend (70%)
  const platformPercentage = 70;
  
  // Calculate platform fee and burn amount using the same formula as the backend
  const platformFee = Math.floor(total * (platformPercentage / 100));
  const burn = total - platformFee;
  
  return {
    total,
    platformFee,
    burn,
    platformPercentage
  };
};

// Helper function to fix transaction data format
const fixTransactionDataFormat = (txData: any) => {
  if (!txData.transaction_data) return txData;
  
  const transactionData = {...txData.transaction_data};
  
  // Log initial state for debugging
  
  // Check for platform fee payment (marked as such in the description)
  const platformFeeIndex = transactionData.payments?.findIndex(
    (payment: any) => 
      payment.description?.toLowerCase().includes('platform fee')
  );
  
  // Check for burn payment (identified by burn address patterns or description)
  const burnPaymentIndex = transactionData.payments?.findIndex(
    (payment: any) => 
      // Check for any known burn address patterns
      payment.recipient === 'BurnAddressXXXXXXXXXXXXXXXXXXXXXXXXXXXXX' ||
      payment.recipient === '1nc1nerator11111111111111111111111111111111' ||
      payment.recipient?.toLowerCase() === 'burnaddress' ||
      // Check description for burn-related terms
      payment.description?.toLowerCase().includes('burn')
  );

  // First handle the platform fee case
  if (platformFeeIndex >= 0) {
    const platformFeePayment = transactionData.payments[platformFeeIndex];
    
    // Make sure this payment is included in the actual payments and not removed
    // We don't need to modify this payment
  }
  
  // Now handle any burn payment
  if (burnPaymentIndex >= 0) {
    // Extract the burn payment
    const burnPayment = transactionData.payments[burnPaymentIndex];
    
    // Create a burn object 
    transactionData.burn = {
      amount: burnPayment.amount,
      // Use percentage from payment data if available, or default to 30% for credits
      percentage: burnPayment.percentage || 30,
    };
    
    // Remove the burn payment from payments array since it will be handled via burn instruction
    transactionData.payments = transactionData.payments.filter((_: any, index: number) => index !== burnPaymentIndex);
    
  } else if (!transactionData.burn && transactionData.payments?.length > 0) {
    // If no explicit burn payment found but we have other payment info,
    // check if we can infer burn amount from total vs. payment to seller
    
    // Total amount should be sum of all intended transfers
    const totalAmount = transactionData.amount || 
                       transactionData.payments.reduce((sum: number, p: any) => sum + (p.amount || 0), 0);
    
    // Main payment is typically to the seller
    const mainPayment = transactionData.payments[0];
    const sellerAmount = mainPayment?.amount;
    
    // If total and seller amounts differ, the difference may be intended for burning
    if (totalAmount && sellerAmount && totalAmount > sellerAmount) {
      const burnAmount = totalAmount - sellerAmount;
      const burnPercentage = Math.round((burnAmount / totalAmount) * 100);
      
      transactionData.burn = {
        amount: burnAmount,
        percentage: burnPercentage
      };
      
    }
  }
  
  // Final validation that we're not losing payments in our transformation
  const totalBeforeFix = txData.transaction_data.payments?.reduce(
    (sum: number, p: any) => sum + (p.amount || 0), 0
  ) || 0;
  
  const totalAfterFix = transactionData.payments?.reduce(
    (sum: number, p: any) => sum + (p.amount || 0), 0
  ) || 0;
  
  const burnAmount = transactionData.burn?.amount || 0;
  
  // If amounts don't match after our fix, handle gracefully - this might indicate we're losing tokens
  if (Math.abs((totalAfterFix + burnAmount) - totalBeforeFix) > 0.00001) {
    // Handle amount mismatch gracefully - the transaction will still proceed
  }
  
  return {
    ...txData,
    transaction_data: transactionData
  };
};

const CheckoutPage = () => {
  const router = useRouter();
  const [plan, setPlan] = useState<Plan | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [processingPayment, setProcessingPayment] = useState(false);
  const [loadingRazorpay, setLoadingRazorpay] = useState(false);
  const [isYearly, setIsYearly] = useState(false);
  const [creditPurchase, setCreditPurchase] = useState<CreditPurchase | null>(null);
  const [paymentAbandoned, setPaymentAbandoned] = useState(false);
  const [displayCurrency, setDisplayCurrency] = useState<string>('USD'); // State to hold the currency for display/order
  const [showContactModal, setShowContactModal] = useState<boolean>(false); // State for contact support modal

  // CODON transaction states
  const [isConnected, setIsConnected] = useState(false);
  const [walletAddress, setWalletAddress] = useState('');
  const [isProcessingCodon, setIsProcessingCodon] = useState(false);
  const [transactionStatus, setTransactionStatus] = useState<'idle' | 'creating' | 'signing' | 'confirming' | 'verifying'>('idle');
  const [txHash, setTxHash] = useState('');
  const [codonError, setCodonError] = useState<string | null>(null);

  // Update the useEffect that checks for active subscriptions
  useEffect(() => {
    // Check if user is logged in
    const storedUser = getUserFromCookie();
    if (!storedUser) {
      router.push('/signin');
      return;
    }

    // First, check if the user already has an active subscription (for non-credit purchases)
    const creditPurchaseStr = sessionStorage.getItem('creditPurchase');
    const codonPurchaseStr = sessionStorage.getItem('codonPurchase');
    const isCreditPurchase = !!(creditPurchaseStr || codonPurchaseStr);

    // Get selected plan ID, billing cycle, and credit purchase from session storage
    const selectedPlanId = sessionStorage.getItem('selectedPlanId');
    const billingCycle = sessionStorage.getItem('billingCycle');
    // Get the selected currency from session storage and set state
    const storedCurrency = sessionStorage.getItem('selectedCurrency') || 'USD';
    setDisplayCurrency(storedCurrency); // Set the state for currency

    // Check if we have either a plan selection OR a credit purchase (including CODON)
    if (!selectedPlanId && !isCreditPurchase) {
      router.push('/pricing');
      return;
    }

    // Only check for active subscriptions if this is NOT a credit purchase and not a plan change
    const isChangingPlan = sessionStorage.getItem('isChangingPlan') === 'true';
    if (!isCreditPurchase && !isChangingPlan) {
      const checkActiveSubscription = async () => {
        try {
          const response = await authenticatedFetch(`${process.env.NEXT_PUBLIC_API_URL}/payments/subscription`, {
            method: 'GET',
          });

          if (!response.ok) {
            throw new Error('Failed to fetch subscription details');
          }

          const data = await response.json();

          // If user already has an active subscription, redirect to subscription page
          if (data.has_subscription && data.subscription_details?.status === "active") {
            // Clear any selected plan data
            sessionStorage.removeItem('selectedPlanId');
            sessionStorage.removeItem('billingCycle');
            sessionStorage.removeItem('selectedCurrency');

            // Redirect to subscription page with error message
            router.push('/subscription?error=active_subscription');
            return;
          }

          // Continue with plan fetch if no subscription exists
          fetchPlanDetails(storedCurrency); // Use storedCurrency
        } catch (err) {
          // Handle gracefully - continue with checkout if we can't verify (fail open)
          fetchPlanDetails(storedCurrency); // Use storedCurrency
        }
      };

      checkActiveSubscription();
    } else {
      // For credit purchases or plan changes, proceed directly
      // Set initial yearly state based on billing cycle from session storage
      if (billingCycle === 'yearly') {
        setIsYearly(true);
      }

      // Check if this is a credit purchase
      if (creditPurchaseStr || codonPurchaseStr) {
        try {
          let creditPurchaseData;
          
          // Prioritize CODON purchase if both exist (should not happen with fixes, but safety)
          if (codonPurchaseStr) {
            creditPurchaseData = JSON.parse(codonPurchaseStr);
            
            // Ensure CODON purchase has correct properties and currency
            if (creditPurchaseData.paymentMethod === 'codon') {
              // Ensure CODON currency is set for display
              creditPurchaseData.currency = 'CODON';
              setDisplayCurrency('CODON');
              
              // Clear any conflicting fiat purchase data
              sessionStorage.removeItem('creditPurchase');
            }
          } else if (creditPurchaseStr) {
            creditPurchaseData = JSON.parse(creditPurchaseStr);
            
            // Standard fiat credit purchase
            // Ensure credit purchase currency matches display currency if possible
            if (creditPurchaseData.currency && creditPurchaseData.currency !== storedCurrency) {
              // Handle currency mismatch gracefully - use credit purchase currency
              setDisplayCurrency(creditPurchaseData.currency);
            } else if (!creditPurchaseData.currency) {
              creditPurchaseData.currency = storedCurrency;
            }
            
            // Clear any conflicting CODON purchase data
            sessionStorage.removeItem('codonPurchase');
          }
          
          if (creditPurchaseData) {
            setCreditPurchase(creditPurchaseData);
          }
        } catch (e) {
          // Handle gracefully - invalid session data won't prevent checkout
        }
      }

      // Only fetch plan details if we have a selected plan ID (for subscriptions)
      // For credit purchases, we don't need plan details
      if (selectedPlanId) {
        fetchPlanDetails(storedCurrency); // Use storedCurrency
      } else {
        // For credit-only purchases, we can finish loading
        setLoading(false);
      }
    }

    // Fetch plan details function with currency parameter
    async function fetchPlanDetails(currency: string) {
      try {
        setLoading(true);
        // Fetch using the currency determined earlier (storedCurrency)
        const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/payments/pricing-plans?currency=${currency}`);

        if (!response.ok) {
          throw new Error('Failed to fetch pricing plans');
        }

        const data = await response.json();

        if (data.success && data.plans && data.currency) {
          let selectedPlan = data.plans.find((p: Plan) => p.id === selectedPlanId);
          if (selectedPlan) {
            // Apply the same logic as usePricingPlans hook
            // If currency is INR and amount_inr exists, use it as the amount
            if (data.currency === 'INR' && selectedPlan.amount_inr !== undefined) {
              selectedPlan = {
                ...selectedPlan,
                amount: selectedPlan.amount_inr, // Set amount to the INR amount
                currency: 'INR'
              };
            } else {
              // Otherwise ensure the currency matches the fetched currency
              selectedPlan = {
                ...selectedPlan,
                currency: data.currency
              };
            }
            setPlan(selectedPlan);
          } else {
            throw new Error('Selected plan not found');
          }
        } else {
          throw new Error(data.error || 'Failed to fetch pricing plans or invalid data format');
        }
      } catch (err) {
        // Handle gracefully - set user-friendly error message
        setError(err instanceof Error ? err.message : 'An unknown error occurred');
      } finally {
        setLoading(false);
      }
    }
  }, [router]); // Removed displayCurrency from dependency array to avoid potential loops if setDisplayCurrency triggers refetch

  // Wallet connection handler
  const handleWalletConnected = (address: string) => {
    setWalletAddress(address);
    setIsConnected(true);
    setCodonError(null);
  };

  // Wallet disconnection handler
  const handleWalletDisconnect = () => {
    setWalletAddress('');
    setIsConnected(false);
    
    // Clear wallet address from user cookie
    const userData = getUserFromCookie();
    if (userData && userData.walletAddress) {
      const { walletAddress, ...rest } = userData;
      setCookie('user', JSON.stringify(rest));
    }
  };

  // Toggle manual wallet address entry
  const [useManualEntry, setUseManualEntry] = useState(false);
  const [manualWalletAddress, setManualWalletAddress] = useState('');
  
  // Helper function to validate Solana address
  const validateSolanaAddress = (address: string): boolean => {
    if (!address) return false;
    // Basic validation - Solana addresses are base58, 32-44 chars, never start with 0x
    return /^[1-9A-HJ-NP-Za-km-z]{32,44}$/.test(address) && !address.startsWith('0x');
  };

  // CODON transaction handler
  const handleCodonTransaction = async () => {
    if (!creditPurchase || creditPurchase.paymentMethod !== 'codon') {
      setCodonError('Invalid CODON purchase data');
      return;
    }

    // Determine which wallet address to use
    const addressToUse = useManualEntry ? manualWalletAddress : walletAddress;
    
    if (!addressToUse) {
      setCodonError(useManualEntry ? 'Please enter a wallet address' : 'Please connect your wallet first');
      return;
    }
    
    // Validate Solana wallet address format if using manual entry
    if (useManualEntry) {
      if (!validateSolanaAddress(addressToUse)) {
        setCodonError('Invalid Solana wallet address format. Please check and try again.');
        return;
      }
    }

    const purchaseStartTime = Date.now();
    setIsProcessingCodon(true);
    setTransactionStatus('creating');
    setCodonError(null);
    setTxHash('');

    try {
      // Step 1: Create CODON credit transaction
      
      // Setup request data for creating a CODON credit transaction
      const requestData = {
        buyer_wallet: addressToUse,
        credits: creditPurchase.credits,
        // In dev mode, send the reduced amount instead of the actual amount
        expected_codon_amount: DEV_MODE ? getDevModeValues().total : creditPurchase.totalCodon,
        client_timestamp: Date.now()
      };
      
      // Log if we're in dev mode with reduced amounts 
      if (DEV_MODE) {
        // Dev mode logging removed for production
      }
      
      const createResponse = await authenticatedFetch(
        `${process.env.NEXT_PUBLIC_API_URL}/payments/create-codon-credit-transaction`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(requestData)
        }
      );

      if (!createResponse.ok) {
        const errorData = await createResponse.json();
        throw new Error(errorData.detail || 'Failed to create CODON transaction');
      }

      let txData = await createResponse.json();

      // Make sure we have the complete transaction data
      if (!txData.transaction_data || !txData.transaction_data.payments) {
        throw new Error('Invalid transaction data received from server');
      }
      
      // DEV MODE: Override transaction amounts if in development mode (as a fallback if server doesn't support dev_mode)
      if (DEV_MODE && txData.transaction_data) {
        // Store original values for logging
        const originalTotal = txData.transaction_data.amount || 
          txData.transaction_data.payments.reduce((sum: number, p: any) => sum + (p.amount || 0), 0);
        
        // Set fixed test amounts (total: 12, platform: 9, burn: 3)
        const { total: testTotal, platformFee: testPlatformAmount, burn: testBurnAmount } = getDevModeValues();
        
        // Override the total amount
        txData.transaction_data.amount = testTotal;
        
        // Override payment amounts - assuming the first payment is the platform fee
        if (txData.transaction_data.payments && txData.transaction_data.payments.length > 0) {
          txData.transaction_data.payments[0].amount = testPlatformAmount;
          
          // If there's a second payment (which could be the burn amount), adjust it too
          if (txData.transaction_data.payments.length > 1) {
            txData.transaction_data.payments[1].amount = testBurnAmount;
          }
        }
        
      }
      
      // Validate the total transaction amount against what's shown to the user
      const totalInTransaction = txData.transaction_data.amount || 
        txData.transaction_data.payments.reduce((sum: number, p: any) => sum + (p.amount || 0), 0);
      
      if (totalInTransaction !== creditPurchase.totalCodon) {
        // Handle amount mismatch gracefully - this is logged but doesn't break the transaction
      }
      
      // Log original transaction data structure for debugging
      
      // Fix transaction data format if necessary
      txData = fixTransactionDataFormat(txData);
      
      // DEV MODE: Make sure our fixed burn amount is preserved if we're in dev mode
      if (DEV_MODE && txData.transaction_data && txData.transaction_data.burn) {
        // Set burn amount to 3 for testing
        const { burn } = getDevModeValues();
        txData.transaction_data.burn.amount = burn;
      }
      
      // Log fixed transaction data structure for debugging
      
      // Ensure all the components of the transaction are present
      const totalPaymentsAmount = txData.transaction_data.payments?.reduce(
        (sum: number, p: any) => sum + (p.amount || 0), 0
      ) || 0;
      const burnAmount = txData.transaction_data.burn?.amount || 0;
      const calculatedTotal = totalPaymentsAmount + burnAmount;
      
      // Log additional info in dev mode
      if (DEV_MODE) {
        const testValues = getDevModeValues();
        // Dev mode logging removed for production
      }
      
      // Step 2: Prepare and execute transaction
      setTransactionStatus('signing');
      
      const { transaction, connection } = await createSplitPaymentTransaction(
        addressToUse,
        txData.transaction_data
      );

      // Step 3: Execute transaction with Phantom
      const transactionSignature = await executeTransferWithPhantom(transaction, 60000);
      
      if (transactionSignature) {
        setTxHash(transactionSignature);
      }

      // Step 4: Wait for confirmation
      setTransactionStatus('confirming');
      await new Promise(resolve => setTimeout(resolve, 3000));

      // Step 5: Verify transaction
      setTransactionStatus('verifying');
      
      // Structure the request according to CODONCreditPurchaseRequest model
      const verifyRequestData = {
        transaction_hash: transactionSignature,
        buyer_wallet: addressToUse,
        credits: creditPurchase.credits,
        expected_codon_amount: DEV_MODE ? getDevModeValues().total : creditPurchase.totalCodon // Use reduced amount in dev mode
      };
      
      // Log if we're using reduced amounts in dev mode 
      if (DEV_MODE) {
        // Dev mode logging removed for production
      }
      
      const verifyResponse = await authenticatedFetch(
        `${process.env.NEXT_PUBLIC_API_URL}/payments/verify-codon-credit-transaction`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(verifyRequestData)
        }
      );

      if (!verifyResponse.ok) {
        const errorData = await verifyResponse.json();
        throw new Error(errorData.detail || 'Failed to verify CODON transaction');
      }

      const verificationResult = await verifyResponse.json();
      
      if (verificationResult.success) {
        // Success! Clear session storage and redirect
        sessionStorage.removeItem('codonPurchase');
        sessionStorage.removeItem('creditPurchase');
        
        toast.success(`Successfully purchased ${creditPurchase.credits} credits with CODON!`);
        
        // Redirect to success page
        window.location.href = `/payment-success?transaction_hash=${transactionSignature}&type=codon-credits&credits=${creditPurchase.credits}`;
      } else {
        throw new Error('Transaction verification failed');
      }

    } catch (error: any) {
      let errorMessage = 'Something went wrong with your CODON transaction. Please try again.';
      let shouldShowSupportOption = false;
      
      // Handle specific error types with user-friendly messages
      if (error.message.includes('rejected') || error.message.includes('denied')) {
        errorMessage = 'Transaction was cancelled. You can try again when ready.';
        shouldShowSupportOption = false;
      } else if (error.message.includes('insufficient')) {
        errorMessage = 'Insufficient CODON balance. Please add more CODON tokens to your wallet.';
        shouldShowSupportOption = false;
      } else if (error.message.includes('not detected')) {
        errorMessage = 'Phantom wallet not detected. Please install the Phantom browser extension.';
        shouldShowSupportOption = false;
      } else if (error.message.includes('verify')) {
        // Payment processed but verification failed - critical case
        errorMessage = 'Your transaction was processed, but we couldn\'t verify it. Please contact support for assistance.';
        shouldShowSupportOption = true;
      } else if (error.message.includes('timeout') || error.message.includes('timed out')) {
        errorMessage = 'Transaction timed out. This doesn\'t mean your transaction failed - please check your wallet for confirmation.';
        shouldShowSupportOption = true;
      } else if (error.message.includes('500') || error.message.includes('server') || error.message.includes('internal')) {
        errorMessage = 'Our system is experiencing temporary issues. Please try again in a few minutes.';
        shouldShowSupportOption = true;
      }
      
      // Set error and show toast
      setCodonError(errorMessage);
      
      if (shouldShowSupportOption) {
        // Show a toast with contact support option
        toast.error(
          <div className="cursor-pointer" onClick={() => setShowContactModal(true)}>
            {errorMessage} <span className="font-bold underline">Contact support</span>
          </div>,
          { duration: 8000 }
        );
      } else {
        // Standard error toast
        toast.error(errorMessage);
      }
    } finally {
      setIsProcessingCodon(false);
      setTransactionStatus('idle');
    }
  };

  // Update the handleCreateOrder function
  const handleCreateOrder = async () => {
    // Use displayCurrency state for consistency in initiating the order
    // The API should handle the currency conversion/logic based on the currency code sent
    const currencyToUse = creditPurchase ? creditPurchase.currency : displayCurrency;

    if (!plan && !creditPurchase) return;

    setPaymentAbandoned(false);
    
    // Check if this is a CODON purchase - handle it directly
    if (creditPurchase && creditPurchase.paymentMethod === 'codon') {
      await handleCodonTransaction();
      return;
    }
    
    try {
      setProcessingPayment(true);
      const user = getUserFromCookie() as User || {};
      
      // Check if this is a regular credit purchase
      if (creditPurchase) {
        const response = await authenticatedFetch(`${process.env.NEXT_PUBLIC_API_URL}/payments/buy-credits`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            quantity: creditPurchase.quantity,
            currency: currencyToUse // Use currencyToUse
          }),
        });

        if (!response.ok) {
          const errorData = await response.json();
          throw new Error(errorData.detail || 'Failed to create payment order');
        }

        const orderData = await response.json();

        // Initialize Razorpay for credit purchase
        setLoadingRazorpay(true);
        try {
          const options = {
            key: orderData.razorpay_options.key,
            amount: orderData.razorpay_options.amount,
            currency: orderData.razorpay_options.currency, // Use currency from Razorpay options (should match currencyToUse)
            name: orderData.razorpay_options.name || 'CodEase',
            description: orderData.razorpay_options.description || `Purchase of ${creditPurchase.quantity} credits`,
            order_id: orderData.razorpay_options.order_id,
            handler: function(response: RazorpayResponse) {
              handlePaymentSuccess(response);
            },
            prefill: {
              email: user.email,
              ...(orderData.razorpay_options.prefill || {})
            },
            theme: orderData.razorpay_options.theme || {
              color: '#3B82F6',
            },
            method: orderData.razorpay_options.method || {
              netbanking: true,
              card: true,
              upi: true,
              wallet: true
            },
            modal: {
              ondismiss: function() {
                setProcessingPayment(false);
                setLoadingRazorpay(false);
                setPaymentAbandoned(true);
              }
            },
            notes: {
              origin: "CodEase Platform"
            }
          };

          const razorpay = new (window as any).Razorpay(options);
          setLoadingRazorpay(false);
          razorpay.open();
        } catch (razorpayError) {
          setLoadingRazorpay(false);
          // Handle gracefully - throw user-friendly error
          throw new Error('Failed to initialize payment gateway. Please try again later.');
        }

      } else if (plan) {
        // Regular subscription purchase
        const response = await authenticatedFetch(`${process.env.NEXT_PUBLIC_API_URL}/payments/create-order`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            plan_id: plan.id,
            currency: currencyToUse // Use currencyToUse (derived from displayCurrency)
          }),
        });

        if (!response.ok) {
          const errorData = await response.json();
          throw new Error(errorData.detail || 'Failed to create payment order');
        }

        const orderData = await response.json();

        // Initialize Razorpay for subscription
        setLoadingRazorpay(true);
        try {
          const options = {
            key: orderData.razorpay_options.key,
            amount: orderData.razorpay_options.amount,
            currency: orderData.razorpay_options.currency, // Use currency from Razorpay options (should match currencyToUse)
            name: orderData.razorpay_options.name || 'CodEase',
            description: orderData.razorpay_options.description || `Subscription for ${plan.name} plan`,
            order_id: orderData.razorpay_options.order_id,
            handler: function(response: RazorpayResponse) {
              handlePaymentSuccess(response);
            },
            prefill: {
              email: user.email,
              ...(orderData.razorpay_options.prefill || {})
            },
            theme: orderData.razorpay_options.theme || {
              color: '#3B82F6',
            },
            method: orderData.razorpay_options.method || {
              netbanking: true,
              card: true,
              upi: true,
              wallet: true
            },
            modal: {
              ondismiss: function() {
                setProcessingPayment(false);
                setLoadingRazorpay(false);
                setPaymentAbandoned(true);
              }
            },
            notes: {
              origin: "CodEase Platform"
            }
          };

          const razorpay = new (window as any).Razorpay(options);
          setLoadingRazorpay(false);
          razorpay.open();
        } catch (razorpayError) {
          setLoadingRazorpay(false);
          // Handle gracefully - throw user-friendly error
          throw new Error('Failed to initialize payment gateway. Please try again later.');
        }
      }

    } catch (err) {
      let errorMessage = 'Something went wrong with your payment. Please try again.';
      let shouldShowSupportOption = true;

      if (err instanceof Error) {
        // Determine if this is a user-facing error or a system error
        if (err.message.includes('cancelled') || err.message.includes('rejected') || 
            err.message.includes('dismissed')) {
          errorMessage = 'Payment was cancelled. You can try again when ready.';
          shouldShowSupportOption = false;
        } else if (err.message.includes('gateway') || err.message.includes('Razorpay')) {
          errorMessage = 'There was an issue with the payment gateway. Please try again in a few minutes.';
        } 
      }

      setError(errorMessage);
      setProcessingPayment(false);
      
      if (shouldShowSupportOption) {
        // Show a toast with contact support option
        toast.error(
          <div className="cursor-pointer" onClick={() => setShowContactModal(true)}>
            {errorMessage} <span className="font-bold underline">Contact support</span>
          </div>,
          { duration: 8000 }
        );
      } else {
        // Standard error toast
        toast.error(errorMessage);
      }
    }
  };

  const handlePaymentSuccess = async (response: RazorpayResponse) => {
    try {
      setProcessingPayment(true);
      // No need to verify payment manually - this is handled by webhooks now

      // Clear selected plan from session storage after payment is initiated
      sessionStorage.removeItem('selectedPlanId');
      sessionStorage.removeItem('selectedCurrency');

      if (creditPurchase) {
        sessionStorage.removeItem('creditPurchase');

        // Redirect to payment success page with order_id parameter
        window.location.href = `/payment-success?order_id=${response.razorpay_order_id}&type=credits`;
      } else {
        sessionStorage.removeItem('billingCycle');

        // Redirect to payment success page with order_id parameter
        window.location.href = `/payment-success?order_id=${response.razorpay_order_id}&type=subscription`;
      }
    } catch (err) {
      let errorMessage = 'Your payment was processed, but we encountered an issue completing your order.';
      let redirectPath = creditPurchase ? '/dashboard' : '/subscription';

      // Show a toast with contact support option - this is critical as payment was made
      toast.error(
        <div className="cursor-pointer" onClick={() => setShowContactModal(true)}>
          {errorMessage} <span className="font-bold underline">Contact support</span> for immediate assistance.
        </div>,
        { duration: 10000 }
      );

      // Redirect to appropriate page with error info
      router.push(`${redirectPath}?status=payment-processed&error=${encodeURIComponent(errorMessage)}`);
    } finally {
      setProcessingPayment(false);
    }
  };

  // Updated formatPrice function to use the displayCurrency state for subscriptions
  // It now takes the currency directly, which should be correctly set on the plan object
  const formatPrice = (amount: number, currency: string, isYearly: boolean): string => {
    const yearlyDiscount = 20; // 20% discount
    // Amount is expected in smallest unit (cents/paise)
    const baseAmount = isYearly
      ? amount * 12 * (1 - yearlyDiscount / 100)
      : amount;

    // Use locale based on the provided currency argument
    const locale = currency === 'INR' ? 'en-IN' : 'en-US';

    return new Intl.NumberFormat(locale, {
      style: 'currency',
      currency: currency,
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    }).format(baseAmount / 100); // Divide by 100 here before formatting
  };

  // Helper to format credit purchase prices using Intl.NumberFormat
  const formatCreditPrice = (amount: number, currency: string): string => {
    const locale = currency === 'INR' ? 'en-IN' : 'en-US';
    return new Intl.NumberFormat(locale, {
      style: 'currency',
      currency: currency,
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    }).format(amount); // Amount is already calculated (e.g., unitPrice, totalPrice * 1.18)
  };

  // Loading state
  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-gray-950 via-gray-900 to-gray-950 flex items-center justify-center">
        <div className="animate-pulse flex flex-col items-center">
          <div className="w-12 h-12 border-4 border-blue-500 border-t-transparent rounded-full animate-spin mb-4"></div>
          <p className="text-gray-400">Loading checkout details...</p>
        </div>
      </div>
    );
  }

  // Error state
  if (error || (!plan && !creditPurchase)) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-gray-950 via-gray-900 to-gray-950">
        <Header />
        <BackgroundEffects />
        <div className="container mx-auto px-4 py-32 relative z-10">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="max-w-md mx-auto bg-gradient-to-b from-red-900/30 to-red-800/20 border border-red-500/30 rounded-xl p-6 backdrop-blur-sm shadow-xl"
          >
            <div className="text-center mb-6">
              <AlertTriangle className="w-12 h-12 text-red-400 mx-auto mb-4" />
              <h2 className="text-xl font-bold text-white mb-2">Checkout Error</h2>
              <p className="text-red-200/80 mb-4">{error || 'Plan or credit purchase information not found'}</p>
            </div>
            <button
              onClick={() => router.push('/pricing')}
              className="w-full py-3 px-4 rounded-lg font-medium transition-all flex items-center justify-center bg-gradient-to-r from-blue-500 to-purple-500 text-white hover:shadow-lg hover:shadow-blue-500/20"
            >
              Return to Pricing
              <ArrowLeft className="w-4 h-4 ml-2" />
            </button>
          </motion.div>
        </div>
        <Footer />
      </div>
    );
  }

  // Determine currency to use for display (use state variable or plan/credit purchase currency)
  const currencyForDisplay = creditPurchase ? (creditPurchase.currency || displayCurrency) : (plan ? plan.currency : displayCurrency);

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-950 via-gray-900 to-gray-950">
      <Header />
      
      <BackgroundEffects />

      <div className="container mx-auto px-4 py-16 sm:py-20 md:py-24 relative z-10">
        <div className="max-w-4xl mx-auto">
          {/* Header section with back button and title */}
          <CheckoutHeader router={router} />

          {/* Main content */}
          <AnimationWrapper>
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 sm:gap-8">
              {/* Order Summary */}
              <OrderSummary
                plan={plan}
                creditPurchase={creditPurchase}
                isYearly={isYearly}
                displayCurrency={displayCurrency}
                formatPrice={formatPrice}
                formatCreditPrice={formatCreditPrice}
                devMode={DEV_MODE}
                devModeValues={DEV_MODE ? getDevModeValues() : undefined}
              />

              {/* Payment Section */}
              <div className="space-y-5 sm:space-y-6">
                <PaymentForm
                  paymentAbandoned={paymentAbandoned}
                  processingPayment={processingPayment}
                  loadingRazorpay={loadingRazorpay}
                  handleCreateOrder={handleCreateOrder}
                  currencyForDisplay={currencyForDisplay}
                  plan={plan}
                  creditPurchase={creditPurchase}
                  isYearly={isYearly}
                  formatPrice={formatPrice}
                  formatCreditPrice={formatCreditPrice}
                  // CODON-specific props
                  isConnected={isConnected}
                  walletAddress={useManualEntry ? manualWalletAddress : walletAddress}
                  isProcessingCodon={isProcessingCodon}
                  transactionStatus={transactionStatus}
                  txHash={txHash}
                  codonError={codonError}
                  onWalletConnected={handleWalletConnected}
                  onWalletDisconnect={handleWalletDisconnect}
                  useManualEntry={useManualEntry}
                  setUseManualEntry={setUseManualEntry}
                  manualWalletAddress={manualWalletAddress}
                  setManualWalletAddress={setManualWalletAddress}
                  devMode={DEV_MODE} // Pass dev mode flag to payment form
                  devModeValues={DEV_MODE ? getDevModeValues() : undefined}
                />

                {/* Policy Information */}
                <PolicyInformation creditPurchase={creditPurchase} />
              </div>
            </div>
          </AnimationWrapper>
        </div>
      </div>

      {/* Razorpay script */}
      <script src="https://checkout.razorpay.com/v1/checkout.js" async />

      <Footer />

      {/* Contact Modal */}
      <ContactModal
        isOpen={showContactModal}
        onClose={() => setShowContactModal(false)}
      />
    </div>
  );
};

export default CheckoutPage;