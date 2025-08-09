'use client'

import React, { useState } from 'react'
import { motion } from 'framer-motion'
import { Quote, ChevronRight, ChevronLeft, Star } from 'lucide-react'

// Define the testimonial data structure
interface Testimonial {
  id: number;
  name: string;
  role: string;
  company: string;
  quote: string;
  rating: number;
  profileImage?: string;
}

// Sample testimonials
const testimonials: Testimonial[] = [
  {
    id: 1,
    name: "Sarah Johnson",
    role: "Lead Developer",
    company: "TechFirm Inc",
    quote: "The credit system is extremely flexible and the AI is incredibly accurate. It's like having an expert developer working alongside me.",
    rating: 5,
    profileImage: "https://randomuser.me/api/portraits/women/44.jpg"
  },
  {
    id: 2,
    name: "Michael Chen",
    role: "Software Engineer",
    company: "DevStudio",
    quote: "Using CODON tokens for credits reduced my transaction costs and the token burn mechanism feels like a smart long-term strategy.",
    rating: 5,
    profileImage: "https://randomuser.me/api/portraits/men/32.jpg"
  },
  {
    id: 3, 
    name: "Aisha Patel",
    role: "CTO",
    company: "Innov8 Solutions",
    quote: "We've integrated CodEase into our entire development workflow. The bulk credit purchases with discounts work perfectly for our team needs.",
    rating: 4,
    profileImage: "https://randomuser.me/api/portraits/women/63.jpg"
  }
];

