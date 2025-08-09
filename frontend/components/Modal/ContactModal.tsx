// import { useState, useEffect } from 'react';
// import { X } from 'lucide-react';
// import Cookies from 'js-cookie';
// import { v4 as uuidv4 } from 'uuid';
// import { authenticatedFetch } from '@/lib/api-utils';
// import { getStoredToken } from '@/lib/auth-utils';

// interface ContactModalProps {
//   isOpen: boolean;
//   onClose: () => void;
// }

// const CATEGORIES = [
//   "General Inquiry",
//   "Technical Support",
//   "Billing Question",
//   "Feature Request",
//   "Enterprise Plans",
//   "Partnership",
//   "Other"
// ];

// export default function ContactModal({ isOpen, onClose }: ContactModalProps) {
//   const [formData, setFormData] = useState({
//     email: '',
//     title: '',
//     description: '',
//     category: 'General Inquiry',
//   });
//   const [isSubmitting, setIsSubmitting] = useState(false);
//   const [submitStatus, setSubmitStatus] = useState<{
//     success: boolean;
//     message: string;
//   } | null>(null);
  
//   // Move the useEffect before any conditional returns
//   useEffect(() => {
//     // Prevent background scrolling when modal is open
//     if (isOpen) {
//       document.body.style.overflow = 'hidden';
//     }
    
//     // Clean up function to restore scrolling when the modal closes
//     return () => {
//       document.body.style.overflow = 'unset';
//     };
//   }, [isOpen]);

//   // Don't render anything if not open
//   if (!isOpen) return null;

//   const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
//     setFormData({
//       ...formData,
//       [e.target.name]: e.target.value,
//     });
//   };

//   const handleSubmit = async (e: React.FormEvent) => {
//     e.preventDefault();
    
//     // Validate inputs before sending
//     if (formData.email.trim() === '' || 
//         formData.title.trim().length < 5 || 
//         formData.title.trim().length > 100 ||
//         formData.description.trim().length < 10 || 
//         formData.description.trim().length > 2000) {
      
//       setSubmitStatus({
//         success: false,
//         message: 'Please check your inputs: Email is required, title should be 5-100 characters, and description 10-2000 characters.'
//       });
//       return;
//     }
    
//     setIsSubmitting(true);
//     setSubmitStatus(null);
    
//     try {
//       // Get user info if logged in
//       const storedUser = Cookies.get('user');
//       let userId = null;
//       let isAuthenticated = false;
      
//       if (storedUser) {
//         const user = JSON.parse(storedUser);
//         userId = user.uid;
//         // Check if user has valid authentication
//         const idToken = user.idToken || getStoredToken();
//         isAuthenticated = !!idToken;
//       }
      
//       // Get or create session ID for tracking
//       let sessionId = localStorage.getItem('session_id');
//       if (!sessionId) {
//         sessionId = uuidv4();
//         localStorage.setItem('session_id', sessionId);
//       }
      
//       // Format the request body to match the expected model
//       const requestBody = {
//         email: formData.email.trim(),
//         title: formData.title.trim(),
//         description: formData.description.trim(),
//         category: formData.category || "General Inquiry",
//         user_id: userId || null,
//         session_id: sessionId
//       };
      
//       let response;
      
//       if (isAuthenticated) {
//         // User is authenticated, use authenticatedFetch
//         response = await authenticatedFetch(`${process.env.NEXT_PUBLIC_API_URL}/support/request`, {
//           method: 'POST',
//           headers: {
//             'Content-Type': 'application/json'
//           },
//           body: JSON.stringify(requestBody)
//         });
//       } else {
//         // User is not authenticated, use regular fetch
//         response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/support/request`, {
//           method: 'POST',
//           headers: {
//             'Content-Type': 'application/json'
//           },
//           body: JSON.stringify(requestBody)
//         });
//       }
      
//       if (!response.ok) {
//         // Get more detailed error information
//         const errorData = await response.json();
//         throw new Error(errorData.detail || 'Failed to submit request');
//       }
      
//       const data = await response.json();
      
//       if (data.success) {
//         setSubmitStatus({
//           success: true,
//           message: 'Your request has been submitted successfully! We\'ll get back to you soon.',
//         });
//         // Reset form after successful submission
//         setFormData({
//           email: '',
//           title: '',
//           description: '',
//           category: 'General Inquiry',
//         });
        
