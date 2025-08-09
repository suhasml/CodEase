'use client';

import { useRouter } from 'next/navigation'; // Import useRouter
import { ArrowLeft } from 'lucide-react';

export default function NotFound() {
  const router = useRouter(); // Get router instance

  const handleGoBack = () => {
    // Check if there's a history to go back to
    if (window.history.length > 1) {
      router.back(); // Go back to the previous page
    } else {
      router.push('/'); // Redirect to home if no history
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-950 via-gray-900 to-gray-950 flex flex-col justify-center items-center relative overflow-hidden text-center px-4">
      {/* Background effects (similar to contact page) */}
      <div className="absolute -top-[500px] -left-[400px] w-[1000px] h-[1000px] bg-[radial-gradient(ellipse_at_center,hsla(217,100%,50%,0.12)_0%,transparent_70%)]"
           style={{ animation: 'aurora-x 25s ease-in-out infinite' }} />
      <div className="absolute bottom-[20%] left-[10%] w-[600px] h-[600px] bg-[radial-gradient(ellipse_at_center,hsla(190,95%,50%,0.06)_0%,transparent_70%)]"
           style={{ animation: 'aurora-pulse 30s ease infinite' }} />
      <div className="absolute inset-0 bg-[linear-gradient(rgba(59,130,246,0.05)_1px,transparent_1px),linear-gradient(90deg,rgba(59,130,246,0.05)_1px,transparent_1px)] bg-[size:40px_40px] [mask-image:radial-gradient(ellipse_at_center,black_20%,transparent_70%)]" />

      <div className="z-10">
        <h1 className="text-6xl md:text-8xl font-bold mb-4 bg-clip-text text-transparent bg-gradient-to-r from-red-500 via-orange-500 to-yellow-500">
          404
        </h1>
        <h2 className="text-3xl md:text-4xl font-semibold text-white mb-6">
          Page Not Found
        </h2>
        <p className="text-xl text-gray-300 mb-10 max-w-lg mx-auto">
          Oops! The page you are looking for does not exist or may have been moved.
        </p>
        {/* Removed Link component, added onClick handler */}
        <button
          onClick={handleGoBack} // Call the handler on click
          className="inline-flex items-center px-6 py-3 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-500 hover:to-purple-500 rounded-lg text-white transition-colors text-lg font-medium shadow-lg hover:shadow-blue-500/30"
        >
          <ArrowLeft className="w-5 h-5 mr-2" />
          <span>Go Back</span> {/* Changed text slightly */}
        </button>
      </div>

      {/* CSS animations (copied from contact page) */}
      <style jsx global>{`
        @keyframes aurora-x {
          0%, 100% { transform: translateX(0) rotate(0); opacity: 0.8; }
          50% { transform: translateX(30px) rotate(5deg); opacity: 1; }
        }

        @keyframes aurora-pulse {
          0%, 100% { opacity: 0.3; transform: scale(1); }
          50% { opacity: 0.5; transform: scale(1.1); }
        }
      `}</style>
    </div>
  );
}