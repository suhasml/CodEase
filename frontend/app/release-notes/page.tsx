import Header from '@/components/Header/header'
import Footer from '@/components/Footer/footer'
import Link from 'next/link'

export default function ReleaseNotesPage() {
  return (
    <div className="min-h-screen bg-black">
      <Header />
      
      <div className="max-w-4xl mx-auto px-4 pt-28 pb-16 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-12">
          <h1 className="text-3xl font-bold text-white mb-2">Release Notes</h1>
          <p className="text-gray-400">Latest updates and improvements to CodEase</p>
        </div>

        {/* Version 1.1 */}
        <div className="mb-12">
          <div className="border-l-2 border-blue-500 pl-6">
            <div className="flex items-center gap-3 mb-4">
              <h2 className="text-2xl font-semibold text-white">Version 1.1</h2>
              <span className="bg-green-600 text-white text-xs px-2 py-1 rounded">Latest</span>
            </div>
            <p className="text-gray-400 text-sm mb-6">Released June 27, 2025</p>

            <div className="space-y-6">
              {/* Performance Improvements */}
              <div>
                <h3 className="text-lg font-medium text-white mb-3">⚡ Performance Improvements</h3>
                <ul className="text-gray-300 space-y-2 list-disc list-inside">
                  <li>Reduced extension generation time from ~2 minutes to ~1 minute</li>
                  <li>Optimized AI model processing pipeline</li>
                  <li>Enhanced backend response times</li>
                </ul>
              </div>

              {/* CODON Pricing */}
              <div>
                <h3 className="text-lg font-medium text-white mb-3">💰 CODON Pricing Stability</h3>
                <ul className="text-gray-300 space-y-2 list-disc list-inside">
                  <li>Fixed exchange rate: 2,000 CODON = 1 Credit</li>
                  <li>Eliminated price volatility for predictable costs</li>
                  <li>Improved marketplace liquidity</li>
                </ul>
              </div>

              {/* Bug Fixes */}
              <div>
                <h3 className="text-lg font-medium text-white mb-3">🐛 Bug Fixes</h3>
                <ul className="text-gray-300 space-y-2 list-disc list-inside">
                  <li>Fixed intermittent connection timeouts during generation</li>
                  <li>Resolved UI layout issues on mobile devices</li>
                  <li>Improved error handling for invalid extension requests</li>
                </ul>
              </div>
            </div>
          </div>
        </div>

        {/* Version 1.0 */}
        <div className="mb-12">
          <div className="border-l-2 border-gray-600 pl-6">
            <h2 className="text-2xl font-semibold text-white mb-2">Version 1.0</h2>
            <p className="text-gray-400 text-sm mb-6">Initial Release - May 15, 2025</p>

            <div>
              <h3 className="text-lg font-medium text-white mb-3">🚀 Initial Features</h3>
              <ul className="text-gray-300 space-y-2 list-disc list-inside">
                <li>AI-powered Chrome extension generation</li>
                <li>Credit-based pricing system</li>
                <li>CODON token integration</li>
                <li>Live testing environment</li>
                <li>Community marketplace</li>
                <li>User authentication and profiles</li>
              </ul>
            </div>
          </div>
        </div>

        {/* Footer CTA */}
        <div className="border-t border-gray-800 pt-8">
          <div className="text-center">
            <p className="text-gray-400 mb-4">Ready to try the latest version?</p>
            <div className="flex gap-4 justify-center">
              <Link 
                href="/chat" 
                className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-2 rounded-lg transition-colors"
              >
                Start Building
              </Link>
              <Link 
                href="/pricing" 
                className="border border-gray-600 hover:border-gray-500 text-white px-6 py-2 rounded-lg transition-colors"
              >
                View Pricing
              </Link>
            </div>
          </div>
        </div>
      </div>

      <Footer />
    </div>
  )
}
