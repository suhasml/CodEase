// Define types for plan objects
export interface PlanObject {
  id: string;
  name: string;
  description: string;
  amount: number;
  currency: string; // Currency is now part of the plan
  period?: string;
  features?: string[];
  highlighted?: boolean;
  cta: string;
  is_credit_purchase?: boolean;
  is_subscription?: boolean;
  credits?: number;
}

export interface User {
  uid?: string;
  email?: string;
  name?: string;
  idToken?: string;
  [key: string]: any;
}

// Extended plan object with UI state
export interface ExtendedPlanObject extends PlanObject {
  selectedQuantity?: number;
}

// Define FAQ interface
export interface Faq {
  question: string;
  answer: string;
}