//         // Auto close after 3 seconds on success
//         setTimeout(() => {
//           onClose();
//           setSubmitStatus(null);
//         }, 3000);
//       } else {
//         setSubmitStatus({
//           success: false,
//           message: data.message || 'Failed to submit your request. Please try again.',
//         });
//       }
//     } catch (error) {
//       console.error('Error submitting support request:', error);
//       setSubmitStatus({
//         success: false,
//         message: 'An unexpected error occurred. Please try again later.',
//       });
//     } finally {
//       setIsSubmitting(false);
//     }
//   };

//   return (
//     // Portal container that attaches directly to document body
//     <div 
//       className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center p-4 overflow-y-auto"
//       onClick={(e) => {
//         // Close the modal when clicking the backdrop
//         if (e.target === e.currentTarget) {
//           onClose();
//         }
//       }}
//       // Improved stacking context and highest z-index
//       style={{ 
//         position: 'fixed',
//         zIndex: 99999,
//         isolation: 'isolate',
//         // Force a new stacking context
//         transform: 'translateZ(0)'
//       }}
//     >
//       <div 
//         className="bg-gray-900 border border-gray-700 rounded-xl w-full max-w-lg shadow-xl animate-fade-in relative"
//         onClick={(e) => e.stopPropagation()} // Prevent clicks from bubbling to the backdrop
//         style={{ zIndex: 100000 }} // Ensure modal content is above backdrop
//       >
//         <div className="flex items-center justify-between border-b border-gray-700 p-4">
//           <h2 className="text-xl font-bold text-white">Contact Us</h2>
//           <button
//             type="button"
//             onClick={onClose}
//             className="p-2 rounded-full hover:bg-gray-700 transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500"
//             aria-label="Close modal"
//           >
//             <X className="w-5 h-5 text-gray-400" />
//           </button>
//         </div>
        
//         <div className="p-6">
//           {submitStatus ? (
//             <div className={`p-4 mb-6 rounded-lg ${
//               submitStatus.success ? 'bg-green-900/30 border border-green-600/30 text-green-400' : 
//                 'bg-red-900/30 border border-red-600/30 text-red-400'
//             }`}>
//               <p>{submitStatus.message}</p>
//             </div>
//           ) : null}
          
//           <form onSubmit={handleSubmit}>
//             <div className="space-y-4">
//               <div>
//                 <label htmlFor="email" className="block text-sm font-medium text-gray-300 mb-1">
//                   Email Address
//                 </label>
//                 <input
//                   type="email"
//                   id="email"
//                   name="email"
//                   required
//                   value={formData.email}
//                   onChange={handleChange}
//                   className="w-full rounded-lg border border-gray-600 bg-gray-700/50 px-3 py-2 text-white placeholder-gray-400 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
//                   placeholder="your@email.com"
//                 />
//               </div>
              
//               <div>
//                 <label htmlFor="category" className="block text-sm font-medium text-gray-300 mb-1">
//                   Category
//                 </label>
//                 <select
//                   id="category"
//                   name="category"
//                   required
//                   value={formData.category}
//                   onChange={handleChange}
//                   className="w-full rounded-lg border border-gray-600 bg-gray-700/50 px-3 py-2 text-white placeholder-gray-400 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
//                 >
//                   {CATEGORIES.map((category) => (
//                     <option key={category} value={category}>
//                       {category}
//                     </option>
//                   ))}
//                 </select>
//               </div>
              
//               <div>
//                 <label htmlFor="title" className="block text-sm font-medium text-gray-300 mb-1">
//                   Subject
//                 </label>
//                 <input
//                   type="text"
//                   id="title"
//                   name="title"
//                   required
//                   value={formData.title}
//                   onChange={handleChange}
//                   className="w-full rounded-lg border border-gray-600 bg-gray-700/50 px-3 py-2 text-white placeholder-gray-400 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
//                   placeholder="Brief summary of your inquiry"
//                 />
//               </div>
              
//               <div>
//                 <label htmlFor="description" className="block text-sm font-medium text-gray-300 mb-1">
//                   Message
//                 </label>
//                 <textarea
//                   id="description"
//                   name="description"
//                   required
//                   value={formData.description}
//                   onChange={handleChange}
//                   rows={5}
//                   className="w-full rounded-lg border border-gray-600 bg-gray-700/50 px-3 py-2 text-white placeholder-gray-400 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
//                   placeholder="Please provide details about your inquiry..."
//                 ></textarea>
//               </div>
              
