// 'use client';

// import { useState, useEffect } from 'react';
// import { motion } from 'framer-motion';
// import { ArrowRight, Check, ArrowLeft, Wallet } from 'lucide-react';
// import { useRouter } from 'next/navigation';
// import Cookies from 'js-cookie';
// import DefaultHeader from '@/components/Header/components/DefaultHeader';
// import Footer from '@/components/Footer/footer';
// import { getUserFromCookie } from '@/lib/cookie-utils';

// interface CreditPlan {
//   id: string;
//   quantity: number;
//   unitPrice: number;
//   amount: number;
//   discount: number;
//   totalPrice: number;
//   popular?: boolean;
// }

// interface User {
//   uid?: string;
//   email?: string;
//   name?: string;
//   idToken?: string;
//   [key: string]: any;
// }

// const PurchaseCreditsPage = () => {
//   const router = useRouter();
//   const [loading, setLoading] = useState(true);
//   const [selectedPlan, setSelectedPlan] = useState<number | null>(null);
//   const [isAuthenticated, setIsAuthenticated] = useState<boolean>(false);
//   const [customQuantity, setCustomQuantity] = useState<number>(1);
//   const [creditPlans, setCreditPlans] = useState<CreditPlan[]>([]);
  
//   // Animation variants
//   const fadeIn = {
//     initial: { opacity: 0, y: 20 },
//     animate: { opacity: 1, y: 0, transition: { duration: 0.6 } }
//   };
  
//   // Staggered container animation
//   const container = {
//     animate: {
//       transition: {
//         staggerChildren: 0.1
//       }
//     }
//   };
  
//   // Calculate base unit price, discounts, etc.
//   const baseUnitPrice = 2.00; // $2.00 per credit
  
//   useEffect(() => {
//     // Check if user is authenticated on component mount
//     const storedUser = Cookies.get('user');
//     if (storedUser) {
//       setIsAuthenticated(true);
//     }
    
//     // Generate credit plans
//     const plans: CreditPlan[] = [
//       {
//         id: 'credits_5',
//         quantity: 5,
//         unitPrice: baseUnitPrice,
//         amount: baseUnitPrice * 100, // convert to cents
//         discount: 0,
//         totalPrice: baseUnitPrice * 5,
//       },
//       {
//         id: 'credits_20',
//         quantity: 20,
//         unitPrice: baseUnitPrice,
//         amount: baseUnitPrice * 100,
//         discount: 10,
//         totalPrice: baseUnitPrice * 20 * 0.9,
//         popular: true
//       },
//       {
//         id: 'credits_50',
//         quantity: 50,
//         unitPrice: baseUnitPrice,
//         amount: baseUnitPrice * 100,
//         discount: 15,
//         totalPrice: baseUnitPrice * 50 * 0.85
//       },
//       {
//         id: 'credits_100',
//         quantity: 100,
//         unitPrice: baseUnitPrice,
//         amount: baseUnitPrice * 100,
//         discount: 20,
//         totalPrice: baseUnitPrice * 100 * 0.8
//       },
//     ];
    
//     setCreditPlans(plans);
//     setLoading(false);
//   }, []);
  
//   // Format currency
//   const formatCurrency = (amount: number): string => {
//     return new Intl.NumberFormat('en-US', {
//       style: 'currency',
//       currency: 'USD',
//       minimumFractionDigits: 2,
//       maximumFractionDigits: 2,
//     }).format(amount);
//   };
  
//   // Handle plan selection and navigation to checkout
//   const handleSelectPlan = (plan: CreditPlan, index: number): void => {
//     setSelectedPlan(index);
    
//     if (!isAuthenticated) {
//       // Redirect to sign in if not authenticated
//       router.push('/signin?redirect=purchase-credits');
//       return;
//     }
    
//     // Store plan information in session storage for checkout
//     sessionStorage.setItem('selectedPlanId', 'pay_as_you_go');
//     sessionStorage.setItem('creditPurchase', JSON.stringify({
//       quantity: plan.quantity,
//       unitPrice: plan.unitPrice,
//       discount: plan.discount,
//       totalPrice: plan.totalPrice.toFixed(2)
//     }));
    
