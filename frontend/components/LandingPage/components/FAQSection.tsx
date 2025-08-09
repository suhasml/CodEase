import React, { useState } from 'react';
import { ChevronRight, ChevronDown } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

interface FAQItem {
  question: string;
  answer: string;
  color: string;
}

interface FAQSectionProps {
  faqs: FAQItem[];
}

export default function FAQSection({ faqs }: FAQSectionProps) {
  const [activeIndex, setActiveIndex] = useState<number | null>(null);

  const toggleFAQ = (index: number) => {
    setActiveIndex(activeIndex === index ? null : index);
  };

  return (
    <section className="pt-8 sm:pt-10 md:pt-14 pb-12 sm:pb-16 md:pb-35 bg-gradient-to-t from-gray-900 via-gray-900/40 to-transparent relative overflow-hidden" id='faq'> 
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-1/3 right-1/4 w-[300px] md:w-[600px] h-[300px] md:h-[600px] bg-[radial-gradient(ellipse_at_center,hsla(217,100%,50%,0.06)_0%,transparent_70%)]" />
        <div className="absolute bottom-1/4 left-1/4 w-[250px] md:w-[500px] h-[250px] md:h-[500px] bg-[radial-gradient(ellipse_at_center,hsla(265,89%,60%,0.06)_0%,transparent_70%)]" />
      </div>
      
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        <div className="max-w-4xl mx-auto text-center mb-6 sm:mb-8 md:mb-16">
          <h2 className="text-xl sm:text-2xl md:text-3xl lg:text-4xl font-bold mb-3 md:mb-4 bg-clip-text text-transparent bg-gradient-to-r from-blue-400 to-purple-400 leading-tight md:leading-normal px-2">
            Frequently Asked Questions
          </h2>
          <p className="text-base sm:text-lg md:text-xl text-gray-300 max-w-3xl mx-auto">
            Everything you need to know about CodEase
          </p>
        </div>

        <div className="max-w-4xl mx-auto">
          {faqs.map((faq, index) => (
            <motion.div 
              key={index} 
              className={`mb-3 md:mb-4 rounded-lg sm:rounded-xl bg-gray-800/30 backdrop-blur-sm border border-gray-700 hover:border-${faq.color}-500/30 overflow-hidden transition-all duration-300`}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1, duration: 0.5 }}
              viewport={{ once: false, margin: "-100px" }}
            >
              <button 
                className="w-full p-3 sm:p-4 md:p-6 text-left flex items-center justify-between focus:outline-none"
                onClick={() => toggleFAQ(index)}
                aria-expanded={activeIndex === index}
                aria-controls={`faq-answer-${index}`}
              >
                <h3 className="text-base md:text-lg font-semibold flex items-center">
                  <motion.div
                    animate={{ rotate: activeIndex === index ? 90 : 0 }}
                    transition={{ duration: 0.3 }}
                    className={`w-4 h-4 md:w-5 md:h-5 mr-2 md:mr-3 text-${faq.color}-400 flex-shrink-0`}
                  >
                    <ChevronRight className="w-4 h-4 md:w-5 md:h-5" />
                  </motion.div>
                  <span className="line-clamp-2 md:line-clamp-none">{faq.question}</span>
                </h3>
                <div className={`text-${faq.color}-400 ml-2 flex-shrink-0`}>
                  {activeIndex === index ? (
                    <ChevronDown className="w-4 h-4 md:w-5 md:h-5" />
                  ) : (
                    <ChevronRight className="w-4 h-4 md:w-5 md:h-5" />
                  )}
                </div>
              </button>
              
              <AnimatePresence>
                {activeIndex === index && (
                  <motion.div
                    id={`faq-answer-${index}`}
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: "auto", opacity: 1 }}
                    exit={{ height: 0, opacity: 0 }}
                    transition={{ duration: 0.3 }}
                    className="overflow-hidden"
                  >
                    <div className="px-4 md:px-6 pb-4 md:pb-6 pt-0 -mt-1 md:-mt-2 text-sm md:text-base text-gray-300">
                      <p>{faq.answer}</p>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}





// import React, { useState } from 'react';
// import { ChevronRight, ChevronDown } from 'lucide-react';
// import { motion, AnimatePresence } from 'framer-motion';

// interface FAQItem {
//   question: string;
//   answer: string;
//   color: string;
// }

// interface FAQSectionProps {
//   faqs: FAQItem[];
// }

// export default function FAQSection({ faqs }: FAQSectionProps) {
//   const [activeIndex, setActiveIndex] = useState<number | null>(null);

//   const toggleFAQ = (index: number) => {
//     setActiveIndex(activeIndex === index ? null : index);
//   };

//   return (
//     <section className="pt-14 pb-35 bg-gradient-to-t from-gray-900 via-gray-900/40 to-transparent relative overflow-hidden" id='faq'> 
//     {/* py-20 bg-gradient-to-t from-gray-900 via-gray-900/40 to-transparent relative overflow-hidden */}
//       <div className="absolute inset-0 overflow-hidden pointer-events-none">
//         <div className="absolute top-1/3 right-1/4 w-[600px] h-[600px] bg-[radial-gradient(ellipse_at_center,hsla(217,100%,50%,0.06)_0%,transparent_70%)]" />
//         <div className="absolute bottom-1/4 left-1/4 w-[500px] h-[500px] bg-[radial-gradient(ellipse_at_center,hsla(265,89%,60%,0.06)_0%,transparent_70%)]" />
//       </div>
      
//       <div className="container mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
//         <div className="max-w-4xl mx-auto text-center mb-16">
//           {/* <span className="inline-block text-blue-500 text-sm font-semibold tracking-wider uppercase mb-2"></span> */}
//           <h2 className="text-3xl md:text-4xl font-bold mb-4 bg-clip-text text-transparent bg-gradient-to-r from-blue-400 to-purple-400 leading-tight md:leading-normal px-2">
//             Frequently Asked Questions
//           </h2>
//           <p className="text-xl text-gray-300 max-w-3xl mx-auto">
//             Everything you need to know about CodEase
//           </p>
//         </div>

//         <div className="max-w-4xl mx-auto">
//           {faqs.map((faq, index) => (
//             <motion.div 
//               key={index} 
//               className={`mb-4 rounded-xl bg-gray-800/30 backdrop-blur-sm border border-gray-700 hover:border-${faq.color}-500/30 overflow-hidden transition-all duration-300`}
//               initial={{ opacity: 0, y: 20 }}
//               whileInView={{ opacity: 1, y: 0 }}
//               transition={{ delay: index * 0.1, duration: 0.5 }}
//               viewport={{ once: false, margin: "-100px" }}
//             >
//               <button 
//                 className="w-full p-6 text-left flex items-center justify-between focus:outline-none"
//                 onClick={() => toggleFAQ(index)}
//                 aria-expanded={activeIndex === index}
//                 aria-controls={`faq-answer-${index}`}
//               >
//                 <h3 className="text-lg font-semibold flex items-center">
//                   <motion.div
//                     animate={{ rotate: activeIndex === index ? 90 : 0 }}
//                     transition={{ duration: 0.3 }}
//                     className={`w-5 h-5 mr-3 text-${faq.color}-400 flex-shrink-0`}
//                   >
//                     <ChevronRight className="w-5 h-5" />
//                   </motion.div>
//                   {faq.question}
//                 </h3>
//                 <div className={`text-${faq.color}-400`}>
//                   {activeIndex === index ? (
//                     <ChevronDown className="w-5 h-5" />
//                   ) : (
//                     <ChevronRight className="w-5 h-5" />
//                   )}
//                 </div>
//               </button>
              
//               <AnimatePresence>
//                 {activeIndex === index && (
//                   <motion.div
//                     id={`faq-answer-${index}`}
//                     initial={{ height: 0, opacity: 0 }}
//                     animate={{ height: "auto", opacity: 1 }}
//                     exit={{ height: 0, opacity: 0 }}
//                     transition={{ duration: 0.3 }}
//                     className="overflow-hidden"
//                   >
//                     <div className="px-6 pb-6 pt-0 -mt-2 text-gray-300">
//                       <p>{faq.answer}</p>
//                     </div>
//                   </motion.div>
//                 )}
//               </AnimatePresence>
//             </motion.div>
//           ))}
//         </div>
//       </div>
//     </section>
//   );
// }