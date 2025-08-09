// import { useState, useEffect } from 'react';

// export interface PricingPlan {
//   id: string;
//   name: string;
//   description: string;
//   amount: number;
//   credits?: number;
//   currency: string;
//   period?: string;
//   features: string[];
//   highlighted?: boolean;
//   cta: string;
//   is_credit_purchase?: boolean;
//   is_subscription?: boolean;
// }

// export const usePricingPlans = () => {
//   const [plans, setPlans] = useState<PricingPlan[]>([]);
//   const [loading, setLoading] = useState(true);
//   const [error, setError] = useState<string | null>(null);

//   useEffect(() => {
//     const fetchPricingPlans = async () => {
//       try {
//         setLoading(true);
//         const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/payments/pricing-plans`);
        
//         if (!response.ok) {
//           throw new Error('Failed to fetch pricing plans');
//         }
        
//         const data = await response.json();
        
//         if (data.success && data.plans) {
//           setPlans(data.plans);
//         } else {
//           throw new Error(data.error || 'Failed to fetch pricing plans');
//         }
//       } catch (err) {
//         console.error('Error fetching pricing plans:', err);
//         setError(err instanceof Error ? err.message : 'An unknown error occurred');
//       } finally {
//         setLoading(false);
//       }
//     };

//     fetchPricingPlans();
//   }, []);

//   return { plans, loading, error };
// };
import { useState, useEffect } from 'react';

export interface PricingPlan {
  id: string;
  name: string;
  description: string;
  amount: number;
  amount_inr?: number; // Add the amount_inr field
  credits?: number;
  currency: string; // Currency is part of the plan data from API
  period?: string;
  features: string[];
  highlighted?: boolean;
  cta: string;
  is_credit_purchase?: boolean;
  is_subscription?: boolean;
}

// Add currency parameter to the hook
export const usePricingPlans = (currency: string = 'USD') => {
  const [plans, setPlans] = useState<PricingPlan[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [fetchedCurrency, setFetchedCurrency] = useState<string>(currency); // Store the currency used for the fetch

  useEffect(() => {
    const fetchPricingPlans = async () => {
      try {
        setLoading(true);
        setError(null); // Reset error on new fetch
        // Include currency in the API request
        const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/payments/pricing-plans?currency=${currency}`);

        if (!response.ok) {
          const errorData = await response.json().catch(() => ({ detail: 'Failed to fetch pricing plans' }));
          throw new Error(errorData.detail || `HTTP error! status: ${response.status}`);
        }

        const data = await response.json();

        if (data.success && data.plans && data.currency) {
          // Process the plans to use the correct amount based on currency
          const processedPlans = data.plans.map((plan: any) => {
            // If currency is INR and amount_inr exists, use it as the amount
            if (data.currency === 'INR' && plan.amount_inr !== undefined) {
              return {
                ...plan,
                amount: plan.amount_inr, // Set amount to the INR amount
                currency: 'INR'
              };
            }
            // Otherwise use the default amount (USD)
            return {
              ...plan,
              currency: data.currency
            };
          });
          
          setPlans(processedPlans);
          setFetchedCurrency(data.currency); // Store the currency returned by the API
        } else {
          throw new Error(data.error || 'Invalid data format received from API');
        }
      } catch (err) {
        setError(err instanceof Error ? err.message : 'An unknown error occurred');
        setPlans([]); // Clear plans on error
      } finally {
        setLoading(false);
      }
    };

    fetchPricingPlans();
  }, [currency]); // Re-fetch when currency changes

  // Return the fetched currency as well
  return { plans, loading, error, currency: fetchedCurrency };
};