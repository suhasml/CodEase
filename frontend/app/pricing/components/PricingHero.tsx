'use client'

import { motion } from 'framer-motion'
import { Coins } from 'lucide-react'

interface PricingHeroProps {
  selectedCurrency: string;
  setSelectedCurrency: (currency: string) => void;
}

export default function PricingHero({ selectedCurrency, setSelectedCurrency }: PricingHeroProps) {
  return (
    <section className="pt-20 md:pt-28 lg:pt-32 pb-10 md:pb-16 relative z-10">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.5 }}
          className="max-w-4xl mx-auto text-center"
        >
          <h1 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-bold mb-4 sm:mb-6 bg-clip-text text-transparent bg-gradient-to-r from-blue-400 via-purple-400 to-teal-400">
            Choose the Perfect Plan for Your Needs
          </h1>
          <p className="text-base sm:text-lg md:text-xl text-gray-300 mb-6 sm:mb-8 max-w-3xl mx-auto px-2">
            Build Chrome extensions without code, at any scale. From solo creators to enterprise teams, we've got you covered.
          </p>
          {/* Token announcement banner moved to CODON payment section in page.tsx */}
          {/* Currency toggle - Moved to main payment method toggle in page.tsx */}
        </motion.div>
      </div>
    </section>
  )
}