//     // Navigate to checkout
//     router.push('/checkout');
//   };
  
//   // Handle custom quantity input and calculate price
//   const handleCustomPurchase = () => {
//     if (!isAuthenticated) {
//       router.push('/signin?redirect=purchase-credits');
//       return;
//     }
    
//     // Calculate discount based on quantity
//     let discount = 0;
//     if (customQuantity >= 100) discount = 20;
//     else if (customQuantity >= 50) discount = 15;
//     else if (customQuantity >= 20) discount = 10;
    
//     const totalPrice = baseUnitPrice * customQuantity * (1 - discount/100);
    
//     // Store in session storage for checkout
//     sessionStorage.setItem('selectedPlanId', 'pay_as_you_go');
//     sessionStorage.setItem('creditPurchase', JSON.stringify({
//       quantity: customQuantity,
//       unitPrice: baseUnitPrice,
//       discount: discount,
//       totalPrice: totalPrice.toFixed(2)
//     }));
    
//     // Navigate to checkout
//     router.push('/checkout');
//   };
  
//   if (loading) {
//     return (
//       <div className="min-h-screen bg-gradient-to-b from-gray-950 via-gray-900 to-gray-950 flex items-center justify-center">
//         <div className="animate-pulse flex flex-col items-center">
//           <div className="w-12 h-12 border-4 border-blue-500 border-t-transparent rounded-full animate-spin mb-4"></div>
//           <p className="text-gray-400">Loading credit plans...</p>
//         </div>
//       </div>
//     );
//   }

//   return (
//     <div className="min-h-screen bg-gradient-to-b from-gray-950 via-gray-900 to-gray-950">
//       <DefaultHeader />
      
//       <div className="relative overflow-hidden">
//         {/* Dynamic aurora effects with subtle animations */}
//         <div className="absolute -top-[500px] -left-[400px] w-[1000px] h-[1000px] bg-[radial-gradient(ellipse_at_center,hsla(217,100%,50%,0.12)_0%,transparent_70%)]" 
//              style={{ animation: 'aurora-x 25s ease-in-out infinite' }} />
//         <div className="absolute -top-[300px] -right-[300px] w-[800px] h-[800px] bg-[radial-gradient(ellipse_at_center,hsla(265,89%,60%,0.12)_0%,transparent_70%)]" 
//              style={{ animation: 'aurora-y 20s ease-in-out infinite' }} />
//         <div className="absolute bottom-[20%] left-[10%] w-[600px] h-[600px] bg-[radial-gradient(ellipse_at_center,hsla(190,95%,50%,0.06)_0%,transparent_70%)]" 
//              style={{ animation: 'aurora-pulse 30s ease infinite' }} />
        
//         {/* Enhanced grid effect */}
//         <div className="absolute inset-0 bg-[linear-gradient(rgba(59,130,246,0.05)_1px,transparent_1px),linear-gradient(90deg,rgba(59,130,246,0.05)_1px,transparent_1px)] bg-[size:40px_40px] [mask-image:radial-gradient(ellipse_at_center,black_20%,transparent_70%)]" />
//       </div>
      
//       <div className="container mx-auto px-4 py-32 relative z-10">
//         <div className="max-w-6xl mx-auto">
//           <motion.div
//             initial={{ opacity: 0, x: -20 }}
//             animate={{ opacity: 1, x: 0 }}
//             transition={{ duration: 0.3 }}
//             className="mb-8"
//           >
//             <button 
//               onClick={() => router.back()}
//               className="flex items-center text-gray-400 hover:text-white transition group"
//             >
//               <ArrowLeft className="w-4 h-4 mr-2 group-hover:-translate-x-1 transition-transform" />
//               <span>Back</span>
//             </button>
//           </motion.div>
          
