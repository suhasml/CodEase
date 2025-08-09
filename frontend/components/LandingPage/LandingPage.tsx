'use client'

import { useState, useEffect, useMemo, useRef } from 'react'
import { motion, useScroll, useTransform, useSpring} from 'framer-motion'
import HeroSection from './components/HeroSection'
import FeaturesSection from './components/FeaturesSection'
import DemoSection from './components/DemoSection'
import HowItWorksSection from './components/HowItWorksSection'
import TestimonialsSection from './components/TestimonialsSection'
import VideoSection from './components/VideoSection'
import CTASection from './components/CTASection'
import FAQSection from './components/FAQSection'
import { testimonials, features, demoSteps, useCases, faqs } from './data'
import CookieConsent from '../common/CookieConsent'

// Enhanced animation variants
const fadeInVariant = {
  hidden: { opacity: 0, y: 50 },
  visible: (i = 0) => ({ 
    opacity: 1, 
    y: 0,
    transition: { 
      duration: 0.8, 
      ease: [0.25, 0.1, 0.25, 1],
      delay: i * 0.1
    }
  })
}

// Improved slide-in variants with custom easing
const slideVariant = {
  hidden: { opacity: 0, x: -50 },
  visible: (i = 0) => ({
    opacity: 1,
    x: 0,
    transition: {
      duration: 0.7,
      ease: [0.19, 1, 0.22, 1],
      delay: i * 0.1
    }
  })
}

// Enhanced scale variants with custom spring
const scaleVariant = {
  hidden: { opacity: 0, scale: 0.92 },
  visible: (i = 0) => ({
    opacity: 1,
    scale: 1,
    transition: {
      type: "spring",
      stiffness: 100,
      damping: 15,
      delay: i * 0.1
    }
  })
}

// Staggered children animation
const staggerContainer = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.15,
      delayChildren: 0.2
    }
  }
}

