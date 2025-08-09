'use client'

import { motion } from 'framer-motion'
import { Shield, Coins, Store, Sparkles, ArrowRight } from 'lucide-react'
import { useRouter } from 'next/navigation'

const newFeatures = [
  {
    icon: <Shield className="w-8 h-8 text-orange-400" />,
    title: "Advanced Security Testing",
    description: "Every extension undergoes thorough security testing after sandbox validation for maximum safety",
    badge: "Security First",
    color: "orange",
    href: "/signin"
  },
  {
    icon: <Coins className="w-8 h-8 text-yellow-400" />,
    title: "CODON Payment System",
    description: "Pay with our utility token CODON for seamless, fast transactions and exclusive platform benefits",
    badge: "New Payment",
    color: "yellow",
    href: "/pricing"
  },  {
    icon: <Store className="w-8 h-8 text-cyan-400" />,
    title: "Community Marketplace",
    description: "List your extensions for sale or discover amazing extensions created by the community",
    badge: "Marketplace",
    color: "cyan",
    href: "/signin"
  }
]

const containerVariant = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.2,
      delayChildren: 0.3
    }
  }
}

const cardVariant = {
  hidden: { 
    opacity: 0, 
    y: 60,
    scale: 0.95
  },
  visible: {
    opacity: 1,
    y: 0,
    scale: 1,
    transition: {
      type: "spring",
      stiffness: 100,
      damping: 15,
      duration: 0.8
    }
  }
}

const titleVariant = {
  hidden: { opacity: 0, y: 30 },
  visible: {
    opacity: 1,
    y: 0,
    transition: {
      duration: 0.8,
      ease: [0.25, 0.1, 0.25, 1]
    }
  }
}

const getColorClasses = (color: string) => {
  switch (color) {
    case 'orange':
      return {
        badge: 'bg-orange-500/20 text-orange-300 border-orange-500/30',
        glow: 'group-hover:shadow-orange-500/20',
        accent: 'border-orange-500/30'
      }
    case 'yellow':
      return {
        badge: 'bg-yellow-500/20 text-yellow-300 border-yellow-500/30',
        glow: 'group-hover:shadow-yellow-500/20',
        accent: 'border-yellow-500/30'
      }
    case 'cyan':
      return {
        badge: 'bg-cyan-500/20 text-cyan-300 border-cyan-500/30',
        glow: 'group-hover:shadow-cyan-500/20',
        accent: 'border-cyan-500/30'
      }
    default:
      return {
        badge: 'bg-blue-500/20 text-blue-300 border-blue-500/30',
        glow: 'group-hover:shadow-blue-500/20',
        accent: 'border-blue-500/30'
      }
  }
}

