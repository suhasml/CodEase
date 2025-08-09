'use client'

import { motion } from 'framer-motion';
import { ArrowLeft } from 'lucide-react';
import { CheckoutHeaderProps } from '../types';

export default function CheckoutHeader({ router }: CheckoutHeaderProps) {
  return (
    <>
      {/* Back button */}
      <motion.div
        initial={{ opacity: 0, x: -20 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ duration: 0.3 }}
      >
        <button
          onClick={() => router.push('/pricing')}
          className="flex items-center text-gray-400 hover:text-white mb-6 sm:mb-8 transition group"
        >
          <ArrowLeft className="w-4 h-4 mr-2 group-hover:-translate-x-1 transition-transform" />
          <span>Back to Pricing</span>
        </button>
      </motion.div>

      {/* Page title */}
      <motion.h1
        className="text-2xl sm:text-3xl md:text-4xl font-bold mb-6 sm:mb-8 text-center bg-clip-text text-transparent bg-gradient-to-r from-blue-400 via-purple-400 to-teal-400"
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        Complete Your Purchase
      </motion.h1>
    </>
  );
}