//           <motion.div
//             initial={{ opacity: 0 }}
//             animate={{ opacity: 1 }}
//             transition={{ duration: 0.5 }}
//             className="max-w-4xl mx-auto text-center mb-12"
//           >
//             <h1 className="text-4xl md:text-5xl font-bold mb-6 bg-clip-text text-transparent bg-gradient-to-r from-blue-400 via-purple-400 to-teal-400">
//               Purchase Credits
//             </h1>
//             <p className="text-xl text-gray-300 max-w-3xl mx-auto">
//               Add credits to your account and use them for advanced features and services. 
//               Credits never expire and bulk purchases receive automatic discounts.
//             </p>
//           </motion.div>
          
//           {/* Credit Plans */}
//           <motion.div 
//             className="grid md:grid-cols-2 lg:grid-cols-4 gap-6"
//             variants={container}
//             initial="initial"
//             animate="animate"
//           >
//             {creditPlans.map((plan, index) => (
//               <motion.div
//                 key={index}
//                 variants={fadeIn}
//                 className={`rounded-xl border backdrop-blur-sm transition-all duration-300 relative overflow-hidden ${
//                   selectedPlan === index
//                     ? "ring-2 ring-blue-500 scale-105 shadow-xl shadow-blue-500/20"
//                     : "hover:-translate-y-1 hover:shadow-lg"
//                 } ${
//                   plan.popular
//                     ? "bg-gradient-to-b from-blue-900/30 to-purple-900/30 border-blue-500/50"
//                     : "bg-gray-800/40 border-gray-700 hover:border-blue-500/30"
//                 }`}
//                 onClick={() => handleSelectPlan(plan, index)}
//               >
//                 {plan.popular && (
//                   <div className="absolute top-0 left-0 right-0 bg-gradient-to-r from-blue-500 to-purple-500 text-white text-xs font-medium py-1 text-center">
//                     Popular Choice
//                   </div>
//                 )}
                
//                 <div className={`p-6 ${plan.popular ? "pt-8" : ""}`}>
//                   <div className="mb-4 flex items-center justify-center">
//                     <div className={`w-16 h-16 rounded-full flex items-center justify-center ${
//                       plan.popular 
//                         ? "bg-blue-500/20" 
//                         : "bg-gray-700/50"
//                     }`}>
//                       <Wallet className={`w-8 h-8 ${
//                         plan.popular ? "text-blue-400" : "text-gray-300"
//                       }`} />
//                     </div>
//                   </div>
                  
//                   <h3 className="text-xl font-bold mb-2 text-center text-white">{plan.quantity} Credits</h3>
                  
//                   <div className="flex items-center justify-center mb-4">
//                     <span className="text-3xl font-bold text-white">{formatCurrency(plan.totalPrice)}</span>
//                   </div>
                  
//                   {plan.discount > 0 && (
//                     <div className="mb-4 text-sm text-center bg-green-500/10 text-green-400 px-3 py-1.5 rounded-md">
//                       {plan.discount}% discount applied
//                     </div>
//                   )}
                  
//                   <ul className="space-y-2 mb-6">
//                     <li className="flex items-start">
//                       <Check className={`w-5 h-5 mr-2 flex-shrink-0 ${
//                         plan.popular ? "text-blue-400" : "text-green-500"
//                       }`} />
//                       <span className="text-gray-300">
//                         {formatCurrency(plan.unitPrice)} per credit
//                       </span>
//                     </li>
//                     <li className="flex items-start">
//                       <Check className={`w-5 h-5 mr-2 flex-shrink-0 ${
//                         plan.popular ? "text-blue-400" : "text-green-500"
//                       }`} />
//                       <span className="text-gray-300">Never expires</span>
//                     </li>
//                     <li className="flex items-start">
//                       <Check className={`w-5 h-5 mr-2 flex-shrink-0 ${
//                         plan.popular ? "text-blue-400" : "text-green-500"
//                       }`} />
//                       <span className="text-gray-300">Instant delivery</span>
//                     </li>
//                   </ul>
                  
