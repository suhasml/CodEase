'use client';

import { useState, useEffect, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { CheckCircle, XCircle, Loader2, ArrowRight } from 'lucide-react';
import Header from '@/components/Header/header';
import Footer from '@/components/Footer/footer';
import { getStoredToken } from '@/lib/auth-utils';
import { authenticatedFetch } from '@/lib/api-utils';
import { getUserFromCookie } from '@/lib/cookie-utils';

// Assuming we'll create a User interface for type safety
interface User {
  uid?: string;
  email?: string;
  name?: string;
  currentSessionId?: string;
  idToken?: string;
  [key: string]: any;
}

// Loading component for Suspense fallback
const PaymentStatusLoading = () => {
  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-950 via-gray-900 to-gray-950 flex items-center justify-center">
      <div className="flex flex-col items-center">
        <div className="w-16 h-16 border-4 border-blue-500 border-t-transparent rounded-full animate-spin mb-4"></div>
        <p className="text-gray-400">Checking payment status...</p>
      </div>
    </div>
  );
};

// Main component content
const PaymentSuccessContent = () => {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [loading, setLoading] = useState(true);
  const [status, setStatus] = useState<'success' | 'pending' | 'failed'>('pending');
  const [message, setMessage] = useState('');
  
  // Get parameters from URL for both Razorpay and CODON payments
  const orderId = searchParams?.get('order_id');
  const transactionHash = searchParams?.get('transaction_hash');
  const type = searchParams?.get('type') || 'subscription';
  const creditsAmount = searchParams?.get('credits');
  
  // Determine if this is a CODON payment
  const isCodonPayment = type === 'codon-credits' && !!transactionHash;

  useEffect(() => {
    // Redirect to dashboard if no payment identifiers are found
    if (!orderId && !transactionHash) {
      router.push('/dashboard');
      return;
    }

    const checkPaymentStatus = async () => {
      try {
        setLoading(true);
        
        // Get the ID token using our cookie util
        const user = getUserFromCookie() as User;
        const idToken = user?.idToken || getStoredToken();
        
        if (!idToken) {
          router.push('/signin');
          return;
        }

        let data;

        // Handle different payment types with appropriate API calls
        if (isCodonPayment && transactionHash) {
          // For CODON payments, we assume verification already happened during checkout
          // So we just display success directly, or optionally verify again
          data = {
            success: true,
            status: 'completed',
            message: `Successfully purchased ${creditsAmount || ''} credits with CODON!`
          };
        } else if (orderId) {
          // For Razorpay payments, check payment status with backend
          const response = await authenticatedFetch(
            `${process.env.NEXT_PUBLIC_API_URL}/payments/payment-success?order_id=${orderId}`
          );
          data = await response.json();
        } else {
          throw new Error('Invalid payment parameters');
        }
        
        if (data.success) {
          // Payment is being processed or is complete
          setStatus(data.status === 'completed' ? 'success' : 'pending');
          setMessage(data.message || 'Your payment is being processed');
        } else {
          // Payment failed
          setStatus('failed');
          setMessage(data.error || 'There was a problem with your payment');
        }
      } catch (err) {
        setStatus('failed');
        setMessage('Could not verify payment status');
      } finally {
        setLoading(false);
      }
    };

    checkPaymentStatus();
  }, [orderId, transactionHash, type, creditsAmount, isCodonPayment, router]);

  const getTitle = () => {
    switch (status) {
      case 'success':
        if (type === 'codon-credits') return 'CODON Credits Added Successfully!';
        return type === 'credits' ? 'Credits Added Successfully!' : 'Subscription Activated!';
      case 'pending':
        return 'Processing Your Payment';
      case 'failed':
        return 'Payment Issue Detected';
      default:
        return 'Payment Status';
    }
  };

  const getButtonText = () => {
    switch (status) {
      case 'success':
        return 'Go to Dashboard'; // Simplified to be consistent
      case 'pending':
        return 'Check Status Later';
      case 'failed':
        return 'Try Again';
      default:
        return 'Go to Dashboard';
    }
  };

  const getButtonLink = () => {
    switch (status) {
      case 'success':
        // Both regular credits and CODON credits should redirect to dashboard
        return (type === 'credits' || type === 'codon-credits')
          ? '/dashboard?status=success&purchase=credits' 
          : '/dashboard?status=success&purchase=subscription';
      case 'pending':
        return '/dashboard?status=pending';
      case 'failed':
        return '/pricing';
      default:
        return '/dashboard';
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-950 via-gray-900 to-gray-950">
      <Header />
      
      <div className="relative overflow-hidden">
        {/* Background effects */}
        <div className="absolute -top-[500px] -left-[400px] w-[1000px] h-[1000px] bg-[radial-gradient(ellipse_at_center,hsla(217,100%,50%,0.12)_0%,transparent_70%)]" 
             style={{ animation: 'aurora-x 25s ease-in-out infinite' }} />
        <div className="absolute -top-[300px] -right-[300px] w-[800px] h-[800px] bg-[radial-gradient(ellipse_at_center,hsla(265,89%,60%,0.12)_0%,transparent_70%)]" 
             style={{ animation: 'aurora-y 20s ease-in-out infinite' }} />
        
        {/* Grid effect */}
        <div className="absolute inset-0 bg-[linear-gradient(rgba(59,130,246,0.05)_1px,transparent_1px),linear-gradient(90deg,rgba(59,130,246,0.05)_1px,transparent_1px)] bg-[size:40px_40px] [mask-image:radial-gradient(ellipse_at_center,black_20%,transparent_70%)]" />
      </div>
      
      <div className="container mx-auto px-4 py-16 md:py-32 relative z-10">
        <div className="max-w-lg mx-auto">
          <div className={`p-8 rounded-2xl ${
            status === 'success' ? 'bg-gradient-to-b from-green-900/30 to-green-800/20 border border-green-500/30' :
            status === 'pending' ? 'bg-gradient-to-b from-amber-900/30 to-amber-800/20 border border-amber-500/30' :
            'bg-gradient-to-b from-red-900/30 to-red-800/20 border border-red-500/30'
          } backdrop-blur-sm shadow-xl`}>
            
            {/* Status icon */}
            <div className="flex justify-center mb-6">
              {loading ? (
                <div className="w-20 h-20 rounded-full bg-gray-800/50 flex items-center justify-center">
                  <Loader2 size={40} className="text-blue-400 animate-spin" />
                </div>
              ) : status === 'success' ? (
                <div className="w-20 h-20 rounded-full bg-green-500/10 flex items-center justify-center">
                  <CheckCircle size={40} className="text-green-400" />
                </div>
              ) : status === 'pending' ? (
                <div className="w-20 h-20 rounded-full bg-amber-500/10 flex items-center justify-center">
                  <Loader2 size={40} className="text-amber-400 animate-spin" />
                </div>
              ) : (
                <div className="w-20 h-20 rounded-full bg-red-500/10 flex items-center justify-center">
                  <XCircle size={40} className="text-red-400" />
                </div>
              )}
            </div>
            
            <h1 className="text-3xl font-bold text-center text-white mb-4">
              {getTitle()}
            </h1>
            
            <p className="text-center text-lg mb-8 text-gray-300">
              {loading ? 'Checking payment status...' : message}
            </p>
            
            {/* Order details */}
            <div className="bg-gray-800/30 border border-gray-700 rounded-lg p-4 mb-8">
              {isCodonPayment ? (
                <>
                  <div className="flex justify-between mb-2">
                    <span className="text-gray-400">Transaction Hash:</span>
                    <span className="text-white font-mono text-xs truncate max-w-[200px]" title={transactionHash}>
                      {transactionHash}
                    </span>
                  </div>
                  {creditsAmount && (
                    <div className="flex justify-between">
                      <span className="text-gray-400">Credits:</span>
                      <span className="text-white">{creditsAmount}</span>
                    </div>
                  )}
                  <div className="flex justify-between">
                    <span className="text-gray-400">Type:</span>
                    <span className="text-white">CODON Credit Purchase</span>
                  </div>
                </>
              ) : (
                <>
                  <div className="flex justify-between mb-2">
                    <span className="text-gray-400">Order ID:</span>
                    <span className="text-white font-mono">{orderId}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-400">Type:</span>
                    <span className="text-white">
                      {type === 'credits' ? 'Credit Purchase' : 'Subscription'}
                    </span>
                  </div>
                </>
              )}
            </div>
            
            <button 
              onClick={() => router.push(getButtonLink())}
              className={`w-full py-3 px-4 rounded-lg font-medium transition-all flex items-center justify-center ${
                status === 'success' ? 'bg-gradient-to-r from-green-500 to-emerald-500' :
                status === 'pending' ? 'bg-gradient-to-r from-amber-500 to-orange-500' :
                'bg-gradient-to-r from-blue-500 to-purple-500'
              } text-white hover:shadow-lg hover:shadow-blue-500/20`}
            >
              <span>{getButtonText()}</span>
              <ArrowRight className="ml-2 w-4 h-4" />
            </button>
          </div>
        </div>
      </div>
      
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
      `}</style>
      
      <Footer />
    </div>
  );
};

// Main page component with Suspense boundary
const PaymentSuccessPage = () => {
  return (
    <Suspense fallback={<PaymentStatusLoading />}>
      <PaymentSuccessContent />
    </Suspense>
  );
};

export default PaymentSuccessPage;