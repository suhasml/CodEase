'use client'

import { ArrowRight } from 'lucide-react'

interface EnterpriseCtaProps {
  setShowContactModal: (show: boolean) => void;
}

export default function EnterpriseCta({ setShowContactModal }: EnterpriseCtaProps) {
  return (
    <div className="mt-8 sm:mt-12 max-w-3xl mx-auto bg-gray-800/40 border border-gray-700 rounded-xl p-4 sm:p-6 backdrop-blur-sm hover:border-blue-500/30 transition-colors">
      <div className="flex flex-col md:flex-row items-center justify-between gap-4 md:gap-6">
        <div>
          <h3 className="text-lg sm:text-xl font-semibold text-white mb-1 sm:mb-2 text-center md:text-left">Need a custom solution?</h3>
          <p className="text-sm sm:text-base text-gray-300 text-center md:text-left">Contact our team for custom pricing and special requirements</p>
        </div>
        <button
          onClick={() => setShowContactModal(true)}
          className="mt-3 md:mt-0 whitespace-nowrap px-4 sm:px-5 py-2 sm:py-2.5 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-500 hover:to-purple-500 rounded-lg text-white transition-colors flex items-center text-sm sm:text-base shadow-md hover:shadow-lg"
        >
          <span>Contact Sales</span>
          <ArrowRight className="w-3.5 h-3.5 sm:w-4 sm:h-4 ml-1 sm:ml-1" />
        </button>
      </div>
    </div>
  )
}