export default function WhatsNewSection() {
  const router = useRouter()  
  const handleFeatureClick = (href: string, title: string) => {
    // Special handling for Advanced Security Testing to go to chat after signin
    if (title === "Advanced Security Testing") {
      // Store the intended destination in sessionStorage
      sessionStorage.setItem('redirectAfterLogin', '/chat')
    }
    // Special handling for Community Marketplace to go to marketplace after signin
    else if (title === "Community Marketplace") {
      // Store the intended destination in sessionStorage
      sessionStorage.setItem('redirectAfterLogin', '/marketplace')
    }
    router.push(href)
  }
  const handleGetStartedClick = () => {
    // Store the intended destination to go to chat after signin
    sessionStorage.setItem('redirectAfterLogin', '/chat')
    router.push('/signin')
  }
  return (
    <section className="relative py-8 sm:py-12 md:py-16 lg:py-14 px-4 sm:px-6 lg:px-8">
      {/* Background gradient overlay */}
      <div className="absolute inset-0 bg-gradient-to-b from-transparent via-gray-950/50 to-transparent" />
      
      {/* Decorative elements */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-gradient-to-r from-blue-600/10 to-purple-600/10 rounded-full blur-3xl" />
        <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-gradient-to-r from-cyan-600/10 to-orange-600/10 rounded-full blur-3xl" />
      </div>

      <div className="max-w-7xl mx-auto relative z-10">
        {/* Header */}
        <motion.div
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: "-10%" }}
          variants={titleVariant}
          className="text-center mb-8 sm:mb-12 lg:mb-16"
        >
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-gradient-to-r from-blue-500/20 to-purple-500/20 border border-blue-500/30 mb-4 sm:mb-6">
            <Sparkles className="w-4 h-4 text-blue-400" />
            <span className="text-sm font-medium text-blue-300">Latest Updates</span>
          </div>
          
          <h2 className="text-2xl sm:text-4xl md:text-5xl lg:text-6xl font-bold mb-4 sm:mb-6">
            <span className="bg-gradient-to-r from-white via-blue-100 to-purple-100 bg-clip-text text-transparent">
              What's New
            </span>
          </h2>
          
          <p className="text-base sm:text-xl text-gray-300 max-w-3xl mx-auto leading-relaxed">
            Discover the latest features that make CodEase more powerful, secure, and community-driven than ever before
          </p>
        </motion.div>

        {/* Features Grid */}
        <motion.div
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: "-10%" }}
          variants={containerVariant}
        >
          {/* Mobile: Compact vertical list */}
          <div className="block md:hidden space-y-4">
            {newFeatures.map((feature, index) => {
              const colors = getColorClasses(feature.color)
              
              return (
                <motion.div
                  key={index}
                  variants={cardVariant}
                  className="group relative cursor-pointer"
                  onClick={() => handleFeatureClick(feature.href, feature.title)}
                >
                  <div className="relative p-4 rounded-xl border border-gray-800/50 bg-gradient-to-br from-gray-900/80 to-gray-950/80 backdrop-blur-sm transition-all duration-300 hover:border-gray-700">
                    <div className="flex items-start space-x-3">
                      <div className="flex-shrink-0">
                        <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-gray-800 to-gray-900 flex items-center justify-center border border-gray-700">
                          {feature.icon}
                        </div>
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center justify-between mb-2">
                          <h3 className="text-base font-bold text-white">{feature.title}</h3>
                          <span className={`px-2 py-1 rounded-full text-xs font-medium border ${colors.badge}`}>
                            {feature.badge}
                          </span>
                        </div>
                        <p className="text-sm text-gray-300 line-clamp-2">{feature.description}</p>
                        <div className="flex items-center mt-2 text-blue-400">
                          <span className="text-xs">Learn more</span>
                          <ArrowRight className="w-3 h-3 ml-1" />
                        </div>
                      </div>
                    </div>
                  </div>
                </motion.div>
              )
            })}
          </div>

          {/* Desktop/Tablet: Grid layout */}
          <div className="hidden md:grid md:grid-cols-2 lg:grid-cols-3 gap-6 lg:gap-8">            {newFeatures.map((feature, index) => {
              const colors = getColorClasses(feature.color)
              
              return (
                <motion.div
                  key={index}
                  variants={cardVariant}
                  whileHover={{ 
                    y: -8,
                    transition: { type: "spring", stiffness: 300, damping: 20 }
                  }}
                  className="group relative cursor-pointer"
                  onClick={() => handleFeatureClick(feature.href, feature.title)}
                >
                  {/* Card */}
                  <div className={`
                    relative h-full p-6 lg:p-8 rounded-2xl border-2 border-gray-800/50 
                    bg-gradient-to-br from-gray-900/80 to-gray-950/80 backdrop-blur-sm
                    transition-all duration-500 ease-out
                    hover:border-gray-700/70 hover:shadow-2xl ${colors.glow}
                  `}>
                    {/* Badge */}
                    <div className={`
                      inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-medium mb-6
                      border ${colors.badge}
                    `}>
                      <div className="w-2 h-2 rounded-full bg-current animate-pulse" />
                      {feature.badge}
                    </div>

                    {/* Icon */}
                    <div className="mb-6">
                      <div className="w-16 h-16 rounded-xl bg-gradient-to-br from-gray-800 to-gray-900 border border-gray-700 flex items-center justify-center group-hover:scale-110 transition-transform duration-300">
                        {feature.icon}
                      </div>
                    </div>

                    {/* Content */}
                    <div className="space-y-4">
                      <h3 className="text-xl lg:text-2xl font-bold text-white group-hover:text-blue-100 transition-colors duration-300">
                        {feature.title}
                      </h3>
                      
                      <p className="text-gray-300 leading-relaxed">
                        {feature.description}
                      </p>
                    </div>

                    {/* Hover indicator */}
                    <div className="absolute bottom-6 right-6 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                      <ArrowRight className="w-5 h-5 text-blue-400" />
                    </div>

                    {/* Subtle accent border */}
                    <div className={`
                      absolute inset-0 rounded-2xl border-2 opacity-0 group-hover:opacity-100 
                      transition-opacity duration-500 ${colors.accent}
                    `} />
                  </div>
                </motion.div>
              )
            })}
          </div>
        </motion.div>

        {/* Call to action */}
        <motion.div
          initial={{ opacity: 0, y: 40 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ delay: 0.8, duration: 0.8 }}
          className="text-center mt-12 sm:mt-16"
        >
          <p className="text-base sm:text-lg text-gray-400 mb-4 sm:mb-6">
            Ready to experience these new features?
          </p>
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={handleGetStartedClick}
            className="inline-flex items-center gap-2 px-6 sm:px-8 py-3 sm:py-4 rounded-full bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-500 hover:to-purple-500 text-white font-semibold transition-all duration-300 shadow-lg hover:shadow-blue-500/25"
          >
            Get Started Today
            <ArrowRight className="w-4 h-4 sm:w-5 sm:h-5" />
          </motion.button>
        </motion.div>
      </div>
    </section>
  )
}