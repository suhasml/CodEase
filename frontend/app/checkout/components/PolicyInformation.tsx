'use client'

import { ArrowLeft } from 'lucide-react';
import { PolicyInformationProps } from '../types';

export default function PolicyInformation({ creditPurchase }: PolicyInformationProps) {
  return (
    <div className="bg-gray-800/40 border border-gray-700 rounded-xl p-4 sm:p-6 backdrop-blur-sm transition-colors duration-300 hover:border-yellow-500/30">
      <h3 className="font-medium text-sm sm:text-base text-white mb-2 sm:mb-3">
        {creditPurchase ? 'Credits Policy' : 'Subscription Policy'}
      </h3>
      <p className="text-xs sm:text-sm text-gray-400 mb-3 sm:mb-4">
        {creditPurchase
          ? "Credits are added to your account immediately after purchase and never expire. They can be used for all credit-based features. No refunds will be issued for purchased credits."
          : "You can cancel your subscription at any time. Your subscription will remain active until the end of your current billing period, with no refunds for the current period."}
      </p>
      <div className="flex items-center justify-between text-xs sm:text-sm">
        <span className="text-gray-500">Need help?</span>
        <a
          href="/support"
          className="text-blue-400 hover:text-blue-300 transition-colors flex items-center group"
        >
          <span>Contact Support</span>
          <ArrowLeft className="w-2.5 h-2.5 sm:w-3 sm:h-3 ml-1 rotate-180 group-hover:translate-x-1 transition-transform" />
        </a>
      </div>
    </div>
  );
}