export default function TestimonialCarousel() {
  const [activeIndex, setActiveIndex] = useState(0);

  // Navigation functions
  const goToPrevious = () => {
    setActiveIndex((prev) => (prev === 0 ? testimonials.length - 1 : prev - 1));
  };

  const goToNext = () => {
    setActiveIndex((prev) => (prev === testimonials.length - 1 ? 0 : prev + 1));
  };

  return (
    <div className="max-w-5xl mx-auto py-6 relative px-4 sm:px-6">
      <div className="text-center mb-8">
        <h3 className="text-2xl font-bold text-white mb-2">What People Are Saying</h3>
        <p className="text-gray-400">Hear from developers who've boosted their productivity</p>
      </div>
      
      {/* Desktop carousel */}
      <div className="hidden md:block">
        <div className="relative bg-gradient-to-br from-gray-800/80 to-gray-900/80 rounded-2xl border border-gray-700 p-8 shadow-xl">
          <div className="absolute -top-5 -left-5">
            <div className="bg-blue-600 p-3 rounded-full shadow-lg">
              <Quote className="w-6 h-6 text-white" />
            </div>
          </div>
          
          <motion.div
            key={testimonials[activeIndex].id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            transition={{ duration: 0.5 }}
            className="grid grid-cols-3 gap-8 items-center"
          >
            <div className="col-span-2">
              <p className="text-gray-300 text-lg italic mb-6 leading-relaxed">
                "{testimonials[activeIndex].quote}"
              </p>
              
              <div className="flex items-center">
                <div className="flex mr-2">
                  {[...Array(5)].map((_, i) => (
                    <Star 
                      key={i}
                      className={`w-4 h-4 ${i < testimonials[activeIndex].rating ? "text-yellow-400 fill-yellow-400" : "text-gray-600"}`} 
                    />
                  ))}
                </div>
              </div>
              
              <div className="mt-4">
                <h4 className="text-white font-medium">{testimonials[activeIndex].name}</h4>
                <p className="text-blue-400 text-sm">{testimonials[activeIndex].role}, {testimonials[activeIndex].company}</p>
              </div>
            </div>
            
            <div className="flex justify-center">
              {testimonials[activeIndex].profileImage && (
                <div className="w-48 h-48 relative">
                  <div className="w-full h-full rounded-full overflow-hidden border-4 border-blue-500/50 shadow-lg shadow-blue-500/20">
                    <img 
                      src={testimonials[activeIndex].profileImage} 
                      alt={testimonials[activeIndex].name}
                      className="w-full h-full object-cover"
                    />
                  </div>
                  <div className="absolute inset-0 rounded-full bg-gradient-to-tl from-blue-500/20 via-transparent to-transparent"></div>
                </div>
              )}
            </div>
          </motion.div>
          
          {/* Navigation controls */}
          <div className="absolute -bottom-5 right-10 flex space-x-3">
            <button 
              onClick={goToPrevious}
              className="w-10 h-10 rounded-full bg-gray-800 border border-gray-600 flex items-center justify-center text-white hover:bg-blue-600 hover:border-blue-500 transition-colors focus:outline-none"
              aria-label="Previous testimonial"
            >
              <ChevronLeft className="w-5 h-5" />
            </button>
            <button 
              onClick={goToNext}
              className="w-10 h-10 rounded-full bg-gray-800 border border-gray-600 flex items-center justify-center text-white hover:bg-blue-600 hover:border-blue-500 transition-colors focus:outline-none"
              aria-label="Next testimonial"
            >
              <ChevronRight className="w-5 h-5" />
            </button>
          </div>
          
          {/* Pagination indicators */}
          <div className="flex justify-center mt-8">
            {testimonials.map((_, index) => (
              <button
                key={index}
                onClick={() => setActiveIndex(index)}
                className={`mx-1 w-2 h-2 rounded-full transition-all ${
                  activeIndex === index 
                    ? "w-6 bg-blue-500" 
                    : "bg-gray-600 hover:bg-gray-500"
                }`}
                aria-label={`Go to testimonial ${index + 1}`}
              />
            ))}
          </div>
        </div>
      </div>
      
      {/* Mobile friendly version */}
      <div className="md:hidden">
        <motion.div
          key={testimonials[activeIndex].id}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -20 }}
          transition={{ duration: 0.5 }}
          className="bg-gradient-to-br from-gray-800/80 to-gray-900/80 rounded-xl border border-gray-700 p-6 shadow-lg"
        >
          <div className="flex items-center mb-4">
            {testimonials[activeIndex].profileImage && (
              <div className="w-12 h-12 rounded-full overflow-hidden border-2 border-blue-500/50 mr-3">
                <img 
                  src={testimonials[activeIndex].profileImage} 
                  alt={testimonials[activeIndex].name}
                  className="w-full h-full object-cover"
                />
              </div>
            )}
            <div>
              <h4 className="text-white font-medium">{testimonials[activeIndex].name}</h4>
              <p className="text-blue-400 text-sm">{testimonials[activeIndex].role}</p>
            </div>
          </div>
          
          <p className="text-gray-300 text-sm italic mb-4">
            "{testimonials[activeIndex].quote}"
          </p>
          
          <div className="flex items-center justify-between">
            <div className="flex">
              {[...Array(5)].map((_, i) => (
                <Star 
                  key={i}
                  className={`w-3 h-3 ${i < testimonials[activeIndex].rating ? "text-yellow-400 fill-yellow-400" : "text-gray-600"}`} 
                />
              ))}
            </div>
            
            <div className="flex space-x-2">
              <button 
                onClick={goToPrevious}
                className="w-8 h-8 rounded-full bg-gray-800 border border-gray-600 flex items-center justify-center text-white hover:bg-blue-600 hover:border-blue-500 transition-colors focus:outline-none"
                aria-label="Previous testimonial"
              >
                <ChevronLeft className="w-4 h-4" />
              </button>
              <button 
                onClick={goToNext}
                className="w-8 h-8 rounded-full bg-gray-800 border border-gray-600 flex items-center justify-center text-white hover:bg-blue-600 hover:border-blue-500 transition-colors focus:outline-none"
                aria-label="Next testimonial"
              >
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        </motion.div>
      </div>
    </div>
  )
}