export default function LandingPage() {
  const [email, setEmail] = useState('')
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [isSubmitted, setIsSubmitted] = useState(false)
  const [error, setError] = useState('')
  const [scrollY, setScrollY] = useState(0)
  const [isMounted, setIsMounted] = useState(false)
  const [headerHeight, setHeaderHeight] = useState(0);

  // References for scroll animations
  const containerRef = useRef(null)
  const { scrollYProgress } = useScroll({
    target: containerRef,
    offset: ["start start", "end end"]
  })
  
  // Smooth spring-based scroll progress
  const smoothScrollProgress = useSpring(scrollYProgress, { 
    stiffness: 100, 
    damping: 30, 
    restDelta: 0.001 
  })
  
  // Generate particle data once and reuse it
  const particleData = useMemo(() => {
    return Array.from({ length: 30 }).map(() => ({
      size: Math.random() * 6 + 2,
      xPos: Math.random() * 100,
      yPos: Math.random() * 100,
      speed: Math.random() * 0.3,
      opacity: 0.2 + Math.random() * 0.3,
      delay: Math.random() * 2
    }));
  }, []);
  
  // Set mounted state to true after hydration
  useEffect(() => {
    setIsMounted(true);
  }, []);
  
  // Track scroll position for parallax effects
  useEffect(() => {
    const handleScroll = () => {
      setScrollY(window.scrollY)
    }
    
    window.addEventListener('scroll', handleScroll, { passive: true })
    return () => window.removeEventListener('scroll', handleScroll)
  }, [])
  
  useEffect(() => {
    const updateHeaderHeight = () => {
      const header = document.querySelector('[data-header]');
      if (header) {
        setHeaderHeight(header.getBoundingClientRect().height);
      }
    };
    
    updateHeaderHeight();
    window.addEventListener('resize', updateHeaderHeight);
    
    return () => {
      window.removeEventListener('resize', updateHeaderHeight);
    };
  }, [isMounted]);

  const handleEmailSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsSubmitting(true)
    setError('')

    try {
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/beta-signup`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email }),
      })

      if (response.ok) {
        const data = await response.json()
        setIsSubmitted(true)
        if (data.access_token) {
          localStorage.setItem('auth_token', data.access_token)
        }
      } else {
        const data = await response.json()
        setError(data.detail || 'Something went wrong. Please try again.')
      }
    } catch (err) {
      setError('Failed to submit. Please try again.')
    } finally {
      setIsSubmitting(false)
    }
  }

  // Hero parallax values
  const heroY = useTransform(smoothScrollProgress, [0, 0.1], [0, -50])
  const heroOpacity = useTransform(smoothScrollProgress, [0, 0.25], [1, 0.5])


  return (
    <div ref={containerRef} 
    className="min-h-screen bg-gradient-to-b from-gray-950 via-gray-900 to-black text-white overflow-hidden"
    >
      
      {/* Cookie Consent Banner */}
      <CookieConsent />
      
      {/* Background gradient */}

      {/* Enhanced floating particles with scroll interaction */}
      {isMounted && (
        <div className="fixed inset-0 pointer-events-none z-0">
          {particleData.map((particle, i) => (
            <motion.div 
              key={i} 
              className="absolute bg-white/5 rounded-full"
              initial={{ opacity: 0 }}
              animate={{ 
                opacity: particle.opacity,
                transition: { delay: particle.delay, duration: 1.5 }
              }}
              style={{
                width: `${particle.size}px`,
                height: `${particle.size}px`,
                left: `${particle.xPos}%`,
                top: `${particle.yPos}%`,
                transform: `translateY(${scrollY * particle.speed}px)`,
                transition: 'transform 0.3s cubic-bezier(0.25, 0.1, 0.25, 1)'
              }}
            />
          ))}
        </div>
      )}

      {/* Hero section with enhanced parallax effect */}
      <motion.div
      id='home'
        style={{ 
          y: heroY,
          opacity: heroOpacity
        }}
        className="relative z-10"
      >
        <HeroSection />
      </motion.div>
      
      {/* Video section with enhanced reveal */}
      <motion.div
      id='video'
        initial="hidden"
        whileInView="visible"
        viewport={{ once: false, margin: "-15%" }}
        variants={staggerContainer}
        className="relative z-10"
      >
        <motion.div variants={fadeInVariant} custom={0}>
          <VideoSection />
        </motion.div>
      </motion.div>
      
      {/* How it works with staggered element reveal */}
      <motion.div
      id='how-it-works'
        initial="hidden"
        whileInView="visible"
        viewport={{ once: false, margin: "-15%" }}
        variants={staggerContainer}
        className="relative z-10"
      >
        <motion.div variants={slideVariant} custom={0}>
          <HowItWorksSection />
        </motion.div>
      </motion.div>
      
      {/* Features with enhanced scale animation */}
      <motion.div
      id='features'
        initial="hidden"
        whileInView="visible"
        viewport={{ once: false, margin: "-15%" }}
        variants={staggerContainer}
        className="relative z-10"
      >
        <motion.div variants={scaleVariant} custom={0}>
          <FeaturesSection features={features} useCases={useCases} />
        </motion.div>
      </motion.div>
      
      {/* Demo section with enhanced fade in */}
      <motion.div
      id='demo'
        initial="hidden"
        whileInView="visible"
        viewport={{ once: false, margin: "-15%" }}
        variants={staggerContainer}
        className="relative z-10"
      >
        <motion.div variants={fadeInVariant} custom={0}>
          <DemoSection demoSteps={demoSteps} />
        </motion.div>
      </motion.div>
      
      {/* Testimonials with enhanced slide animation */}
      <motion.div
      id='testimonials'
        initial="hidden"
        whileInView="visible"
        viewport={{ once: false, margin: "-15%" }}
        variants={staggerContainer}
        className="relative z-10"
      >
        <motion.div variants={slideVariant} custom={0}>
          <TestimonialsSection testimonials={testimonials} />
        </motion.div>
      </motion.div>

      <motion.div
      id='faq'
  initial="hidden"
  whileInView="visible"
  viewport={{ once: false, margin: "-15%" }}
  variants={staggerContainer}
  className="relative z-10"
>
  <motion.div variants={fadeInVariant} custom={0}>
    <FAQSection faqs={faqs} />
  </motion.div>
</motion.div>
      
      {/* CTA with attention-grabbing entrance animation */}
      <motion.div
      id='cta'
        initial="hidden"
        whileInView="visible"
        viewport={{ once: false, margin: "-20%" }}
        variants={staggerContainer}
        className="relative z-10"
      >
        <motion.div 
          variants={fadeInVariant} 
          custom={0}
          whileHover={{ scale: 1.01 }}
          transition={{ type: "spring", stiffness: 400, damping: 25 }}
        >
          <CTASection 
            email={email}
            setEmail={setEmail}
            isSubmitting={isSubmitting}
            isSubmitted={isSubmitted}
            error={error}
            handleEmailSubmit={handleEmailSubmit}
          />
        </motion.div>
      </motion.div>
      </div>
  )
}