//                   <button
//                     onClick={(e) => {
//                       e.stopPropagation();
//                       handleSelectPlan(plan, index);
//                     }}
//                     className={`w-full py-2.5 px-4 rounded-lg font-medium transition-all flex items-center justify-center ${
//                       selectedPlan === index
//                         ? "bg-gradient-to-r from-blue-400 to-purple-400 text-white shadow-lg shadow-blue-500/20"
//                         : plan.popular
//                           ? "bg-gradient-to-r from-blue-500 to-purple-500 text-white hover:shadow-lg hover:shadow-blue-500/20"
//                           : "bg-gray-700 text-white hover:bg-gray-600"
//                     }`}
//                   >
//                     Buy Now
//                     <ArrowRight className="w-4 h-4 ml-2" />
//                   </button>
//                 </div>
//               </motion.div>
//             ))}
//           </motion.div>
          
//           {/* Custom Credit Purchase */}
//           <motion.div
//             variants={fadeIn}
//             initial="initial"
//             animate="animate"
//             transition={{ delay: 0.4 }}
//             className="mt-10 bg-gray-800/40 border border-gray-700 rounded-xl p-6 backdrop-blur-sm max-w-2xl mx-auto"
//           >
//             <h3 className="text-xl font-bold mb-4 text-white">Custom Purchase</h3>
//             <p className="text-gray-300 mb-6">
//               Need a specific number of credits? Choose your own quantity below.
//             </p>
            
//             <div className="flex flex-col sm:flex-row gap-4 items-end">
//               <div className="flex-grow">
//                 <label htmlFor="customQuantity" className="block text-sm font-medium text-gray-300 mb-1.5">
//                   Number of Credits
//                 </label>
//                 <input
//                   id="customQuantity"
//                   type="number"
//                   min="1"
//                   value={customQuantity}
//                   onChange={(e) => setCustomQuantity(Math.max(1, parseInt(e.target.value) || 1))}
//                   className="w-full rounded-lg border border-gray-600 bg-gray-700/70 px-4 py-2.5 text-white focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
//                 />
//               </div>
              
//               <button
//                 onClick={handleCustomPurchase}
//                 className="py-2.5 px-6 rounded-lg bg-gradient-to-r from-blue-500 to-purple-500 text-white font-medium hover:shadow-lg hover:shadow-blue-500/20 transition-all whitespace-nowrap"
//               >
//                 Purchase
//               </button>
//             </div>
            
//             {customQuantity >= 20 && (
//               <div className="mt-4 bg-green-500/10 rounded-lg p-3 flex items-start">
//                 <Check className="w-5 h-5 text-green-500 mr-2 flex-shrink-0" />
//                 <div>
//                   <span className="text-green-400 font-medium">
//                     {customQuantity >= 100 ? '20%' : customQuantity >= 50 ? '15%' : '10%'} bulk discount applied!
//                   </span>
//                   <p className="text-gray-300 text-sm">
//                     Your price: {formatCurrency(baseUnitPrice * customQuantity * (1 - (customQuantity >= 100 ? 0.2 : customQuantity >= 50 ? 0.15 : customQuantity >= 20 ? 0.1 : 0)))}
//                   </p>
//                 </div>
//               </div>
//             )}
//           </motion.div>
          
//           {/* FAQ */}
//           <motion.div
//             variants={fadeIn}
//             initial="initial"
//             animate="animate"
//             transition={{ delay: 0.5 }}
//             className="mt-16 max-w-3xl mx-auto"
//           >
//             <h2 className="text-2xl font-bold mb-6 text-white text-center">Frequently Asked Questions</h2>
            
//             <div className="space-y-4">
//               <div className="bg-gray-800/30 border border-gray-700 rounded-lg p-5">
//                 <h3 className="text-lg font-medium text-white mb-2">What can I do with credits?</h3>
//                 <p className="text-gray-300">
//                   Credits can be used for advanced features such as debugger functionality, premium support, 
//                   extension optimization, and other specialized services on our platform.
//                 </p>
//               </div>
              
//               <div className="bg-gray-800/30 border border-gray-700 rounded-lg p-5">
//                 <h3 className="text-lg font-medium text-white mb-2">Do credits expire?</h3>
//                 <p className="text-gray-300">
//                   No, once purchased, your credits never expire and will remain in your account until used.
//                 </p>
//               </div>
              
