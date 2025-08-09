'use client'

import { motion } from 'framer-motion'
import { ChevronDown, ChevronUp, HelpCircle } from 'lucide-react'
import { useState } from 'react'
import { Faq } from '../../pricing/types'

interface FaqItemProps {
  faq: Faq;
  index: number;
  activeFaq: number | null;
  setActiveFaq: (index: number | null) => void;
}

export function FaqItem({ faq, index, activeFaq, setActiveFaq }: FaqItemProps) {
  const isActive = activeFaq === index;
  
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.1, duration: 0.5 }}
      className={`border rounded-xl transition-all ${
        isActive
          ? 'border-blue-500/50 bg-gray-800/50'
          : 'border-gray-700 bg-gray-800/20 hover:border-blue-500/30'
      }`}
    >
      <button
        className="w-full text-left p-4 sm:p-5 flex justify-between items-center"
        onClick={() => setActiveFaq(isActive ? null : index)}
      >
        <span className="font-medium text-base sm:text-lg text-gray-100 pr-2">
          {faq.question}
        </span>
        <span className="flex-shrink-0 ml-2 sm:ml-4">
          {isActive ? 
            <ChevronUp className="w-5 h-5 text-blue-400" /> : 
            <ChevronDown className="w-5 h-5 text-gray-400" />
          }
        </span>
      </button>

      {isActive && (
        <div className="p-4 sm:p-5 pt-0 border-t border-gray-700">
          <p className="text-gray-300 text-sm sm:text-base">{faq.answer}</p>
        </div>
      )}
    </motion.div>
  )
}

interface FaqSectionProps {
  faqs: Faq[];
  setShowContactModal: (show: boolean) => void;
}

export default function FaqSection({ faqs, setShowContactModal }: FaqSectionProps) {
  const [activeFaq, setActiveFaq] = useState<number | null>(null);

  return (
    <section className="py-10 sm:py-16 relative z-5">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="max-w-4xl mx-auto text-center mb-8 sm:mb-12">
          <h2 className="text-2xl sm:text-3xl md:text-4xl font-bold mb-3 sm:mb-4 bg-clip-text text-transparent bg-gradient-to-r from-blue-400 to-teal-400">
            Frequently Asked Questions
          </h2>
          <p className="text-base sm:text-lg md:text-xl text-gray-300">
            Everything you need to know about our plans and billing
          </p>
        </div>

        <div className="max-w-3xl mx-auto space-y-3 sm:space-y-4">
          {faqs.map((faq, index) => (
            <FaqItem 
              key={index} 
              faq={faq} 
              index={index} 
              activeFaq={activeFaq} 
              setActiveFaq={setActiveFaq} 
            />
          ))}
        </div>

        <div className="max-w-2xl mx-auto mt-8 sm:mt-10 p-4 sm:p-6 rounded-xl border border-gray-700 bg-gray-800/30 hover:border-blue-500/30 transition-colors">
          <div className="flex flex-col sm:flex-row items-center">
            <div className="mb-4 sm:mb-0 sm:mr-6 flex-shrink-0">
              <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-full bg-blue-500/20 flex items-center justify-center">
                <HelpCircle className="w-5 h-5 sm:w-6 sm:h-6 text-blue-400" />
              </div>
            </div>
            <div className="text-center sm:text-left">
              <h3 className="text-base sm:text-lg font-medium text-white mb-1">Still have questions?</h3>
              <p className="text-sm text-gray-300">
                Contact our support team and we'll get back to you as soon as possible.
              </p>
            </div>
            <div className="mt-4 sm:mt-0 sm:ml-auto">
              <button 
                onClick={() => setShowContactModal(true)}
                className="px-4 py-2 rounded-lg bg-blue-600 hover:bg-blue-500 text-white text-sm transition-colors"
              >
                Contact Us
              </button>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}