//               <div className="flex justify-end">
//                 <button
//                   type="button"
//                   onClick={onClose}
//                   className="px-4 py-2 mr-3 bg-gray-700 hover:bg-gray-600 text-white rounded-lg transition-colors focus:outline-none focus:ring-2 focus:ring-gray-500"
//                 >
//                   Cancel
//                 </button>
//                 <button
//                   type="submit"
//                   disabled={isSubmitting}
//                   className="px-4 py-2 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-500 hover:to-purple-500 text-white rounded-lg transition-colors flex items-center focus:outline-none focus:ring-2 focus:ring-blue-500"
//                 >
//                   {isSubmitting ? (
//                     <>
//                       <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
//                         <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
//                         <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
//                       </svg>
//                       Submitting...
//                     </>
//                   ) : (
//                     'Submit Request'
//                   )}
//                 </button>
//               </div>
//             </div>
//           </form>
//         </div>
//       </div>
//     </div>
//   );
// }

import { useState, useEffect } from 'react';
import { X } from 'lucide-react';
import Cookies from 'js-cookie';
import { v4 as uuidv4 } from 'uuid';
import { authenticatedFetch } from '@/lib/api-utils';
import { getStoredToken } from '@/lib/auth-utils';
import { getUserFromCookie } from '@/lib/cookie-utils';

interface ContactModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const CATEGORIES = [
  "General Inquiry",
  "Technical Support",
  "Billing Question",
  "Feature Request",
  "Enterprise Plans",
  "Partnership",
  "Other"
];