//               <div className="bg-gray-800/30 border border-gray-700 rounded-lg p-5">
//                 <h3 className="text-lg font-medium text-white mb-2">Are there refunds for unused credits?</h3>
//                 <p className="text-gray-300">
//                   We don't offer refunds for purchased credits, but they never expire so you can use them whenever you need.
//                 </p>
//               </div>
//             </div>
//           </motion.div>
          
//           {/* Support Link */}
//           <motion.div
//             variants={fadeIn}
//             initial="initial"
//             animate="animate"
//             transition={{ delay: 0.6 }}
//             className="mt-10 text-center"
//           >
//             <p className="text-gray-400">
//               Need help or have questions?{' '}
//               <a href="/contact" className="text-blue-400 hover:text-blue-300 transition-colors">
//                 Contact our support team
//               </a>
//             </p>
//           </motion.div>
//         </div>
//       </div>
      
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

// export default PurchaseCreditsPage;

'use client';

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { ArrowRight, Check, ArrowLeft, Wallet } from 'lucide-react';
import { useRouter } from 'next/navigation';
import Cookies from 'js-cookie';
import DefaultHeader from '@/components/Header/components/DefaultHeader';
import Footer from '@/components/Footer/footer';
import { getUserFromCookie } from '@/lib/cookie-utils';

interface CreditPlan {
  id: string;
  quantity: number;
  unitPrice: number;
  amount: number;
  discount: number;
  totalPrice: number;
  popular?: boolean;
}

interface User {
  uid?: string;
  email?: string;
  name?: string;
  idToken?: string;
  [key: string]: any;
}

