import React, { useState } from 'react'
import { useInterval } from '../hooks/useInterval'

interface TestimonialProps {
  quote: string
  author: string
  role: string
  company: string
}

interface TestimonialsSectionProps {
  testimonials: TestimonialProps[]
}

export default function TestimonialsSection({ testimonials }: TestimonialsSectionProps) {
  const [activeIndex, setActiveIndex] = useState(0)
  const [direction, setDirection] = useState<'right'|'left'>('right')

  useInterval(() => {
    setDirection('right')
    setActiveIndex((current) => (current + 1) % testimonials.length)
  }, 5000)

  const goToTestimonial = (index: number) => {
    setDirection(index > activeIndex ? 'right' : 'left')
    setActiveIndex(index)
  }

  return (
    <section className="pt-8 sm:pt-12 lg:pt-16 pb-8 sm:pb-12 lg:pb-16 bg-gradient-to-t from-gray-900 via-gray-900/40 to-transparent relative overflow-hidden" id="testimonials">
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-[100px] sm:-top-[200px] left-1/2 transform -translate-x-1/2 w-[300px] sm:w-[600px] md:w-[800px] h-[300px] sm:h-[600px] md:h-[800px] bg-[radial-gradient(ellipse_at_center,hsla(217,100%,50%,0.15)_0%,transparent_70%)]" />
      </div>
      
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        <div className="max-w-4xl mx-auto text-center mb-6 sm:mb-8 lg:mb-12">
          <span className="inline-block text-blue-500 text-xs sm:text-sm font-semibold tracking-wider uppercase mb-2 sm:mb-3">Testimonials</span>
          <h2 className="text-xl sm:text-2xl md:text-3xl lg:text-4xl font-bold mb-3 sm:mb-4 bg-clip-text text-transparent bg-gradient-to-r from-blue-400 to-purple-400 leading-tight md:leading-normal px-2">
            Loved by Developers & Non-Developers Alike
          </h2>
          <p className="text-gray-300 text-sm sm:text-base md:text-lg max-w-2xl mx-auto">
            See why thousands trust CodEase to build their Chrome extensions
          </p>
        </div>
        
        <div className="max-w-3xl lg:max-w-4xl mx-auto">
          <div className="relative h-[280px] sm:h-[300px] md:h-[280px] overflow-hidden">
            {testimonials.map((testimonial, index) => (
              <div
                key={index}
                className={`absolute inset-0 transition-all duration-500 ease-in-out ${
                  index === activeIndex 
                    ? "translate-x-0 opacity-100 z-10" 
                    : direction === 'right'
                      ? "translate-x-full opacity-0"
                      : "-translate-x-full opacity-0"
                }`}
              >
                <div className="h-full p-6 sm:p-8 rounded-xl bg-gradient-to-br from-gray-800/90 to-gray-900/90 border border-gray-700 shadow-xl shadow-blue-500/5 backdrop-blur-sm flex flex-col justify-center">
                  <div className="flex flex-col items-center text-center">
                    {/* Stars rating */}
                    <div className="flex mb-4 sm:mb-5">
                      {Array(5).fill(null).map((_, i) => (
                        <svg 
                          key={i}
                          className="w-4 h-4 sm:w-5 sm:h-5 text-yellow-400 fill-current"
                          viewBox="0 0 20 20"
                        >
                          <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                        </svg>
                      ))}
                    </div>
                    
                    {/* Testimonial quote */}
                    <blockquote className="mb-5 sm:mb-6">
                      <p className="text-gray-200 text-sm sm:text-base md:text-lg italic leading-relaxed sm:leading-loose">
                        "{testimonial.quote}"
                      </p>
                    </blockquote>
                    
                    {/* Author info */}
                    <div className="mt-auto">
                      <p className="font-semibold text-white text-sm sm:text-base">{testimonial.author}</p>
                      <p className="text-gray-400 text-xs sm:text-sm">
                        {testimonial.role}
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
          
          {/* Navigation dots - only show if more than one testimonial */}
          {/* {testimonials.length > 1 && (
            <div className="flex justify-center mt-6 sm:mt-8 space-x-2">
              {testimonials.map((_, index) => (
                <button
                  key={index}
                  onClick={() => goToTestimonial(index)}
                  className={`w-2.5 h-2.5 sm:w-3 sm:h-3 rounded-full transition-all duration-300 ${
                    index === activeIndex 
                      ? "bg-blue-500 scale-125" 
                      : "bg-gray-600 hover:bg-gray-500"
                  }`}
                  aria-label={`Go to testimonial ${index + 1}`}
                />
              ))}
            </div>
          )} */}
        </div>
      </div>
    </section>
  )
}







// import React, { useState } from 'react'
// import { useInterval } from '../hooks/useInterval'

// interface TestimonialProps {
//   quote: string
//   author: string
//   role: string
//   company: string
// }

// interface TestimonialsSectionProps {
//   testimonials: TestimonialProps[]
// }

// export default function TestimonialsSection({ testimonials }: TestimonialsSectionProps) {
//   const [activeIndex, setActiveIndex] = useState(0)

//   useInterval(() => {
//     setActiveIndex((current) => (current + 1) % testimonials.length)
//   }, 5000)

//   return (
//     <section className="pt-14 pb-20 bg-gradient-to-t from-gray-900 via-gray-900/40 to-transparent relative overflow-hidden" id="testimonials">
//       {/* py-20 bg-gradient-to-b from-gray-900/50 to-transparent relative */}
//       <div className="absolute inset-0 overflow-hidden pointer-events-none">
//         <div className="absolute -top-[200px] left-1/2 transform -translate-x-1/2 w-[800px] h-[800px] bg-[radial-gradient(ellipse_at_center,hsla(217,100%,50%,0.15)_0%,transparent_70%)]" />
//       </div>
      
//       <div className="container mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
//         <div className="max-w-4xl mx-auto text-center mb-12">
//           <span className="inline-block text-blue-500 text-sm font-semibold tracking-wider uppercase mb-2">Testimonials</span>
//           <h2 className="text-3xl md:text-4xl font-bold mb-4 bg-clip-text text-transparent bg-gradient-to-r from-blue-400 to-purple-400 leading-tight md:leading-normal px-2">
//             Loved by Developers & Non-Developers Alike
//           </h2>
//           <p className="text-gray-300 text-lg">
//             See why thousands trust CodEase to build their Chrome extensions
//           </p>
//         </div>
        
//         <div className="max-w-5xl mx-auto">
//           <div className="relative h-[340px] md:h-[280px] overflow-hidden">
//             {testimonials.map((testimonial, index) => (
//               <div
//                 key={index}
//                 className={`absolute top-0 left-0 w-full transition-all duration-700 ease-out ${
//                   index === activeIndex 
//                     ? "translate-x-0 opacity-100" 
//                     : "translate-x-full opacity-0"
//                 }`}
//               >
//                 <div className="p-8 rounded-2xl bg-gradient-to-br from-gray-800/90 to-gray-900/90 border border-gray-700 shadow-xl shadow-blue-500/5 backdrop-blur-sm">
//                   <div className="flex flex-col items-center">
//                     <div className="mb-6">
//                       <div className="flex space-x-1 mb-4">
//                         {Array(5).fill(null).map((_, i) => (
//                           <div key={i} className="text-yellow-400">★</div>
//                         ))}
//                       </div>
//                       <p className="text-gray-200 text-lg md:text-xl italic text-center leading-relaxed">
//                         "{testimonial.quote}"
//                       </p>
//                     </div>
                    
//                     <div className="flex flex-col items-center">
//                       <p className="font-semibold text-white">{testimonial.author}</p>
//                       <p className="text-sm text-gray-400">
//                         {testimonial.role} 
//                         {/* {testimonial.company} */}
//                       </p>
//                     </div>
//                   </div>
//                 </div>
//               </div>
//             ))}
//           </div>
          
//           {/* <div className="flex justify-center mt-8 space-x-2">
//             {testimonials.map((_, index) => (
//               <button
//                 key={index}
//                 onClick={() => setActiveIndex(index)}
//                 className={`w-2.5 h-2.5 rounded-full transition-all ${
//                   index === activeIndex 
//                     ? "bg-blue-500 scale-125" 
//                     : "bg-gray-600 hover:bg-gray-500"
//                 }`}
//                 aria-label={`Go to testimonial ${index + 1}`}
//               />
//             ))}
//           </div> */}
//         </div>
//       </div>
//     </section>
//   )
// }