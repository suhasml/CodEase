// Types for the checkout page
export interface Plan {
  id: string;
  name: string;
  description: string;
  amount: number;
  amount_inr?: number;
  currency: string;
  period: string;
  features: string[];
}

export interface CreditPurchase {
  quantity?: number;
  unitPrice?: number;
  discount?: number;
  totalPrice?: string;
  currency?: string;
  paymentMethod?: 'fiat' | 'codon';
  // CODON specific fields (Fixed Rate System)
  credits?: number;
  totalCodon?: number;
  platformAmount?: number;
  burnAmount?: number;
  savings?: number;
  discountApplied?: boolean;
  discountPercentage?: number;
}

export interface RazorpayResponse {
  razorpay_payment_id: string;
  razorpay_order_id: string;
  razorpay_signature: string;
}

export interface User {
  uid: string;
  email?: string;
  name?: string;
  currentSessionId?: string;
  idToken?: string;
  [key: string]: any;
}

// Props for components
export interface CheckoutHeaderProps {
  router: any;
}

export interface OrderSummaryProps {
  plan: Plan | null;
  creditPurchase: CreditPurchase | null;
  isYearly: boolean;
  displayCurrency: string;
  formatPrice: (amount: number, currency: string, isYearly: boolean) => string;
  formatCreditPrice: (amount: number, currency: string) => string;
  devMode?: boolean; // Flag for development mode with reduced CODON amounts
  devModeValues?: { total: number; platformFee: number; burn: number }; // Dev mode test values
}

export interface PaymentFormProps {
  paymentAbandoned: boolean;
  processingPayment: boolean;
  loadingRazorpay: boolean;
  handleCreateOrder: () => void;
  currencyForDisplay: string;
  plan: Plan | null;
  creditPurchase: CreditPurchase | null;
  isYearly: boolean;
  formatPrice: (amount: number, currency: string, isYearly: boolean) => string;
  formatCreditPrice: (amount: number, currency: string) => string;
  // CODON-specific props
  isConnected?: boolean;
  walletAddress?: string;
  isProcessingCodon?: boolean;
  transactionStatus?: 'idle' | 'creating' | 'signing' | 'confirming' | 'verifying';
  txHash?: string;
  codonError?: string | null;
  onWalletConnected?: (address: string) => void;
  onWalletDisconnect?: () => void;
  // Manual wallet entry props
  useManualEntry?: boolean;
  setUseManualEntry?: (value: boolean) => void;
  manualWalletAddress?: string;
  setManualWalletAddress?: (address: string) => void;
  devMode?: boolean; // Flag indicating if we're in development mode with reduced amounts
  devModeValues?: { total: number; platformFee: number; burn: number }; // Dev mode test values
}

export interface PolicyInformationProps {
  creditPurchase: CreditPurchase | null;
}

export interface AnimationStyleProps {
  children: React.ReactNode;
}