const PurchaseCreditsPage = () => {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [selectedPlan, setSelectedPlan] = useState<number | null>(null);
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(false);
  const [customQuantity, setCustomQuantity] = useState<number>(1);
  const [creditPlans, setCreditPlans] = useState<CreditPlan[]>([]);
  
  // Animation variants
  const fadeIn = {
    initial: { opacity: 0, y: 20 },
    animate: { opacity: 1, y: 0, transition: { duration: 0.6 } }
  };
  
  // Staggered container animation
  const container = {
    animate: {
      transition: {
        staggerChildren: 0.1
      }
    }
  };
  
  // Calculate base unit price, discounts, etc.
  const baseUnitPrice = 2.00; // $2.00 per credit
  
  useEffect(() => {
    // Check if user is authenticated on component mount
    const userData = getUserFromCookie();
  if (userData) {
    setIsAuthenticated(true);
  }
    
    // Generate credit plans
    const plans: CreditPlan[] = [
      {
        id: 'credits_5',
        quantity: 5,
        unitPrice: baseUnitPrice,
        amount: baseUnitPrice * 100, // convert to cents
        discount: 0,
        totalPrice: baseUnitPrice * 5,
      },
      {
        id: 'credits_20',
        quantity: 20,
        unitPrice: baseUnitPrice,
        amount: baseUnitPrice * 100,
        discount: 10,
        totalPrice: baseUnitPrice * 20 * 0.9,
        popular: true
      },
      {
        id: 'credits_50',
        quantity: 50,
        unitPrice: baseUnitPrice,
        amount: baseUnitPrice * 100,
        discount: 15,
        totalPrice: baseUnitPrice * 50 * 0.85
      },
      {
        id: 'credits_100',
        quantity: 100,
        unitPrice: baseUnitPrice,
        amount: baseUnitPrice * 100,
        discount: 20,
        totalPrice: baseUnitPrice * 100 * 0.8
      },
    ];
    
    setCreditPlans(plans);
    setLoading(false);
  }, []);
  
  // Format currency
  const formatCurrency = (amount: number): string => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    }).format(amount);
  };
  
  // Handle plan selection and navigation to checkout
  const handleSelectPlan = (plan: CreditPlan, index: number): void => {
    setSelectedPlan(index);
    
    if (!isAuthenticated) {
      // Redirect to sign in if not authenticated
      router.push('/signin?redirect=purchase-credits');
      return;
    }
    
    // Store plan information in session storage for checkout
    sessionStorage.setItem('selectedPlanId', 'pay_as_you_go');
    sessionStorage.setItem('creditPurchase', JSON.stringify({
      quantity: plan.quantity,
      unitPrice: plan.unitPrice,
      discount: plan.discount,
      totalPrice: plan.totalPrice.toFixed(2)
    }));
    
    // Navigate to checkout
    router.push('/checkout');
  };
  
  // Handle custom quantity input and calculate price
  const handleCustomPurchase = () => {
    if (!isAuthenticated) {
      router.push('/signin?redirect=purchase-credits');
      return;
    }
    
    // Calculate discount based on quantity
    let discount = 0;
    if (customQuantity >= 100) discount = 20;
    else if (customQuantity >= 50) discount = 15;
    else if (customQuantity >= 20) discount = 10;
    
    const totalPrice = baseUnitPrice * customQuantity * (1 - discount/100);
    
    // Store in session storage for checkout
    sessionStorage.setItem('selectedPlanId', 'pay_as_you_go');
    sessionStorage.setItem('creditPurchase', JSON.stringify({
      quantity: customQuantity,
      unitPrice: baseUnitPrice,
      discount: discount,
      totalPrice: totalPrice.toFixed(2)
    }));
    
    // Navigate to checkout
    router.push('/checkout');
  };
  
  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-gray-950 via-gray-900 to-gray-950 flex items-center justify-center">
        <div className="animate-pulse flex flex-col items-center">
          <div className="w-12 h-12 border-4 border-blue-500 border-t-transparent rounded-full animate-spin mb-4"></div>
          <p className="text-gray-400">Loading credit plans...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-950 via-gray-900 to-gray-950">
      <DefaultHeader />
      
      <div className="relative overflow-hidden">
        {/* Dynamic aurora effects with subtle animations */}
        <div className="absolute -top-[500px] -left-[400px] w-[1000px] h-[1000px] bg-[radial-gradient(ellipse_at_center,hsla(217,100%,50%,0.12)_0%,transparent_70%)]" 
             style={{ animation: 'aurora-x 25s ease-in-out infinite' }} />
        <div className="absolute -top-[300px] -right-[300px] w-[800px] h-[800px] bg-[radial-gradient(ellipse_at_center,hsla(265,89%,60%,0.12)_0%,transparent_70%)]" 
             style={{ animation: 'aurora-y 20s ease-in-out infinite' }} />
        <div className="absolute bottom-[20%] left-[10%] w-[600px] h-[600px] bg-[radial-gradient(ellipse_at_center,hsla(190,95%,50%,0.06)_0%,transparent_70%)]" 
             style={{ animation: 'aurora-pulse 30s ease infinite' }} />
        
        {/* Enhanced grid effect */}
        <div className="absolute inset-0 bg-[linear-gradient(rgba(59,130,246,0.05)_1px,transparent_1px),linear-gradient(90deg,rgba(59,130,246,0.05)_1px,transparent_1px)] bg-[size:40px_40px] [mask-image:radial-gradient(ellipse_at_center,black_20%,transparent_70%)]" />
      </div>
      
      <div className="container mx-auto px-4 py-32 relative z-10">
        <div className="max-w-6xl mx-auto">
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.3 }}
            className="mb-8"
          >
            <button 
              onClick={() => router.back()}
              className="flex items-center text-gray-400 hover:text-white transition group"
            >
              <ArrowLeft className="w-4 h-4 mr-2 group-hover:-translate-x-1 transition-transform" />
              <span>Back</span>
            </button>
          </motion.div>
          
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.5 }}
            className="max-w-4xl mx-auto text-center mb-12"
          >
            <h1 className="text-4xl md:text-5xl font-bold mb-6 bg-clip-text text-transparent bg-gradient-to-r from-blue-400 via-purple-400 to-teal-400">
              Purchase Credits
            </h1>
            <p className="text-xl text-gray-300 max-w-3xl mx-auto">
              Add credits to your account and use them for advanced features and services. 
              Credits never expire and bulk purchases receive automatic discounts.
            </p>
          </motion.div>
          
          {/* Credit Plans */}
          <motion.div 
            className="grid md:grid-cols-2 lg:grid-cols-4 gap-6"
            variants={container}
            initial="initial"
            animate="animate"
          >
            {creditPlans.map((plan, index) => (
              <motion.div
                key={index}
                variants={fadeIn}
                className={`rounded-xl border backdrop-blur-sm transition-all duration-300 relative overflow-hidden ${
                  selectedPlan === index
                    ? "ring-2 ring-blue-500 scale-105 shadow-xl shadow-blue-500/20"
                    : "hover:-translate-y-1 hover:shadow-lg"
                } ${
                  plan.popular
                    ? "bg-gradient-to-b from-blue-900/30 to-purple-900/30 border-blue-500/50"
                    : "bg-gray-800/40 border-gray-700 hover:border-blue-500/30"
                }`}
                onClick={() => handleSelectPlan(plan, index)}
              >
                {plan.popular && (
                  <div className="absolute top-0 left-0 right-0 bg-gradient-to-r from-blue-500 to-purple-500 text-white text-xs font-medium py-1 text-center">
                    Popular Choice
                  </div>
                )}
                
                <div className={`p-6 ${plan.popular ? "pt-8" : ""}`}>
                  <div className="mb-4 flex items-center justify-center">
                    <div className={`w-16 h-16 rounded-full flex items-center justify-center ${
                      plan.popular 
                        ? "bg-blue-500/20" 
                        : "bg-gray-700/50"
                    }`}>
                      <Wallet className={`w-8 h-8 ${
                        plan.popular ? "text-blue-400" : "text-gray-300"
                      }`} />
                    </div>
                  </div>
                  
                  <h3 className="text-xl font-bold mb-2 text-center text-white">{plan.quantity} Credits</h3>
                  
                  <div className="flex items-center justify-center mb-4">
                    <span className="text-3xl font-bold text-white">{formatCurrency(plan.totalPrice)}</span>
                  </div>
                  
                  {plan.discount > 0 && (
                    <div className="mb-4 text-sm text-center bg-green-500/10 text-green-400 px-3 py-1.5 rounded-md">
                      {plan.discount}% discount applied
                    </div>
                  )}
                  
                  <ul className="space-y-2 mb-6">
                    <li className="flex items-start">
                      <Check className={`w-5 h-5 mr-2 flex-shrink-0 ${
                        plan.popular ? "text-blue-400" : "text-green-500"
                      }`} />
                      <span className="text-gray-300">
                        {formatCurrency(plan.unitPrice)} per credit
                      </span>
                    </li>
                    <li className="flex items-start">
                      <Check className={`w-5 h-5 mr-2 flex-shrink-0 ${
                        plan.popular ? "text-blue-400" : "text-green-500"
                      }`} />
                      <span className="text-gray-300">Never expires</span>
                    </li>
                    <li className="flex items-start">
                      <Check className={`w-5 h-5 mr-2 flex-shrink-0 ${
                        plan.popular ? "text-blue-400" : "text-green-500"
                      }`} />
                      <span className="text-gray-300">Instant delivery</span>
                    </li>
                  </ul>
                  
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      handleSelectPlan(plan, index);
                    }}
                    className={`w-full py-2.5 px-4 rounded-lg font-medium transition-all flex items-center justify-center ${
                      selectedPlan === index
                        ? "bg-gradient-to-r from-blue-400 to-purple-400 text-white shadow-lg shadow-blue-500/20"
                        : plan.popular
                          ? "bg-gradient-to-r from-blue-500 to-purple-500 text-white hover:shadow-lg hover:shadow-blue-500/20"
                          : "bg-gray-700 text-white hover:bg-gray-600"
                    }`}
                  >
                    Buy Now
                    <ArrowRight className="w-4 h-4 ml-2" />
                  </button>
                </div>
              </motion.div>
            ))}
          </motion.div>
          
          {/* Custom Credit Purchase */}
          <motion.div
            variants={fadeIn}
            initial="initial"
            animate="animate"
            transition={{ delay: 0.4 }}
            className="mt-10 bg-gray-800/40 border border-gray-700 rounded-xl p-6 backdrop-blur-sm max-w-2xl mx-auto"
          >
            <h3 className="text-xl font-bold mb-4 text-white">Custom Purchase</h3>
            <p className="text-gray-300 mb-6">
              Need a specific number of credits? Choose your own quantity below.
            </p>
            
            <div className="flex flex-col sm:flex-row gap-4 items-end">
              <div className="flex-grow">
                <label htmlFor="customQuantity" className="block text-sm font-medium text-gray-300 mb-1.5">
                  Number of Credits
                </label>
                <input
                  id="customQuantity"
                  type="number"
                  min="1"
                  value={customQuantity}
                  onChange={(e) => setCustomQuantity(Math.max(1, parseInt(e.target.value) || 1))}
                  className="w-full rounded-lg border border-gray-600 bg-gray-700/70 px-4 py-2.5 text-white focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
                />
              </div>
              
              <button
                onClick={handleCustomPurchase}
                className="py-2.5 px-6 rounded-lg bg-gradient-to-r from-blue-500 to-purple-500 text-white font-medium hover:shadow-lg hover:shadow-blue-500/20 transition-all whitespace-nowrap"
              >
                Purchase
              </button>
            </div>
            
            {customQuantity >= 20 && (
              <div className="mt-4 bg-green-500/10 rounded-lg p-3 flex items-start">
                <Check className="w-5 h-5 text-green-500 mr-2 flex-shrink-0" />
                <div>
                  <span className="text-green-400 font-medium">
                    {customQuantity >= 100 ? '20%' : customQuantity >= 50 ? '15%' : '10%'} bulk discount applied!
                  </span>
                  <p className="text-gray-300 text-sm">
                    Your price: {formatCurrency(baseUnitPrice * customQuantity * (1 - (customQuantity >= 100 ? 0.2 : customQuantity >= 50 ? 0.15 : customQuantity >= 20 ? 0.1 : 0)))}
                  </p>
                </div>
              </div>
            )}
          </motion.div>
          
          {/* FAQ */}
          <motion.div
            variants={fadeIn}
            initial="initial"
            animate="animate"
            transition={{ delay: 0.5 }}
            className="mt-16 max-w-3xl mx-auto"
          >
            <h2 className="text-2xl font-bold mb-6 text-white text-center">Frequently Asked Questions</h2>
            
            <div className="space-y-4">
              <div className="bg-gray-800/30 border border-gray-700 rounded-lg p-5">
                <h3 className="text-lg font-medium text-white mb-2">What can I do with credits?</h3>
                <p className="text-gray-300">
                  Credits can be used for advanced features such as debugger functionality, premium support, 
                  extension optimization, and other specialized services on our platform.
                </p>
              </div>
              
              <div className="bg-gray-800/30 border border-gray-700 rounded-lg p-5">
                <h3 className="text-lg font-medium text-white mb-2">Do credits expire?</h3>
                <p className="text-gray-300">
                  No, once purchased, your credits never expire and will remain in your account until used.
                </p>
              </div>
              
              <div className="bg-gray-800/30 border border-gray-700 rounded-lg p-5">
                <h3 className="text-lg font-medium text-white mb-2">Are there refunds for unused credits?</h3>
                <p className="text-gray-300">
                  We don't offer refunds for purchased credits, but they never expire so you can use them whenever you need.
                </p>
              </div>
            </div>
          </motion.div>
          
          {/* Support Link */}
          <motion.div
            variants={fadeIn}
            initial="initial"
            animate="animate"
            transition={{ delay: 0.6 }}
            className="mt-10 text-center"
          >
            <p className="text-gray-400">
              Need help or have questions?{' '}
              <a href="/contact" className="text-blue-400 hover:text-blue-300 transition-colors">
                Contact our support team
              </a>
            </p>
          </motion.div>
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
        
        @keyframes aurora-pulse {
          0%, 100% { opacity: 0.3; transform: scale(1); }
          50% { opacity: 0.5; transform: scale(1.1); }
        }
      `}</style>
      
      <Footer />
    </div>
  );
};

export default PurchaseCreditsPage;