export default function ContactModal({ isOpen, onClose }: ContactModalProps) {
  const [formData, setFormData] = useState({
    email: '',
    title: '',
    description: '',
    category: 'General Inquiry',
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitStatus, setSubmitStatus] = useState<{
    success: boolean;
    message: string;
  } | null>(null);
  
  // Move the useEffect before any conditional returns
  useEffect(() => {
    // Prevent background scrolling when modal is open
    if (isOpen) {
      document.body.style.overflow = 'hidden';
    }
    
    // Clean up function to restore scrolling when the modal closes
    return () => {
      document.body.style.overflow = 'unset';
    };
  }, [isOpen]);

  // Don't render anything if not open
  if (!isOpen) return null;

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Validate inputs before sending
    if (formData.email.trim() === '' || 
        formData.title.trim().length < 5 || 
        formData.title.trim().length > 100 ||
        formData.description.trim().length < 10 || 
        formData.description.trim().length > 2000) {
      
      setSubmitStatus({
        success: false,
        message: 'Please check your inputs: Email is required, title should be 5-100 characters, and description 10-2000 characters.'
      });
      return;
    }
    
    setIsSubmitting(true);
    setSubmitStatus(null);
    
    try {
      // Get user info if logged in
      const userData = getUserFromCookie();
      let userId = null;
      let isAuthenticated = false;

      if (userData) {
        userId = userData.uid;
        // Check if user has valid authentication
        const idToken = userData.idToken || getStoredToken();
        isAuthenticated = !!idToken;
      }
      
      // Get or create session ID for tracking
      let sessionId = localStorage.getItem('session_id');
      if (!sessionId) {
        sessionId = uuidv4();
        localStorage.setItem('session_id', sessionId);
      }
      
      // Format the request body to match the expected model
      const requestBody = {
        email: formData.email.trim(),
        title: formData.title.trim(),
        description: formData.description.trim(),
        category: formData.category || "General Inquiry",
        user_id: userId || null,
        session_id: sessionId
      };
      
      let response;
      
      if (isAuthenticated) {
        // User is authenticated, use authenticatedFetch
        response = await authenticatedFetch(`${process.env.NEXT_PUBLIC_API_URL}/support/request`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json'
          },
          body: JSON.stringify(requestBody)
        });
      } else {
        // User is not authenticated, use regular fetch
        response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/support/request`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json'
          },
          body: JSON.stringify(requestBody)
        });
      }
      
      if (!response.ok) {
        // Get more detailed error information
        const errorData = await response.json();
        throw new Error(errorData.detail || 'Failed to submit request');
      }
      
      const data = await response.json();
      
      if (data.success) {
        setSubmitStatus({
          success: true,
          message: 'Your request has been submitted successfully! We\'ll get back to you soon.',
        });
        // Reset form after successful submission
        setFormData({
          email: '',
          title: '',
          description: '',
          category: 'General Inquiry',
        });
        
        // Auto close after 3 seconds on success
        setTimeout(() => {
          onClose();
          setSubmitStatus(null);
        }, 3000);
      } else {
        setSubmitStatus({
          success: false,
          message: data.message || 'Failed to submit your request. Please try again.',
        });
      }
    } catch (error) {
      setSubmitStatus({
        success: false,
        message: 'An unexpected error occurred. Please try again later.',
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    // Portal container that attaches directly to document body
    <div 
      className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center p-4 overflow-y-auto"
      onClick={(e) => {
        // Close the modal when clicking the backdrop
        if (e.target === e.currentTarget) {
          onClose();
        }
      }}
      // Improved stacking context and highest z-index
      style={{ 
        position: 'fixed',
        zIndex: 99999,
        isolation: 'isolate',
        // Force a new stacking context
        transform: 'translateZ(0)'
      }}
    >
      <div 
        className="bg-gray-900 border border-gray-700 rounded-xl w-full max-w-lg shadow-xl animate-fade-in relative"
        onClick={(e) => e.stopPropagation()} // Prevent clicks from bubbling to the backdrop
        style={{ zIndex: 100000 }} // Ensure modal content is above backdrop
      >
        <div className="flex items-center justify-between border-b border-gray-700 p-4">
          <h2 className="text-xl font-bold text-white">Contact Us</h2>
          <button
            type="button"
            onClick={onClose}
            className="p-2 rounded-full hover:bg-gray-700 transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500"
            aria-label="Close modal"
          >
            <X className="w-5 h-5 text-gray-400" />
          </button>
        </div>
        
        <div className="p-6">
          {submitStatus ? (
            <div className={`p-4 mb-6 rounded-lg ${
              submitStatus.success ? 'bg-green-900/30 border border-green-600/30 text-green-400' : 
                'bg-red-900/30 border border-red-600/30 text-red-400'
            }`}>
              <p>{submitStatus.message}</p>
            </div>
          ) : null}
          
          <form onSubmit={handleSubmit}>
            <div className="space-y-4">
              <div>
                <label htmlFor="email" className="block text-sm font-medium text-gray-300 mb-1">
                  Email Address
                </label>
                <input
                  type="email"
                  id="email"
                  name="email"
                  required
                  value={formData.email}
                  onChange={handleChange}
                  className="w-full rounded-lg border border-gray-600 bg-gray-700/50 px-3 py-2 text-white placeholder-gray-400 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
                  placeholder="your@email.com"
                />
              </div>
              
              <div>
                <label htmlFor="category" className="block text-sm font-medium text-gray-300 mb-1">
                  Category
                </label>
                <select
                  id="category"
                  name="category"
                  required
                  value={formData.category}
                  onChange={handleChange}
                  className="w-full rounded-lg border border-gray-600 bg-gray-700/50 px-3 py-2 text-white placeholder-gray-400 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
                >
                  {CATEGORIES.map((category) => (
                    <option key={category} value={category}>
                      {category}
                    </option>
                  ))}
                </select>
              </div>
              
              <div>
                <label htmlFor="title" className="block text-sm font-medium text-gray-300 mb-1">
                  Subject
                </label>
                <input
                  type="text"
                  id="title"
                  name="title"
                  required
                  value={formData.title}
                  onChange={handleChange}
                  className="w-full rounded-lg border border-gray-600 bg-gray-700/50 px-3 py-2 text-white placeholder-gray-400 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
                  placeholder="Brief summary of your inquiry"
                />
              </div>
              
              <div>
                <label htmlFor="description" className="block text-sm font-medium text-gray-300 mb-1">
                  Message
                </label>
                <textarea
                  id="description"
                  name="description"
                  required
                  value={formData.description}
                  onChange={handleChange}
                  rows={5}
                  className="w-full rounded-lg border border-gray-600 bg-gray-700/50 px-3 py-2 text-white placeholder-gray-400 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
                  placeholder="Please provide details about your inquiry..."
                ></textarea>
              </div>
              
              <div className="flex justify-end">
                <button
                  type="button"
                  onClick={onClose}
                  className="px-4 py-2 mr-3 bg-gray-700 hover:bg-gray-600 text-white rounded-lg transition-colors focus:outline-none focus:ring-2 focus:ring-gray-500"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="px-4 py-2 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-500 hover:to-purple-500 text-white rounded-lg transition-colors flex items-center focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  {isSubmitting ? (
                    <>
                      <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                      </svg>
                      Submitting...
                    </>
                  ) : (
                    'Submit Request'
                  )}
                </button>
              </div>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}